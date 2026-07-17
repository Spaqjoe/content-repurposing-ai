import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/cf";
import { getRecentGenerations } from "@/lib/db";

export async function GET() {
  try {
    const env = await getCloudflareEnv();
    const records = await getRecentGenerations(env.DB, 30);

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("History fetch failed:", error);

    return NextResponse.json({
      success: true,
      records: [],
      warning:
        error instanceof Error
          ? error.message
          : "Unable to load remote generation history.",
    });
  }
}
