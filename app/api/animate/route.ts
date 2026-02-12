import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const maxDuration = 30

// Step 1: Submit the video generation task and return taskUUID immediately
export async function POST(req: NextRequest) {
  try {
    const { imageUrl, duration = 5, style = 'original' } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Validate duration (5 or 10 seconds)
    const videoDuration = duration === 10 ? 10 : 5

    // Choose prompt based on style type
    // ALL styled images should keep their art style when animated — only 'original' photos get the realistic prompt
    const isOriginal = style === 'original'
    
    const animatePrompt = isOriginal
      ? 'subtle natural movement, gentle smile, slight head turn, preserve exact facial features and age, flattering soft warm lighting, cinematic, smooth motion, high quality, beautiful, youthful glow'
      : 'maintain exact art style, keep illustration style, subtle movement, gentle expression change, smooth animation, do not convert to realistic photo, preserve the artistic medium exactly as shown'

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const taskUUID = randomUUID()

    const submitRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([{
        taskType: 'videoInference',
        taskUUID,
        frameImages: [
          {
            inputImage: imageUrl,
            frame: 'first'
          }
        ],
        model: 'klingai:1@1',
        duration: videoDuration,
        positivePrompt: animatePrompt,
        numberResults: 1,
        outputType: 'URL',
        outputFormat: 'mp4',
        includeCost: true,
        deliveryMethod: 'async'
      }]),
    })

    if (!submitRes.ok) {
      const errText = await submitRes.text()
      console.error('Runware video submit error:', errText)
      return NextResponse.json({ error: 'Failed to start video generation' }, { status: 502 })
    }

    const submitData = await submitRes.json()
    
    if (submitData?.errors?.length > 0) {
      console.error('Runware video submit errors:', submitData.errors)
      return NextResponse.json({ error: submitData.errors[0]?.message || 'Video generation failed' }, { status: 502 })
    }

    // Return taskUUID immediately - client will poll separately
    return NextResponse.json({ taskUUID })

  } catch (error) {
    console.error('Animate API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
