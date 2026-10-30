// Remotion CLI（Studio / 渲染导出）打包配置：与 vite.config.ts 的 @proj/@demos 策略保持一致。
// 未链接成片工程时自动落到 proj-stub 降级实现；symlinks:false 让符号链接按
// 虚拟路径解析，裸导入落回本工程 node_modules（避免 react/remotion 双实例）。
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";

const proj = path.resolve(
  process.cwd(),
  existsSync(path.resolve(process.cwd(), "proj", "workbench.ts")) ? "proj" : "proj-stub",
);
// demosrc is a committed symlink; without symlink support (Windows core.symlinks=false) it is a plain file →
// use the junction .demosrc that gen-index.mjs creates (keeps resolution under workbench/), else ../demos
const demos = (() => {
  for (const d of ["demosrc", ".demosrc"]) {
    const p = path.resolve(process.cwd(), d);
    try { if (statSync(p).isDirectory()) return p; } catch { /* missing */ }
  }
  return path.resolve(process.cwd(), "..", "demos");
})();

Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: {
    ...c.resolve,
    symlinks: false,
    alias: {
      ...(c.resolve?.alias ?? {}),
      "@proj": proj,
      "@demos": demos,
    },
  },
}));

// 与 template/remotion.config.ts 同口径：jpeg 帧、ANGLE GL（three/WebGL 镜头要它）、并发 4
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(4);
