const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);

const WEB_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const ANDROID_USER_AGENT =
  "com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip";

const IOS_USER_AGENT =
  "com.google.ios.youtube/20.10.38 (iPhone14,3; U; CPU iOS 17_0 like Mac OS X)";

export class YouTubeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YouTubeError";
  }
}

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && id.length === 11 ? id : null;
    }

    if (!YOUTUBE_HOSTS.has(url.hostname) && host !== "youtube.com") {
      return null;
    }

    const fromQuery = url.searchParams.get("v");
    if (fromQuery && fromQuery.length === 11) {
      return fromQuery;
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "shorts" || pathParts[0] === "embed" || pathParts[0] === "live") {
      const id = pathParts[1];
      return id && id.length === 11 ? id : null;
    }
  } catch {
    return null;
  }

  return null;
}

interface CaptionTrack {
  baseUrl: string;
  languageCode?: string;
  kind?: string;
}

function extractJsonObject(source: string, startIndex: number): string | null {
  const openingBrace = source.indexOf("{", startIndex);
  if (openingBrace === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = openingBrace; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openingBrace, index + 1);
      }
    }
  }

  return null;
}

function parsePlayerResponse(html: string): Record<string, unknown> | null {
  const markers = ["ytInitialPlayerResponse = ", "var ytInitialPlayerResponse = "];

  for (const marker of markers) {
    const startIndex = html.indexOf(marker);
    if (startIndex === -1) {
      continue;
    }

    const jsonText = extractJsonObject(html, startIndex + marker.length);
    if (!jsonText) {
      continue;
    }

    try {
      return JSON.parse(jsonText) as Record<string, unknown>;
    } catch {
      continue;
    }
  }

  return null;
}

function getCaptionTracks(playerResponse: Record<string, unknown>): CaptionTrack[] {
  const captions = playerResponse.captions as
    | {
        playerCaptionsTracklistRenderer?: {
          captionTracks?: CaptionTrack[];
        };
      }
    | undefined;

  return captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
}

function pickCaptionTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (tracks.length === 0) {
    return null;
  }

  const manualEnglish =
    tracks.find((track) => track.languageCode?.startsWith("en") && track.kind !== "asr") ??
    tracks.find((track) => track.languageCode?.startsWith("en")) ??
    tracks.find((track) => track.kind !== "asr") ??
    tracks[0];

  return manualEnglish ?? null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parseCaptionXml(xml: string): string {
  const segments: string[] = [];
  const textPattern = /<text[^>]*>([\s\S]*?)<\/text>/g;

  for (const match of xml.matchAll(textPattern)) {
    const text = decodeHtmlEntities(match[1]?.replace(/\n/g, " ").trim() ?? "");
    if (text) {
      segments.push(text);
    }
  }

  return segments.join(" ");
}

function parseCaptionJson(json: string): string {
  if (!json.trim()) {
    return "";
  }

  const payload = JSON.parse(json) as {
    events?: Array<{ segs?: Array<{ utf8?: string }> }>;
  };

  const segments: string[] = [];
  for (const event of payload.events ?? []) {
    for (const segment of event.segs ?? []) {
      const text = segment.utf8?.replace(/\n/g, " ").trim();
      if (text && text !== "\n") {
        segments.push(text);
      }
    }
  }

  return segments.join(" ");
}

function normalizeCaptionUrl(baseUrl: string): string {
  const withoutFmt = baseUrl.replace(/([?&])fmt=[^&]*&?/g, "$1").replace(/[?&]$/, "");
  return `${withoutFmt}${withoutFmt.includes("?") ? "&" : "?"}fmt=json3`;
}

async function fetchCaptionText(baseUrl: string, userAgent: string): Promise<string> {
  const jsonUrl = normalizeCaptionUrl(baseUrl);
  const jsonResponse = await fetch(jsonUrl, {
    headers: { "User-Agent": userAgent },
  });

  if (jsonResponse.ok) {
    const jsonText = await jsonResponse.text();
    try {
      const parsed = parseCaptionJson(jsonText);
      if (parsed) {
        return parsed;
      }
    } catch {
      // Fall through to XML parsing.
    }
  }

  const xmlResponse = await fetch(baseUrl, {
    headers: { "User-Agent": userAgent },
  });

  if (!xmlResponse.ok) {
    throw new YouTubeError("Unable to download captions for this video.");
  }

  const xml = await xmlResponse.text();
  const parsed = parseCaptionXml(xml);
  if (!parsed) {
    throw new YouTubeError("Captions were found but could not be parsed.");
  }

  return parsed;
}

interface InnertubeClient {
  clientName: "ANDROID" | "IOS" | "WEB";
  clientVersion: string;
  userAgent: string;
  androidSdkVersion?: number;
}

const INNERTUBE_CLIENTS: InnertubeClient[] = [
  {
    clientName: "ANDROID",
    clientVersion: "20.10.38",
    userAgent: ANDROID_USER_AGENT,
    androidSdkVersion: 34,
  },
  {
    clientName: "IOS",
    clientVersion: "20.10.38",
    userAgent: IOS_USER_AGENT,
  },
  {
    clientName: "WEB",
    clientVersion: "2.20250210.01.00",
    userAgent: WEB_USER_AGENT,
  },
];

async function fetchInnertubePlayerResponse(
  videoId: string,
  client: InnertubeClient,
): Promise<Record<string, unknown>> {
  const response = await fetch(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": client.userAgent,
        "Accept-Language": "en-US,en;q=0.9",
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            clientName: client.clientName,
            clientVersion: client.clientVersion,
            hl: "en",
            ...(client.androidSdkVersion
              ? { androidSdkVersion: client.androidSdkVersion }
              : {}),
          },
        },
      }),
    },
  );

  if (!response.ok) {
    throw new YouTubeError("Unable to read video metadata from YouTube.");
  }

  return (await response.json()) as Record<string, unknown>;
}

async function fetchPlayerResponse(videoId: string): Promise<{
  playerResponse: Record<string, unknown>;
  userAgent: string;
}> {
  for (const client of INNERTUBE_CLIENTS) {
    const playerResponse = await fetchInnertubePlayerResponse(videoId, client);
    const tracks = getCaptionTracks(playerResponse);

    if (tracks.length > 0) {
      return { playerResponse, userAgent: client.userAgent };
    }
  }

  const watchResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
    headers: {
      "User-Agent": WEB_USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!watchResponse.ok) {
    throw new YouTubeError("Unable to load the YouTube video.");
  }

  const html = await watchResponse.text();
  const playerResponse = parsePlayerResponse(html);
  if (playerResponse) {
    return { playerResponse, userAgent: WEB_USER_AGENT };
  }

  throw new YouTubeError("Unable to read video metadata from YouTube.");
}

export async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  const { playerResponse, userAgent } = await fetchPlayerResponse(videoId);
  const tracks = getCaptionTracks(playerResponse);
  const track = pickCaptionTrack(tracks);

  if (!track?.baseUrl) {
    throw new YouTubeError(
      "No captions found for this video. Try a video with subtitles enabled, or upload the file instead.",
    );
  }

  const transcript = await fetchCaptionText(track.baseUrl, userAgent);
  if (!transcript.trim()) {
    throw new YouTubeError("Captions were found but appear to be empty.");
  }

  return transcript.replace(/\s+/g, " ").trim();
}

export async function ingestYouTubeUrl(url: string): Promise<{
  videoId: string;
  transcript: string;
}> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new YouTubeError("Enter a valid YouTube URL or 11-character video ID.");
  }

  const transcript = await fetchYouTubeTranscript(videoId);
  return { videoId, transcript };
}
