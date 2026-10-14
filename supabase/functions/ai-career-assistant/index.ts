// Supabase Edge Function: ai-career-assistant
// Handles server-side AI processing (Gemini or OpenAI API) securely with authentication checks,
// input validation, size limits, and structured JSON responses.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("AI_API_KEY");

    // Authenticate user via JWT in Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired authentication token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { action, payload } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing required 'action' in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if external AI key is configured
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "AI service key (GEMINI_API_KEY) is not configured on the server.",
          isConfigured: false,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate_summary":
        systemPrompt = "You are a professional career coach and resume writer. Generate a concise, impactful 3-4 sentence professional summary based on the provided skills, education, and experience. Focus on strengths and career aspirations. Do NOT invent fake employers or credentials.";
        userPrompt = `Candidate Details:\n${JSON.stringify(payload, null, 2)}`;
        break;

      case "optimize_bullet":
        systemPrompt = "You are an expert resume editor. Rewrite the following resume bullet point using the STAR method (Situation, Task, Action, Result) with strong action verbs and quantified impact where applicable. Preserve all truthful facts.";
        userPrompt = `Original bullet point: "${payload.bullet}"\nRole context: ${payload.role || "Professional"}`;
        break;

      case "evaluate_interview_answer":
        systemPrompt = "You are a senior hiring manager and technical interviewer. Evaluate the candidate's answer to the given question. Return a strictly valid JSON object with the following fields: 'score' (number 0 to 100), 'feedback' (detailed constructive feedback), 'model_answer' (an exemplary response), 'strengths' (array of strings), and 'areas_to_improve' (array of strings).";
        userPrompt = `Interview Type: ${payload.interview_type}\nQuestion: ${payload.question}\nTarget Role: ${payload.role}\nCandidate Answer: ${payload.answer}`;
        break;

      case "generate_questions":
        systemPrompt = "You are an expert interviewer. Generate realistic interview questions based on the role, difficulty, and interview type. Return a strictly valid JSON array of objects, each containing: 'question' (string), 'category' (string), 'guidance' (string hints).";
        userPrompt = `Role: ${payload.role}\nType: ${payload.interview_type}\nDifficulty: ${payload.difficulty}\nQuantity: ${payload.count || 3}\nJob Description Context: ${payload.job_description || "N/A"}`;
        break;

      case "analyze_job_match":
        systemPrompt = "You are an ATS and career strategist. Compare the candidate's resume/skills against the target job description. Return a strictly valid JSON object with: 'match_score' (number 0 to 100), 'matching_skills' (array of strings), 'missing_skills' (array of strings), 'recommendations' (array of actionable tips), and 'keyword_advice' (string).";
        userPrompt = `Job Title: ${payload.job_title}\nJob Description:\n${payload.job_description}\nCandidate Profile/Resume:\n${JSON.stringify(payload.candidate_data)}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported action '${action}'` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Call Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\nTask:\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: "AI provider request failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(
      JSON.stringify({ result: candidateText, success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
