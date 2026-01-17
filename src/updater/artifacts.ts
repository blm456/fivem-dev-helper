export type ReleaseTier = "critical" | "recommended" | "optional" | "latest";
export type ArtifactPlatform = "windows" | "linux";

export interface ChangelogVersionResponse {
  critical: string;
  recommended: string;
  optional: string;
  latest: string;

  critical_download: string;
  recommended_download: string;
  optional_download: string;
  latest_download: string;
}

export interface LatestArtifact {
  platform: ArtifactPlatform;
  tier: ReleaseTier;
  version: string;
  url: string;
  filename: string;
}

const CHANGELOG_URLS: Record<ArtifactPlatform, string> = {
  windows:
    "https://changelogs-live.fivem.net/api/changelog/versions/win32/server",
  linux:
    "https://changelogs-live.fivem.net/api/changelog/versions/linux/server",
};

function expectedFilename(platform: ArtifactPlatform): string {
  return platform === "windows" ? "server.zip" : "fx.tar.xz";
}

function pickDownloadUrl(
  json: ChangelogVersionResponse,
  tier: ReleaseTier,
): string {
  switch (tier) {
    case "critical":
      return json.critical_download;
    case "recommended":
      return json.recommended_download;
    case "latest":
      return json.latest_download;
    case "optional":
      return json.optional_download;
  }
}

function pickVersion(json: ChangelogVersionResponse, tier: ReleaseTier) {
  switch (tier) {
    case "critical":
      return json.critical;
    case "latest":
      return json.latest;
    case "optional":
      return json.optional;
    case "recommended":
      return json.recommended;
  }
}

export async function fetchLatestArtifact(
  platform: ArtifactPlatform,
  tier: ReleaseTier,
): Promise<LatestArtifact> {
  const endpoint = CHANGELOG_URLS[platform];
  const res = await fetch(endpoint, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch changelog versions: ${endpoint} (${res.status})`,
    );
  }

  const json = (await res.json()) as ChangelogVersionResponse;

  // minimal validation
  for (const k of [
    "critical",
    "recommended",
    "optional",
    "latest",
    "critical_download",
    "optional_download",
    "latest_download",
  ] as const) {
    if (typeof (json as any)[k] !== "string") {
      throw new Error(`Changelog response missing "${k}" from ${endpoint}`);
    }
  }

  const url = pickDownloadUrl(json, tier);
  const version = pickVersion(json, tier);

  return { platform, tier, version, url, filename: expectedFilename(platform) };
}
