import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cf";
import { saveGenerationToD1 } from "@/lib/db";
import { ValidationError, validateSaveRequest } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { request: payload, results } = validateSaveRequest(body);
    const env = await getCloudflareEnv();
    const generationId = await saveGenerationToD1(env.DB, payload, results);

    return NextResponse.json({
      success: true,
      generationId,
      savedToHistory: Boolean(generationId),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, savedToHistory: false },
        { status: 400 },
      );
    }

    console.error("Save failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while saving.",
        savedToHistory: false,
      },
      { status: 500 },
    );
  }
}
