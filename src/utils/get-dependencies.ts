import { isAbsolute, normalize, relative, resolve } from "path";

export type DependencyPathFormat = "repo-relative" | "absolute";

export interface GetDependenciesOptions {
  output?: DependencyPathFormat;
  projectRoot?: string;
}

function toAbsolutePath(pathLike: string, baseDir: string): string {
  return normalize(
    isAbsolute(pathLike) ? pathLike : resolve(baseDir, pathLike),
  );
}

function isInsideProjectRoot(pathLike: string, projectRoot: string): boolean {
  const relativePath = relative(projectRoot, pathLike);
  return (
    relativePath !== "" &&
    !relativePath.startsWith("..") &&
    !isAbsolute(relativePath)
  );
}

function hasNodeModulesSegment(pathLike: string): boolean {
  return pathLike.replace(/\\/g, "/").split("/").includes("node_modules");
}

function toRepoRelativePath(pathLike: string, projectRoot: string): string {
  return relative(projectRoot, pathLike).replace(/\\/g, "/");
}

function formatBuildLogs(logs: unknown[]): string {
  return logs
    .map((log) => String(log))
    .filter((line) => line.length > 0)
    .join("\n");
}

export async function getDependencies(
  filePath: string,
  options: GetDependenciesOptions = {},
): Promise<string[]> {
  const output = options.output ?? "repo-relative";
  const projectRoot = normalize(resolve(options.projectRoot ?? process.cwd()));
  const entryAbsolutePath = toAbsolutePath(filePath, projectRoot);

  const result = await Bun.build({
    entrypoints: [entryAbsolutePath],
    metafile: true,
    throw: false,
    target: "bun",
  });

  if (!result.success || !result.metafile) {
    const logs = formatBuildLogs(result.logs);
    const details = logs.length > 0 ? `\n${logs}` : "";
    throw new Error(
      `Failed to resolve dependencies for ${entryAbsolutePath}.${details}`,
    );
  }

  const entryFiles = new Set<string>([entryAbsolutePath]);

  for (const outputData of Object.values(result.metafile.outputs)) {
    if (outputData.entryPoint) {
      entryFiles.add(toAbsolutePath(outputData.entryPoint, projectRoot));
    }
  }

  const dependencies = new Set<string>();

  for (const inputPath of Object.keys(result.metafile.inputs)) {
    const absolutePath = toAbsolutePath(inputPath, projectRoot);

    if (entryFiles.has(absolutePath)) {
      continue;
    }

    if (!isInsideProjectRoot(absolutePath, projectRoot)) {
      continue;
    }

    if (hasNodeModulesSegment(absolutePath)) {
      continue;
    }

    dependencies.add(
      output === "absolute"
        ? absolutePath
        : toRepoRelativePath(absolutePath, projectRoot),
    );
  }

  return [...dependencies].sort((a, b) => a.localeCompare(b));
}
