---
title: GitHub / GitLab
description: The credentials CAF Orchestrator needs to open a PR once the review checkpoint passes.
---

Linear and Jira are trigger sources; GitHub or GitLab is where the PR eventually gets
opened. This integration is different in nature from the tracker webhooks — the
Orchestrator needs credentials with write access to the repo, not just something to
receive notifications on.

## Required credentials

Create a token with the minimum scope needed to push a branch and open a PR:

- **GitHub**: a fine-grained personal access token with `Contents: Read and write`
  and `Pull requests: Read and write` scope, restricted to the relevant repo
- **GitLab**: a project access token with `write_repository` and `api` scope

Store it as `GITHUB_TOKEN` or `GITLAB_TOKEN` in the Orchestrator's `.env`, depending
on which you use.

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
