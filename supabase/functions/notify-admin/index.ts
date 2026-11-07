import { createClient } from 'npm:@supabase/supabase-js@2';
import { formNotification, FORM_SOURCE, submitterReplyTo } from '../_shared/form-notification.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ALERT_RECIPIENTS } from "../_shared/alert-recipients.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify internal call via service role
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authHeader || !serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, data } = await req.json();

    let subject = "";
    let body = "";

    switch (type) {
      case "new_lead": {
        const { name, email, trade, score, classification, quoteOneTime, specialRequest } = data;
        subject = `🔥 New Lead: ${name} (${classification.toUpperCase()}) — ${trade}`;
        body = [
          `New lead submitted via calculator:`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Trade: ${trade}`,
          `Score: ${score}/100 (${classification})`,
          `Quote: ${quoteOneTime} CZK`,
          specialRequest ? `Special Request: ${specialRequest}` : "",
          ``,
          `View in admin: https://www.fastmedia.pro/admin/leads`,
        ]
          .filter(Boolean)
          .join("\n");
        break;
      }
      case "new_booking": {
        const { customerName, customerEmail, service, scheduledAt } = data;
        subject = `📅 New Booking: ${customerName} — ${service}`;
        body = [
          `New booking received:`,
          ``,
          `Customer: ${customerName}`,
          `Email: ${customerEmail}`,
          `Service: ${service}`,
          `Scheduled: ${scheduledAt}`,
          ``,
          `View in admin: https://www.fastmedia.pro/admin/bookings`,
        ].join("\n");
        break;
      }
      case "new_subscriber": {
        const { subscriberEmail } = data;
        subject = `📬 New Newsletter Subscriber`;
        body = `New subscriber: ${subscriberEmail}\n\nView in admin: https://www.fastmedia.pro/admin/newsletter`;
        break;
      }
      case "module_request": {
        const { trade, summary, range, contact } = data;
        subject = `💡 New module idea from the calculator — ${trade || "unknown trade"}`;
        body = `${summary}\n\nRough range: ${range}\nContact: ${contact}\n\nReview: https://www.fastmedia.pro/admin/module-requests`;
        break;
      }
      default: {
        subject = `FastMedia.Pro Notification`;
        body = JSON.stringify(data, null, 2);
      }
    }

    let replyTo: string | undefined;
    // Module advisor is the current form caller; payment/operational alerts remain unchanged.
    if (type === 'module_request') {
      const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey);
      const { data: record } = await db.from('module_requests').select('id,created_at,contact_email').eq('id', data.requestId).maybeSingle();
      if (!record) return new Response(JSON.stringify({ error: 'Stored form reference unavailable' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const formatted = formNotification(subject, '', body, { form: 'Calculator module request', id: record.id, timestamp: record.created_at });
      subject = formatted.subject; body = formatted.text;
      replyTo = submitterReplyTo(record.contact_email);
    }

    // Use Lovable AI to send via a simple webhook-style log
    // For now, log the notification. When Resend is configured, this will send actual emails.
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${type === "module_request" ? FORM_SOURCE.name : "FastMedia.Pro"} <noreply@fastmedia.pro>`,
          reply_to: replyTo,
          to: [...ALERT_RECIPIENTS],
          subject,
          text: body,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error("Resend error:", emailResponse.status, errText);
        return new Response(JSON.stringify({ sent: false, error: "Email delivery failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ sent: true, method: "email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: log notification (no email provider configured yet)
    console.log(`[NOTIFICATION] To: ${ALERT_RECIPIENTS.join(', ')}`);
    console.log(`[NOTIFICATION] Subject: ${subject}`);
    console.log(`[NOTIFICATION] Body: ${body}`);

    return new Response(JSON.stringify({ sent: true, method: "log", recipient: "configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-admin error:", e instanceof Error ? e.message : "Unknown");
    return new Response(JSON.stringify({ error: "Notification failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
