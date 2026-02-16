import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const maxDuration = 30

// SECURITY: Validate API key at module load
const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY
if (!RUNWARE_API_KEY) {
  console.warn('RUNWARE_API_KEY not configured - upload API will fail')
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!RUNWARE_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Validate image is a data URI
    if (typeof image !== 'string' || !image.startsWith('data:image')) {
      return NextResponse.json({ error: 'Invalid image format. Must be a data URI.' }, { status: 400 })
    }

    // Retry logic for robustness
    let uploadUrl: string | null = null
    let uploadUUID: string | null = null
    let lastError = ''

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const uploadRes = await fetch('https://api.runware.ai/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RUNWARE_API_KEY}`,
          },
          body: JSON.stringify([{
            taskType: "imageUpload",
            taskUUID: randomUUID(),
            image: image,
          }]),
          signal: AbortSignal.timeout(25000), // 25s timeout (maxDuration is 30s)
        })

        if (!uploadRes.ok) {
          lastError = `HTTP ${uploadRes.status}`
          console.error(`Runware upload error (attempt ${attempt + 1}):`, lastError)
          if (attempt < 1) continue
          return NextResponse.json({ error: 'Image upload failed after retries' }, { status: 502 })
        }

        const uploadData = await uploadRes.json()

        // Check for API-level errors
        if (uploadData?.errors?.length > 0) {
          lastError = uploadData.errors[0]?.message || 'Unknown error'
          console.error(`Runware upload API error (attempt ${attempt + 1}):`, lastError)
          if (attempt < 1) continue
          return NextResponse.json({ error: 'Image upload failed - API error' }, { status: 502 })
        }

        uploadUrl = uploadData?.data?.[0]?.imageURL
        uploadUUID = uploadData?.data?.[0]?.imageUUID

        if (!uploadUrl) {
          lastError = 'No imageURL in response'
          console.error(`Runware upload - no URL (attempt ${attempt + 1}):`, uploadData)
          if (attempt < 1) continue
          return NextResponse.json({ error: 'Upload failed - no URL received' }, { status: 502 })
        }

        // Success!
        break
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        console.error(`Upload attempt ${attempt + 1} failed:`, lastError)
        if (attempt < 1) continue
        return NextResponse.json({ error: 'Upload failed - network error' }, { status: 502 })
      }
    }

    if (!uploadUrl) {
      return NextResponse.json({ error: 'Upload failed after retries' }, { status: 502 })
    }

    return NextResponse.json({ imageUrl: uploadUrl, imageUUID: uploadUUID })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
