import * as esbuild from "esbuild";
import { join } from "path";
// import fs from "node:fs"
// import path from "node:path"

const DEST_DIR = "./a220-acars/PackageSources/Copys/a220-acars/files";

// const msfsJsx = {
//   name: 'special-jsx',

//   setup(build) {
//     build.onLoad({ filter: /\.msfs\.jsx$/ }, async (args) => {
//       const source = await fs.promises.readFile(args.path, 'utf8')

//       const result = await esbuild.transform(source, {
//         loader: 'jsx',
//         jsxFactory: 'msfs.buildComponent',
//         jsxFragment: 'msfs.Fragment',
//         sourcefile: args.path,
//       })

//       return {
//         contents: result.code,
//         loader: 'js',
//         resolveDir: path.dirname(args.path),
//       }
//     })
//   },
// }


const ctx = await esbuild.context({
  entryPoints: ["src/index.mjs"],
  bundle: true,
  minify: false,
  sourcemap: false,
  banner: {
    js: `
const jsx = {};
const reactUtils = {}
const ui = {};
const msfs = {};
let readyCallbacks = [];
window.acarsLoad = (opt) => {
if(opt.jsx) {
for (const key in opt.jsx)
  jsx[key] = opt.jsx[key];
}
if(opt.msfs) {
for (const key in opt.msfs)
  msfs[key] = opt.msfs[key];
}
if(opt.utils) {
for (const key in opt.utils)
  reactUtils[key] = opt.utils[key];
}
if(opt.ui){
for (const key in opt.ui)
  ui[key] = opt.ui[key];
}
if(ui.DropdownSelect && ui.DropdownMenu) {
const ds = ui.DropdownSelect;
const dm = ui.DropdownMenu;
ui.DropdownSelect = dm;
ui.DropdownMenu = ds;
}

  readyCallbacks.forEach(e => e());
  readyCallbacks = [];
}
function require(m) {
  const MODS = {
   "react/jsx-runtime":jsx,
  }
 if(MODS[m])
   return MODS[m];
  throw new Error(\`Unknown module \${m}\`);
}
    `
  },
  // plugins: [msfsJsx],
  target: ["es2020"],
  format: "iife",
  jsx: "automatic",
  jsxFactory: "acarsImports.buildComponent",
  jsxFragment: "jsx.Fragment",
  outfile: join(DEST_DIR, "plugin.js"),
  external: [
    "react/jsx-runtime"
  ],
});
await ctx.watch();