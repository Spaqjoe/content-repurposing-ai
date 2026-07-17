import { release } from "node:os";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

function isWorkersRuntimeSupported(): boolean {
  if (process.env.SKIP_CLOUDFLARE_DEV === "1") {
    return false;
  }

  if (process.platform !== "darwin") {
    return true;
  }

  // workerd requires macOS 13.5+ (Darwin 22.6+).
  const [major = "0", minor = "0"] = release().split(".");
  const darwinMajor = Number.parseInt(major, 10);
  const darwinMinor = Number.parseInt(minor, 10);

  if (darwinMajor < 22) {
    return false;
  }

  return darwinMajor > 22 || darwinMinor >= 6;
}

if (process.env.NODE_ENV === "development" && isWorkersRuntimeSupported()) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");

  void initOpenNextCloudflareForDev().catch((error: unknown) => {
    console.warn(
      "Skipping Cloudflare dev bindings. Workers runtime unavailable locally.",
      error,
    );
  });
} else if (process.env.NODE_ENV === "development") {
  console.warn(
    "Skipping Cloudflare dev bindings. Workers runtime unavailable on this machine.",
  );
}
