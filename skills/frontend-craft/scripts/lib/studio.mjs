// The studio brief and the plan template start.mjs writes for a new build. Nothing here is dealt: the model is the
// design lead, the brief says how a studio works and which tool does what, and the plan is where the thinking goes.

export const PLAN_TEMPLATE = `# Brief
What is sold:
Who buys it, and why they would choose this one:
The one action on the page (its real link):
Facts only this client has (names, places, numbers, how it is made), each with where it comes from:
Material: every photograph, video, logo and text file you have, and what is missing:

# References
| Site or design | The one move I take | What I leave |
|---|---|---|

# Direction
Idea, in one sentence:
Palette (4-6 named colours; written with design.mjs set):
Faces (display, text) and why they fit:
The one orchestrated moment:
First screen (ASCII wireframe):
Defaults I refused (every line of the calibration list in the brief, checked against this direction and the storyboard: each one the plan came near, and what you did instead):

# Storyboard
| # | Visitor's question | What they see (layout, the picture) | Media (file or route) | Motion (what moves, why) | Part (recipe, library piece, kit) |
|---|---|---|---|---|---|

# Review
| Section | What I see (look.mjs sheets) | What a studio would change | Done |
|---|---|---|---|
`;

const CALIBRATION = [
  'a white page with one accent and nothing else of the client\'s colour; a cream ground with a high-contrast serif and a terracotta accent whatever the subject; a near-black ground with one bright accent',
  'a headline in one size, flush left, as it came; the same split section (words left, picture right) section after section',
  'a first screen of words on a dark panel beside the photograph in a box; the client\'s bio slogan or tagline as the headline instead of what only they are',
  'a small tracked label over the headline or over every heading; uppercase tracked labels ("DÓNDE", "HORARIO"); meta strings joined with middle dots; "01 / 02" markers on things that are not a sequence',
  'one word of the headline in italic or another colour; a big number with a small label as a section; three identical cards',
  'a generic fade-up on every section; a paragraph that lights up word by word as the default "wow"; an endless band of words',
  'a drawn map, a diagram of boxes and lines, an empty dark stage that opens on three words, a text button under every animation',
  'a cropped or letterboxed hero picture; a stock photograph standing in for the client\'s own place, product or people; a social cover with its burned-in title used as a photograph',
];

export function studioBrief(d, t) {
  const tool = (name) => `node ${t.scripts}/${name}`;
  return [
    `# Studio brief (${d.kind}${d.lang ? `, ${d.lang}` : ''})`,
    '',
    'You are the design lead of a studio. This client pays for a site at the level of an Awwwards Site of the Day, one that',
    'could not belong to anyone else; they rejected proposals that were clean but plain. Every design decision is yours.',
    'The scripts fetch media and measure defects; they never decide, and no tool is required for its own sake.',
    `The bar: ${t.ref('studio.md')}. Write your thinking in .craft/plan.md (template already there;`,
    `a filled example: ${t.ref('plan-example.md')}).`,
    '',
    '## 1. Material first',
    '- Fill # Brief: what is sold, who buys it, the one action, the facts only this client has, every file you have.',
    `- The client's own media carries the page. Their videos on TikTok, Instagram or YouTube: \`${tool('media.mjs')} social <url>\` (theirs, with their permission). Look at every clip (\`${tool('media.mjs')} sheet <clip>\`) and every photograph full size before you plan.`,
    '- Ask for what only the client has when it is missing (the packaging artwork, the logo file, a short clip of the place). Stock is for atmosphere only, never as their place, product or people.',
    '',
    '## 2. Look at real work',
    `- Three references a client would admire, one from the trade: the Awwwards MCP (search_sites), land-book, and the MotionSites designs below (${t.ref('inspiration.md')}). Under # References write the one move you take from each, never their look.`,
    ...(t.motionsites ? [`- MotionSites, closest to this subject: ${t.motionsites.examples.length ? t.motionsites.examples.map((e) => e.file).join(', ') : 'none close; read its index for precision only'} (in ${t.motionsites.dir}/examples). Read one in full for its precision: every value given.`] : []),
    '',
    '## 3. Direction, then attack it',
    `- Fill # Direction: the idea in one sentence, the palette (the client's colours as grounds, section by section), a display face with their character, how type is composed, the motion system and the one orchestrated moment, an ASCII wireframe of the first screen. Colours and faces: ${t.ref('color-type.md')}; candidates from ui-ux-pro-max; write them with \`${tool('design.mjs')} set ... --why "..."\`.`,
    '- When the look is uncertain or the client wants to approve it: two or three versions of the first screen in Figma with the real photographs, then choose (studio.md, Figma: the Figma MCP\'s own skills).',
    '- Then read it as the client who rejected templates: whatever you would have produced for any similar brief, change. Go through every line below against your direction, first screen and storyboard, not only the lines that come to mind, and under "Defaults I refused" write each one the plan came near and what you did instead. What generated pages look like (refuse unless the brief asks for it):',
    ...CALIBRATION.map((c) => `  - ${c}`),
    '',
    '## 4. Storyboard',
    '- One row per section (usually 5-8): the visitor\'s question, what they see, the media (a file you have or the route to get it), the motion and why it moves (or "none"), the part.',
    `- Parts: finished recipes in ${t.ref('recipes.md')} (dive, journey, carousel, sequence, product3d, map). Anything else a library has (nav, gallery, form, FAQ, pricing): \`${tool('components.mjs')} search "<its job>"\`, open the previews, \`pick\` the best. A map is a real map (data-map), never drawn.`,
    '- Spend your boldness once: one orchestrated moment (often the hero), everything around it calm and exact.',
    '',
    '## 5. Media',
    `- Routes, best first (${t.ref('media.md')}): the client's footage (\`video.mjs\` makes the loop, \`media.mjs frames\` the scroll sequence); their photographs; their product in 3D from its artwork (data-product3d); free stock (\`media.mjs stock\`); generated clips (hero-video.md). Never crop the hero source or letterbox it; a parallax loop from a still is a last resort.`,
    '',
    ...stillsWithoutClientPhotos(t),
    '## 6. Build: the first screen alone, then the rest',
    `- Start from ${t.kitDir}/starter.html (smooth scroll and the premium layer are wired: data-lines, data-unveil, data-ground, data-hover; recipes.md). Build the hero only, then \`${tool('look.mjs')}\` and open its sheets; fix until a client would sign it. Then every section from its storyboard row.`,
    '',
    '## 7. Look in motion, critique, fix',
    `- \`${tool('look.mjs')}\` photographs every section as it enters, in the middle and as it leaves, at 1440 and 390. Open every sheet. Fill # Review: what you see, what a studio would change; change it.`,
    `- \`${t.checkCmd}\` finds defects only (broken media, blank screens, overflow, contrast, invisible content, AI tells): fix every FAIL.`,
    `- Then one independent critic (${t.ref('review.md')}) with the sheets and the plan; fix its high findings and look again.`,
    '',
  ].join('\n');
}

/** The licensed-photograph commands for a client with no photographs yet (keyless: a bundled library and Wikimedia Commons). */
function stillsWithoutClientPhotos(t) {
  const lines = ['- No photographs from the client yet: the page is a proposal they will fill, and every section of a place still carries its picture. A section of words where their room, patio or counter belongs reads unfinished. Licensed photographs, no key needed (run from the project folder):'];
  if (t.taste) {
    const ph = `node ${t.taste}/scripts/photos.mjs`;
    lines.push(`  - \`${ph} search "<3-6 words: the place, the subject, its light>" --count 12 --out .\` (Wikimedia Commons), \`${ph} pick --trade <a trade from ${ph} list> --draft-lead --pictures 12 --sections hero,<section subjects> --history .craft/photos.json\`, \`${ph} fetch <ids> --hero <id> --out .\`, then \`${ph} credits --out . --write\`.`);
  }
  if (t.hallmark) lines.push(`  - \`node ${t.hallmark}/scripts/theme.mjs photos "<the subject>" "<a second subject>" --n 4 --save assets/photos\` (755 Commons photographs with their credit lines).`);
  if (!t.taste && !t.hallmark) lines.push('  - Licensed stand-ins from Wikimedia Commons, Unsplash or Pexels, downloaded with a SOURCES.txt (photographer, page, licence).');
  lines.push('  - Take the frames only; ignore any layout advice those commands print. Look at each full size; drop any that shows another business\'s name or a stranger as staff. Never caption a stand-in as their own room or facade; list every stand-in in the report as a sample to replace, and ask the client for the photographs only they have.', '');
  return lines;
}

/** Rows of the # Storyboard table that have content. */
export function storyboardRows(plan) {
  const m = /^# Storyboard\s*\n([\s\S]*?)(?=^# |$(?![\s\S]))/m.exec(String(plan ?? ''));
  if (!m) return 0;
  return m[1].split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/Visitor's question/.test(l))
    .filter((l) => l.split('|').slice(1, -1).some((c) => c.trim() && !/^#?$/.test(c.trim()))).length;
}
