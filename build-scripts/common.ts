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
      watch,
    }),
  ]);

  console.log(result);
}

async function copyLspServerBundle({ watch }: { watch: boolean }) {
  const src = require.resolve("knotta-lsp-server");
  const dest = path.resolve(root, "dist/knotta-lsp-server.js");

  await fs.copyFile(src, dest);
  console.log("Copied LSP server bundle.");
  if (watch) {
    chokidar.watch(src).on("change", async () => {
      await fs.copyFile(src, dest);
      console.log("Copied LSP server bundle.");
    });
  }
}