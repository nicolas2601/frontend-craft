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
  'a warm cream ground with a high-contrast serif and a terracotta accent; a near-black ground with one bright accent',
  'a first screen of words on a dark panel beside the photograph in a box; the client\'s bio slogan or tagline as the headline instead of what only they are',
  'a small tracked label over the headline or over every heading; uppercase tracked labels ("DÓNDE", "HORARIO"); meta strings joined with middle dots; "01 / 02" markers on things that are not a sequence',
  'one word of the headline in italic or another colour; a big number with a small label as a section; three identical cards',
  'a fade-and-rise on every section; a paragraph that lights up word by word as the default "wow"; an endless band of words',
  'a drawn map, a diagram of boxes and lines, an empty dark stage that opens on three words, a text button under every animation',
  'a cropped or letterboxed hero picture; a stock photograph standing in for the client\'s own place, product or people; a social cover with its burned-in title used as a photograph',
];

export function studioBrief(d, t) {
  const tool = (name) => `node ${t.scripts}/${name}`;
  return [
    `# Studio brief (${d.kind}${d.lang ? `, ${d.lang}` : ''})`,
    '',
    'You are the design lead of a studio. This client pays for a site that could not belong to anyone else, and has already',
    'rejected proposals that felt templated. Every design decision is yours. The scripts fetch media and measure defects;',
    `they never decide. The bar: ${t.ref('studio.md')}. Write your thinking in .craft/plan.md (template already there;`,
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
    `- Fill # Direction: the idea in one sentence, the palette, the faces, the one orchestrated moment, an ASCII wireframe of the first screen. Colours and faces: ${t.ref('color-type.md')}; candidates from ui-ux-pro-max; write them with \`${tool('design.mjs')} set ... --why "..."\`.`,
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
    '## 6. Build: the first screen alone, then the rest',
    `- Start from ${t.kitDir}/starter.html. Build the hero only, then \`${tool('look.mjs')}\` and open its sheets; fix until a client would sign it. Then every section from its storyboard row.`,
    '',
    '## 7. Look in motion, critique, fix',
    `- \`${tool('look.mjs')}\` photographs every section as it enters, in the middle and as it leaves, at 1440 and 390. Open every sheet. Fill # Review: what you see, what a studio would change; change it.`,
    `- \`${t.checkCmd}\` finds defects only (broken media, blank screens, overflow, contrast, invisible content, AI tells): fix every FAIL.`,
    `- Then one independent critic (${t.ref('review.md')}) with the sheets and the plan; fix its high findings and look again.`,
    '',
  ].join('\n');
}

/** Rows of the # Storyboard table that have content. */
export function storyboardRows(plan) {
  const m = /^# Storyboard\s*\n([\s\S]*?)(?=^# |$(?![\s\S]))/m.exec(String(plan ?? ''));
  if (!m) return 0;
  return m[1].split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/Visitor's question/.test(l))
    .filter((l) => l.split('|').slice(1, -1).some((c) => c.trim() && !/^#?$/.test(c.trim()))).length;
}
