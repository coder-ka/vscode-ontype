import fs from "fs/promises";
import path from "path";
import * as esbuild from "esbuild";
import chokidar from "chokidar";

const root = `${__dirname}/../`;

export async function build({ watch }: { watch: boolean }) {
  const [_, result] = await Promise.all([
    copyLspServerBundle({ watch }),
    esbuild.build({
      entryPoints: [path.resolve(root, "src/main.ts")],
      bundle: true,
      platform: "node",
      external: ["vscode"],
      outfile: path.resolve(root, "dist/index.js"),
      watch: watch
        ? {
            onRebuild: onBuildEnd,
          }
        : undefined,
    }),
  ]);

  onBuildEnd(null, result);
}

function onBuildEnd(
  error: esbuild.BuildFailure | null,
  result: esbuild.BuildResult | null
) {
  if (error) {
    // console.error("Build failed:", error);
  } else if (result) {
    // for (const error of result.errors) {
    //   console.warn("Error:", error);
    // }
    // for (const warning of result.warnings) {
    //   console.warn("Warning:", warning);
    // }

    if (result.errors.length === 0) {
      console.log("Build succeeded.");
    }
  }
}

async function copyLspServerBundle({ watch }: { watch: boolean }) {
  const src = require.resolve("ontype-lsp-server");
  const dest = path.resolve(root, "dist/ontype-lsp-server.js");

  await fs.copyFile(src, dest);
  console.log("Copied LSP server bundle.");
  if (watch) {
    chokidar.watch(src).on("change", async () => {
      await fs.copyFile(src, dest);
      console.log("Copied LSP server bundle.");
    });
  }
}
