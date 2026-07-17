interface CloudflareRestCredentials {
  accountId: string;
  apiToken: string;
}

interface CloudflareApiResponse<T> {
  success: boolean;
  result?: T;
  errors?: Array<{ message?: string }>;
}

export class WorkersAiRestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkersAiRestError";
  }
}

export function getCloudflareRestCredentials(): CloudflareRestCredentials | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!accountId || !apiToken) {
    return null;
  }

  return { accountId, apiToken };
}

function buildRunUrl(accountId: string, model: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
}

async function parseCloudflareResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as CloudflareApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message =
      payload.errors?.map((error) => error.message).filter(Boolean).join("; ") ||
      `Cloudflare Workers AI request failed (${response.status}).`;
    throw new WorkersAiRestError(message);
  }

  if (payload.result === undefined) {
    throw new WorkersAiRestError("Cloudflare Workers AI returned an empty result.");
  }

  return payload.result;
}

export async function runWorkersAiRest<TInput extends Record<string, unknown>, TResult>(
  model: string,
  input: TInput,
): Promise<TResult> {
  const credentials = getCloudflareRestCredentials();
  if (!credentials) {
    throw new WorkersAiRestError(
      "Cloudflare Workers AI is unavailable. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local.",
    );
  }

  const response = await fetch(buildRunUrl(credentials.accountId, model), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return parseCloudflareResponse<TResult>(response);
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  if (typeof btoa === "function") {
    return btoa(binary);
  }

  return Buffer.from(bytes).toString("base64");
}
