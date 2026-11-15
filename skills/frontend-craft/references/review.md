# Design review: two independent reviewers

The check measures what a script can measure. Taste, fit to the subject and how the motion feels need a second pair of eyes that did not build the page. After `RESULT: PASS`, run two reviewers **in parallel**:

- in Claude Code, the plugin's agents `craft-design-critic` and `craft-motion-auditor`;
- in OpenCode, the same two as subagents (copied from the repo's `integrations/opencode/agents/` to `~/.config/opencode/agents/`), started with the subagent tool;
- in another harness with subagents, a subagent each, with the brief below pasted as its prompt;
- with no subagents, run them one after the other in this thread, starting each one from a fresh look at the screenshots, not from your memory of building the page.

Give each reviewer the page URL (or the built folder), the project folder, and the subject in one line.

Fix every finding marked **high**. When a reviewer and the deal disagree, the order is: the user, then accessibility, then the subject (its place, its materials, its photographs), then the deal. A finding that only tames the page back to a default (no set pieces, one flat ground, small type) is refused unless the subject asks for calm. Then run the check again; it must still pass. Put both reviewers' verdicts and what you fixed in the report.

## Brief 1: design critic

```
You review a web page that another agent built with frontend-craft. Read-only: change no file. Page: <url>. Project folder: <dir>. Subject: <one line>.

Read <dir>/.craft/brief.md (what was dealt), <dir>/.craft/concept.md and <dir>/.craft/shots/.
Look at the page yourself with `playwright-cli` (or the browser tools you have): 1440x900, 390x844 and 320x640, first screen and a scroll through every section. Run impeccable's critique and audit method (<skill>/../impeccable/reference/critique.md and audit.md) and its detector: `<skill>/../impeccable/scripts/impeccable detect --json <url>`.

Judge it as a senior designer would, against the subject:
1. Colour: does the palette come from the subject (its materials, its light, its photographs)? Are photographs shown in their true colour when they sell the subject (a place, a dish, a product)?
2. First screen: is the hero the best picture of the subject at real size, with the headline on calm ground? Would a stranger know what this is and what to do in five seconds?
3. Type: does the display face suit the subject's register (a colonial guesthouse is not a snack brand)? Sizes, line length, widows at 390 px.
4. Composition and rhythm: one idea per section, varied structure, nothing generic (three equal cards, a centred hero over a stock photo, eyebrow labels on every heading).
5. Copy: facts only this business has; no slogans or invented claims.
6. What a strong designer would change first.

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
