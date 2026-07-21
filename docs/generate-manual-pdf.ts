/**
 * Converte docs/manual-utilizador.html em PDF via Chrome/Edge headless.
 * Pré-requisito: gerar o HTML primeiro (npx tsx docs/generate-manual-html.ts)
 * Executar: npx --yes tsx docs/generate-manual-pdf.ts
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, "manual-utilizador.html");
const pdfPath = join(__dirname, "Manual-Utilizador-Jindungo.pdf");

const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

function findBrowser(): string | null {
  return browserCandidates.find((candidate) => existsSync(candidate)) ?? null;
}

function main() {
  if (!existsSync(htmlPath)) {
    throw new Error(
      "Falta manual-utilizador.html. Corre primeiro: npx tsx docs/generate-manual-html.ts",
    );
  }

  const browser = findBrowser();
  if (!browser) {
    throw new Error(
      "Não foi encontrado Chrome nem Edge para gerar o PDF. Abre o HTML e imprime para PDF manualmente.",
    );
  }

  const result = spawnSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { encoding: "utf8" },
  );

  if (result.status !== 0 || !existsSync(pdfPath)) {
    throw new Error(
      result.stderr || result.stdout || "Falha ao gerar o PDF com o browser.",
    );
  }

  console.log(`PDF escrito em ${pdfPath}`);
}

main();
