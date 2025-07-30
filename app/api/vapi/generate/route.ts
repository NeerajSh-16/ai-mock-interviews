import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    // Parse JSON body
    const { type, role, level, techstack, amount, userid } = await request.json();

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing one or more required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare prompt for AI text generation
    const prompt = `Prepare questions for a job interview.
                    The job role is ${role}.
                    The job experience level is ${level}.
                    The tech stack used in the job is: ${techstack}.
                    The focus between behavioural and technical questions should lean towards: ${type}.
                    The amount of questions required is: ${amount}.
                    Please return only the questions, without any additional text.
                    The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                    Return the questions formatted like this:
                    ["Question 1", "Question 2", "Question 3"]
                    Thank you! <3
                    `;

    // Generate interview questions using AI
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    // Compose interview document
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((s: string) => s.trim()),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save the interview document to Firestore
    await db.collection("interviews").add(interview);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating or saving interview:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Optional GET handler for testing or health check
export async function GET() {
  return new Response(
    JSON.stringify({ success: true, data: "API is working" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
