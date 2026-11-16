# A filled plan (example)

The level of detail `.craft/plan.md` needs before the first line of markup. A fictional bakery; yours comes from the
client's own material.

```md
# Brief
What is sold: sourdough and rye baked overnight, sold over the counter from 6:00 and by order for cafés.
Who buys it, and why they would choose this one: neighbours of Cabecera on the way to work, three cafés in the
district; the only bakery in the area with a twelve-year-old starter and stone-milled flour.
The one action on the page (its real link): call to order (tel:+576070000000); second: directions.
Facts only this client has: the starter's age (12 years), rye only on Thursdays, flour milled in Boyacá, the oven
lit at 22:00, Carrera 33 in Cabecera, open Monday to Saturday 6:00-13:00.
Material: 14 photographs from the owner (the oven at night, loaves on racks, the counter, flour, hands shaping);
two phone videos (the oven door opening, 18 s; slicing a loaf, 9 s). Missing: the logo as a vector file (asked).

# References
| Site or design | The one move I take | What I leave |
|---|---|---|
| Tartine Bakery | The loaf shown at full size, crust in focus, as the hero | Its handwritten type |
| Apocalypse Coffee Roasters (Awwwards) | A pinned horizontal run of photographs as the process | Its dark ground |
| MotionSites "Mostar guide" | Exact values for the scroll story: 300svh pass, captions at 14 px | Its city layout |

# Direction
Idea, in one sentence: bread you can only get here, because it starts the night before.
Palette (design.mjs set): ground #f7f6f2, ink #151413, accent #8f4b36 (the crust); the photographs bring the warmth.
Faces: Archivo 700 for the headlines (sturdy, workshop signage), Public Sans to read.
The one orchestrated moment: the hero flies into the oven's glow (dive).
First screen (ASCII):
[nav: Panadería de la 33 ...... El pan  Visita  (Encargar pan)]
[ the oven at night, full bleed                                ]
[ Pan de masa madre en la Carrera 33                           ]
[ one line: baked overnight in Cabecera, ready at six          ]
[ (Encargar pan)                                               ]
Defaults I refused: a cream ground with a serif (the oven photograph is warm enough on white); three cards for
"our breads" (a carousel of real loaves instead); a paragraph lit word by word.

# Storyboard
| # | Visitor's question | What they see (layout, the picture) | Media (file or route) | Motion (what moves, why) | Part (recipe, library piece, kit) |
|---|---|---|---|---|---|
| 1 | What is this, where? | The oven at night full bleed, headline low left | owner's oven.jpg | Scrolling flies into the glow: the night shift | dive |
| 2 | Why is it different? | Five photographs pass: wheat, flour, shaping, oven, rack; two lines cross | owner's photos | Horizontal journey tied to scroll: the night, in order | journey |
| 3 | What can I buy? | Four loaves in a snapping row, the day each is baked | owner's photos | Native snap, arrows, drag | carousel |
| 4 | How is it made? | The oven door opening, scrubbed by scroll, three short steps | owner's oven video 4-10 s, media.mjs frames | The clip follows the scroll: the moment the bread comes out | sequence |
| 5 | When and where? | Hours and phone as a list, a real map with the pin on the door | OpenFreeMap tiles | None (the map pans on drag) | spec + map |
| 6 | How do I reach them? | Name, phone, email, hours, the credits | none | None | footer |

# Review
| Section | What I see (look.mjs sheets) | What a studio would change | Done |
|---|---|---|---|
| journey 390 | The second line cut at the right edge | Shorter line for phones | yes |
| sequence | The first frame is dark for a moment while frames load | A poster from the clip's brightest frame | yes |
```
