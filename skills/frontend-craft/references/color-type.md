# Colour and type: how to choose them

You choose the colours and the faces, as the designer of this page. Nothing is dealt. ui-ux-pro-max and Hallmark's
themes give candidates, the subject gives the reasons, and `scripts/design.mjs` checks the choice and writes `tokens.css`.

## The palette: the client's colours, committed

Award-winning pages commit to their client's colours: the paper of a coffee bag as the ground, the night of the
facade for one section, the pink of the mug for the motto, the green of the label for the product (Don Molinico's
red and cream, Delta's deep coffee). Take every colour from the client's own objects and photographs; the ground may
change from section to section (`data-ground`, references/recipes.md). Contrast always holds.

| Role | What it is | Rule |
|---|---|---|
| `--bg` | the page's ground | The client's paper, white, a tinted ground from their objects, or their night: a colour you can name from their material |
| `--ink` | all text on it | Dark enough for 7:1 on the ground (a near-black, an espresso, a deep green); on a dark ground, the reverse |
| `--accent` | the main action | Taken from the subject, deep enough to carry text (4.5:1) and to read on the ground (3:1) |
| section grounds | one per section that needs its colour | `data-ground` with its own `data-ink`, each from an object of the client's; contrast checked against that colour |
| surface, muted, line | quiet steps between them | `design.mjs` derives them from the ground and ink; set them only for a reason |

A white page with near-black ink and one accent is still a choice, for a client who asks for something quiet
(`design.mjs set --mode sober` holds it to that).

**Where the accent comes from, in order:**
1. The brand's own colour, when the client has one.
2. The subject's hero photograph: the strongest material colour in it (roof tiles, a painted door, a dish, a
   product's finish). `node <skill>/scripts/design.mjs accents <photo>` lists the colours in the picture.
3. The trade's material: terracotta for a colonial house, a deep green for a garden, oxblood for a wine bar, a
   strong blue for a pool or the sea.

Never violet or purple (the colour every generated page reaches for), never a framework's default blue or indigo
(`#2563eb`, `#3b82f6`, `#4f46e5`), never neon, never two accents.

## How much of each (the composition of colour)

Look at the page as areas of colour, not as components.

- On one screen the accent appears in one or two places; the section's ground carries the colour of that screen.
- The accent marks: the primary action (the button and its nav twin), and at most one other thing per screen: a
  rule under a heading, a number, a line on a map, a link on hover. Never body text, never every heading.
- Grounds change with the story: the client's colours, one per section where the section is about that object.
- Photographs are full colour, never tinted to match the palette. A busy photograph sits on white, not on the accent.
- Greys come from the ink, not from blue-grey: muted text is the ink lightened toward the ground.

## Type: one face with character, one face that reads

| Role | Choose | Avoid |
|---|---|---|
| Display (headlines) | A face with the subject's character: a serif with warmth for a heritage house or a restaurant, a grotesk for a studio or a product, a condensed face for an event | Inter, Roboto, Poppins, Montserrat or Playfair Display as the headline face: what most generated pages use |
| Text (body, buttons, labels) | A quiet face built for reading: Schibsted Grotesk, Public Sans, Source Sans 3, IBM Plex Sans, Hanken Grotesk, Newsreader for long reading | Display or handwriting faces for text; Inter, Geist, DM Sans, Plus Jakarta Sans and Instrument Sans as the text face (impeccable's detector calls them overused) |

- Pair by contrast of structure (a serif headline over a sans text, or a grotesk headline over a humanist text), or
  use one family in two weights. Never two serifs or two grotesks that look alike.
- One display weight (500-700 for a serif, 700-800 for a grotesk), set large and tight; text at 400 and 600.
- The kit's scale (`--t-*`) sets the sizes. Headlines at `--t-display` or `--t-mega`, 10-16 characters a line.

## Using ui-ux-pro-max

It is a library of candidates, not a decision. Run it, read it as a designer, keep what fits the subject.

```sh
python3 <skill>/../ui-ux-pro-max/scripts/search.py "<what is sold> <its character>" --design-system
python3 <skill>/../ui-ux-pro-max/scripts/search.py "<the subject's character in 2-4 words>" --domain typography -n 6
python3 <skill>/../ui-ux-pro-max/scripts/search.py "<the headline face's feel>" --domain google-fonts -n 8
python3 <skill>/../ui-ux-pro-max/scripts/search.py "<the trade>" --domain color -n 5
```

Refuse what it suggests that breaks this page: glass and "liquid" styles, gradients, carousels of testimonials,
navy-and-blue palettes for things that are not banks. Measured: for "boutique hotel guesthouse heritage colonial"
its design system returned a Liquid Glass style with navy `#1E3A8A` and blue `#3B82F6`; a colonial guesthouse is
white walls, dark wood and terracotta, so the subject wins. Its font pairings and its UX rules are the useful part.

## Finished materials: Hallmark themes

The bundled `hallmark` skill ships fifty themes: each a finished material (paper, ink, accent, faces, surfaces) with a
picture of a page built in it. When one fits the subject better than a palette built from scratch, take it whole.

```sh
node <skill>/../hallmark/scripts/theme.mjs deal --genre <editorial|modern-minimal|atmospheric|playful> --prompt "<what the page is>"
# open the three pictures it names (references/themes/<slug>.jpg), read the one that fits, then:
node <skill>/scripts/design.mjs theme <slug> [--colourway <name>] --why "<why this material fits the subject>"
```

`design.mjs theme` maps the theme's tokens onto the kit, keeps its own font links (some faces come from Fontshare),
and says whether the theme is sober. A theme that colours its grounds is fine when the subject asks for it; the
default here stays white, black and one accent.

## Check and write the choice

```sh
node <skill>/scripts/design.mjs set --bg "#fbfaf7" --ink "#151413" --accent "#9a4a2c" \
  --display "Fraunces" --text "Public Sans" \
  --why "accent from the terracotta tiles in the patio photograph; Fraunces for the colonial calm"
```

It derives surface, muted, line and the text on the accent, checks contrast (ink on ground, muted on ground, text
on the accent, the accent on the ground), violet and neon, and that both faces exist on Google Fonts with those
weights. A choice that fails is refused with the reason, and nothing is written. `--mode sober` adds the quiet
method (white or near-black ground, near-black ink, one accent) for a client who asks for it. Write the choice
and its reasons under `# Look` in `.craft/concept.md`.
