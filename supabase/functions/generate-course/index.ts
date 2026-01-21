// AI Course Generator Edge Function

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CourseGenerationRequest {
  topic: string;
  preferences: {
    lessonCount: number;
    includeText: boolean;
    includeVideo: boolean;
    includeAudio: boolean;
    includeScreenshare: boolean;
    includeQuizzes: boolean;
    targetAudience: string;
    difficulty: "beginner" | "intermediate" | "advanced";
  };
}

interface GeneratedLesson {
  title: string;
  description: string;
  content: string;
  lesson_type: "text" | "video";
  duration_minutes: number;
  video_script?: string;
  audio_script?: string;
  screenshare_notes?: string;
  quizzes: {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }[];
}

interface GeneratedCourse {
  title: string;
  description: string;
  thumbnail_prompt: string;
  target_audience: string;
  learning_objectives: string[];
  lessons: GeneratedLesson[];
  estimated_duration_hours: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, preferences } = (await req.json()) as CourseGenerationRequest;

    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating course for topic: "${topic}"`, preferences);

    // Build the prompt based on preferences
    const contentTypes = [];
    if (preferences.includeText) contentTypes.push("written text content");
    if (preferences.includeVideo) contentTypes.push("video scripts with detailed instructions");
    if (preferences.includeAudio) contentTypes.push("voiceover/audio scripts");
    if (preferences.includeScreenshare) contentTypes.push("screenshare walkthrough notes");
    
    const prompt = `You are an expert course creator. Generate a comprehensive, professional course on the topic: "${topic}"

REQUIREMENTS:
- Target Audience: ${preferences.targetAudience || "General professionals"}
- Difficulty Level: ${preferences.difficulty || "intermediate"}
- Number of Lessons: ${preferences.lessonCount || 5}
- Content Types to Include: ${contentTypes.join(", ")}
- Include Quizzes: ${preferences.includeQuizzes ? "Yes, with 2-3 quiz questions per lesson" : "No"}

OUTPUT FORMAT (JSON):
{
  "title": "Catchy, descriptive course title",
  "description": "2-3 sentence compelling course description",
  "thumbnail_prompt": "A detailed prompt for generating a course thumbnail image",
  "target_audience": "Who this course is for",
  "learning_objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "estimated_duration_hours": 2.5,
  "lessons": [
    {
      "title": "Lesson title",
      "description": "Brief lesson overview",
      "content": "Detailed lesson content in markdown format (500-800 words)",
      "lesson_type": "text" or "video",
      "duration_minutes": 15,
      ${preferences.includeVideo ? '"video_script": "Detailed script for video recording with timestamps and visual cues",' : ""}
      ${preferences.includeAudio ? '"audio_script": "Professional voiceover script with tone/pacing notes",' : ""}
      ${preferences.includeScreenshare ? '"screenshare_notes": "Step-by-step instructions for screenshare demonstration",' : ""}
      "quizzes": [
        {
          "question": "Quiz question",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A",
          "explanation": "Why this is the correct answer"
        }
      ]
    }
  ]
}

Make the content:
1. Professional and well-structured
2. Actionable with practical examples
3. Engaging with real-world applications
4. Progressive in complexity across lessons
5. Comprehensive enough to truly educate

Return ONLY valid JSON, no markdown code blocks or additional text.`;

    // Use Lovable AI API
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://api.lovable.dev/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error("Failed to generate course content");
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response
    let courseData: GeneratedCourse;
    try {
      // Clean up potential markdown code blocks
      const cleanedText = generatedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      courseData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", generatedText);
      throw new Error("Failed to parse course generation response");
    }

    console.log(`Generated course: "${courseData.title}" with ${courseData.lessons.length} lessons`);

    return new Response(JSON.stringify(courseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating course:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate course";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
