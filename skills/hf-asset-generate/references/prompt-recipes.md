# Prompt recipes for web assets

Fill the brackets. Keep one shared STYLE BLOCK per project and paste it into every prompt so the set stays coherent.

STYLE BLOCK example: `warm espresso brown and cream palette, soft window light, subtle film grain, no text, no logos`

## hero (16:9 or 21:9, full scene)
Model: Z-Image 1536x864 / 2048x1152, or Krea 1344x768.
```
Editorial photograph of [scene], [subject placement: e.g. subject on the left third],
[light: soft window light from the left], shallow depth of field, [background mood],
[STYLE BLOCK]
```
Text room: generate the full scene, then outpaint (alignment Left or Right) or crop. Do not request "empty space".

## product_shot (1:1, Krea)
```
Studio product photo of [product with material and color], centered, [softbox light],
subtle floor shadow, plain [color] seamless backdrop, [85mm|100mm macro] lens,
sharp focus, no text
```
Verified output: kraft coffee bag on grey seamless, clean result at 1024x1024.

## lifestyle (3:2 or 4:3)
```
[Product] in use at [setting], [person detail: hands only], natural [time of day] light,
candid composition, [lens], [STYLE BLOCK]
```

## texture / background (seamless is NOT guaranteed)
```
Close-up top-down macro of [material: dark roasted coffee beans | worn walnut wood | linen],
even light, no focal subject, uniform detail across the frame, no text
```
Check tiling in the browser; if seams show, use as a blurred full-bleed background instead of `repeat`.

## og_image (1200x630, ratio about 1.9:1)
Generate 16:9, then crop: `magick in.webp -gravity center -crop 1200x630+0+0 +repage og.jpg`. Put the title in HTML, not in the image.

## icon_set / illustration
Raster models are weak at consistent icons. Use Qwen-Image with `flat vector illustration, consistent 2px stroke, single accent color [hex], white background`, expect inconsistency, and prefer SVG icon libraries for UI icons.

## restyle (edit)
Model: Kontext / Klein edit. One instruction, one change:
```
Change only the lighting to warm golden hour. Keep the subject, composition and colors of objects unchanged.
```

## animate (image to video)
Model: Wan 2.2. Prompt describes motion only: `slow push-in, steam rising from the cup, subtle camera drift`. Keep duration at 3-5s.

## Negative space and text rules
- Text in image: only with Qwen-Image, quoted, short (1-4 words). Always verify spelling visually.
- Brand marks, logos, UI text: never generated; overlay in code.
