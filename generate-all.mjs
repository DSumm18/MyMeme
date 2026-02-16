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

async function generate(imageUUID, prompt, outputPath) {
  if (existsSync(outputPath)) {
    console.log(`  SKIP (exists): ${outputPath}`)
    return true
  }
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
  console.log(`  ✅ ${outputPath} ($${cost})`)
  return true
}

const styles = {
  'ghibli': 'Transform this person into a Studio Ghibli anime portrait. Keep the exact same face, hair color, eye color, and expression. Soft hand-painted watercolor textures, dreamy pastel sky with wispy clouds, gentle warm sunlight, Hayao Miyazaki art direction, cel-shaded with visible brush texture.',
  'oil-painting': 'Transform this person into a classical oil painting portrait. Keep the exact same face, hair color, eye color, and expression. Rich impasto technique with visible thick brushstrokes, dramatic Rembrandt-style chiaroscuro lighting, warm golden tones, museum-quality fine art on aged canvas.',
  'cyberpunk-neon': 'Transform this person into a cyberpunk neon portrait. Keep the exact same face, hair color, eye color, and expression. Electric pink and cyan holographic lighting, rain-soaked reflections on chrome, futuristic augmented reality overlays, dark Blade Runner atmosphere, glowing circuit patterns.',
  'renaissance': 'Transform this person into a Renaissance master painting portrait. Keep the exact same face, hair color, eye color, and expression. Leonardo da Vinci sfumato technique, rich earth tones with subtle glazing, dramatic divine lighting, ornate period clothing.',
  'italian-brainrot': 'Transform this person into an extremely exaggerated Italian gesture meme portrait. Keep the exact same face, hair color, eye color. Wildly dramatic hand pinching gesture, impossibly passionate expression, Italian flag background, chef\'s kiss pose, over-the-top Mediterranean energy, comedic meme style.',
  'caricature': 'Transform this person into a masterful editorial caricature. Keep recognizable face features, hair color, eye color. Brilliantly exaggerated facial features, oversized expressive head on small body, rich vibrant colors, bold linework, professional magazine illustration quality.',
  'anime': 'Transform this person into a premium Japanese anime character portrait. Keep the exact same face structure, hair color, eye color, and expression. Large luminous eyes with detailed iris reflections, dynamic flowing hair, crisp sharp lineart, richly saturated colors, Makoto Shinkai film quality.',
  'pixar': 'Transform this person into a Pixar 3D animated character. Keep the exact same face, hair color, eye color, and expression. Flawless subsurface scattering on smooth skin, big round expressive eyes, warm cinematic golden-hour lighting, Disney Pixar feature film quality.',
  'gta': 'Transform this person into a GTA V loading screen character portrait. Keep the exact same face, hair color, eye color. Bold graphic outlines, highly saturated stylized realism, cinematic wide composition, authentic Grand Theft Auto artwork style, urban backdrop, swagger attitude. No text.',
  'superhero': 'Transform this person into a dynamic comic book superhero. Keep the exact same face, hair color, eye color. Wearing a unique original superhero costume, dramatic action-ready pose, volumetric rim lighting, professional Marvel/DC tier illustration, energy effects.',
  'clay-3d': 'Transform this person into a charming claymation character. Keep the exact same face, hair color, eye color, and expression. Smooth sculpted polymer clay texture, soft round features, warm studio lighting, Aardman Studios quality, miniature diorama setting.',
  'watercolor': 'Transform this person into a stunning loose watercolor painting. Keep the exact same face, hair color, eye color, and expression. Masterful wet-on-wet technique with beautiful color bleeds, artistic paint splatter, soft dreamy washes on textured paper, gallery-quality fine art.',
  'pop-art': 'Transform this person into a bold pop art portrait. Keep the exact same face, hair color, eye color. Andy Warhol and Roy Lichtenstein style, vibrant primary color blocks, precise halftone Ben-Day dots, thick black graphic outlines, screen print aesthetic. No text.',
  'pencil-sketch': 'Transform this person into a photorealistic pencil sketch. Keep the exact same face, hair color shading, eye details, and expression. Incredibly detailed graphite work with masterful hatching, subtle tonal gradations, realistic texture on drawing paper, hyperrealistic pencil technique.',
  'comic-book': 'Transform this person into a professional comic book character. Keep the exact same face, hair color, eye color. Bold black ink outlines, dynamic cell shading, vivid saturated colors, action comic panel composition, contemporary comic illustration quality. No text, no speech bubbles.',
  'sticker': 'Transform this person into a premium die-cut sticker design. Keep the exact same face, hair color, eye color. Thick clean white border, glossy finish effect, cute kawaii-inspired chibi proportions, bright candy colors, trendy sticker aesthetic.',
  'retro-80s': 'Transform this person into a retro 1980s synthwave portrait. Keep the exact same face, hair color, eye color. Neon pink and electric blue lighting, chrome reflections, laser grid horizon background, VHS scan lines, classic outrun synthwave aesthetic. No text.',
}

async function main() {
  const mode = process.argv[2] || 'female' // 'female' or 'male'
  
  if (mode === 'female') {
    console.log('=== GENERATING FEMALE EXAMPLES ===')
    const imageUUID = await uploadImage('public/styles/before.png')
    console.log('Uploaded, UUID:', imageUUID)
    
    for (const [key, prompt] of Object.entries(styles)) {
      console.log(`\nGenerating: ${key}`)
      try {
        await generate(imageUUID, prompt, `public/examples/${key}.jpg`)
      } catch (e) {
        console.error(`  ❌ FAILED: ${e.message}`)
        // Retry once
        try {
          console.log('  Retrying...')
          await new Promise(r => setTimeout(r, 2000))
          await generate(imageUUID, prompt, `public/examples/${key}.jpg`)
        } catch (e2) {
          console.error(`  ❌ RETRY FAILED: ${e2.message}`)
        }
      }
      // Small delay between requests
      await new Promise(r => setTimeout(r, 1000))
    }
  } else {
    console.log('=== GENERATING MALE EXAMPLES ===')
    const imageUUID = await uploadImage('public/examples/male-before.jpg')
    console.log('Uploaded, UUID:', imageUUID)
    
    const maleStyles = ['ghibli', 'cyberpunk-neon', 'anime', 'gta', 'oil-painting', 'pixar']
    for (const key of maleStyles) {
      console.log(`\nGenerating male: ${key}`)
      // Adjust prompts for male
      const prompt = styles[key].replace('this person', 'this man').replace('this person', 'this man')
      try {
        await generate(imageUUID, prompt, `public/examples/male-${key}.jpg`)
      } catch (e) {
        console.error(`  ❌ FAILED: ${e.message}`)
        try {
          console.log('  Retrying...')
          await new Promise(r => setTimeout(r, 2000))
          await generate(imageUUID, prompt, `public/examples/male-${key}.jpg`)
        } catch (e2) {
          console.error(`  ❌ RETRY FAILED: ${e2.message}`)
        }
      }
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  
  console.log('\n=== DONE ===')
}

main().catch(console.error)
