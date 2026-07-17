import { release } from "node:os";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function isWorkersRuntimeSupported(): boolean {
  if (process.env.SKIP_CLOUDFLARE_DEV === "1") {
    return false;
  }

  if (process.platform !== "darwin") {
    return true;
  }

  const [major = "0", minor = "0"] = release().split(".");
  const darwinMajor = Number.parseInt(major, 10);
  const darwinMinor = Number.parseInt(minor, 10);

  if (darwinMajor < 22) {
    return false;
  }

  return darwinMajor > 22 || darwinMinor >= 6;
}

export async function getCloudflareEnv(): Promise<Partial<CloudflareEnv>> {
  if (!isWorkersRuntimeSupported()) {
    return {};
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    return env;
  } catch (error) {
    console.warn("Cloudflare bindings unavailable in this environment.", error);
    return {};
  }
}
