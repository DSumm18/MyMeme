import { readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'

const API_KEY = 'JpJrfN4Oyw50hWtaf6HTJKzhbgzniMUg'
const API_URL = 'https://api.runware.ai/v1'

async function callAPI(tasks) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify(tasks),
    signal: AbortSignal.timeout(120000),
  })
  const data = await res.json()
  if (data.errors) throw new Error(JSON.stringify(data.errors))
  return data
}

async function uploadImage(path) {
  const buf = readFileSync(path)
  const ext = path.endsWith('.jpg') || path.endsWith('.jpeg') ? 'jpeg' : 'png'
  const b64 = `data:image/${ext};base64,${buf.toString('base64')}`
  const res = await callAPI([{ taskType: 'imageUpload', taskUUID: randomUUID(), image: b64 }])
  return res.data[0].imageUUID
}

async function generate(imageUUID, prompt, outputPath) {
  for (let i = 0; i < 8; i++) {
    try {
      const res = await callAPI([{
        taskType: 'imageInference',
        taskUUID: randomUUID(),
        positivePrompt: prompt,
        height: 1024,
        width: 1024,
        model: 'runware:106@1',
        numberResults: 1,
        outputType: 'URL',
        outputFormat: 'JPG',
        includeCost: true,
        referenceImages: [imageUUID],
      }])
      const url = res.data[0].imageURL
      const imgRes = await fetch(url)
      writeFileSync(outputPath, Buffer.from(await imgRes.arrayBuffer()))
      console.log(`  ✅ ${outputPath} [attempt ${i+1}]`)
      return true
    } catch (e) {
      console.log(`  ❌ attempt ${i+1}`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  return false
}

async function main() {
  console.log('Uploading source image...')
  const imageUUID = await uploadImage('public/styles/before.png')
  
  // Ultra-minimal prompts for the stubborn ones
  const styles = {
    'watercolor': 'watercolor painting portrait, soft brushstrokes, paint splatter, dreamy washes',
    'pencil-sketch': 'detailed pencil drawing portrait, graphite on paper, hatching, realistic sketch',
    'oil-painting': 'oil painting portrait, thick brushstrokes, warm golden lighting, canvas texture',
    'renaissance': 'renaissance era painted portrait, classical art, soft lighting, ornate clothing',
    'gta': 'stylized video game character portrait, bold outlines, saturated colors, urban style, no text',
    'comic-book': 'comic book illustration portrait, bold ink outlines, cell shading, vivid colors, no text',
  }
  
  for (const [key, prompt] of Object.entries(styles)) {
    console.log(`\n${key}:`)
    // Delete existing file first
    try { require('fs').unlinkSync(`public/examples/${key}.jpg`) } catch {}
    await generate(imageUUID, prompt, `public/examples/${key}.jpg`)
    await new Promise(r => setTimeout(r, 500))
  }
  
  console.log('\n=== DONE ===')
}

main().catch(console.error)
