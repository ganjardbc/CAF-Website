---
title: GitHub / GitLab
description: The credentials CAF Orchestrator needs to open a PR once the review checkpoint passes.
---

Linear is the trigger source; GitHub is where the PR eventually gets opened.
This integration is different in nature from the Linear webhook — the
Orchestrator needs credentials with write access to the repo, not just
something to receive notifications on.

> **GitLab is not yet supported.** Only GitHub is implemented today —
> there's no `GITLAB_TOKEN` handling in the current release. This page will
> be updated once GitLab support ships.

## Required credentials

Create a fine-grained GitHub personal access token with `Contents: Read and
write` and `Pull requests: Read and write` scope, restricted to the relevant
repo. Store it as `GITHUB_TOKEN` in the Orchestrator's `.env`.

You'll also need a `GITHUB_WEBHOOK_SECRET` if you want the automated PR review
feature — see [CAF Orchestrator](/docs/caf-orchestrator#automated-pr-review).

## What the Orchestrator does with this token

After the Implement phase finishes and passes
[Layer 4: Quality Gates](/docs/core-concepts/layer-4), the Orchestrator uses this
token to:

1. Push the branch containing the Implement phase's changes
2. Open a pull request, with a description summarizing the artifact from
   [Layer 3: Artifact Handoff](/docs/core-concepts/layer-3)

## The Orchestrator never merges a PR

This token is deliberately never given merge scope. Once a PR is open, the merge
decision still goes through your normal review process on GitHub/GitLab — we
recommend keeping branch protection rules enabled on your repo so CAF's
"no auto-merge" policy is also enforced at the platform level, not just by the
Orchestrator.
