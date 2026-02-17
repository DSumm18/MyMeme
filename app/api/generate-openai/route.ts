import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 10

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const styleDescriptions: Record<string, string> = {
  ghibli: "Hand-painted 2D animation portrait with soft watercolor shading, warm sunlight, pastel background, gentle cel shading, whimsical and cosy illustration style.",
  'oil-painting': "Classical oil painting portrait with soft brushwork, warm directional lighting, subtle canvas texture, realistic skin tones and natural facial detail.",
  'cyberpunk-neon': "Cyberpunk neon portrait illustration with magenta and cyan rim lighting, soft futuristic city background, subtle holographic accents, cinematic glow, high detail but natural skin texture, balanced lighting on the face.",
  renaissance: "Renaissance portrait painting with soft sfumato technique, warm earth tones, subtle glazing, gentle directional lighting, period-inspired clothing with fine detail.",
  'italian-brainrot': "Exaggerated Italian meme portrait with dramatic hand pinching gesture, passionate expression, Italian flag hints in background, comedic Mediterranean energy, meme aesthetic but face stays recognisable.",
  caricature: "Editorial caricature portrait with subtle exaggeration (maximum 15%), bold linework, magazine illustration style, person must remain clearly recognisable.",
  anime: "Clean Japanese anime portrait with soft shading, expressive eyes that still match the real face, natural hair detail, cinematic background lighting.",
  pixar: "Stylised 3D character portrait with soft skin rendering, gentle cinematic lighting, expressive but recognisable face, studio-quality render.",
  gta: "GTA V loading screen portrait with bold graphic outlines, saturated stylized colours, urban backdrop, confident attitude, face clearly recognisable.",
  superhero: "Comic book superhero portrait with a unique costume, dynamic pose, cinematic rim lighting, high detail illustration, face clearly the same person.",
  'clay-3d': "Claymation character portrait with smooth sculpted clay texture, soft rounded features, warm studio lighting, miniature diorama feel, recognisable face.",
  watercolor: "Soft watercolor portrait with gentle colour bleeding, light paper texture, luminous natural skin tones, artistic but recognisable likeness.",
  'pop-art': "Pop art portrait with vibrant colour blocks, halftone dot pattern, bold graphic outlines, screen print aesthetic, face clearly recognisable.",
  'pencil-sketch': "Highly detailed graphite portrait drawing, fine shading and hatching, realistic proportions, clean paper background.",
  'comic-book': "Professional comic book portrait with bold ink outlines, dynamic cell shading, vivid colours, action panel composition, face clearly the same person.",
  sticker: "Cute chibi-style portrait with simplified proportions, still recognisable as the same person, bright colours and sticker outline, die-cut border.",
  'retro-80s': "Retro synthwave portrait with soft neon pink and blue rim lighting, chrome accents, laser grid background, natural skin texture preserved, VHS aesthetic.",
}

export async function POST(req: NextRequest) {
  try {
    const { image, jobTitle, gender = '', style, accessories, location } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }
    if (!image.startsWith('data:image')) {
      return NextResponse.json({ error: 'Invalid image format. Must be a data URI' }, { status: 400 })
    }
    if (!style) {
      return NextResponse.json({ error: 'Style is required' }, { status: 400 })
    }
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const imageSizeInKB = Math.round(image.length * 0.75 / 1024)
    if (imageSizeInKB > 2048) {
      return NextResponse.json({ error: 'Image too large. Max 2MB.' }, { status: 400 })
    }

    const styleDesc = styleDescriptions[style] || styleDescriptions.caricature
    const sceneDetails = [
      jobTitle ? `as a ${jobTitle}` : '',
      location ? `in a ${location}` : '',
      accessories ? `with ${accessories}` : '',
    ].filter(Boolean).join(', ')
    const sceneText = sceneDetails ? `, ${sceneDetails}` : ''

    const prompt = `Create a stylised portrait transformation of the SAME PERSON in the reference photo${sceneText}.

Identity rules (highest priority):
- keep the exact face shape and proportions
- keep the same age appearance
- keep natural skin texture (do not age or smooth excessively)
- keep the same hair colour and hairstyle
- keep the same expression
- keep the same clothing

Only change the ART STYLE, lighting mood, and background.

Style description: ${styleDesc}`

    console.log('OpenAI generate request:', { style, promptLength: prompt.length })

    // Use GPT-4o Responses API with background mode for async generation
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        background: true,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_image',
                image_url: image,
              },
              {
                type: 'input_text',
                text: prompt,
              },
            ],
          },
        ],
        tools: [
          {
            type: 'image_generation',
            quality: 'high',
            size: '1024x1024',
          },
        ],
        tool_choice: { type: 'image_generation' },
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenAI API error:', { status: response.status, body: errText })
      return NextResponse.json({ error: 'OpenAI API request failed', details: errText }, { status: 502 })
    }

    const data = await response.json()

    // Background mode returns immediately with an ID and status
    return NextResponse.json({
      jobId: data.id,
      status: data.status || 'processing',
    })
  } catch (error) {
    console.error('OpenAI generate error:', error)
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Request timed out. Please try again.' }, { status: 504 })
    }
    return NextResponse.json({
      error: 'Unexpected server error during image generation',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
