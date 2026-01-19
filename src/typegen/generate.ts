import fs from "fs/promises";
import {
  getDevDir,
  getResourcesDir,
  getTypesDir,
  TypesDirData,
} from "../utils/paths.js";
import { fsu } from "../utils/file-utils.js";
import path from "path";
import { isResourceGroupFolder } from "../utils/resource-utils.js";
import { loadConfig } from "../config/load-config.js";
import { AppConfig } from "../config/schema.js";
import { AppSpinner } from "../utils/spinner-utils.js";

type TSConfigData = {
  compilerOptions: {
    paths: { [key: string]: string[] };
  };
};

function typesDataToResource(
  typesData: TypesDirData,
  resource: string,
): TypesDirData {
  return {
    base: typesData.base,
    client: path.join(typesData.client, resource),
    server: path.join(typesData.server, resource),
    shared: path.join(typesData.shared, resource),
  };
}

async function updateTSConfig(
  file: string,
  type: "client" | "server",
  config: AppConfig,
  typeData: TypesDirData,
) {
  const data = await fsu.readJson<TSConfigData>(file);
  if (!data.compilerOptions) data.compilerOptions = { paths: {} };
  if (!data.compilerOptions.paths) data.compilerOptions.paths = {};

  data.compilerOptions.paths[`@${config.types.namespace}/shared/*`] = [
    `${path.relative(file, typeData.shared).replaceAll("\\", "/")}/*`,
  ];
  data.compilerOptions.paths[`@${config.types.namespace}/${type}/*`] = [
    `${path.relative(file, typeData[type]).replaceAll("\\", "/")}/*`,
  ];

  await fsu.writeJson(file, data);
}

async function scanGlobalsPartFolder(folder: string, typePath: string) {
  const entries = await fs.readdir(folder);
  await fsu.ensureDir(typePath);

  for (const file of entries) {
    const absPath = path.join(folder, file);
    if (await fsu.isDir(absPath)) {
      await scanGlobalsPartFolder(absPath, path.join(typePath, file));
      continue;
    }
    if (!file.endsWith(".ts")) continue;

    await fs.copyFile(absPath, path.join(typePath, file));
  }
}

async function scanResourceGlobalsFolder(
  folder: string,
  resourceTypeData: TypesDirData,
) {
  const clientFolder = path.join(folder, "client");
  const sharedFolder = path.join(folder, "shared");
  const serverFolder = path.join(folder, "server");

  if (await fsu.doesDirExist(clientFolder)) {
    await scanGlobalsPartFolder(clientFolder, resourceTypeData.client);
  }
  if (await fsu.doesDirExist(sharedFolder)) {
    await scanGlobalsPartFolder(sharedFolder, resourceTypeData.shared);
  }
  if (await fsu.doesDirExist(serverFolder)) {
    await scanGlobalsPartFolder(serverFolder, resourceTypeData.server);
  }
}

async function scanResourceFolder(
  folder: string,
  resourceTypeData: TypesDirData,
  typeData: TypesDirData,
  config: AppConfig,
) {
  const globalsPath = path.join(folder, "globals");

  const clientTSPath = path.join(folder, "src/client", "tsconfig.json");
  const serverTSPath = path.join(folder, "src/server", "tsconfig.json");

  if (await fsu.pathExists(clientTSPath)) {
    await updateTSConfig(clientTSPath, "client", config, typeData);
  }
  if (await fsu.pathExists(serverTSPath)) {
    await updateTSConfig(serverTSPath, "server", config, typeData);
  }

  if (!(await fsu.doesDirExist(globalsPath))) return null;

  await scanResourceGlobalsFolder(globalsPath, resourceTypeData);
}

async function scanResourceGroupFolder(
  folder: string,
  resources: string,
  rootDir: string,
  typesData: TypesDirData,
  config: AppConfig,
  spinner: AppSpinner,
) {
  const entries = await fs.readdir(folder);

  for (const file of entries) {
    const filePath = path.join(folder, file);
    if (!(await fsu.isDir(filePath))) continue;

    if (isResourceGroupFolder(file)) {
      // Scan deeper
      await scanResourceGroupFolder(
        filePath,
        resources,
        rootDir,
        typesData,
        config,
        spinner,
      );
    } else {
      // Possible resource
      const fxmanifestPath = path.join(filePath, "fxmanifest.lua");
      const packagePath = path.join(filePath, "package.json");

      // Check for fxmanifest.lua and package.json
      if (
        (await fsu.pathExists(fxmanifestPath)) &&
        (await fsu.pathExists(packagePath))
      ) {
        spinner.update(`Generating global types (${file})...`);
        await scanResourceFolder(
          filePath,
          typesDataToResource(typesData, file),
          typesData,
          config,
        );
      }
    }
  }
}

export async function getAllTypedResources() {
  const config = await loadConfig();
  const resourceDir = await getResourcesDir();
  const rootDir = await getDevDir();
  const typesDirData = await getTypesDir();

  await fsu.ensureDir(typesDirData.base);
  await fsu.emptyDir(typesDirData.base);

  const spinner = new AppSpinner("Generating global types...", true);

  await scanResourceGroupFolder(
    resourceDir,
    resourceDir,
    rootDir,
    typesDirData,
    config,
    spinner,
  );
  spinner.stop();
}
