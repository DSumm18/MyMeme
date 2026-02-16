#!/usr/bin/env python3
"""Regenerate all example images using the fixed inputImages API."""

import json
import requests
import uuid
import base64
import sys
import time
import os

API_KEY = "JpJrfN4Oyw50hWtaf6HTJKzhbgzniMUg"
API_URL = "https://api.runware.ai/v1"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
}

EXAMPLES_DIR = "/Users/david/.openclaw/workspace/my-meme-web/public/examples"

STYLES = {
    "ghibli": "Transform this photo into a Studio Ghibli anime portrait. Soft hand-painted watercolor textures, dreamy pastel sky with wispy clouds, gentle warm sunlight, whimsical magical atmosphere, Hayao Miyazaki art direction, cel-shaded with visible brush texture. Keep the same person, face, hair color, eye color, and expression.",
    "oil-painting": "Transform this photo into a masterful classical oil painting portrait. Rich impasto technique with visible thick brushstrokes, dramatic Rembrandt-style chiaroscuro lighting, warm golden tones, museum-quality fine art on canvas. Keep the same person, face, and features.",
    "cyberpunk-neon": "Transform this photo into a stunning cyberpunk neon portrait. Drenched in electric pink and cyan holographic lighting, rain-soaked chrome reflections, futuristic augmented reality overlays, dark Blade Runner atmosphere, glowing circuit patterns. Keep the same person and face.",
    "renaissance": "Transform this photo into a magnificent Renaissance master painting portrait. Leonardo da Vinci sfumato technique, rich earth tones, dramatic divine chiaroscuro lighting, ornate period clothing. Keep the same person, face, and features.",
    "italian-brainrot": "Transform this photo into an extremely exaggerated Italian gesture meme portrait. Wildly dramatic hand pinching gesture, impossibly passionate expression, Italian flag background, chef's kiss pose, comedic meme style. Keep the same person's face.",
    "caricature": "Transform this photo into a masterful editorial caricature. Brilliantly exaggerated facial features, oversized expressive head on small body, vibrant colors, bold linework, professional magazine illustration. Keep the same person recognizable.",
    "anime": "Transform this photo into a premium Japanese anime character portrait. Large luminous eyes with detailed iris reflections, dynamic flowing hair, crisp sharp lineart, saturated colors, Makoto Shinkai film quality. Keep the same person, hair color, and eye color.",
    "pixar": "Transform this photo into a Pixar 3D animated character. Flawless subsurface scattering on smooth skin, big round expressive eyes, warm cinematic golden-hour lighting, Disney Pixar feature film quality. Keep the same person and features.",
    "gta": "Transform this photo into a GTA V loading screen character portrait. Bold graphic outlines, highly saturated stylized realism, cinematic wide composition, authentic Grand Theft Auto artwork style, urban backdrop. Keep the same person. No text or words.",
    "superhero": "Transform this photo into a dynamic comic book superhero portrait. Wearing a unique original costume with metallic textures, dramatic action pose, volumetric rim lighting, Marvel/DC tier illustration. Keep the same person's face.",
    "clay-3d": "Transform this photo into a charming claymation character. Smooth sculpted polymer clay texture, soft round features, warm studio lighting, Aardman Studios quality, miniature diorama setting. Keep the same person recognizable.",
    "watercolor": "Transform this photo into a stunning loose watercolor painting. Masterful wet-on-wet technique with beautiful color bleeds, artistic paint splatter, soft dreamy washes on textured paper, gallery-quality fine art. Keep the same person.",
    "pop-art": "Transform this photo into bold pop art in Andy Warhol and Roy Lichtenstein style. Vibrant primary color blocks, precise halftone Ben-Day dots, thick black outlines, screen print aesthetic. Keep the same person. No text.",
    "pencil-sketch": "Transform this photo into a photorealistic pencil sketch. Incredibly detailed graphite with masterful hatching and cross-hatching, subtle tonal gradations, realistic texture on heavyweight paper. Keep the same person and features.",
    "comic-book": "Transform this photo into a professional comic book character portrait. Bold black ink outlines, dynamic cell shading, vivid saturated colors, action comic style. Keep the same person. No text or speech bubbles.",
    "sticker": "Transform this photo into a premium die-cut sticker design. Thick clean white border, glossy finish, cute kawaii chibi proportions, bright candy colors, trendy sticker aesthetic. Keep the same person recognizable.",
    "retro-80s": "Transform this photo into a retro 1980s synthwave portrait. Neon pink and electric blue lighting, chrome reflections, laser grid horizon, VHS scan lines, classic outrun synthwave aesthetic. Keep the same person. No text or words.",
}


def upload_image(image_path):
    """Upload an image to Runware and return its UUID."""
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()

    ext = os.path.splitext(image_path)[1].lower()
    mime = "image/png" if ext == ".png" else "image/jpeg"
    data_uri = f"data:{mime};base64,{b64}"

    payload = [{"taskType": "imageUpload", "taskUUID": str(uuid.uuid4()), "image": data_uri}]
    resp = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
    resp.raise_for_status()
    result = resp.json()
    img_uuid = result["data"][0]["imageUUID"]
    print(f"  Uploaded {image_path} -> {img_uuid}")
    return img_uuid


def generate_image(image_uuid, style_name, prompt, output_path):
    """Generate a styled image using GPT Image with inputImages."""
    payload = [{
        "taskType": "imageInference",
        "taskUUID": str(uuid.uuid4()),
        "model": "openai:4@1",
        "positivePrompt": prompt[:1000],
        "height": 1024,
        "width": 1024,
        "numberResults": 1,
        "outputType": "URL",
        "outputFormat": "JPG",
        "includeCost": True,
        "inputImages": [image_uuid],
    }]

    for attempt in range(3):
        try:
            resp = requests.post(API_URL, headers=HEADERS, json=payload, timeout=120)
            resp.raise_for_status()
            result = resp.json()

            if "errors" in result:
                print(f"  ⚠️  {style_name} attempt {attempt+1} error: {result['errors']}")
                payload[0]["taskUUID"] = str(uuid.uuid4())
                time.sleep(5)
                continue

            image_url = result["data"][0]["imageURL"]
            cost = result["data"][0].get("cost", "?")
            
            # Download
            img_resp = requests.get(image_url, timeout=30)
            img_resp.raise_for_status()
            with open(output_path, "wb") as f:
                f.write(img_resp.content)
            
            print(f"  ✅ {style_name} -> {output_path} (${cost})")
            return True
        except Exception as e:
            print(f"  ❌ {style_name} attempt {attempt+1} failed: {e}")
            time.sleep(5)
    
    print(f"  ❌ {style_name} FAILED after 3 attempts")
    return False


def main():
    os.makedirs(EXAMPLES_DIR, exist_ok=True)
    
    # Upload female source
    female_path = "/Users/david/.openclaw/workspace/my-meme-web/public/styles/before.png"
    print("Uploading female source...")
    female_uuid = upload_image(female_path)
    
    # Upload male source
    male_path = "/Users/david/.openclaw/workspace/my-meme-web/public/examples/male-before.jpg"
    male_uuid = None
    if os.path.exists(male_path):
        print("Uploading male source...")
        male_uuid = upload_image(male_path)
    else:
        print("⚠️  No male source found, skipping male examples")
    
    total_cost = 0.0
    
    # Generate female examples (all styles)
    print(f"\n=== Generating {len(STYLES)} female examples ===")
    for style_name, prompt in STYLES.items():
        output = os.path.join(EXAMPLES_DIR, f"{style_name}.jpg")
        success = generate_image(female_uuid, style_name, prompt, output)
        if success:
            total_cost += 0.133
        time.sleep(2)  # Rate limiting
    
    # Generate male examples (subset)
    male_styles = ["ghibli", "anime", "cyberpunk-neon", "gta", "oil-painting"]
    if male_uuid:
        print(f"\n=== Generating {len(male_styles)} male examples ===")
        for style_name in male_styles:
            prompt = STYLES[style_name]
            output = os.path.join(EXAMPLES_DIR, f"male-{style_name}.jpg")
            success = generate_image(male_uuid, style_name, prompt, output)
            if success:
                total_cost += 0.133
            time.sleep(2)
    
    print(f"\n=== Done! Estimated total cost: ${total_cost:.2f} ===")


if __name__ == "__main__":
    main()
