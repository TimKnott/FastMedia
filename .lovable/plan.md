# Always reply in English in the Lovable chat

## What you're asking
The Lovable assistant chat (where we're talking now) has been surfacing suggestions and instructions in Czech, presumably because the FastMedia project's primary UI language is Czech (cs). You want the assistant to always communicate with you in English unless you explicitly ask for Czech.

This is not a code change in your FastMedia app — it's a preference about how Lovable talks to you.

## Plan

1. Write a user-level preference to `mem://~user` so it persists across every project and every session:
   - "Always respond in English. Never default to Czech (or any other language) based on project context. Switch to another language only if I explicitly ask in that message."

2. Apply it immediately in this and all future replies.

## What this does NOT change
- The FastMedia app itself stays trilingual (CS / EN / DE) — end-user UI, blog, calculator output, edge function responses are untouched.
- Project memory (which says "Czech primary") is unchanged; it correctly describes your product, not how I should talk to you.

## Confirmation
Approve and I'll save the user preference and continue in English from here on.