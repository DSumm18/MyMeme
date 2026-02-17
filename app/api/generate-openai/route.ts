import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const styleDescriptions: Record<string, string> = {
  ghibli: "Studio Ghibli anime style - soft hand-painted watercolor textures, dreamy pastel colors, gentle warm sunlight, whimsical magical atmosphere, Hayao Miyazaki art direction, cel-shaded with visible brush texture",
  'oil-painting': "Classical oil painting style - rich impasto technique with visible thick brushstrokes, dramatic Rembrandt-style chiaroscuro lighting, warm golden tones and deep shadows, Dutch Golden Age masters quality",
  'cyberpunk-neon': "Cyberpunk neon style - drenched in electric pink and cyan holographic lighting, rain-soaked reflections on chrome surfaces, dark moody Blade Runner atmosphere, glowing circuit patterns, volumetric neon fog",
  renaissance: "Renaissance master painting style - Leonardo da Vinci sfumato technique, rich earth tones with subtle glazing layers, dramatic divine lighting, ornate period clothing with intricate embroidery",
  'italian-brainrot': "Exaggerated Italian meme style - wildly dramatic hand pinching gesture, impossibly passionate facial expression, Italian flag background, chef's kiss pose, over-the-top Mediterranean energy, comedic meme aesthetic",
  caricature: "Editorial caricature style - brilliantly exaggerated facial features, oversized expressive head on diminutive body, bold confident linework, professional magazine illustration quality",
  anime: "Premium Japanese anime style - large luminous eyes with detailed iris reflections, dynamic flowing hair, crisp sharp lineart, richly saturated colors, Makoto Shinkai film quality",
  pixar: "Pixar 3D animated character style - smooth skin with subsurface scattering, big round expressive eyes, warm cinematic golden-hour lighting, Disney Pixar feature film quality, charming character design",
  gta: "GTA V loading screen style - bold graphic outlines, highly saturated stylized realism, authentic Grand Theft Auto artwork aesthetic, urban backdrop, swagger and attitude",
  superhero: "Comic book superhero style - wearing a unique original costume with metallic and fabric textures, dramatic action-ready pose, volumetric rim lighting, Marvel/DC tier illustration",
  'clay-3d': "Claymation character style - smooth sculpted polymer clay texture, soft round features, warm studio lighting, Aardman Studios quality, miniature diorama setting",
  watercolor: "Loose watercolor painting style - wet-on-wet technique with beautiful color bleeds, artistic paint splatter accents, soft dreamy washes on textured paper, luminous skin tones",
  'pop-art': "Andy Warhol and Roy Lichtenstein pop art style - vibrant primary color blocks, halftone Ben-Day dots pattern, thick black graphic outlines, screen print aesthetic",
  'pencil-sketch': "Photorealistic pencil sketch style - incredibly detailed graphite work with masterful hatching, subtle tonal gradations, realistic texture on drawing paper, dramatic light and shadow",
  'comic-book': "Professional comic book style - bold black ink outlines, dynamic cell shading, vivid saturated colors, action comic panel composition, contemporary superhero comic illustration",
  sticker: "Die-cut sticker design style - thick clean white border, glossy holographic finish, cute kawaii chibi proportions, bright candy colors, trendy sticker sheet aesthetic",
  'retro-80s': "Retro 1980s synthwave style - neon pink and electric blue lighting, chrome reflections, laser grid horizon background, VHS scan lines, classic outrun synthwave aesthetic",
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

    const prompt = `Transform this photo into ${style.replace(/-/g, ' ')} art style${sceneText}. CRITICAL: Preserve the person's EXACT identity - same age, same face shape, same features, same hair color/style, same body type, same clothing. The result must be clearly recognizable as the same person. Style: ${styleDesc}`

    console.log('OpenAI generate request:', { style, promptLength: prompt.length })

    // Use GPT-4o Responses API with image_generation tool
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
      }),
      signal: AbortSignal.timeout(55000),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenAI API error:', { status: response.status, body: errText })
      return NextResponse.json({ error: 'OpenAI API request failed', details: errText }, { status: 502 })
    }

    const data = await response.json()

    // Extract generated image from response
    let generatedImageB64: string | null = null
    if (data.output) {
      for (const item of data.output) {
        if (item.type === 'image_generation_call' && item.result) {
          generatedImageB64 = item.result
          break
        }
      }
    }

    if (!generatedImageB64) {
      console.error('No generated image in OpenAI response:', JSON.stringify(data).substring(0, 500))
      return NextResponse.json({ error: 'No image generated by OpenAI' }, { status: 502 })
    }

    // Return as data URI
    const imageUrl = `data:image/png;base64,${generatedImageB64}`

    // Calculate approximate cost: GPT-4o image generation ~$0.02-0.08
    const usage = data.usage
    const inputTokens = usage?.input_tokens || 0
    const outputTokens = usage?.output_tokens || 0
    const estimatedCost = (inputTokens * 2.5 / 1_000_000) + (outputTokens * 10 / 1_000_000) + 0.02 // base image gen cost

    return NextResponse.json({
      imageUrl,
      cost: `~$${estimatedCost.toFixed(4)}`,
      prompt,
      inputStyle: style,
      provider: 'openai',
      inputMetadata: { jobTitle, accessories, location },
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
