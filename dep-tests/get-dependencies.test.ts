import { describe, expect, test } from "bun:test";
import { resolve } from "path";
import { getDependencies } from "../get-dependencies";

const projectRoot = process.cwd();

async function expectScenarioDependencies(
  scenarioName: string,
  expectedRelativePaths: string[],
) {
  const entryPath = `dep-tests/${scenarioName}/entry.ts`;
  const dependencies = await getDependencies(entryPath, {
    output: "repo-relative",
    projectRoot,
  });

  expect(dependencies).toEqual([...expectedRelativePaths].sort());
  expect(new Set(dependencies).size).toBe(dependencies.length);
  expect(
    dependencies.some((dependency) => dependency.includes("node_modules")),
  ).toBe(false);
}

describe("getDependencies", () => {
  test("handles a transitive diamond graph with package imports", async () => {
    await expectScenarioDependencies("diamond-transitive", [
      "dep-tests/diamond-transitive/routes/a.ts",
      "dep-tests/diamond-transitive/routes/b.ts",
      "dep-tests/diamond-transitive/routes/deep/a-deep.ts",
      "dep-tests/diamond-transitive/routes/deep/b-deep.ts",
      "dep-tests/diamond-transitive/shared/core.ts",
      "dep-tests/diamond-transitive/shared/leaf.ts",
      "dep-tests/diamond-transitive/utils/format.ts",
    ]);
  });

  test("includes dynamic imports and barrel re-exports", async () => {
    await expectScenarioDependencies("dynamic-barrel-chain", [
      "dep-tests/dynamic-barrel-chain/barrel/index.ts",
      "dep-tests/dynamic-barrel-chain/barrel/layer1.ts",
      "dep-tests/dynamic-barrel-chain/barrel/layer2/helper.ts",
      "dep-tests/dynamic-barrel-chain/barrel/shared/token.ts",
      "dep-tests/dynamic-barrel-chain/dynamic/module.ts",
    ]);
  });

  test("supports circular dependency graphs", async () => {
    await expectScenarioDependencies("circular-graph", [
      "dep-tests/circular-graph/a.ts",
      "dep-tests/circular-graph/b.ts",
      "dep-tests/circular-graph/c.ts",
    ]);
  });

  test("supports mixed loaders and module formats", async () => {
    await expectScenarioDependencies("mixed-loaders", [
      "dep-tests/mixed-loaders/component.tsx",
      "dep-tests/mixed-loaders/data.json",
      "dep-tests/mixed-loaders/esm-wrapper.mjs",
      "dep-tests/mixed-loaders/legacy.cjs",
      "dep-tests/mixed-loaders/nested/info.json",
      "dep-tests/mixed-loaders/shared.ts",
    ]);
  });

  test("deduplicates dependencies across index resolution paths", async () => {
    await expectScenarioDependencies("index-resolution-and-duplicates", [
      "dep-tests/index-resolution-and-duplicates/pkg/index.ts",
      "dep-tests/index-resolution-and-duplicates/pkg/shared.ts",
      "dep-tests/index-resolution-and-duplicates/pkg/utils/index.ts",
      "dep-tests/index-resolution-and-duplicates/side-effects/index.ts",
      "dep-tests/index-resolution-and-duplicates/side-effects/logger.ts",
    ]);
  });

  test("can return absolute dependency paths", async () => {
    const scenarioName = "diamond-transitive";
    const entryPath = `dep-tests/${scenarioName}/entry.ts`;
    const expectedAbsolutePaths = [
      "dep-tests/diamond-transitive/routes/a.ts",
      "dep-tests/diamond-transitive/routes/b.ts",
      "dep-tests/diamond-transitive/routes/deep/a-deep.ts",
      "dep-tests/diamond-transitive/routes/deep/b-deep.ts",
      "dep-tests/diamond-transitive/shared/core.ts",
      "dep-tests/diamond-transitive/shared/leaf.ts",
      "dep-tests/diamond-transitive/utils/format.ts",
    ]
      .map((pathLike) => resolve(projectRoot, pathLike))
      .sort();

    const dependencies = await getDependencies(entryPath, {
      output: "absolute",
      projectRoot,
    });

    expect(dependencies).toEqual(expectedAbsolutePaths);
  });
});
