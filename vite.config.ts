import { defineConfig } from 'vite';
import banner from 'vite-plugin-banner';

import pkgInfo from './package.json';
import userscript from './userscript.json';

function generateBannerLine(
    param: string, 
    value: string | null, 
    padding: number = 17
) {
    if (value == null) return '';
    if (value.length == 0) return '';

    let line = `// @${param}`;
    let amount = padding - line.length;
    if (amount <= 0) amount = 2;
    line += ' '.repeat(amount);
    line += value + "\n";
    return line;
}

function generateBanner() {
    let banner = "";
    banner += "// ==UserScript==\n";

    banner += generateBannerLine("name", userscript.name != null ? userscript.name : pkgInfo.name);

    banner += generateBannerLine("namespace", userscript.namespace);

    banner += generateBannerLine("version", userscript.version != null ? userscript.version : pkgInfo.version);

    banner += generateBannerLine("description", userscript.description != null ? userscript.description : pkgInfo.description);

    for (let grant of userscript.grants) {
        banner += generateBannerLine("grant", grant);
    }

    banner += generateBannerLine("author", userscript.author ? userscript.author : pkgInfo.author);

    for (let require of userscript.requires) {
        banner += generateBannerLine("require", require);
    }

    for (let match of userscript.matches) {
        banner += generateBannerLine("match", match);
    }

    for (let connect of userscript.connects) {
        banner += generateBannerLine("connect", connect);
    }

    for (let note of userscript.notes) {
        banner += generateBannerLine("note", note);
    }

    banner += "// ==/UserScript==";
    return banner;
}

export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 30328,
        open: "/dist/mangaldr.user.js"
    },
    build: {
        outDir: "dist",
        rollupOptions: {
            input: "src/main.ts",
            output: {
                entryFileNames: "mangaldr.user.js",
                format: "iife",
                name: "UserScript",
                sourcemap: true,
            }
        }
    },
    plugins: [
        banner((fileName: string) => {
            return generateBanner();
        })
    ]
})
