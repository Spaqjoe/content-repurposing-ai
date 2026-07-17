const DEFAULT_D1_DATABASE_ID = "fe04c2b8-12ef-4fef-8ea2-c95c8cf228c6";

interface D1QueryResponse<T> {
  success: boolean;
  result?: Array<{
    results?: T[];
    success: boolean;
  }>;
  errors?: Array<{ message: string }>;
}

function getRemoteD1Config() {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? process.env.CF_ACCOUNT_ID ?? "",
    apiToken: process.env.CLOUDFLARE_API_TOKEN ?? "",
    databaseId: process.env.D1_DATABASE_ID ?? DEFAULT_D1_DATABASE_ID,
  };
}

export function isRemoteD1Available(): boolean {
  const { accountId, apiToken } = getRemoteD1Config();
  return Boolean(accountId && apiToken);
}

export async function executeRemoteD1<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { accountId, apiToken, databaseId } = getRemoteD1Config();

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  const data = (await response.json()) as D1QueryResponse<T>;

  if (!response.ok || !data.success) {
    const message =
      data.errors?.[0]?.message ??
      `Remote D1 request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data.result?.[0]?.results ?? [];
}
