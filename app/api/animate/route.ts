import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes max

interface RunwareResponse {
  taskUUID?: string;
  videoUrl?: string;
  cost?: number;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Generate unique task UUID
    const taskUUID = uuidv4();

    // Prepare Runware API request
    const runwarePayload = [{
      taskType: 'videoInference',
      taskUUID,
      inputImage: imageUrl,
      model: 'klingai:1@1',
      duration: 5,
      positivePrompt: 'subtle natural movement, gentle smile, slight head turn, cinematic, smooth motion',
      numberResults: 1,
      outputType: 'URL',
      outputFormat: 'mp4',
      includeCost: true,
      deliveryMethod: 'async'
    }];

    // Submit task to Runware
    const runwareResponse = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`
      },
      body: JSON.stringify(runwarePayload)
    });

    if (!runwareResponse.ok) {
      throw new Error('Failed to submit video task');
    }

    // Poll for task completion
    let videoResult: RunwareResponse | null = null;
    const maxAttempts = 36; // 3 minutes (5s * 36 = 180s)
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const pollPayload = [{
        taskType: 'getResponse',
        taskUUID: uuidv4(),
        responseTaskUUID: taskUUID
      }];

      const pollResponse = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RUNWARE_API_KEY}`
        },
        body: JSON.stringify(pollPayload)
      });

      if (!pollResponse.ok) {
        continue;
      }

      const pollResult: RunwareResponse[] = await pollResponse.json();
      const result = pollResult[0];

      if (result.videoUrl) {
        videoResult = result;
        break;
      }
    }

    if (!videoResult?.videoUrl) {
      return NextResponse.json({ error: 'Video generation timed out' }, { status: 408 });
    }

    return NextResponse.json({
      videoUrl: videoResult.videoUrl,
      cost: videoResult.cost || 0
    });

  } catch (error) {
    console.error('Animation error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}