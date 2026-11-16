# The studio bar

What separates a page a client pays well for, the level of an Awwwards Site of the Day, from a page a model
produced. Read it before the direction and again before the review. It is judgment, not a checklist: the scripts
fetch media and catch defects; every design decision is yours, and nothing here is required for its own sake.

## What an award-level page has

Measured on four Sites of the Day in hospitality and food (Tengile Malamala, Delta Cafés, White Desert, Don
Molinico, 2026-11-16) and the client pages that fell short of them.

1. **The client's own material carries it.** Their place, product, people and footage on every screen. A café shows
   its corner, its cups, its bags and its barista; a SaaS shows its own interface doing its job. Stock is atmosphere.
2. **An art direction with personality.** One idea a stranger could repeat ("the bakery you smell from the plaza
   before you see it") and a look only this client could have: the colours of their objects, a face with their
   character, a way of placing pictures. Clean and correct is the floor, not the goal: a page that could belong to
   any café is the template the client rejected.
3. **Type composed, not just set.** A display face with character (condensed stadium lettering, a sharp serif, a
   grotesk with attitude) set huge and composed line by line: lines offset from each other, small connecting words
   between big ones ("COFFEE *that* AWAKENS", "EL CAFÉ / del DIEZ"), type crossing a picture. Ledes set large as
   editorial paragraphs. A quiet text face for the facts.
4. **A committed palette.** The client's colours as grounds, not only as an accent: the paper of their bag, the night
   of their facade, the pink of their mug, the green of their label; the ground may change from section to section
   (data-ground). Contrast always holds. A white page with one accent is a choice for a client who asks for quiet.
5. **Pictures with tension.** Sizes that differ, pictures offset, overlapping, slightly turned (a collage), a picture
   at full bleed with words over it, a strip that runs sideways. Never the same split section after section.
6. **One motion system, everywhere, done well.** Smooth scroll; headings that rise line by line from a mask; pictures
   that unveil and settle; a ground that changes with the section; pictures that lean in on hover. Expo-out
   (cubic-bezier(0.19, 1, 0.22, 1)), about a second for reveals, 0.3-0.5 s for the interface. The same few moves on
   every section read as premium; a different trick per section reads as a template. Plus one orchestrated moment
   where the page performs (the hero flies into the sign, the product turns in the light).
7. **Every part finished.** A real map with the pin on the door, a carousel that snaps and counts, a footer with every
   way to reach them, forms that send, every state, 390 px as considered as 1440.
8. **Copy with facts only this client has.** Names, streets, hours, numbers, how it is made. Plain verbs, no slogans.

## What generated pages look like (calibration)

These are defaults, not choices: they appear whatever the subject. Refuse them unless the brief asks.

| Default | Instead |
|---|---|
| A white page with one accent and nothing else of the client's colour | The client's colours as grounds, section by section |
| A cream ground with a high-contrast serif and a terracotta accent, whatever the subject | Colours and a face taken from this client's objects and character |
| A near-black page with one bright accent | Dark only where the subject is night, film or music, and then committed |
| A first screen of words on a dark panel beside the photograph in a box | The subject's best picture at full bleed with the words composed over it (the dive), or the product large on its colour |
| The client's bio slogan as the headline ("Hecho con pasión") | What only they are: the place, the person, the street, the product ("Pan de masa madre en la calle 10, desde las 6:00") |
| A headline in one size, flush left, as it came | The headline composed: lines offset, small connecting words, the scale of a poster |
| A small tracked label over the headline or every heading; uppercase tracked labels ("DÓNDE", "HORARIO"); "01 / 02" on things that are not a sequence | Headings that answer the visitor's question; labels in the text face, sentence case, untracked; numbers only for real steps |
| One word of the headline in italic or another colour | Emphasis by size or by a line of its own |
| Three identical cards; a big number with a small label as a section | One dominant item with its picture; a collage; a list of facts |
| A generic 20 px fade-up on every section; a paragraph lit word by word as the "wow" | One motion system with masks, unveils and expo-out, the same on every section |
| An endless band of words; a button that follows the cursor | Nothing, or the client's own footage |
| A drawn map; a diagram of boxes and lines | A real map (the map recipe); the process in footage or photographs |
| A dark stage that opens on three words; a pinned section that runs past its content | Every screen holds the subject; pinned sections as long as their content |
| A text button under every animation | The kit's small corner pause icon, only on what moves for more than five seconds |
| The same split (words left, picture right) section after section | A collage, a statement over a picture, the product on its colour, a strip, type set large |
| A cropped or letterboxed hero picture | The full picture at full bleed, the focal point chosen with object-position |
| A social cover with its burned-in title ("DÍA 8 DE 10") used as a photograph | A clean frame from the clip, or the cover cropped above its text |

## Moves by trade

Starting points, not templates. The client's material decides.

| Trade | The moment | The sections that sell |
|---|---|---|
| Café, bakery, restaurant | The hero flies into the shopfront or the counter (dive) | The road from origin to cup as a collage or a journey, the product in 3D on its colour, the motto set huge on the brand's colour, what to take home (carousel), the bar in their footage, a real map |
| Hotel, guesthouse | The hero loop of the courtyard or the view | The place as a collage, rooms as a carousel, an editorial lede about the place, a real map, the rates in a quiet list |
| Product, shop | The product turning in the light (product3d) or its own film | Every promise pictured, the colours that change the picture, what is in the box |
| SaaS, developer tool | The interface doing its job, live, in the hero | One feature demonstrated per section, the integrations as real logos, pricing that compares |
| Studio, portfolio | The work at full size | Case studies as chapters, the people, a contact that sends |

## The review questions

Ask them of every look.mjs sheet, section by section, and once of the whole page in a browser, scrolling:
- Next to the three references in the plan, would this screen hold up? What would they have done here?
- Is the subject seen? Would a stranger know what this is in five seconds?
- Is anything empty, cut, black, letterboxed or unreadable, at 1440 and at 390?
- Does the page move as one system? Does a word ever sit on the wrong colour while the ground changes?
- Is this section something only this client could have? Which default did I fall into?
- Would the client pay for this screen? If not, what would a studio change first?

## Figma, when it helps

The Figma MCP and its own skills (read them from the MCP: `skill://figma/<name>/SKILL.md`) are a design lead's
sketchbook and a client's review table. Use them when they earn their time, not on every page:

- **Exploring the direction.** When the look is uncertain or the stakes are high, compose two or three versions of
  the first screen and the signature section at 1440 in a new file, with the real photographs, faces and colours
  (`figma-create-new-file`, then `figma-generate-design` with `figma-use`; `get_screenshot` to compare them side by
  side). Choose one, write why in the plan, then build in the browser.
- **The client's review.** Once the page runs, capture it to editable Figma layers (`generate_figma_design`, code to
  canvas) so the client can comment on the canvas; read the comments (`get_comments`) into # Review and change the
  code.
- **The client's own design.** A Figma link from the client is the source: `figma-design-to-code` before
  `get_design_context`, and `figma-implement-motion` for any motion in it.

The page itself is built and judged in the browser; Figma is never the deliverable unless the client asks for it.
