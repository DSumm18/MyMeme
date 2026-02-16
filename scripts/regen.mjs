import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';

const API_KEY = "JpJrfN4Oyw50hWtaf6HTJKzhbgzniMUg";
const API_URL = "https://api.runware.ai/v1";
const EXAMPLES = "/Users/david/.openclaw/workspace/my-meme-web/public/examples";

async function apiCall(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(120000),
  });
  return res.json();
}

async function upload(filePath) {
  const b64 = readFileSync(filePath).toString('base64');
  const ext = filePath.endsWith('.png') ? 'png' : 'jpeg';
  const result = await apiCall([{ taskType: "imageUpload", taskUUID: randomUUID(), image: `data:image/${ext};base64,${b64}` }]);
  const uuid = result?.data?.[0]?.imageUUID;
  console.log(`Uploaded ${filePath} -> ${uuid}`);
  return uuid;
}

async function generate(name, prompt, imgUUID, output) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const t0 = Date.now();
      const result = await apiCall([{
        taskType: "imageInference",
        taskUUID: randomUUID(),
        model: "bfl:5@1",
        positivePrompt: prompt.substring(0, 1000),
        height: 1024, width: 1024,
        numberResults: 1,
        outputType: "URL", outputFormat: "JPG",
        includeCost: true,
        inputImages: [imgUUID],
      }]);
      
      if (result?.errors?.length) {
        console.log(`  ⚠️ ${name}: ${result.errors[0].message}`);
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      
      const url = result?.data?.[0]?.imageURL;
      const cost = result?.data?.[0]?.cost;
      if (!url) { console.log(`  ⚠️ ${name}: no URL`); continue; }
      
      const imgRes = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const buf = Buffer.from(await imgRes.arrayBuffer());
      writeFileSync(output, buf);
      console.log(`  ✅ ${name} ($${cost}, ${((Date.now()-t0)/1000).toFixed(1)}s)`);
      return true;
    } catch(e) {
      console.log(`  ❌ ${name}: ${e.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log(`  ❌ ${name} FAILED`);
  return false;
}

const STYLES = {
  ghibli: "Convert this portrait into Studio Ghibli anime art style with soft watercolor textures, cel-shaded coloring, expressive anime eyes, clean outlines, dreamy pastel sky background, warm Miyazaki lighting. Preserve the exact same face shape, hair color, eye color, and expression.",
  "oil-painting": "Convert this portrait into a masterful classical oil painting. Rich impasto brushstrokes, dramatic Rembrandt chiaroscuro lighting, warm golden tones, museum-quality fine art on aged canvas. Preserve the exact same face, hair color, eye color, and expression.",
  "cyberpunk-neon": "Convert this portrait into a cyberpunk neon style. Drench in electric pink and cyan holographic lighting, add rain-soaked chrome reflections, futuristic augmented reality overlays, dark Blade Runner atmosphere, glowing circuit patterns. Preserve the same face and features.",
  renaissance: "Convert this portrait into a magnificent Renaissance master painting. Leonardo da Vinci sfumato technique, rich earth tones with subtle glazing, divine chiaroscuro lighting, ornate period clothing with embroidery. Preserve the same face shape, hair color, eye color.",
  "italian-brainrot": "Convert this portrait into an exaggerated Italian gesture meme. Add wildly dramatic hand pinching gesture, impossibly passionate expression, Italian flag draped background, over-the-top Mediterranean energy, comedic meme style. Keep the same face recognizable.",
  caricature: "Convert this portrait into a masterful editorial caricature. Brilliantly exaggerate the facial features with artistic precision, oversized expressive head on tiny body, vibrant colors, bold confident linework, professional magazine illustration. Keep the person recognizable.",
  anime: "Convert this portrait into premium Japanese anime style. Large luminous eyes with detailed iris reflections, dynamic flowing hair, crisp sharp lineart, richly saturated colors, Makoto Shinkai film quality. Preserve exact face features, hair color, and eye color.",
  pixar: "Convert this portrait into a Pixar 3D animated character. Smooth skin with subsurface scattering, big round expressive eyes with catchlights, warm cinematic golden-hour lighting, Disney Pixar feature film quality. Preserve the same person's features.",
  gta: "Convert this portrait into a GTA V loading screen character. Bold graphic outlines with confident strokes, highly saturated stylized realism, authentic Grand Theft Auto artwork by Stephen Bliss, urban Los Santos backdrop. Keep same person. No text or words.",
  superhero: "Convert this portrait into a dynamic comic book superhero. Add a unique original costume with metallic and fabric textures, dramatic action-ready pose, volumetric rim lighting, professional Marvel/DC tier illustration. Preserve the same face.",
  "clay-3d": "Convert this portrait into a charming claymation character. Smooth sculpted polymer clay texture with fingerprint details, soft round features, warm studio photography lighting, Aardman Studios quality. Keep the person recognizable.",
  watercolor: "Convert this portrait into a stunning loose watercolor painting. Masterful wet-on-wet technique with beautiful color bleeds, artistic paint splatter accents, soft dreamy color washes on textured cold-press paper. Preserve the same person's face and features.",
  "pop-art": "Convert this portrait into bold pop art in Andy Warhol and Roy Lichtenstein style. Vibrant primary color blocks, precise halftone Ben-Day dots pattern, thick black graphic outlines, screen print aesthetic. Keep same person recognizable. No text.",
  "pencil-sketch": "Convert this portrait into a photorealistic pencil sketch. Incredibly detailed graphite work with masterful hatching and cross-hatching, subtle tonal gradations, realistic texture on heavyweight drawing paper. Preserve the same face and features.",
  "comic-book": "Convert this portrait into a professional comic book character. Bold black ink outlines with confident brush strokes, dynamic cell shading, vivid saturated colors, action comic panel composition. Keep same person. No text or speech bubbles.",
  sticker: "Convert this portrait into a premium die-cut sticker design. Thick clean white border, glossy holographic finish effect, cute kawaii chibi proportions, bright candy colors. Keep the person recognizable.",
  "retro-80s": "Convert this portrait into a retro 1980s synthwave style. Neon pink and electric blue lighting, chrome reflections, laser grid horizon background, VHS scan lines overlay, classic outrun synthwave aesthetic. Keep same person. No text or words.",
};

const MALE_STYLES = ["ghibli", "anime", "cyberpunk-neon", "gta", "oil-painting"];

async function main() {
  console.log("Uploading source images...");
  const femaleUUID = await upload("/Users/david/.openclaw/workspace/my-meme-web/public/styles/before.png");
  
  const malePath = "/Users/david/.openclaw/workspace/my-meme-web/public/examples/male-before.jpg";
  let maleUUID = null;
  if (existsSync(malePath)) {
    maleUUID = await upload(malePath);
  }

  console.log(`\n=== Generating ${Object.keys(STYLES).length} female examples ===`);
  let ok = 0, fail = 0;
  for (const [name, prompt] of Object.entries(STYLES)) {
    const success = await generate(name, prompt, femaleUUID, `${EXAMPLES}/${name}.jpg`);
    success ? ok++ : fail++;
    await new Promise(r => setTimeout(r, 1000));
  }

  if (maleUUID) {
    console.log(`\n=== Generating ${MALE_STYLES.length} male examples ===`);
    for (const name of MALE_STYLES) {
      const success = await generate(`male-${name}`, STYLES[name], maleUUID, `${EXAMPLES}/male-${name}.jpg`);
      success ? ok++ : fail++;
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n=== Done! ${ok} success, ${fail} failed. Est cost: ~$${(ok * 0.03).toFixed(2)} ===`);
}

main().catch(e => { console.error(e); process.exit(1); });
