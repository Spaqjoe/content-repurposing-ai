import { NextResponse } from "next/server";
import {
  truncateSourceContent,
  ValidationError,
  validateYouTubeIngestRequest,
} from "@/lib/validators";
import { ingestYouTubeUrl, YouTubeError } from "@/lib/youtube";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = validateYouTubeIngestRequest(body);
    const { videoId, transcript } = await ingestYouTubeUrl(url);
    const sourceContent = truncateSourceContent(transcript);

    return NextResponse.json({
      success: true,
      sourceContent,
      sourceLabel: `YouTube: ${videoId}`,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof YouTubeError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    console.error("YouTube ingest failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while extracting the YouTube transcript.",
      },
      { status: 500 },
    );
  }
}
