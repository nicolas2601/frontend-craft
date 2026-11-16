# Design review: an independent critic

The check measures what a script can measure. Taste, fit to the client and how the motion feels need a second pair of eyes that did not build the page. After `RESULT: PASS` and your own look.mjs review:

- in Claude Code, the plugin's agent `craft-design-critic` (and `craft-motion-auditor` when more than one section moves on its own or with the scroll);
- in OpenCode, the same as subagents (copied from the repo's `integrations/opencode/agents/` to `~/.config/opencode/agents/`), started with the subagent tool;
- in another harness with subagents, a subagent with the brief below pasted as its prompt;
- with no subagents, in this thread, starting from a fresh look at the sheets, not from your memory of building the page.

Give the reviewer the page URL (or the built folder), the project folder, and the subject in one line.

Fix every finding marked **high**. When the critic and your plan disagree, the order is: the user, then accessibility, then the client's material and subject, then your direction. A finding that only tames the page back to a default is refused unless the subject asks for calm. Then look and check again; the check must still pass. Put the verdict and what you fixed in the report.

## Brief 1: design critic

```
You review a web page that another agent built with frontend-craft. Read-only: change no file. Page: <url>. Project folder: <dir>. Subject: <one line>.

Read <dir>/.craft/plan.md (the brief, references, direction, storyboard and the builder's own review), then open every sheet in <dir>/.craft/looks/ (each section entering, in its middle and leaving, at 1440 and 390; run `node <skill>/scripts/look.mjs` in <dir> if they are missing) and <dir>/.craft/shots/. Read <skill>/references/studio.md: it is the bar.
Look at the page yourself with `playwright-cli` (or the browser tools you have): 1440x900, 390x844 and 320x640, first screen and a scroll through every section. Run impeccable's critique and audit method (<skill>/../impeccable/reference/critique.md and audit.md) and its detector: `<skill>/../impeccable/scripts/impeccable detect --json <url>`. Read Hallmark's finish review (<skill>/../hallmark/references/review-finish.md) and apply it.

Judge it as a senior designer would, against the subject:
1. Material: is the client's own material (their place, product, people, footage) on every screen? Is any stock or generated media standing in for it? Are photographs in true colour, whole (not cropped or letterboxed), never repeated?
2. Colour: does the palette come from the subject (its materials, its light, its photographs)?
3. First screen: is the hero the best picture of the subject at real size, with the headline on calm ground? Would a stranger know what this is and what to do in five seconds?
4. Type: does the display face suit the subject's register (a colonial guesthouse is not a snack brand)? Sizes, line length, widows at 390 px.
5. Composition and rhythm: one idea per section, varied structure, nothing generic (three equal cards, a centred hero over a stock photo, eyebrow labels on every heading).
6. Copy: facts only this business has; no slogans or invented claims.
7. Finish and detail: scroll the whole page at 1440 and 390 looking for blank areas (half a screen with nothing, a hero with an empty half, a big card holding one number or two lines), sections that say one thing in one line where the subject has more to show (a second photograph, a list of facts, a drawn detail), and the footer (the name, contact as links, hours or last facts, the section links; never one grey line). Name each blank area with its screenshot and what should fill it.
8. Gimmicks: a button that follows the cursor, a custom cursor, text that scrambles for no reason, decoration that moves while you read. Each one is a finding.
9. The calibration list in studio.md: which of those defaults did the page fall into?
10. What a strong designer would change first.

Answer with at most 12 findings, most severe first, as a table: severity (high, medium, low) | where (section, width) | what is wrong, with evidence (a screenshot path, a measured value) | the fix, concrete (a token, a property, a layout move). End with one line: "Verdict: ship" or "Verdict: fix first".
```

## Brief 2: motion and mobile auditor

```
You audit the motion and the mobile use of a web page built with frontend-craft. Read-only: change no file. Page: <url>. Project folder: <dir>. Subject: <one line>.

Use `playwright-cli` (`run-code --filename=<script.js>` for measurements) or the browser tools you have.
1. List every element that moves: entrances, scroll-driven pieces (data-scrub, set pieces, your own scroll code), loops, marquees, pointer effects. For each, what it shows and why it moves.
2. Scroll timing: scroll in steps of about 40 px at 1440x900 and 390x844. For each scroll-driven element, record where its motion starts and ends, as the position of its centre in the viewport. It must start once the element is in view and be finished while it is readable (centre still above about 30% of the viewport). Flag motion that runs while the element is cut off, ends as it leaves, or crops its words for most of its travel.
3. Speed and calm: at most two things moving in one viewport; no text moving faster than a reader can follow; looping or long motion (over 5 s) has a pause control.
4. Mobile at 390, 360 and 320 px: the navigation still reachable (visible links or a menu button with aria-expanded); tap targets of 44 px; control and label text at least 14 px; no horizontal scroll; forms usable with the on-screen keyboard; the video and marquee pause controls reachable.
5. Reduced motion (emulate prefers-reduced-motion): nothing stays hidden, nothing keeps moving, no pause button left for something that no longer moves.
6. Review the motion code against Emil Kowalski's rules (<skill>/../emil-design-eng/SKILL.md, <skill>/../review-animations): easing, durations, interruptibility, what should not animate at all.

Answer with at most 12 findings, most severe first: severity | element and width | measured evidence (numbers) | the fix (file and property, or the kit attribute to use). Add the code changes as a Before | After | Why table. End with "Verdict: ship" or "Verdict: fix first".
```
