import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const maxDuration = 300 // 5 minutes max for video generation

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const taskUUID = randomUUID()

    // Submit async video generation task
    const submitRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([{
        taskType: 'videoInference',
        taskUUID,
        inputImage: imageUrl,
        model: 'klingai:1@1',
        duration: 5,
        positivePrompt: 'subtle natural movement, gentle smile, slight head turn, cinematic, smooth motion, high quality',
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
    
    // Check for errors in submit response
    if (submitData?.errors?.length > 0) {
      console.error('Runware video submit errors:', submitData.errors)
      return NextResponse.json({ error: submitData.errors[0]?.message || 'Video generation failed' }, { status: 502 })
    }

    console.log('Video task submitted, polling for result...')

    // Poll for completion (every 5 seconds, max 3 minutes)
    const maxAttempts = 36
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 5000))

      const pollRes = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify([{
          taskType: 'getResponse',
          taskUUID: randomUUID(),
          responseTaskUUID: taskUUID
        }]),
      })

      if (!pollRes.ok) continue

      const pollData = await pollRes.json()
      
      // Check for errors
      if (pollData?.errors?.length > 0) {
        console.error('Video poll error:', pollData.errors)
        return NextResponse.json({ error: pollData.errors[0]?.message || 'Video generation failed' }, { status: 502 })
      }

      // Check for video result in data array
      const result = pollData?.data?.[0]
      if (result?.videoURL || result?.videoUrl) {
        const videoUrl = result.videoURL || result.videoUrl
        console.log(`Video ready after ${(attempt + 1) * 5}s, cost: ${result.cost}`)
        return NextResponse.json({
          videoUrl,
          cost: result.cost ? `$${result.cost.toFixed(4)}` : undefined
        })
      }
    }

    return NextResponse.json({ error: 'Video generation timed out. Please try again.' }, { status: 408 })

  } catch (error) {
    console.error('Animate API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
