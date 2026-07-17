import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cf";
import { generateAllFormats } from "@/lib/ai";
import { saveGenerationToD1 } from "@/lib/db";
import { ValidationError, validateGenerationRequest } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = validateGenerationRequest(body);
    const env = await getCloudflareEnv();

    const results = await generateAllFormats(env.AI, payload);
    const generationId = await saveGenerationToD1(env.DB, payload, results);

    return NextResponse.json({
      success: true,
      results,
      generationId,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, results: {} },
        { status: 400 },
      );
    }

    console.error("Generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating content.",
        results: {},
      },
      { status: 500 },
    );
  }
}
