// Gera assets/tailwind-<grupo>.css a partir de groups.json (a config de cada
// grupo é a que as páginas tinham inline no <script> tailwind.config do CDN).
const path = require("path");
const fs = require("fs");
const postcss = require("postcss");
const tailwind = require("tailwindcss");
const cssnano = require("cssnano");
const root = path.resolve(__dirname, "../..");
const groups = require("./groups.json");
const SAFELIST = [
  "hidden", "flex", "overflow-hidden", "translate-y-full",
  "text-gray-400", "text-[#E8872A]", "border-b-2", "border-[#E8872A]",
  "text-on-surface-variant", "text-on-primary-container",
  "bg-surface-container-highest", "bg-primary-container",
];
(async () => {
  for (const [name, g] of Object.entries(groups)) {
    const plugins = [];
    if (g.plugins) {
      plugins.push(require("@tailwindcss/forms"), require("@tailwindcss/container-queries"));
    }
    const config = {
      darkMode: g.darkMode,
      content: [...g.files.map((f) => path.join(root, f)), path.join(root, "assets/*.js")],
      safelist: SAFELIST,
      theme: { extend: g.theme.extend },
      plugins,
    };
    const input = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";
    const res = await postcss([tailwind(config), cssnano({ preset: "default" })]).process(input, { from: undefined });
    const out = path.join(root, "assets", `tailwind-${name}.css`);
    fs.writeFileSync(out, res.css);
    console.log(name, g.files.length, "páginas", res.css.length, "bytes (minificado)");
  }
})();
