
# Vbout Integration Plan

## Overview
Integrate Vbout (vbout.com) into the admin back-office to enable two-way contact syncing and email campaign management. This adds a new "Vbout" section in the admin sidebar and a backend function that securely communicates with the Vbout API.

## What will be built

### 1. Securely store your Vbout API key
Your API key (`1868820767450853752145600`) will be stored as an encrypted secret called `VBOUT_API_KEY`, accessible only by backend functions -- never exposed in the browser.

### 2. Backend function: `vbout-proxy`
A single backend function that acts as a secure proxy between the admin UI and the Vbout API. It will support these actions:

- **get-lists** -- Fetch all your Vbout email lists
- **get-contacts** -- Retrieve contacts from a specific list
- **sync-subscribers** -- Push all newsletter subscribers from your database into a chosen Vbout list (using the Vbout "Sync Contact" endpoint which creates or updates)
- **sync-leads** -- Push all leads into a Vbout list with custom fields (name, phone, trade, source)
- **get-campaigns** -- Fetch email campaigns and their stats
- **send-campaign** -- Trigger an existing email campaign

The function validates the admin's authentication token before processing any request.

### 3. New admin page: `AdminVbout.tsx`
A new page at `/admin/vbout` with three tabs:

**Contacts tab**
- Dropdown to select a Vbout list
- View contacts already in that list
- "Sync Subscribers" button -- pushes all newsletter subscribers to the selected list
- "Sync Leads" button -- pushes all leads to the selected list
- Status indicators showing last sync result

**Campaigns tab**
- View existing Vbout email campaigns with stats (sent, opened, clicked)
- Button to trigger/send a draft campaign

**Settings tab**
- Shows current connection status (verifies API key works)
- Select default list for subscriber sync and lead sync

### 4. Sidebar update
Add a "Vbout" menu item under the "Main Menu" group with a `Mail` icon, visible to editors and above.

### 5. Route registration
Register `/admin/vbout` in `App.tsx` within the protected admin routes.

---

## Technical details

### Backend function endpoints
Base URL: Vbout API at `https://api.vbout.com/1/`

| Action | Vbout endpoint | Method |
|--------|---------------|--------|
| get-lists | `emailmarketing/getlists.json?key=KEY` | GET |
| get-contacts | `contacts/getcontacts.json?key=KEY&listid=ID` | GET |
| sync-contact | `contacts/sync.json` | POST |
| get-campaigns | `emailmarketing/getcampaigns.json?key=KEY` | GET |
| send-campaign | `emailmarketing/sendcampaign.json` | POST |

### Files to create
- `supabase/functions/vbout-proxy/index.ts` -- Edge function
- `src/pages/admin/AdminVbout.tsx` -- Admin page

### Files to modify
- `supabase/config.toml` -- Add `[functions.vbout-proxy]` with `verify_jwt = false`
- `src/components/admin/AdminSidebar.tsx` -- Add Vbout menu item
- `src/App.tsx` -- Add route for AdminVbout

### Sync logic
When syncing subscribers/leads, the function will:
1. Fetch all records from the database
2. Loop through each record, calling the Vbout sync endpoint (which creates or updates based on email)
3. Return a summary of how many were synced successfully and any errors
4. Rate-limit calls to stay under Vbout's 15 requests/second limit

### Security
- The Vbout API key is stored as an encrypted secret, only accessible from the backend function
- The function verifies the caller has a valid admin session before processing
- No API credentials are ever sent to or stored in the browser
