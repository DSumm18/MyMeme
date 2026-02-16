import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 15

// SECURITY: Validate API key at module load
const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY
if (!RUNWARE_API_KEY) {
  console.warn('RUNWARE_API_KEY not configured - animate poll API will fail')
}

// Step 2: Poll for video completion by taskUUID
export async function POST(req: NextRequest) {
  try {
    const { taskUUID } = await req.json()

    if (!taskUUID) {
      return NextResponse.json({ error: 'taskUUID is required' }, { status: 400 })
    }

    if (!RUNWARE_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const pollRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWARE_API_KEY}`,
      },
      body: JSON.stringify([{
        taskType: 'getResponse',
        taskUUID: taskUUID
      }]),
      signal: AbortSignal.timeout(10000), // 10s timeout (maxDuration is 15s)
    })

    if (!pollRes.ok) {
      return NextResponse.json({ status: 'processing' })
    }

    const pollData = await pollRes.json()

    // Check errors array first
    if (pollData?.errors?.length > 0) {
      console.error('Video poll error:', pollData.errors)
      return NextResponse.json({ status: 'error', error: pollData.errors[0]?.message || 'Video generation failed' })
    }

    // Check data array for results
    if (pollData?.data?.length > 0) {
      for (const item of pollData.data) {
        // Success - video ready
        if (item.status === 'success' && (item.videoURL || item.videoUrl)) {
          const videoUrl = item.videoURL || item.videoUrl
          return NextResponse.json({
            status: 'complete',
            videoUrl,
            cost: item.cost ? `$${item.cost.toFixed(4)}` : undefined
          })
        }
        // Error from provider
        if (item.status === 'error') {
          return NextResponse.json({ status: 'error', error: item.message || 'Video generation failed at provider' })
        }
        // Still processing
        if (item.status === 'processing') {
          return NextResponse.json({ status: 'processing' })
        }
      }
    }

    // Empty data = not ready yet
    return NextResponse.json({ status: 'processing' })

  } catch (error) {
    console.error('Animate poll error:', error)
    return NextResponse.json({ status: 'error', error: 'Poll failed' })
  }
}
