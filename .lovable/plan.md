

## Add WhatsApp Meeting Link to Booking Detail Sheet

Add a "Send via WhatsApp" button to the booking detail panel that generates a pre-filled WhatsApp message containing the meeting date, time, service, and duration. No API key needed — it uses the standard `wa.me` URL with a `text` parameter.

### What the user will see

In the booking detail side-panel (the sheet that opens when you click a booking), a new green WhatsApp button will appear below the existing "Email Task" section. Clicking it opens WhatsApp (web or app) with a pre-composed message like:

```
Hi Thomas Müller,

Your meeting with FastMedia.Pro is confirmed!

📅 Date: 15 Mar 2026, 14:00
⏱ Duration: 60 minutes
🔧 Service: Web Development Consultation

If you need to reschedule, please let us know.

Best regards,
FastMedia.Pro
```

If the booking has a phone number, the link will target that number directly (`wa.me/49170...`). If no phone number exists, it will open a blank WhatsApp compose so the admin can paste/select the recipient.

### Technical changes

**File: `src/pages/admin/AdminBookings.tsx`**

1. Import the `MessageCircle` icon from lucide-react (already available in the project)
2. Add a helper function `buildWhatsAppLink(booking, formatDate)` that:
   - Strips non-numeric chars from the phone number
   - Constructs the message text with booking details
   - Returns `https://wa.me/{phone}?text={encodedMessage}`
3. Add a new section in the `BookingDetailSheet` between the Email Task section and the Save/Close buttons, containing a green WhatsApp button that opens the link in a new tab
4. Add translation keys for the button label (or use inline text since the section is admin-only)

Single file change, no database changes, no API keys, no edge functions needed.

