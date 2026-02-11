import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { image, jobTitle, gender, style, accessories, location } = await req.json()

    if (!image || !style) {
      return NextResponse.json({ error: 'Image and style are required' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Expanded style map with new descriptions
    const styleMap: Record<string, string> = {
      caricature: 'A fun cartoon caricature illustration with exaggerated features, big head, vibrant colors, professional digital art, highly detailed',
      watercolor: 'Soft watercolor painting style with fluid, translucent colors, delicate brush strokes, ethereal and dreamy quality',
      anime: 'Japanese anime style illustration, clean lines, vibrant anime aesthetic, expressive big eyes, dynamic character design',
      'pop-art': 'Bold pop art style, Roy Lichtenstein dots, comic book aesthetic, high contrast colors, graphic illustration',
      'clay-3d': 'Claymation-style character, textured clay appearance, smooth rounded forms, warm lighting, handcrafted look',
      superhero: 'Dramatic superhero comic book pose, muscular silhouette, heroic stance, dynamic action lighting, bold color palette',
      'renaissance': 'Classical Renaissance oil painting, rich color palette, dramatic lighting, detailed portraiture, chiaroscuro technique',
      'pencil-sketch': 'Detailed pencil sketch, hand-drawn look, cross-hatching shading, textured paper background, soft graphite lines',
      pixar: 'Pixar-style 3D cartoon render, smooth surfaces, big expressive eyes, soft color palette, charming character design',
      'retro-80s': 'Retro synthwave illustration, neon colors, stylized 80s aesthetic, glowing outlines, futuristic vaporwave design',
      'comic-book': 'Dynamic comic book illustration, bold outlines, dramatic shading, graphic novel style, vibrant color blocking',
      sticker: 'Die-cut sticker style, clean vector graphics, white border, minimalist design, flat color illustration',
      lego: 'LEGO minifigure style, blocky geometric forms, plastic toy aesthetic, bright colors, simplified character details',
      gta: 'Grand Theft Auto loading screen style, gritty urban illustration, high contrast, stylized character rendering',
      simpsons: 'Simpsons cartoon style, bright yellow skin, exaggerated features, simplified anatomy, iconic cartoon look',
      minecraft: 'Minecraft blocky pixel art style, low-resolution cubic forms, 8-bit aesthetic, simplified color palette'
    }

    const styleDesc = styleMap[style] || styleMap.caricature
    const accessoriesText = accessories ? `, with ${accessories}` : ''
    const locationText = location ? `, in a ${location} setting` : ''

    // Updated prompt to focus on transforming the existing photo
    const prompt = `Transform this photograph into a ${styleDesc}. Maintain the person's facial features, expression, and likeness exactly${accessoriesText}${locationText}. Professional illustration, high quality, detailed, true to the original image.`

    // Attempt FLUX Depth first
    const primaryTask = {
      taskType: 'imageInference',
      taskUUID: randomUUID(),
      positivePrompt: prompt,
      model: 'runware:103@1', // FLUX Depth 
      seedImage: image, // data URI from client
      width: 1024,
      height: 1024,
      steps: 28,
      numberResults: 1,
      outputType: 'URL',
      outputFormat: 'JPG',
      includeCost: true,
    }

    // Fallback to Schnell img2img
    const fallbackTask = {
      taskType: 'imageInference',
      taskUUID: randomUUID(),
      positivePrompt: prompt,
      model: 'runware:100@1', // FLUX Schnell
      seedImage: image,
      strength: 0.85, // Fallback if primary model fails
      width: 1024,
      height: 1024,
      steps: 4,
      numberResults: 1,
      outputType: 'URL',
      outputFormat: 'JPG',
      includeCost: true,
    }

    // First try the primary (FLUX Depth) model
    let runwareRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([primaryTask]),
    })

    let data
    if (!runwareRes.ok) {
      console.warn('FLUX Depth failed, trying fallback...')
      // If primary model fails, use fallback
      runwareRes = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify([fallbackTask]),
      })
    }

    if (!runwareRes.ok) {
      const errText = await runwareRes.text()
      console.error('Runware API error:', runwareRes.status, errText)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 502 })
    }

    data = await runwareRes.json()
    const imageUrl = data?.data?.[0]?.imageURL
    const cost = data?.data?.[0]?.cost

    if (!imageUrl) {
      console.error('No imageURL in Runware response:', JSON.stringify(data))
      return NextResponse.json({ error: 'No image generated' }, { status: 502 })
    }

    return NextResponse.json({ 
      imageUrl,
      cost: cost ? `$${cost.toFixed(4)}` : undefined,
      prompt,
    })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}