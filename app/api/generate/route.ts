import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { image, jobTitle, gender, style, occupation, accessories, location } = await req.json()

    if (!image || !style) {
      return NextResponse.json({ error: 'Image and style are required' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Expanded style map with new descriptions
    const styleMap: Record<string, string> = {
      caricature: 'fun cartoon caricature with exaggerated features, big head, vibrant colors',
      watercolor: 'soft watercolor painting style with fluid, translucent colors',
      anime: 'Japanese anime style illustration, clean lines, vibrant anime aesthetic',
      'pop-art': 'bold pop art style, Roy Lichtenstein dots, comic book aesthetic',
      'clay-3d': 'claymation-style character, textured clay appearance, smooth rounded forms',
      superhero: 'dramatic superhero comic book pose, muscular silhouette, heroic stance',
      'renaissance': 'classical Renaissance oil painting, rich color palette, dramatic lighting',
      'pencil-sketch': 'detailed pencil sketch, hand-drawn look, cross-hatching shading',
      pixar: 'Pixar-style 3D cartoon render, smooth surfaces, big expressive eyes',
      'retro-80s': 'retro synthwave illustration, neon colors, stylized 80s aesthetic',
      'comic-book': 'dynamic comic book illustration, bold outlines, dramatic shading',
      sticker: 'die-cut sticker style, clean vector graphics, white border',
      lego: 'LEGO minifigure style, blocky geometric forms, plastic toy aesthetic',
      gta: 'Grand Theft Auto loading screen style, gritty urban illustration',
      simpsons: 'Simpsons cartoon style, bright yellow skin, exaggerated features',
      minecraft: 'Minecraft blocky pixel art style, low-resolution cubic forms'
    }

    const styleDesc = styleMap[style] || styleMap.caricature
    const accessoriesText = accessories ? `, with ${accessories}` : ''
    const locationText = location ? `, in a ${location} setting` : ''

    // Updated prompt to focus on transforming the existing photo
    const prompt = `Transform this photograph into a ${styleDesc}. Maintain the person's facial features, expression, and likeness exactly${accessoriesText}${locationText}. Professional illustration, high quality, detailed, true to the original image.`

    // Runware API: image-to-image with seedImage
    const task = {
      taskType: 'imageInference',
      taskUUID: randomUUID(),
      positivePrompt: prompt,
      model: 'runware:100@1', // FLUX Schnell — cheapest (~$0.003)
      seedImage: image, // data URI from client
      strength: 0.55, // Lowered for better likeness preservation
      width: 1024,
      height: 1024,
      steps: 4,
      numberResults: 1,
      outputType: 'URL',
      outputFormat: 'JPG',
      includeCost: true,
    }

    const runwareRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([task]),
    })

    if (!runwareRes.ok) {
      const errText = await runwareRes.text()
      console.error('Runware API error:', runwareRes.status, errText)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 502 })
    }

    const data = await runwareRes.json()
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