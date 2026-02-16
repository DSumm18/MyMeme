# Runware Face-Preserving Style Transfer - Findings

## Date: 2026-02-16

## Winner: PuLID with FLUX.1 Dev (`runware:101@1`)

### How It Works
PuLID (Pure and Lightning ID Customization) transfers facial characteristics from a reference image into generated images. It's a first-class Runware API feature — no LoRAs or ControlNet hacking needed.

### API Parameters
```json
{
  "taskType": "imageInference",
  "taskUUID": "<uuid>",
  "outputType": "URL",
  "outputFormat": "jpg",
  "positivePrompt": "<style description prompt>",
  "height": 1024,
  "width": 1024,
  "model": "runware:101@1",
  "steps": 20,
  "numberResults": 1,
  "includeCost": true,
  "puLID": {
    "inputImages": ["<uploaded-image-uuid>"],
    "idWeight": 1
  }
}
```

### Key PuLID Parameters
| Parameter | Range | Default | Notes |
|-----------|-------|---------|-------|
| `puLID.inputImages` | 1 image | required | UUID of uploaded face reference |
| `puLID.idWeight` | 0-3 | 1 | Higher = stronger face resemblance |
| `puLID.trueCFGScale` | 0-10 | - | Identity guidance scale (CANNOT combine with CFGStartStep) |
| `puLID.CFGStartStep` | 0-10 | - | When identity kicks in (lower = earlier = stronger) |
| `puLID.CFGStartStepPercentage` | 0-100 | - | Alternative to CFGStartStep |

### ⚠️ Important: `trueCFGScale` and `CFGStartStep` are MUTUALLY EXCLUSIVE — use one or the other.

### Image Upload (Required First Step)
```json
[{
  "taskType": "imageUpload",
  "taskUUID": "<uuid>",
  "image": "data:image/png;base64,<base64>"
}]
```
Returns `imageUUID` to use in `puLID.inputImages`.

### Cost
- **$0.0032 per image** (1024x1024, 20 steps, FLUX.1 Dev)
- Upload: free
- That's ~312 images per dollar

### Performance
- ~90 seconds sync (can timeout at 60s — may need retry)
- Async delivery available via `deliveryMethod: "async"` + polling with `getResponse`

### Test Result
- **Source:** before.png (brown-haired, blue-eyed woman, oval face, warm smile)
- **Output:** ghibli-test-v2.jpg — Ghibli anime style
- **Face preservation:** ✅ Excellent — brown hair, blue eyes, face shape, smile all preserved
- **Style transfer:** ✅ Clean Ghibli/Miyazaki aesthetic

### Other Options Available (Not Tested)
1. **ACE++** (`acePlusPlus` + `referenceImages`) — requires FLUX Fill model (`runware:102@1`), supports portrait and local_editing modes
2. **IP-Adapters** — style transfer from guide images, less face-specific
3. **FLUX.1 Kontext** (`runware:106@1`) — uses `referenceImages` for visual consistency

### Recommendation
**Use PuLID with `runware:101@1`** for the meme website. It's:
- Simple API (just add `puLID` object)
- Cheap ($0.003/image)
- Great face preservation
- Works with any style prompt
