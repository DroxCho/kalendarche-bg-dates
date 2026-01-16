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

interface NotificationPreference {
  user_id: string;
  email_birthday_reminders: boolean;
  reminder_days_before: number;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting birthday reminder check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with email reminders enabled
    const { data: preferences, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("email_birthday_reminders", true);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      throw prefsError;
    }

    console.log(`Found ${preferences?.length || 0} users with reminders enabled`);

    if (!preferences || preferences.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users with reminders enabled", sent: 0 }),
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

      console.log(`Checking birthdays for user ${pref.user_id} on ${targetMonth}/${targetDay}`);

      // Get birthdays for this user on the target date
      const { data: birthdays, error: birthdaysError } = await supabase
        .from("birthdays")
        .select("*")
        .eq("user_id", pref.user_id)
        .eq("month", targetMonth)
        .eq("day", targetDay);

      if (birthdaysError) {
        console.error(`Error fetching birthdays for user ${pref.user_id}:`, birthdaysError);
        continue;
      }

      if (!birthdays || birthdays.length === 0) {
        console.log(`No birthdays found for user ${pref.user_id} on ${targetMonth}/${targetDay}`);
        continue;
      }

      console.log(`Found ${birthdays.length} birthdays for user ${pref.user_id}`);

      // Get user email from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(pref.user_id);
      
      if (userError || !userData?.user?.email) {
        console.error(`Error fetching user email for ${pref.user_id}:`, userError);
        continue;
      }

      const userEmail = userData.user.email;

      // Format birthday names
      const birthdayNames = (birthdays as Birthday[]).map(b => {
        const age = b.year ? targetDate.getFullYear() - b.year : null;
        return age ? `${b.name} (навършва ${age} години)` : b.name;
      });

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

      const subject = birthdayNames.length === 1 
        ? `🎂 ${birthdayNames[0]} има рожден ден ${dateText}!`
        : `🎂 ${birthdayNames.length} рождени дни ${dateText}!`;

      const birthdayListHtml = birthdayNames.map(name => `<li style="margin: 8px 0;">${name}</li>`).join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎂 Напомняне за рожден ден</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${birthdayNames.length === 1 
                ? `<strong>${birthdayNames[0]}</strong> има рожден ден <strong>${dateText}</strong>!`
                : `Имате <strong>${birthdayNames.length}</strong> рождени дни <strong>${dateText}</strong>:`
              }
            </p>
            ${birthdayNames.length > 1 ? `<ul style="background: white; padding: 20px 20px 20px 40px; border-radius: 8px; border: 1px solid #e5e7eb;">${birthdayListHtml}</ul>` : ''}
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Не забравяйте да пожелаете честит рожден ден! 🎉
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

    console.log(`Birthday reminder check complete. Sent ${totalSent} emails.`);

    return new Response(
      JSON.stringify({ message: "Birthday reminders sent", sent: totalSent }),
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
