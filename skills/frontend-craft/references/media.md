# Media: where every picture and clip comes from

A page is carried by its media. Choose by this order; the first that gives something worth showing wins. Look at
every file full size (a clip through `media.mjs sheet`) before it goes on the page, and credit every source.

| Route | When | How | Licence |
|---|---|---|---|
| 1. The client's files | Always first | Their photographs, logo, packaging artwork, menu | Theirs |
| 2. The client's social videos | They post on TikTok, Instagram, YouTube, Facebook | `node <skill>/scripts/media.mjs social <profile or post URL> [--max 6]` downloads mp4s (yt-dlp) into `assets/video/raw` with a `SOURCES.txt` | Theirs; use only with their permission |
| 3. Frames from those videos | A clip has one good moment (a shelf pan, a pour, the product close up) | `media.mjs sheet <clip>` to find it, then `ffmpeg -ss <s> -i clip.mp4 -frames:v 1 frame.jpg`; crop away burned-in captions | Theirs |
| 4. A loop from their footage | A hero or a section that should breathe | `node <skill>/scripts/video.mjs clip.mp4 --start <s> --end <s> --aspect 16:9 --out assets/video/<name>` (mp4 + webm + poster, a seamless loop) | Theirs |
| 5. A scroll-scrubbed sequence | A process they filmed | `media.mjs frames clip.mp4 --out assets/seq --fps 18 --width 1280` and the sequence recipe | Theirs |
| 6. Their product in 3D | A packaged product with a straight-on artwork | The product3d recipe (`references/recipes.md`) | Theirs |
| 7. Free stock | Atmosphere only: light, a street, a texture, a generic process | `media.mjs stock "<query>"` with a free `PEXELS_API_KEY` or `PIXABAY_API_KEY`, then `media.mjs stock --get <ref>`; Coverr and Mixkit by hand | Pexels and Pixabay: free for commercial use, no attribution required (credit anyway); Pixabay forbids hotlinking |
| 8. Licensed photographs by subject | No client photographs | `design-taste-frontend/scripts/photos.mjs` and Hallmark's `theme.mjs photos` (the brief prints both) | Per frame, with credits |
| 9. Generated clips | A real subject with no footage at all | `references/hero-video.md` (Hugging Face, Kaggle; free quotas run out) | Per model |
| 10. Motion graphics | A brand or product film made of type and shapes | The bang-motion or hyperframes skills render HTML to MP4 | Yours |
| 11. A parallax loop from a still | Nothing else moves | `scripts/parallax.mjs` (last resort: it reads as a still that wobbles) | As the still |

Stock never stands in for the client's place, product or people. Generated or stock footage that does not show the
client is atmosphere; say which files are stand-ins in the report.

## Rules that keep media looking expensive

- **The hero keeps its whole picture.** Choose the framing with `object-position` (or `--focus` in the dive recipe);
  never crop the source file and never letterbox it with `object-fit: contain` and black bars.
- **True colour.** Never tint the client's photographs to match the palette.
- **No burned-in captions, titles or stickers.** Social videos and their covers carry them ("DÍA 8 DE 10" on a cover, the app's buttons on a screenshot): crop above them, take a clean frame from the clip, or pick another picture. A cover with its title is a poster for the feed, not a photograph for the page.
- **One photograph, one place.** A frame used twice reads as a template; take another frame from their videos.
- **Resolution.** A 720 px frame upscaled to a full-width hero is soft: use it at its size (a framed loop, a card) or
  take the facade's photograph instead.
- **Weight.** Hero loop under 1.5 MB (`video.mjs` keeps it there), a sequence under about 6 MB, photographs as WebP
  at 1600 px or less.

## Looking at a clip

`media.mjs sheet clip.mp4` writes twelve frames spread over the clip on one image. Read it: note the seconds of the
moments worth showing (a frame's place in the grid times the clip's length over twelve), then cut them precisely with
a few `ffmpeg -ss <s>` stills before you choose.
