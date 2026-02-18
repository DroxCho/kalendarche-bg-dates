import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Birthday {
  id: string;
  user_id: string;
  name: string;
  month: number;
  day: number;
  year: number | null;
}

interface RecurringEvent {
  id: string;
  user_id: string;
  name: string;
  month: number;
  day: number;
  year: number | null;
  event_type: string;
  icon: string | null;
  color: string | null;
}

interface NotificationPreference {
  user_id: string;
  email_birthday_reminders: boolean;
  email_recurring_reminders: boolean;
  reminder_days_before: number;
}

const eventTypeLabels: Record<string, string> = {
  anniversary: "годишнина",
  memorial: "възпоменание",
  custom: "събитие",
};

const eventTypeEmojis: Record<string, string> = {
  anniversary: "💍",
  memorial: "🕯️",
  custom: "📅",
};

// Sanitize user-provided text before embedding in HTML emails
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting reminder check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with any reminders enabled
    const { data: preferences, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("*");

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      throw prefsError;
    }

    console.log(`Found ${preferences?.length || 0} users with preferences`);

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with preferences", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const today = new Date();
    let totalSent = 0;

    for (const pref of preferences as NotificationPreference[]) {
      // Calculate the target date (today + reminder_days_before)
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + pref.reminder_days_before);
      
      const targetMonth = targetDate.getMonth() + 1;
      const targetDay = targetDate.getDate();

      console.log(`Checking reminders for user ${pref.user_id} on ${targetMonth}/${targetDay}`);

      let birthdayNames: string[] = [];
      let recurringEventDetails: { name: string; type: string; years: number | null }[] = [];

      // Get birthdays if enabled
      if (pref.email_birthday_reminders) {
        const { data: birthdays, error: birthdaysError } = await supabase
          .from("birthdays")
          .select("*")
          .eq("user_id", pref.user_id)
          .eq("month", targetMonth)
          .eq("day", targetDay);

        if (birthdaysError) {
          console.error(`Error fetching birthdays for user ${pref.user_id}:`, birthdaysError);
        } else if (birthdays && birthdays.length > 0) {
          console.log(`Found ${birthdays.length} birthdays for user ${pref.user_id}`);
          birthdayNames = (birthdays as Birthday[]).map(b => {
            const age = b.year ? targetDate.getFullYear() - b.year : null;
            const safeName = escapeHtml(b.name);
            return age ? `${safeName} (навършва ${age} години)` : safeName;
          });
        }
      }

      // Get recurring events if enabled
      if (pref.email_recurring_reminders) {
        const { data: events, error: eventsError } = await supabase
          .from("recurring_events")
          .select("*")
          .eq("user_id", pref.user_id)
          .eq("month", targetMonth)
          .eq("day", targetDay);

        if (eventsError) {
          console.error(`Error fetching recurring events for user ${pref.user_id}:`, eventsError);
        } else if (events && events.length > 0) {
          console.log(`Found ${events.length} recurring events for user ${pref.user_id}`);
          recurringEventDetails = (events as RecurringEvent[]).map(e => ({
            name: escapeHtml(e.name),
            type: e.event_type,
            years: e.year ? targetDate.getFullYear() - e.year : null,
          }));
        }
      }

      // Skip if no reminders to send
      if (birthdayNames.length === 0 && recurringEventDetails.length === 0) {
        console.log(`No reminders found for user ${pref.user_id} on ${targetMonth}/${targetDay}`);
        continue;
      }

      // Get user email from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(pref.user_id);
      
      if (userError || !userData?.user?.email) {
        console.error(`Error fetching user email for ${pref.user_id}:`, userError);
        continue;
      }

      const userEmail = userData.user.email;

      const isToday = pref.reminder_days_before === 0;
      const isTomorrow = pref.reminder_days_before === 1;
      
      let dateText = "";
      if (isToday) {
        dateText = "днес";
      } else if (isTomorrow) {
        dateText = "утре";
      } else {
        dateText = `след ${pref.reminder_days_before} дни`;
      }

      // Build subject and content
      const hasBirthdays = birthdayNames.length > 0;
      const hasEvents = recurringEventDetails.length > 0;
      
      let subject = "";
      if (hasBirthdays && hasEvents) {
        subject = `📅 Напомняния за ${dateText}: ${birthdayNames.length} рожден${birthdayNames.length === 1 ? '' : 'и'} ден${birthdayNames.length === 1 ? '' : 'а'} и ${recurringEventDetails.length} събити${recurringEventDetails.length === 1 ? 'е' : 'я'}`;
      } else if (hasBirthdays) {
        subject = birthdayNames.length === 1 
          ? `🎂 ${birthdayNames[0]} има рожден ден ${dateText}!`
          : `🎂 ${birthdayNames.length} рождени дни ${dateText}!`;
      } else {
        const firstEvent = recurringEventDetails[0];
        const emoji = eventTypeEmojis[firstEvent.type] || "📅";
        subject = recurringEventDetails.length === 1
          ? `${emoji} ${firstEvent.name} - ${eventTypeLabels[firstEvent.type] || 'събитие'} ${dateText}!`
          : `📅 ${recurringEventDetails.length} събития ${dateText}!`;
      }

      // Build HTML content
      let birthdaySectionHtml = "";
      if (hasBirthdays) {
        const birthdayListHtml = birthdayNames.map(name => `<li style="margin: 8px 0;">${name}</li>`).join("");
        birthdaySectionHtml = `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">🎂 Рождени дни</h2>
            ${birthdayNames.length === 1 
              ? `<p style="font-size: 16px;"><strong>${birthdayNames[0]}</strong> има рожден ден <strong>${dateText}</strong>!</p>`
              : `<p style="font-size: 16px;">Имате <strong>${birthdayNames.length}</strong> рождени дни <strong>${dateText}</strong>:</p>
                 <ul style="background: white; padding: 20px 20px 20px 40px; border-radius: 8px; border: 1px solid #e5e7eb;">${birthdayListHtml}</ul>`
            }
          </div>
        `;
      }

      let eventsSectionHtml = "";
      if (hasEvents) {
        const eventsListHtml = recurringEventDetails.map(e => {
          const emoji = eventTypeEmojis[e.type] || "📅";
          const typeLabel = eventTypeLabels[e.type] || "събитие";
          const yearsText = e.years ? ` (${e.years} ${e.years === 1 ? 'година' : 'години'})` : "";
          return `<li style="margin: 8px 0;">${emoji} <strong>${e.name}</strong> - ${typeLabel}${yearsText}</li>`;
        }).join("");
        
        eventsSectionHtml = `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #764ba2; font-size: 20px; margin-bottom: 15px;">📅 Годишни събития</h2>
            ${recurringEventDetails.length === 1 
              ? `<p style="font-size: 16px;">${eventTypeEmojis[recurringEventDetails[0].type] || "📅"} <strong>${recurringEventDetails[0].name}</strong> - ${eventTypeLabels[recurringEventDetails[0].type] || 'събитие'}${recurringEventDetails[0].years ? ` (${recurringEventDetails[0].years} ${recurringEventDetails[0].years === 1 ? 'година' : 'години'})` : ''} е <strong>${dateText}</strong>!</p>`
              : `<p style="font-size: 16px;">Имате <strong>${recurringEventDetails.length}</strong> събития <strong>${dateText}</strong>:</p>
                 <ul style="background: white; padding: 20px 20px 20px 40px; border-radius: 8px; border: 1px solid #e5e7eb;">${eventsListHtml}</ul>`
            }
          </div>
        `;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📅 Календар БГ - Напомняне</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            ${birthdaySectionHtml}
            ${eventsSectionHtml}
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              ${hasBirthdays && hasEvents 
                ? "Не забравяйте да отбележите тези важни дати! 🎉"
                : hasBirthdays 
                  ? "Не забравяйте да пожелаете честит рожден ден! 🎉"
                  : "Не забравяйте за това важно събитие! 💫"
              }
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              Този имейл е изпратен от Календар БГ. 
              <br>Можете да управлявате напомнянията от вашия профил.
            </p>
          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: "Календар БГ <onboarding@resend.dev>",
          to: [userEmail],
          subject: subject,
          html: html,
        });

        console.log(`Email sent successfully to ${userEmail}:`, emailResponse);
        totalSent++;
      } catch (emailError) {
        console.error(`Error sending email to ${userEmail}:`, emailError);
      }
    }

    console.log(`Reminder check complete. Sent ${totalSent} emails.`);

    return new Response(
      JSON.stringify({ message: "Reminders sent", sent: totalSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-birthday-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
