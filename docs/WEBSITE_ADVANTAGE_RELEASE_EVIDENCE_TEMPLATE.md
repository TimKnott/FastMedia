# Website Advantage — Production Release Evidence Form

> This is a release gate, not a certificate. Do not merge or deploy with required fields blank.

## Release identification
- Project:
- PR / branch / head commit:
- Production domain:
- Platform and verified publish mechanism:
- Change owner:
- UTC deployment window:

## Pre-release backup and rollback
- Current live deployment ID:
- Current live Git commit:
- **Evidence that this version is working** (URL, screenshot, test):
- Database migration or data write? Yes / No
- Backup/snapshot location:
- Exact rollback method:
- Rollback operator and access:
- Restoration tested? Yes / No
- Data loss / cache considerations:

## Tests (attach evidence)
- [ ] CI install, tests, production build
- [ ] Signed-out user denied access to protected route
- [ ] Editor denied access
- [ ] Ordinary admin denied access
- [ ] Super Admin allowed access
- [ ] Server-side API rejects unauthorized calls (required before private data)
- [ ] Keyboard navigation, focus order, accessible names
- [ ] Mobile viewport and horizontal overflow
- [ ] No secrets, PII or privileged tokens in frontend
- [ ] Cookie/analytics consent unaffected
- [ ] Existing forms, booking, checkout and admin functions unaffected
- [ ] External links, canonical, OG and Twitter metadata
- [ ] No unexpected scheduled tasks or paid background work

## Release
- Merge SHA:
- Published build/deployment ID:
- Publish time:
- Live smoke test URLs:
- Critical paths tested:
- Incident or unexpected issue:
- Decision: Go / No-go / Rolled back
- Verified by:
- Release record saved to ChatGPT Space:

## Rollback
1. Stop further deployments and identify the last known-good **published** build.
2. Prefer the platform's supported rollback to that build; confirm database compatibility.
3. If no platform rollback exists, prepare a revert commit and verify the resulting build **before** publishing.
4. Verify public homepage, protected routes, forms and payment/booking functions after restoration.
5. Record the incident, cause, timestamps and recovery evidence.

**Important:** a Git commit existing on main is not proof that it was successfully published or is safe to restore. Do not revert an entire site if intervening changes would be lost.
