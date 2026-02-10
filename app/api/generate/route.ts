import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { image, jobTitle, gender, style, occupation, accessories, location } = await req.json()

    if (!image || !jobTitle) {
      return NextResponse.json({ error: 'Image and job title are required' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Build a rich prompt from user inputs
    const styleMap: Record<string, string> = {
      caricature: 'fun cartoon caricature with exaggerated features, big head, vibrant colors',
      teacher: 'classroom-themed cartoon illustration, chalkboard background, educational setting',
      anime: 'Japanese anime style illustration, clean lines, vibrant anime aesthetic',
      watercolor: 'soft watercolor painting style, artistic brushstrokes, gentle colors',
      pixar: '3D Pixar-style character render, smooth surfaces, cinematic lighting',
      'pop-art': 'bold pop art style, Roy Lichtenstein dots, comic book aesthetic',
      'pencil-sketch': 'detailed pencil sketch, hand-drawn look, cross-hatching shading',
      'oil-painting': 'classical oil painting style, rich textures, Renaissance feel',
      comic: 'comic book illustration, bold outlines, dynamic pose, speech bubbles',
      retro: 'retro 80s illustration, neon colors, synthwave aesthetic',
    }

    const styleDesc = styleMap[style] || styleMap.caricature
    const accessoriesText = accessories ? `, wearing/holding ${accessories}` : ''
    const locationText = location ? `, in a ${location} setting` : ', in their workplace'

    const prompt = `A ${styleDesc} of a ${gender || 'person'} who works as a ${jobTitle}${accessoriesText}${locationText}. Professional illustration, high quality, detailed, fun and shareable on social media.`

    // Runware API: image-to-image with seedImage
    const task = {
      taskType: 'imageInference',
      taskUUID: randomUUID(),
      positivePrompt: prompt,
      model: 'runware:100@1', // FLUX Schnell — cheapest (~$0.003)
      seedImage: image, // data URI from client
      strength: 0.75, // transform significantly but keep face structure
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
