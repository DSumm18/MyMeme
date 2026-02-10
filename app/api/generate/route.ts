import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { 
      image, 
      jobTitle, 
      gender, 
      style 
    } = await req.json()

    // Validate input
    if (!image || !jobTitle) {
      return NextResponse.json(
        { error: 'Image and job title are required' }, 
        { status: 400 }
      )
    }

    // Construct prompt
    const prompt = `A fun cartoon caricature of a ${gender} ${jobTitle} at work, ${style} style, colorful, detailed workplace background, professional illustration, high quality`

    // Call Runware API 
    const runwareResponse = await fetch('https://runware.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'runware:100@1',
        prompt: prompt,
        image: image.split(',')[1], // Remove data URL prefix
        style: style
      })
    })

    if (!runwareResponse.ok) {
      throw new Error('Image generation failed')
    }

    const runwareData = await runwareResponse.json()

    // Return generated image URL
    return NextResponse.json({ 
      imageUrl: runwareData.imageUrl,
      prompt: prompt
    })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' }, 
      { status: 500 }
    )
  }
}