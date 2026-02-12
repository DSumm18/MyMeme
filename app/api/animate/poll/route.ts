import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const maxDuration = 15

// Step 2: Poll for video completion by taskUUID
export async function POST(req: NextRequest) {
  try {
    const { taskUUID } = await req.json()

    if (!taskUUID) {
      return NextResponse.json({ error: 'taskUUID is required' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

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

    if (!pollRes.ok) {
      return NextResponse.json({ status: 'processing' })
    }

    const pollData = await pollRes.json()

    if (pollData?.errors?.length > 0) {
      console.error('Video poll error:', pollData.errors)
      return NextResponse.json({ status: 'error', error: pollData.errors[0]?.message || 'Video generation failed' })
    }

    const result = pollData?.data?.[0]
    if (result?.videoURL || result?.videoUrl) {
      const videoUrl = result.videoURL || result.videoUrl
      return NextResponse.json({
        status: 'complete',
        videoUrl,
        cost: result.cost ? `$${result.cost.toFixed(4)}` : undefined
      })
    }

    // Not ready yet
    return NextResponse.json({ status: 'processing' })

  } catch (error) {
    console.error('Animate poll error:', error)
    return NextResponse.json({ status: 'error', error: 'Poll failed' })
  }
}
