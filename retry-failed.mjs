import { readFileSync, writeFileSync, existsSync } from 'fs'
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

async function generate(imageUUID, prompt, outputPath, maxRetries = 5) {
  if (existsSync(outputPath)) {
    console.log(`  SKIP (exists): ${outputPath}`)
    return true
  }
  for (let i = 0; i < maxRetries; i++) {
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
      const cost = res.data[0].cost
      const imgRes = await fetch(url)
      writeFileSync(outputPath, Buffer.from(await imgRes.arrayBuffer()))
      console.log(`  ✅ ${outputPath} ($${cost}) [attempt ${i+1}]`)
      return true
    } catch (e) {
      console.log(`  ❌ attempt ${i+1}: ${e.message.substring(0, 80)}`)
      await new Promise(r => setTimeout(r, 3000))
    }
  }
  console.log(`  💀 PERMANENTLY FAILED: ${outputPath}`)
  return false
}

// Simplified prompts - no brand names, shorter, avoid triggering content filter
const failedStyles = {
  'oil-painting': 'Restyle this photo as a classical oil painting portrait. Rich impasto brushstrokes, dramatic warm lighting, golden tones, deep shadows, museum-quality fine art on canvas texture.',
  'renaissance': 'Restyle this photo as a Renaissance-era painted portrait. Soft sfumato technique, earth tones with subtle glazing, dramatic lighting, ornate period clothing with embroidery.',
  'gta': 'Restyle this photo as a stylized video game loading screen portrait. Bold graphic outlines, saturated colors, stylized realism, urban backdrop, confident attitude. No text.',
  'superhero': 'Restyle this photo as a comic book hero portrait. Wearing a colorful original costume with cape, dramatic rim lighting, powerful pose, energy effects, dynamic illustration.',
  'watercolor': 'Restyle this photo as a loose watercolor painting. Wet-on-wet technique with beautiful color bleeds, paint splatter accents, soft dreamy washes on textured paper, fine art quality.',
  'pencil-sketch': 'Restyle this photo as a detailed pencil sketch on paper. Graphite hatching and cross-hatching, subtle tonal gradations, realistic texture, hyperrealistic pencil drawing technique.',
  'comic-book': 'Restyle this photo as a comic book character illustration. Bold black ink outlines, dynamic cell shading, vivid saturated colors, action panel composition. No text, no speech bubbles.',
}

async function main() {
  console.log('Uploading source image...')
  const imageUUID = await uploadImage('public/styles/before.png')
  console.log('Image UUID:', imageUUID)

  for (const [key, prompt] of Object.entries(failedStyles)) {
    console.log(`\nGenerating: ${key}`)
    await generate(imageUUID, prompt, `public/examples/${key}.jpg`)
    await new Promise(r => setTimeout(r, 1000))
  }
  console.log('\n=== DONE ===')
}

main().catch(console.error)
