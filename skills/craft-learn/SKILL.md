---
name: craft-learn
description: >-
  At the end of a design session, collects every correction the user made (things they asked
  to change, edits they made by hand, deals they rejected) and writes each one as a testable
  rule with its reason into the project's DESIGN.md, so the next agent does not repeat it. Use
  when the user says "remember this", "learn from this", "save the taste", or wraps up a UI
  session that had design feedback.
---

# craft-learn

A correction the user had to make twice is a rule nobody wrote down. Turn this session's corrections into rules the next run can follow and check.

## The run

1. **Collect.** From this session only:
   - what the user asked to change in the design (their words);
   - edits they made by hand: `git diff` and `git log -p` on the UI files since the session started;
   - deals they rejected: `.craft/deal.json` history and any `start.mjs --redeal` or `--pin` you ran;
   - check findings they told you to ignore, with their reason.
2. **Write each as a rule** that a later agent can apply and verify: a value, a token, a component, a pattern to avoid. Add the reason in the user's terms and the date.
   - Good: `Headlines stay at or under 4 lines at 390 px; use max-width: 12ch (why: the user rejected a 6-line hero on 2026-11-13).`
   - Not a rule: `Make headlines nicer.`
3. **File them** in `DESIGN.md` at the project root under `## Rules learned` (create the section if missing). Merge with an existing rule instead of adding a near-duplicate; replace a rule the user reversed. Keep the deal history out of DESIGN.md; record only the decision: `Avoid palette butter-black for this brand (why: too playful for a law firm).`
4. **Pins for next time.** If the user approved a direction, add the pin line: `Pin: node <frontend-craft>/scripts/start.mjs --pin palette=<id>,type=<id>`.
5. **Show the diff** of DESIGN.md to the user. Do not commit it unless they ask.
