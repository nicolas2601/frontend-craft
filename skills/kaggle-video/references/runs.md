# Measured runs

Each row is a real run on Kaggle, read from its `run.json`. Use it to plan GPU hours before a run.

| Date | Size, frames | Steps, guidance | GPU | Seconds a step | Whole run | Notes |
|---|---|---|---|---|---|---|

## What went wrong before, so it does not again

- 2026-11-15: a run sat `QUEUED` for over an hour while tiny probe kernels on the same account started at once.
  Pushing a new version of the kernel got it scheduled. If a run stays queued for 20 minutes, push it again
  (`kaggle-video.mjs run` with the same settings), never a second kernel beside it: the account allows two batch
  GPU sessions at a time ("Maximum batch GPU session count of 2 reached").
- 2026-11-15: the first kernel failed in two seconds with `binascii.Error: Incorrect padding`: the settings
  placeholder was replaced in the template's docstring instead of the code. The script now fills each placeholder
  exactly once and fails before the push if a template holds one twice.
