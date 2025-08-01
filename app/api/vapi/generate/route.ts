import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin"; // Make sure this initializes Firebase Admin SDK properly
import { getRandomInterviewCover } from "@/lib/utils";
import { getAuth } from "firebase-admin/auth";


export async function POST(request: Request) {
  try {
    // Extract Firebase ID token from Authorization header in the request
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Missing or invalid Authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const idToken = authHeader.substring("Bearer ".length);

    // Verify the Firebase ID token and extract userId (UID)
    let userIdAuth: string;
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      userIdAuth = decodedToken.uid;
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Invalid Firebase ID token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const interviewId = (Math.floor(Math.random() * 1001)).toString();

    // Parse the JSON body for other interview-related data
    const { type, role, level, techstack, amount, userid } = await request.json()


    // Validate required interview data fields except userId (userId comes from token)
    if (!type || !role || !level || !techstack || !amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing one or more required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare prompt for AI question generation
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
      Thank you! <3`;

    // Generate interview questions from AI
    const { text: questionsText } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
    });

    // Parse questions JSON safely
    let questions = [];
    try {
      questions = JSON.parse(questionsText);
      if (!Array.isArray(questions)) {
        questions = [];
      }
    } catch (err) {
      console.error("Failed to parse AI generated questions:", err);
      questions = [];
    }

    // Compose interview document
    const interview = {
      interviewId,
      role,
      type,
      level,
      techstack: techstack.split(",").map((s: string) => s.trim()),
      questions,
      userId:userIdAuth, // The authenticated userId from Firebase token
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save interview document to Firestore
    await db.collection("interviews").doc(interviewId).set({
      interview
    },{merge:true});
    // await db.collection("interviews").doc("userid").set({
    //   userId
    // },{merge:true});


    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating or saving interview:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Optional GET for health check
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Missing or invalid Authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const idToken = authHeader.substring("Bearer ".length);

    let userId: string;
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Invalid Firebase ID token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, userId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
