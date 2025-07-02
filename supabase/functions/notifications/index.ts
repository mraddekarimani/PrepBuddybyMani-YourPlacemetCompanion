import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Resend } from 'npm:resend@3.2.0';

const resend = new Resend('re_TLCxQLmv_2d7ycYrQDDfxC6oAU3BAkNF4'); // Replace with your Resend API key

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

async function sendDailyReminder(email: string, currentDay: number) {
  try {
    await resend.emails.send({
      from: 'PrepBuddy <notifications@prepbuddy.com>',
      to: email,
      subject: `PrepBuddy Day ${currentDay} Reminder`,
      html: `
        <h2>Time to tackle today's tasks!</h2>
        <p>Don't forget to complete your tasks for Day ${currentDay}.</p>
        <p>Keep up the great work and maintain your streak! 💪</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send daily reminder:', error);
    return false;
  }
}

async function sendProgressUpdate(email: string, currentDay: number, completionRate: number, streak: number) {
  try {
    await resend.emails.send({
      from: 'PrepBuddy <notifications@prepbuddy.com>',
      to: email,
      subject: `PrepBuddy Progress Update - Day ${currentDay}`,
      html: `
        <h2>Your Progress Update</h2>
        <ul>
          <li>Current Day: ${currentDay}/100</li>
          <li>Completion Rate: ${completionRate}%</li>
          <li>Current Streak: ${streak} days</li>
        </ul>
        <p>Keep pushing forward! You're doing great! 🎯</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send progress update:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, currentDay, completionRate, streak } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let success = false;
    if (type === 'daily_reminder') {
      success = await sendDailyReminder(email, currentDay);
    } else if (type === 'progress_update') {
      success = await sendProgressUpdate(email, currentDay, completionRate, streak);
    }

    return new Response(
      JSON.stringify({ success }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});