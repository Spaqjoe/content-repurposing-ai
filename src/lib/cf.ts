import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getCloudflareEnv(): Promise<Partial<CloudflareEnv>> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env;
  } catch (error) {
    console.warn("Cloudflare bindings unavailable in this environment.", error);
    return {};
  }
}
