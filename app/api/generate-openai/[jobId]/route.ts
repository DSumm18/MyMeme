import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 10

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
  }
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.openai.com/v1/responses/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenAI poll error:', { status: response.status, body: errText })
      return NextResponse.json({ error: 'Failed to check job status', details: errText }, { status: 502 })
    }

    const data = await response.json()

    // If still processing, return early
    if (data.status === 'in_progress' || data.status === 'queued') {
      return NextResponse.json({ status: 'processing' })
    }

    // If failed/cancelled
    if (data.status === 'failed' || data.status === 'cancelled') {
      return NextResponse.json({ 
        status: 'failed', 
        error: 'Image generation failed. Please try again.' 
      })
    }

    // Completed — extract the image
    let generatedImageB64: string | null = null
    if (data.output) {
      for (const item of data.output) {
        if (item.type === 'image_generation_call' && item.result) {
          generatedImageB64 = item.result
          break
        }
        if (item.type === 'message' && item.content) {
          for (const part of item.content) {
            if (part.type === 'image_generation_call' && part.result) {
              generatedImageB64 = part.result
              break
            }
          }
          if (generatedImageB64) break
        }
      }
    }

    if (!generatedImageB64 && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.content && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c.type === 'image_generation_call' && c.result) {
              generatedImageB64 = c.result
              break
            }
          }
        }
        if (generatedImageB64) break
      }
    }

    if (!generatedImageB64) {
      console.error('No image in completed response:', JSON.stringify(data, null, 2).substring(0, 2000))
      return NextResponse.json({ 
        status: 'failed',
        error: 'No image generated. The AI may have declined to transform this photo.' 
      })
    }

    const imageUrl = `data:image/png;base64,${generatedImageB64}`

    const usage = data.usage
    const inputTokens = usage?.input_tokens || 0
    const outputTokens = usage?.output_tokens || 0
    const estimatedCost = (inputTokens * 2.5 / 1_000_000) + (outputTokens * 10 / 1_000_000) + 0.02

    return NextResponse.json({
      status: 'completed',
      imageUrl,
      cost: `~$${estimatedCost.toFixed(4)}`,
    })
  } catch (error) {
    console.error('Poll error:', error)
    return NextResponse.json({
      error: 'Failed to check job status',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
