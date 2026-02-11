import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { image, jobTitle, gender = '', style, accessories, location } = await req.json()

    // Input validation with more detailed checks
    if (!image) {
      console.error('Generate API: No image provided')
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    if (!image.startsWith('data:image')) {
      console.error('Generate API: Invalid image data URI format')
      return NextResponse.json({ error: 'Invalid image format. Must be a data URI' }, { status: 400 })
    }

    if (!style) {
      console.error('Generate API: No style selected')
      return NextResponse.json({ error: 'Style is required' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      console.error('Generate API: Missing Runware API key')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Validate image size (to avoid massive payloads)
    const imageSizeInKB = Math.round(image.length * 0.75 / 1024)
    if (imageSizeInKB > 2048) {  // 2MB limit for base64 encoded image
      console.error(`Generate API: Image too large (${imageSizeInKB}KB)`)
      return NextResponse.json({ error: 'Image too large. Max 2MB.' }, { status: 400 })
    }

    // Style map remains the same...
    const styleMap: Record<string, string> = {
      caricature: "A professional caricature portrait, exaggerated funny features, big head small body, vibrant colors, sharp clean lines, editorial cartoon style",
      anime: "A Japanese anime character portrait, large expressive anime eyes, clean lineart, vibrant hair colors, anime art style like Studio Ghibli or Makoto Shinkai",
      pixar: "A Pixar 3D animated character, smooth plastic-like skin, big round eyes, warm lighting, Pixar movie still, Disney Pixar animation style",
      gta: "A GTA V loading screen character portrait, bold outlines, saturated colors, stylized realism, Grand Theft Auto artwork style by Stephen Bliss",
      superhero: "A comic book superhero portrait, wearing a superhero costume with cape, dynamic pose, bold comic book colors, Marvel DC comic art style",
      'clay-3d': "A cute Pixar-quality claymation character, smooth sculpted clay, soft round features, detailed texture, warm cinematic lighting, Aardman Studios quality",
      simpsons: "A Simpsons cartoon character, yellow skin, overbite, large round eyes, Matt Groening art style, The Simpsons TV show character design",
      watercolor: "A beautiful soft watercolor painting portrait, artistic brushstrokes, gentle pastel colors, fine art watercolor style",
      'pop-art': "A pop art portrait in the style of Andy Warhol and Roy Lichtenstein, bold primary colors, halftone dots, thick black outlines, comic book pop art",
      renaissance: "A classical Renaissance oil painting portrait, dramatic lighting like Rembrandt, rich warm tones, old master painting technique, museum quality fine art",
      'pencil-sketch': "A detailed pencil sketch portrait, hand-drawn graphite art, fine hatching and shading, realistic pencil drawing on white paper, artist sketch",
      'comic-book': "A comic book character portrait, bold black ink outlines, cell shading, vivid colors, action comic panel art style, superhero comic illustration",
      lego: "A LEGO minifigure portrait, blocky plastic toy character, yellow LEGO skin, simple dot eyes, LEGO brick world background, toy photography style",
      sticker: "A die-cut sticker design portrait, thick white border, glossy finish, cute kawaii style, chibi proportions, sticker sheet art",
      'retro-80s': "A retro 1980s synthwave portrait, neon pink and blue colors, chrome text effects, grid background, VHS aesthetic, outrun synthwave art style",
      minecraft: "A Minecraft character portrait, blocky pixelated 3D style, square head and body, voxel art, Minecraft game aesthetic"
    }

    // Build prompt with scene context FIRST, then style
    // Location and accessories are important for the scene - don't bury them at the end
    const styleDesc = styleMap[style] || styleMap.caricature
    const sceneDetails = [
      jobTitle ? `as a ${jobTitle}` : '',
      location ? `in a ${location}` : '',
      accessories ? `with ${accessories}` : '',
    ].filter(Boolean).join(', ')
    const sceneText = sceneDetails ? `, ${sceneDetails}` : ''

    // Image upload task
    const uploadTask = {
      taskType: "imageUpload",
      taskUUID: randomUUID(),
      image: image, // data URI from client
    }

    // Enhanced logging for upload task
    console.log('Runware Upload Task:', JSON.stringify({
      ...uploadTask,
      image: `[base64 data URI, ${imageSizeInKB}KB]`
    }))

    // Upload image to Runware
    const uploadRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([uploadTask]),
    })

    // Detailed error handling for upload
    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Runware upload error:', {
        status: uploadRes.status,
        body: errText
      })
      return NextResponse.json({ 
        error: 'Image upload to Runware failed', 
        details: errText 
      }, { status: 502 })
    }

    const uploadData = await uploadRes.json()
    const imageUUID = uploadData?.data?.[0]?.imageUUID

    if (!imageUUID) {
      console.error('No imageUUID in upload response:', {
        fullResponse: JSON.stringify(uploadData)
      })
      return NextResponse.json({ 
        error: 'Image upload failed - no UUID received', 
        response: uploadData 
      }, { status: 502 })
    }

    // PuLID task (much better face likeness than PhotoMaker)
    const generateTask = {
      taskType: "imageInference",
      taskUUID: randomUUID(),
      model: "runware:101@1",
      positivePrompt: `${styleDesc}${sceneText}`.substring(0, 295),
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

    // Enhanced logging for PuLID task
    console.log('PuLID Task:', JSON.stringify({
      ...generateTask,
      puLID: { inputImages: ['[REDACTED]'], weight: 0.8 }
    }))

    // PuLID API call with retry
    let data = null
    let lastError = ''
    
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        // Update taskUUID for retry
        generateTask.taskUUID = randomUUID()
        console.log(`PuLID retry attempt ${attempt + 1}`)
      }
      
      const runwareRes = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify([generateTask]),
      })

      if (!runwareRes.ok) {
        lastError = await runwareRes.text()
        console.error('Runware PuLID HTTP error:', { status: runwareRes.status, body: lastError })
        continue
      }

      const resData = await runwareRes.json()
      
      // Check for errors in response body (Runware returns 200 with errors array)
      if (resData?.errors?.length > 0) {
        lastError = JSON.stringify(resData.errors)
        console.error('Runware PuLID inference error:', resData.errors)
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

    // Successful generation response
    return NextResponse.json({ 
      imageUrl,
      cost: cost ? `$${cost.toFixed(4)}` : undefined,
      prompt: generateTask.positivePrompt,
      inputStyle: style,
      inputMetadata: {
        jobTitle,
        accessories,
        location
      }
    })
  } catch (error) {
    console.error('Generate API critical error:', error)
    return NextResponse.json({ 
      error: 'Unexpected server error during image generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}