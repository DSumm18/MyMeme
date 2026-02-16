import { readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'

const API_KEY = 'JpJrfN4Oyw50hWtaf6HTJKzhbgzniMUg'
const API_URL = 'https://api.runware.ai/v1'

async function callAPI(tasks, timeoutMs = 60000) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify(tasks),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const text = await res.text()
  console.log('Raw response:', text.substring(0, 500))
  const data = JSON.parse(text)
  if (data.errors) throw new Error(JSON.stringify(data.errors))
  return data
}

async function uploadImage(path) {
  const buf = readFileSync(path)
  const b64 = `data:image/png;base64,${buf.toString('base64')}`
  const res = await callAPI([{ taskType: 'imageUpload', taskUUID: randomUUID(), image: b64 }])
  return res.data[0].imageUUID
}

async function main() {
  console.log('Uploading source image...')
  const imageUUID = await uploadImage('public/styles/before.png')
  console.log('Image UUID:', imageUUID)

  // Test 1: PuLID with FLUX
  console.log('\n--- Test 1: PuLID with FLUX (runware:101@1) ---')
  try {
    const res = await callAPI([{
      taskType: 'imageInference',
      taskUUID: randomUUID(),
      positivePrompt: 'A breathtaking Studio Ghibli anime portrait of a young woman, soft hand-painted watercolor textures, dreamy pastel sky, gentle warm sunlight, Hayao Miyazaki art direction, cel-shaded',
      height: 1024,
      width: 1024,
      model: 'runware:101@1',
      steps: 20,
      numberResults: 1,
      outputType: 'URL',
      outputFormat: 'JPG',
      includeCost: true,
      puLID: {
        inputImages: [imageUUID],
        idWeight: 1.0,
        trueCFGScale: 1.5,
      }
    }], 120000)
    const url = res.data[0].imageURL
    console.log('PuLID URL:', url)
    const imgRes = await fetch(url)
    writeFileSync('public/examples/test-pulid-ghibli.jpg', Buffer.from(await imgRes.arrayBuffer()))
    console.log('Saved test-pulid-ghibli.jpg')
  } catch (e) {
    console.error('PuLID failed:', e.message)
  }

  // Test 2: FLUX Kontext with referenceImages
  console.log('\n--- Test 2: FLUX Kontext (runware:106@1) ---')
  try {
    const res = await callAPI([{
      taskType: 'imageInference',
      taskUUID: randomUUID(),
      positivePrompt: 'Transform this person into a Studio Ghibli anime portrait style. Keep the same face, hair color, eye color, and features. Soft watercolor textures, dreamy pastel sky, Hayao Miyazaki art direction.',
      height: 1024,
      width: 1024,
      model: 'runware:106@1',
      numberResults: 1,
      outputType: 'URL',
      outputFormat: 'JPG',
      includeCost: true,
      referenceImages: [imageUUID],
    }], 120000)
    const url = res.data[0].imageURL
    console.log('Kontext URL:', url)
    const imgRes = await fetch(url)
    writeFileSync('public/examples/test-kontext-ghibli.jpg', Buffer.from(await imgRes.arrayBuffer()))
    console.log('Saved test-kontext-ghibli.jpg')
  } catch (e) {
    console.error('Kontext failed:', e.message)
  }
}

main().catch(console.error)
