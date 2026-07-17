import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cf";
import { transcribeMedia } from "@/lib/transcription";
import {
  truncateSourceContent,
  ValidationError,
  validateUploadFile,
} from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = validateUploadFile(formData.get("file"));
    const env = await getCloudflareEnv();
    const transcript = await transcribeMedia(env.AI, file, file.name);
    const sourceContent = truncateSourceContent(transcript);

    return NextResponse.json({
      success: true,
      sourceContent,
      sourceLabel: file.name,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    console.error("Upload ingest failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while transcribing the upload.",
      },
      { status: 500 },
    );
  }
}
