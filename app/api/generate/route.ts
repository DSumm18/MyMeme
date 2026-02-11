import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { image, jobTitle, gender, style, accessories, location } = await req.json()

    if (!image || !style) {
      return NextResponse.json({ error: 'Image and style are required' }, { status: 400 })
    }

    const apiKey = process.env.RUNWARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Style map for PhotoMaker prompts
    const styleMap: Record<string, string> = {
      caricature: "A fun cartoon caricature with exaggerated features, big expressive eyes, colorful vibrant style, professional digital art caricature illustration",
      watercolor: "A beautiful soft watercolor painting portrait, artistic brushstrokes, gentle pastel colors, fine art watercolor style",
      anime: "A Japanese anime style illustration, clean lines, large expressive eyes, vibrant anime aesthetic, studio quality anime art",
      'pop-art': "A bold pop art portrait in the style of Roy Lichtenstein, Ben-Day dots, primary colors, comic book pop art aesthetic",
      'clay-3d': "A 3D clay figure sculpture, Claymation style, smooth clay texture, Aardman animation style, sculpted clay character",
      superhero: "An epic superhero comic book portrait, dramatic lighting, superhero costume, powerful pose, Marvel/DC comic book style",
      'renaissance': "A classical Renaissance oil painting portrait, rich textures, dramatic chiaroscuro lighting, Old Masters painting style",
      'pencil-sketch': "A detailed pencil sketch portrait, hand-drawn graphite, cross-hatching shading, artistic pencil drawing on paper",
      pixar: "A 3D Pixar-style animated character, smooth surfaces, big expressive eyes, cinematic lighting, Disney Pixar animation",
      'retro-80s': "A retro 1980s synthwave portrait, neon colors, chrome effects, grid background, outrun aesthetic",
      'comic-book': "A bold comic book illustration, thick ink outlines, dynamic halftone dots, superhero comic art style",
      sticker: "A cute die-cut sticker illustration, white border, kawaii style, flat colors, adorable sticker design",
      lego: "A Lego minifigure portrait, blocky plastic toy style, yellow skin, Lego character design",
      gta: "A GTA V loading screen style portrait, hyper-stylized illustration, Grand Theft Auto art style, sharp edges",
      simpsons: "A Simpsons cartoon character, yellow skin, overbite, Matt Groening art style, Springfield cartoon",
      minecraft: "A Minecraft character portrait, blocky pixelated 3D style, square head, voxel art, Minecraft game aesthetic"
    }

    const styleDesc = styleMap[style] || styleMap.caricature
    const accessoriesText = accessories ? `, with ${accessories}` : ''
    const locationText = location ? `, in a ${location} setting` : ''
    const jobTitleText = jobTitle ? `, as a ${jobTitle}` : ''

    // Step 1: Upload image to Runware to get a UUID
    const uploadTask = {
      taskType: "imageUpload",
      taskUUID: randomUUID(),
      image: image, // data URI from client
    }

    const uploadRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([uploadTask]),
    })

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Runware upload error:', uploadRes.status, errText)
      return NextResponse.json({ error: 'Image upload failed' }, { status: 502 })
    }

    const uploadData = await uploadRes.json()
    const imageUUID = uploadData?.data?.[0]?.imageUUID

    if (!imageUUID) {
      console.error('No imageUUID in upload response:', JSON.stringify(uploadData))
      return NextResponse.json({ error: 'Image upload failed' }, { status: 502 })
    }

    // Step 2: Run PhotoMaker with uploaded image UUID
    const photoMakerTask = {
      taskType: "photoMaker",
      taskUUID: randomUUID(),
      model: "civitai:139562@344487",
      inputImages: [imageUUID], // Use UUID from upload
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

    // Send PhotoMaker request to Runware API
    const runwareRes = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([photoMakerTask]),
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
      prompt: photoMakerTask.positivePrompt,
    })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}