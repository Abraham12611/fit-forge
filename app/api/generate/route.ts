import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client
// Ensure your OPENAI_API_KEY is set in your environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { height, weight, goal, equipment } = body;

    // Basic validation (can be expanded)
    if (!height || !weight || !goal) {
      return NextResponse.json({ error: 'Missing required fields: height, weight, or goal.' }, { status: 400 });
    }

    // Construct the prompt for GPT-4
    // Based on extra/fitforge.md and extra/progress.md
    const systemPrompt = `You are a certified fitness & nutrition coach.
Return a 7-day plan as JSON. The root object should have two keys: "workouts" and "meals".
"workouts" should be an array of objects, each with: "day" (e.g., "Mon"), "title" (e.g., "HIIT + Core"), "burn_kcal_est" (estimated calories burned, number), and "exercises" (an array of objects, each with "name", "sets" (number), "reps" (string or number, e.g., "12" or "AMRAP")).
"meals" should be an array of objects, each with: "day", "meal" (e.g., "Breakfast", "Lunch", "Dinner", "Snack"), "item" (e.g., "Greek-yoghurt bowl"), "kcal" (number), and "macros" (an object with "p" for protein_g, "c" for carbs_g, "f" for fat_g, all numbers).
Ensure the JSON is well-formed and can be directly parsed.`;

    const userMessage = `Generate a 7-day workout and meal plan based on the following user details:
- Height: ${height} cm
- Weight: ${weight} kg
- Primary Goal: ${goal}
- Available Equipment: ${equipment && equipment.length > 0 ? equipment.join(', ') : 'Not specified'}

${goal === 'fat_loss' ? 'Aim for a daily caloric deficit of approximately 500 kcal for fat loss.' : ''}
Focus on variety and balanced nutrition. Provide estimated calories for meals and workouts.`;

    console.log("Sending prompt to OpenAI...");

    // Option 1: Use model that supports response_format
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Updated to a model that supports json_object response format
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" }, // This parameter is supported by gpt-4-turbo
      // max_tokens: 1500, // Adjust as needed
      // temperature: 0.7, // Adjust for creativity vs. determinism
    });

    // Option 2 (alternative): Remove response_format and keep using gpt-4
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [
    //     { role: "system", content: systemPrompt },
    //     { role: "user", content: userMessage },
    //   ],
    //   // max_tokens: 1500, // Adjust as needed
    //   // temperature: 0.7, // Adjust for creativity vs. determinism
    // });

    const planJsonString = completion.choices[0]?.message?.content;

    if (!planJsonString) {
      return NextResponse.json({ error: 'Failed to get a valid response from OpenAI.' }, { status: 500 });
    }

    try {
      const parsedPlan = JSON.parse(planJsonString);
      console.log("Successfully parsed plan from OpenAI.");
      return NextResponse.json(parsedPlan);
    } catch (parseError) {
      console.error("Failed to parse JSON response from OpenAI:", parseError);
      console.error("Raw OpenAI response string:", planJsonString);
      return NextResponse.json({ error: 'Failed to parse the generated plan. The response was not valid JSON.', rawResponse: planJsonString }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error calling OpenAI API:", error);
    let errorMessage = 'An unexpected error occurred.';
    if (error.response) {
      errorMessage = error.response.data?.error?.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: "Failed to generate plan.", details: errorMessage }, { status: 500 });
  }
}