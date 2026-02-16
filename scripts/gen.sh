#!/bin/bash
# Generate all example images using curl
set -e

API_KEY="JpJrfN4Oyw50hWtaf6HTJKzhbgzniMUg"
API_URL="https://api.runware.ai/v1"
EXAMPLES="/Users/david/.openclaw/workspace/my-meme-web/public/examples"

FEMALE_UUID="0430a24e-7705-4752-a1e3-d0777cd4e8ad"
MALE_UUID="96629dcc-1cb5-4acd-841b-88637e3c7495"

generate() {
  local name="$1"
  local prompt="$2"
  local uuid="$3"
  local output="$4"
  
  echo "Generating $name..."
  local task_uuid=$(uuidgen | tr '[:upper:]' '[:lower:]')
  
  local result=$(curl -s --max-time 180 -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d "[{
      \"taskType\":\"imageInference\",
      \"taskUUID\":\"$task_uuid\",
      \"model\":\"openai:4@1\",
      \"positivePrompt\":\"$prompt\",
      \"height\":1024,
      \"width\":1024,
      \"numberResults\":1,
      \"outputType\":\"URL\",
      \"outputFormat\":\"JPG\",
      \"includeCost\":true,
      \"inputImages\":[\"$uuid\"]
    }]")
  
  local url=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['imageURL'])" 2>/dev/null)
  
  if [ -n "$url" ] && [ "$url" != "None" ]; then
    curl -s -o "$output" "$url"
    echo "  ✅ $name -> $output"
  else
    echo "  ❌ $name FAILED: $result"
  fi
  
  sleep 2
}

# Female examples
generate "ghibli" "Transform this photo into a Studio Ghibli anime portrait. Soft hand-painted watercolor textures, dreamy pastel sky, Miyazaki art direction. Keep the same person, face, hair color, eye color." "$FEMALE_UUID" "$EXAMPLES/ghibli.jpg"
generate "oil-painting" "Transform this photo into a classical oil painting portrait. Rich impasto brushstrokes, Rembrandt chiaroscuro lighting, warm golden tones, museum-quality fine art. Keep the same person and features." "$FEMALE_UUID" "$EXAMPLES/oil-painting.jpg"
generate "cyberpunk-neon" "Transform this photo into a cyberpunk neon portrait. Electric pink and cyan holographic lighting, rain-soaked chrome, Blade Runner atmosphere, glowing circuits. Keep the same person." "$FEMALE_UUID" "$EXAMPLES/cyberpunk-neon.jpg"
generate "renaissance" "Transform this photo into a Renaissance master painting. Da Vinci sfumato technique, rich earth tones, divine chiaroscuro, ornate period clothing. Keep the same person." "$FEMALE_UUID" "$EXAMPLES/renaissance.jpg"
generate "italian-brainrot" "Transform this photo into an Italian gesture meme portrait. Dramatic hand pinching gesture, passionate expression, Italian flag background, chef kiss pose, comedic meme style. Keep the same face." "$FEMALE_UUID" "$EXAMPLES/italian-brainrot.jpg"
generate "caricature" "Transform this photo into an editorial caricature. Exaggerated facial features, oversized head on small body, vibrant colors, bold linework, magazine illustration. Keep recognizable." "$FEMALE_UUID" "$EXAMPLES/caricature.jpg"
generate "anime" "Transform this photo into a Japanese anime character. Large luminous eyes with reflections, flowing hair, crisp lineart, saturated colors, Makoto Shinkai quality. Keep same hair and eye color." "$FEMALE_UUID" "$EXAMPLES/anime.jpg"
generate "pixar" "Transform this photo into a Pixar 3D animated character. Smooth skin with subsurface scattering, big expressive eyes, warm cinematic lighting, Disney Pixar quality. Keep the same person." "$FEMALE_UUID" "$EXAMPLES/pixar.jpg"
generate "gta" "Transform this photo into a GTA V loading screen character. Bold graphic outlines, saturated stylized realism, Grand Theft Auto artwork style, urban backdrop. Keep same person. No text." "$FEMALE_UUID" "$EXAMPLES/gta.jpg"
generate "superhero" "Transform this photo into a comic book superhero. Unique original costume, dramatic action pose, volumetric rim lighting, Marvel tier illustration. Keep the same face." "$FEMALE_UUID" "$EXAMPLES/superhero.jpg"
generate "clay-3d" "Transform this photo into a claymation character. Sculpted polymer clay texture, soft round features, warm studio lighting, Aardman Studios quality. Keep recognizable." "$FEMALE_UUID" "$EXAMPLES/clay-3d.jpg"
generate "watercolor" "Transform this photo into a loose watercolor painting. Wet-on-wet technique, beautiful color bleeds, paint splatter, dreamy washes on textured paper. Keep the same person." "$FEMALE_UUID" "$EXAMPLES/watercolor.jpg"
generate "pop-art" "Transform this photo into pop art. Andy Warhol style, vibrant primary colors, halftone Ben-Day dots, thick black outlines, screen print aesthetic. Keep same person. No text." "$FEMALE_UUID" "$EXAMPLES/pop-art.jpg"
generate "pencil-sketch" "Transform this photo into a photorealistic pencil sketch. Detailed graphite, masterful hatching and cross-hatching, tonal gradations, heavyweight paper texture. Keep the same person." "$FEMALE_UUID" "$EXAMPLES/pencil-sketch.jpg"
generate "comic-book" "Transform this photo into a comic book character. Bold black ink outlines, dynamic cell shading, vivid colors, action comic style. Keep same person. No text." "$FEMALE_UUID" "$EXAMPLES/comic-book.jpg"
generate "sticker" "Transform this photo into a die-cut sticker design. Thick white border, glossy finish, cute kawaii chibi proportions, bright candy colors. Keep recognizable." "$FEMALE_UUID" "$EXAMPLES/sticker.jpg"
generate "retro-80s" "Transform this photo into a retro 1980s synthwave portrait. Neon pink and blue lighting, chrome reflections, laser grid, VHS scan lines, outrun aesthetic. Keep same person. No text." "$FEMALE_UUID" "$EXAMPLES/retro-80s.jpg"

# Male examples
generate "male-ghibli" "Transform this photo into a Studio Ghibli anime portrait. Soft watercolor textures, dreamy pastel sky, Miyazaki art direction. Keep the same person and face." "$MALE_UUID" "$EXAMPLES/male-ghibli.jpg"
generate "male-anime" "Transform this photo into a Japanese anime character. Large luminous eyes, flowing hair, crisp lineart, Makoto Shinkai quality. Keep same person." "$MALE_UUID" "$EXAMPLES/male-anime.jpg"
generate "male-cyberpunk-neon" "Transform this photo into a cyberpunk neon portrait. Electric pink and cyan lighting, chrome, Blade Runner atmosphere. Keep the same person." "$MALE_UUID" "$EXAMPLES/male-cyberpunk-neon.jpg"
generate "male-gta" "Transform this photo into a GTA V loading screen character. Bold outlines, saturated stylized realism, GTA artwork style. Keep same person. No text." "$MALE_UUID" "$EXAMPLES/male-gta.jpg"
generate "male-oil-painting" "Transform this photo into a classical oil painting. Rich brushstrokes, Rembrandt lighting, warm golden tones, museum quality. Keep the same person." "$MALE_UUID" "$EXAMPLES/male-oil-painting.jpg"

echo ""
echo "=== All done! ==="
