import path from "path";
import { fsu } from "../utils/file-utils.js";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { getTemplatesDir } from "../utils/paths.js";
import { loadTemplateState } from "./state.js";

export type TemplateType = "basic" | "nui" | "loading-screen";

export const ARTIFACT_TEMPLATE_ZIP: Record<TemplateType, string> = {
  basic: "ts-basic-resource.zip",
  nui: "ts-nui-resource.zip",
  "loading-screen": "ts-loading-screen-resource.zip",
};

export const AvailableTemplates = Object.keys(ARTIFACT_TEMPLATE_ZIP);

const REPO_DATA = {
  owner: "blm456",
  repo: "fivem-typescript-templates",
};

const API_USER_AGENT = "latest-release-zip-downloader";

interface ReleaseResponseData {
  tag_name: string;
  name: string;
  assets: Array<{
    id: number;
    name: string;
    url: string;
    browser_download_url: string;
    size: number;
  }>;
}

export async function getTemplateList() {
  const templatePath = await getTemplatesDir();
  fsu.ensureDir(templatePath);

  const templateList: {
    name: TemplateType;
    path: string;
  }[] = [];

  for (const type of AvailableTemplates) {
    const tPath = path.join(
      templatePath,
      ARTIFACT_TEMPLATE_ZIP[type as TemplateType],
    );
    if (await fsu.pathExists(tPath)) {
      templateList.push({ name: type as TemplateType, path: tPath });
    }
  }

  return templateList;
}

export async function getTemplateVersion() {
  const state = await loadTemplateState();

  return state.installed?.tag_name ?? "none";
}

export async function fetchLatestTemplateArtifact() {
  // Get latest release
  const latestReleaseUrl = `https://api.github.com/repos/${REPO_DATA.owner}/${REPO_DATA.repo}/releases/latest`;
  const releaseRes = await fetch(latestReleaseUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": API_USER_AGENT,
    },
  });

  if (!releaseRes.ok)
    throw new Error(
      `Failed to get latest release: ${releaseRes.status} ${releaseRes.statusText}`,
    );

  const release = (await releaseRes.json()) as ReleaseResponseData;

  for (const k of ["tag_name", "name"]) {
    if (typeof (release as any)[k] !== "string") {
      throw new Error(
        `Template artifact response missing "${k}" from ${latestReleaseUrl}`,
      );
    }
  }

  return release;
}

export async function downloadLatestReleaseZip({
  assetNames = ["basic", "loading-screen", "nui"],
  outputDir,
  releaseData,
}: {
  assetNames?: TemplateType[];
  outputDir: string;
  releaseData: ReleaseResponseData;
}) {
  await fsu.ensureDir(outputDir);

  const assetsSelected = assetNames?.map((a) => ARTIFACT_TEMPLATE_ZIP[a]) ?? [];

  // Select assets
  const zipAssets = releaseData.assets.filter((a) =>
    a.name.toLowerCase().endsWith(".zip"),
  );

  const selected = assetNames?.length
    ? zipAssets.filter((a) => assetsSelected.includes(a.name))
    : zipAssets;

  if (selected.length === 0)
    throw new Error(`No matching ZIP files in release`);

  // Download each asset
  for (const asset of selected) {
    const outPath = path.join(outputDir, asset.name);

    const assetRes = await fetch(asset.url, {
      headers: {
        Accept: "application/octet-stream",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": API_USER_AGENT,
      },
      redirect: "follow",
    });

    if (!assetRes.ok || !assetRes.body)
      throw new Error(
        `Failed downloading ${asset.name}: ${assetRes.status} ${assetRes.statusText}`,
      );

    await pipeline(assetRes.body as any, createWriteStream(outPath));
  }

  return {
    latestTag: releaseData.tag_name,
    releaseName: releaseData.name,
    downloaded: selected.map((a) => {
      return { path: path.join(outputDir, a.name), filename: a.name };
    }),
  };
}
