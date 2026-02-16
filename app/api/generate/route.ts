import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const maxDuration = 60

const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY
if (!RUNWARE_API_KEY) {
  console.warn('RUNWARE_API_KEY not configured - generate API will fail')
}

export async function POST(req: NextRequest) {
  try {
    const { image, jobTitle, gender = '', style, accessories, location } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }
    if (!image.startsWith('data:image')) {
      return NextResponse.json({ error: 'Invalid image format. Must be a data URI' }, { status: 400 })
    }
    if (!style) {
      return NextResponse.json({ error: 'Style is required' }, { status: 400 })
    }
    if (!RUNWARE_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const imageSizeInKB = Math.round(image.length * 0.75 / 1024)
    if (imageSizeInKB > 2048) {
      return NextResponse.json({ error: 'Image too large. Max 2MB.' }, { status: 400 })
    }

    const styleMap: Record<string, string> = {
      // ─── NEW TRENDING STYLES ───
      ghibli: "A breathtaking Studio Ghibli anime portrait, soft hand-painted watercolor textures, dreamy pastel sky with wispy clouds, gentle warm sunlight filtering through, whimsical and magical atmosphere, lush natural elements, Hayao Miyazaki art direction, cel-shaded with visible brush texture, emotionally evocative anime masterpiece",
      'oil-painting': "A masterful classical oil painting portrait, rich impasto technique with visible thick brushstrokes, dramatic Rembrandt-style chiaroscuro lighting, warm golden tones and deep shadows, museum-quality fine art on aged canvas, reminiscent of Dutch Golden Age masters, extraordinary detail in fabric and skin",
      'cyberpunk-neon': "A stunning cyberpunk neon portrait, drenched in electric pink and cyan holographic lighting, rain-soaked reflections on chrome surfaces, futuristic augmented reality overlays, dark moody Blade Runner 2049 atmosphere, glowing circuit patterns, volumetric neon fog, high-tech dystopian aesthetic",
      renaissance: "A magnificent Renaissance master painting portrait, Leonardo da Vinci sfumato technique, rich earth tones with subtle glazing layers, dramatic divine chiaroscuro lighting, ornate period clothing with intricate embroidery, Sistine Chapel quality, timeless museum masterpiece",
      'italian-brainrot': "An extremely exaggerated Italian gesture meme portrait, wildly dramatic hand pinching gesture (🤌), impossibly passionate facial expression, Italian flag draped background, chef's kiss pose, over-the-top Mediterranean energy, comedic meme style, viral internet humor aesthetic, maximum expressiveness",

      // ─── UPDATED EXISTING STYLES ───
      caricature: "A masterful editorial caricature portrait, brilliantly exaggerated facial features with artistic precision, oversized expressive head on diminutive body, rich vibrant color palette, bold confident linework, professional magazine illustration quality, humor and personality captured perfectly",
      anime: "A premium Japanese anime character portrait, large luminous eyes with detailed iris reflections and highlights, dynamic flowing hair with gradient colors, crisp sharp lineart, richly saturated color palette, professional anime key visual quality, emotionally expressive, Makoto Shinkai film quality",
      pixar: "A Pixar 3D animated character portrait, flawless subsurface scattering on smooth skin, big round expressive eyes with catchlights, warm cinematic golden-hour lighting, Disney Pixar feature film quality, endearing and charming character design, soft depth of field background",
      gta: "A GTA V loading screen character portrait, bold graphic outlines with confident strokes, highly saturated stylized realism, cinematic wide composition, authentic Grand Theft Auto artwork by Stephen Bliss, urban Los Santos backdrop, swagger and attitude, no text no words",
      superhero: "A dynamic comic book superhero portrait, wearing a unique original costume with detailed metallic and fabric textures, dramatic action-ready pose, volumetric rim lighting, professional Marvel/DC tier illustration, powerful and inspiring, energy effects and dramatic cape movement",
      'clay-3d': "A charming Pixar-quality claymation character, smooth sculpted polymer clay texture with fingerprint details, soft round features, warm studio photography lighting, Aardman Studios / Laika quality, endearing character with personality, miniature diorama setting",
      watercolor: "A stunning loose watercolor painting portrait, masterful wet-on-wet technique with beautiful color bleeds, artistic paint splatter accents, soft dreamy color washes on textured cold-press paper, gallery-quality fine art, luminous skin tones, impressionistic yet recognizable",
      'pop-art': "A bold pop art portrait in authentic Andy Warhol and Roy Lichtenstein style, vibrant primary color blocks, precise halftone Ben-Day dots pattern, thick black graphic outlines, screen print aesthetic, iconic four-panel Warhol composition, museum-quality pop art, no text",
      'pencil-sketch': "A photorealistic pencil sketch portrait, incredibly detailed graphite work with masterful hatching and cross-hatching, subtle tonal gradations, realistic texture on heavyweight drawing paper, professional artist-quality rendering, dramatic light and shadow, hyperrealistic pencil technique",
      'comic-book': "A professional comic book character portrait, bold black ink outlines with confident brush strokes, dynamic cell shading, vivid saturated colors, action comic panel composition, contemporary superhero comic illustration quality, dramatic perspective, no text no speech bubbles",
      sticker: "A premium die-cut sticker design portrait, thick clean white border, glossy holographic finish effect, cute kawaii-inspired chibi proportions, bright candy colors, trendy sticker sheet aesthetic, perfect for merchandise",
      'retro-80s': "A retro 1980s synthwave portrait, neon pink and electric blue lighting, chrome text reflections, laser grid horizon background, VHS scan lines overlay, classic outrun synthwave aesthetic, Miami Vice vibes, nostalgic and cool, no text no words",
    }

    // Build prompt
    const styleDesc = styleMap[style] || styleMap.caricature
    const sceneDetails = [
      jobTitle ? `as a ${jobTitle}` : '',
      location ? `in a ${location}` : '',
      accessories ? `with ${accessories}` : '',
    ].filter(Boolean).join(', ')
    const sceneText = sceneDetails ? `, ${sceneDetails}` : ''
    const clothingHint = ', wearing same clothing and outfit as the reference photo'

    // Upload image
    const uploadTask = {
      taskType: "imageUpload",
      taskUUID: randomUUID(),
      image: image,
    }

    const uploadRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWARE_API_KEY}`,
      },
      body: JSON.stringify([uploadTask]),
      signal: AbortSignal.timeout(15000),
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Runware upload error:', { status: uploadRes.status, body: errText })
      return NextResponse.json({ error: 'Image upload failed', details: errText }, { status: 502 })
    }

    const uploadData = await uploadRes.json()
    const imageUUID = uploadData?.data?.[0]?.imageUUID

    if (!imageUUID) {
      console.error('No imageUUID in upload response:', uploadData)
      return NextResponse.json({ error: 'Image upload failed - no UUID received' }, { status: 502 })
    }

    // Generate with GPT Image model
    const generateTask = {
      taskType: "imageInference",
      taskUUID: randomUUID(),
      model: "openai:4@1",
      positivePrompt: `${styleDesc}${sceneText}${clothingHint}`.substring(0, 500),
      negativePrompt: "text, words, letters, numbers, watermark, signature, writing, caption, subtitle, logo text, misspelled text, garbled text, low quality, blurry, deformed, ugly",
      height: 1024,
      width: 1024,
      steps: 25,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "JPG",
      includeCost: true,
      puLID: {
        inputImages: [imageUUID],
        weight: 0.8
      }
    }

    console.log('Generate task:', JSON.stringify({ ...generateTask, puLID: { inputImages: ['[REDACTED]'], weight: 0.8 } }))

    let data = null
    let lastError = ''
    
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        generateTask.taskUUID = randomUUID()
        console.log(`Retry attempt ${attempt + 1}`)
      }
      
      const runwareRes = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RUNWARE_API_KEY}`,
        },
        body: JSON.stringify([generateTask]),
        signal: AbortSignal.timeout(50000),
      })

      if (!runwareRes.ok) {
        lastError = await runwareRes.text()
        console.error('Runware HTTP error:', { status: runwareRes.status, body: lastError })
        continue
      }

      const resData = await runwareRes.json()
      
      if (resData?.errors?.length > 0) {
        lastError = JSON.stringify(resData.errors)
        console.error('Runware inference error:', resData.errors)
        continue
      }
      
      if (resData?.data?.[0]?.imageURL) {
        data = resData
        break
      }
      
      lastError = JSON.stringify(resData)
      console.error('No imageURL in response:', resData)
    }

    if (!data) {
      return NextResponse.json({ 
        error: 'Image generation failed after retries. Please try again.', 
        details: lastError 
      }, { status: 502 })
    }
    
    const imageUrl = data.data[0].imageURL
    const cost = data.data[0].cost

    return NextResponse.json({ 
      imageUrl,
      cost: cost ? `$${cost.toFixed(4)}` : undefined,
      prompt: generateTask.positivePrompt,
      inputStyle: style,
      inputMetadata: { jobTitle, accessories, location }
    })
  } catch (error) {
    console.error('Generate API critical error:', error)
    return NextResponse.json({ 
      error: 'Unexpected server error during image generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
