import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Upload to Runware
    const uploadRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([{
        taskType: "imageUpload",
        taskUUID: randomUUID(),
        image: image,
      }]),
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Runware upload error:', errText)
      return NextResponse.json({ error: 'Image upload failed' }, { status: 502 })
    }

    const uploadData = await uploadRes.json()
    const imageUUID = uploadData?.data?.[0]?.imageUUID
    const imageUrl = uploadData?.data?.[0]?.imageURL

    if (!imageUrl) {
      return NextResponse.json({ error: 'Upload failed - no URL received' }, { status: 502 })
    }

    return NextResponse.json({ imageUrl, imageUUID })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
