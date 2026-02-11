import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { image, jobTitle, gender, style, accessories, location } = await req.json()

    // Input validation with more detailed checks
    if (!image) {
      console.error('Generate API: No image provided')
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    if (!image.startsWith('data:image')) {
      console.error('Generate API: Invalid image data URI format')
      return NextResponse.json({ error: 'Invalid image format. Must be a data URI' }, { status: 400 })
    }

    if (!style) {
      console.error('Generate API: No style selected')
      return NextResponse.json({ error: 'Style is required' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      console.error('Generate API: Missing Runware API key')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Validate image size (to avoid massive payloads)
    const imageSizeInKB = Math.round(image.length * 0.75 / 1024)
    if (imageSizeInKB > 2048) {  // 2MB limit for base64 encoded image
      console.error(`Generate API: Image too large (${imageSizeInKB}KB)`)
      return NextResponse.json({ error: 'Image too large. Max 2MB.' }, { status: 400 })
    }

    // Style map remains the same...
    const styleMap: Record<string, string> = {
      caricature: "A fun cartoon caricature with exaggerated features, big expressive eyes, colorful vibrant style, professional digital art caricature illustration",
      watercolor: "A beautiful soft watercolor painting portrait, artistic brushstrokes, gentle pastel colors, fine art watercolor style",
      // ... other styles remain the same
      minecraft: "A Minecraft character portrait, blocky pixelated 3D style, square head, voxel art, Minecraft game aesthetic"
    }

    const styleDesc = styleMap[style] || styleMap.caricature
    const accessoriesText = accessories ? `, with ${accessories}` : ''
    const locationText = location ? `, in a ${location} setting` : ''
    const jobTitleText = jobTitle ? `, as a ${jobTitle}` : ''

    // Image upload task
    const uploadTask = {
      taskType: "imageUpload",
      taskUUID: randomUUID(),
      image: image, // data URI from client
    }

    // Enhanced logging for upload task
    console.log('Runware Upload Task:', JSON.stringify({
      ...uploadTask,
      image: `[base64 data URI, ${imageSizeInKB}KB]`
    }))

    // Upload image to Runware
    const uploadRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([uploadTask]),
    })

    // Detailed error handling for upload
    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Runware upload error:', {
        status: uploadRes.status,
        body: errText
      })
      return NextResponse.json({ 
        error: 'Image upload to Runware failed', 
        details: errText 
      }, { status: 502 })
    }

    const uploadData = await uploadRes.json()
    const imageUUID = uploadData?.data?.[0]?.imageUUID

    if (!imageUUID) {
      console.error('No imageUUID in upload response:', {
        fullResponse: JSON.stringify(uploadData)
      })
      return NextResponse.json({ 
        error: 'Image upload failed - no UUID received', 
        response: uploadData 
      }, { status: 502 })
    }

    // PhotoMaker task
    const photoMakerTask = {
      taskType: "photoMaker",
      taskUUID: randomUUID(),
      model: "civitai:139562@344487",
      inputImages: [imageUUID],
      style: "No style",
      strength: 40,
      positivePrompt: `${styleDesc}${jobTitleText}${accessoriesText}${locationText}. Preserve the person's face and identity exactly.`,
      height: 1024,
      width: 1024,
      steps: 25,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "JPG",
      includeCost: true
    }

    // Enhanced logging for PhotoMaker task
    console.log('PhotoMaker Task:', JSON.stringify({
      ...photoMakerTask,
      imageUUID: '[REDACTED]'
    }))

    // PhotoMaker API call
    const runwareRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([photoMakerTask]),
    })

    // Detailed error handling for PhotoMaker
    if (!runwareRes.ok) {
      const errText = await runwareRes.text()
      console.error('Runware PhotoMaker error:', {
        status: runwareRes.status,
        body: errText
      })
      return NextResponse.json({ 
        error: 'Image generation failed', 
        details: errText 
      }, { status: 502 })
    }

    const data = await runwareRes.json()
    const imageUrl = data?.data?.[0]?.imageURL
    const cost = data?.data?.[0]?.cost

    if (!imageUrl) {
      console.error('No imageURL in Runware response:', {
        fullResponse: JSON.stringify(data)
      })
      return NextResponse.json({ 
        error: 'No image generated', 
        response: data 
      }, { status: 502 })
    }

    // Successful generation response
    return NextResponse.json({ 
      imageUrl,
      cost: cost ? `$${cost.toFixed(4)}` : undefined,
      prompt: photoMakerTask.positivePrompt,
      inputStyle: style,
      inputMetadata: {
        jobTitle,
        accessories,
        location
      }
    })
  } catch (error) {
    console.error('Generate API critical error:', error)
    return NextResponse.json({ 
      error: 'Unexpected server error during image generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}