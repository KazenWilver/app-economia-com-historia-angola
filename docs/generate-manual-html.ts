/**
 * Gera docs/manual-utilizador.html a partir de shared/guide.
 * Executar: npx --yes tsx docs/generate-manual-html.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  USER_GUIDE_META,
  USER_GUIDE_SECTIONS,
} from "../shared/guide/user-guide.ts";
import {
  PROJECT_ABOUT,
  TEAM_CREDIT_LINE,
  TEAM_MEMBERS,
} from "../shared/guide/team.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "manual-utilizador.html");

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const sectionsHtml = USER_GUIDE_SECTIONS.map((section, sectionIndex) => {
  const can = section.canDo
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const cannot = section.cannotDo
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const steps = section.steps
    .map(
      (step, stepIndex) => `
        <li class="step">
          <span class="step-num">${stepIndex + 1}</span>
          <div>
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.body)}</p>
          </div>
        </li>`,
    )
    .join("");

  const images =
    section.images && section.images.length > 0
      ? `
      <div class="screens">
        <h3 class="howto">Vê o ecrã</h3>
        ${section.images
          .map(
            (image) => `
        <figure class="shot">
          <img src="manual-images/${escapeHtml(image.file)}" alt="${escapeHtml(image.alt)}" />
          <figcaption>${escapeHtml(image.caption)}</figcaption>
        </figure>`,
          )
          .join("")}
      </div>`
      : "";

  return `
    <section class="chapter" id="${escapeHtml(section.id)}">
      <div class="chapter-index">${String(sectionIndex + 1).padStart(2, "0")}</div>
      <h2>${escapeHtml(section.title)}</h2>
      <p class="summary">${escapeHtml(section.summary)}</p>
      <div class="purpose">
        <strong>Para que serve</strong>
        <p>${escapeHtml(section.purpose)}</p>
      </div>
      <div class="grid-2">
        <div class="can">
          <strong>O que podes fazer</strong>
          <ul>${can}</ul>
        </div>
        <div class="cannot">
          <strong>O que não podes fazer</strong>
          <ul>${cannot}</ul>
        </div>
      </div>
      <h3 class="howto">Como fazer</h3>
      <ol class="steps">${steps}</ol>
      ${images}
    </section>`;
}).join("\n");

const teamHtml = TEAM_MEMBERS.map(
  (member) => `
    <article class="member">
      <h3>${escapeHtml(member.name)}</h3>
      <p class="role">${escapeHtml(member.role)}</p>
      <p>${escapeHtml(member.focus)}</p>
      ${member.email ? `<p class="email">${escapeHtml(member.email)}</p>` : ""}
    </article>`,
).join("");

const toc = [
  `<li><a href="#sobre-nos">Sobre nós — a equipa</a></li>`,
  ...USER_GUIDE_SECTIONS.map(
    (section) =>
      `<li><a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a></li>`,
  ),
].join("");

const html = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(USER_GUIDE_META.title)} — ${escapeHtml(USER_GUIDE_META.product)}</title>
  <style>
    :root {
      --bordeaux: #7A1F2B;
      --petrol: #1F4E5F;
      --gold: #C9A227;
      --ink: #1A1A1A;
      --muted: #5C5C5C;
      --paper: #FBF8F4;
      --card: #FFFFFF;
      --line: #E6DED3;
      --ok: #065F46;
      --ok-bg: #ECFDF5;
      --no: #9F1239;
      --no-bg: #FFF1F2;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: var(--ink);
      background:
        radial-gradient(1200px 500px at 10% -10%, rgba(122, 31, 43, 0.08), transparent 60%),
        radial-gradient(900px 400px at 100% 0%, rgba(201, 162, 39, 0.12), transparent 55%),
        var(--paper);
      line-height: 1.55;
    }
    .page { max-width: 920px; margin: 0 auto; padding: 48px 28px 80px; }
    .cover {
      position: relative; overflow: hidden; border-radius: 28px; padding: 48px 40px; color: #fff;
      background: linear-gradient(135deg, var(--bordeaux) 0%, #5a1620 45%, var(--petrol) 100%);
      box-shadow: 0 24px 60px rgba(122, 31, 43, 0.28); margin-bottom: 36px;
    }
    .eyebrow { display: inline-block; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; color: var(--gold); margin-bottom: 14px; }
    .cover h1 { margin: 0 0 12px; font-size: clamp(2rem, 4vw, 2.75rem); line-height: 1.15; max-width: 18ch; }
    .cover .product { font-size: 1.1rem; opacity: 0.95; margin: 0 0 14px; }
    .cover .intro { max-width: 64ch; opacity: 0.9; margin: 0 0 18px; }
    .cover .meta { font-size: 0.85rem; opacity: 0.8; margin: 0 0 6px; }
    .toc, .chapter, .about {
      background: var(--card); border: 1px solid var(--line); border-radius: 20px;
      padding: 28px 30px; margin-bottom: 22px; page-break-inside: avoid;
    }
    .toc h2, .about h2 { margin: 0 0 14px; font-size: 1.25rem; color: var(--bordeaux); }
    .toc ol { margin: 0; padding-left: 1.2rem; }
    @media (min-width: 720px) { .toc ol { columns: 2; column-gap: 28px; } }
    .toc a { color: var(--petrol); text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .toc li { margin: 0.35rem 0; break-inside: avoid; }
    .chapter-index { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; color: var(--gold); margin-bottom: 8px; }
    .chapter h2 { margin: 0 0 8px; font-size: 1.3rem; color: var(--bordeaux); }
    .summary { margin: 0 0 14px; color: var(--muted); }
    .purpose { background: #EEF7F8; border: 1px solid #C5DEE3; border-radius: 14px; padding: 14px 16px; margin-bottom: 14px; }
    .purpose p { margin: 6px 0 0; color: var(--muted); }
    .grid-2 { display: grid; gap: 12px; margin-bottom: 16px; }
    @media (min-width: 720px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
    .can, .cannot { border-radius: 14px; padding: 14px 16px; }
    .can { background: var(--ok-bg); border: 1px solid #A7F3D0; color: var(--ok); }
    .cannot { background: var(--no-bg); border: 1px solid #FECDD3; color: var(--no); }
    .can ul, .cannot ul { margin: 8px 0 0; padding-left: 1.1rem; }
    .can li, .cannot li { margin: 0.25rem 0; color: inherit; }
    .howto { margin: 0 0 10px; font-size: 0.95rem; color: var(--petrol); }
    .steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    .step { display: grid; grid-template-columns: 32px 1fr; gap: 12px; }
    .step-num {
      width: 28px; height: 28px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
      background: rgba(201, 162, 39, 0.18); color: #8a6d12; font-size: 0.8rem; font-weight: 800;
    }
    .step h3 { margin: 0 0 4px; font-size: 1rem; }
    .step p { margin: 0; color: var(--muted); font-size: 0.95rem; }
    .screens { margin-top: 18px; }
    .shot {
      margin: 0 0 18px;
      padding: 0;
      background: transparent;
      border: none;
    }
    .shot img {
      display: block;
      width: 100%;
      max-width: 860px;
      height: auto;
      margin: 0 auto;
      border-radius: 8px;
    }
    .shot figcaption {
      margin-top: 8px;
      font-size: 0.92rem;
      color: var(--muted);
      text-align: center;
      max-width: 70ch;
      margin-left: auto;
      margin-right: auto;
    }
    .members { display: grid; gap: 12px; }
    @media (min-width: 720px) { .members { grid-template-columns: 1fr 1fr; } }
    .member { border: 1px solid var(--line); border-radius: 16px; padding: 16px; }
    .member h3 { margin: 0 0 4px; color: var(--bordeaux); }
    .role { font-weight: 700; margin: 0 0 8px; }
    .email { font-size: 0.85rem; color: var(--petrol); }
    .footer-note { margin-top: 36px; text-align: center; color: var(--muted); font-size: 0.85rem; }
    @media print {
      body { background: #fff; }
      .page { padding: 0; max-width: none; }
      .cover { box-shadow: none; border-radius: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a { color: inherit; text-decoration: none; }
      .can, .cannot, .purpose { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .shot img { max-width: 100%; page-break-inside: avoid; }
      .shot { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="cover">
      <div class="eyebrow">${escapeHtml(USER_GUIDE_META.codename)} · Manual v${escapeHtml(USER_GUIDE_META.version)}</div>
      <h1>${escapeHtml(USER_GUIDE_META.title)}</h1>
      <p class="product">${escapeHtml(USER_GUIDE_META.product)}</p>
      <p class="intro">${escapeHtml(USER_GUIDE_META.intro)}</p>
      <p class="meta">${escapeHtml(USER_GUIDE_META.institution)}</p>
      <p class="meta">${escapeHtml(TEAM_CREDIT_LINE)}</p>
    </header>

    <nav class="toc" aria-label="Índice">
      <h2>Índice</h2>
      <ol>${toc}</ol>
    </nav>

    <section class="about" id="sobre-nos">
      <h2>Sobre nós — ${escapeHtml(PROJECT_ABOUT.group)}</h2>
      <p>${escapeHtml(PROJECT_ABOUT.tagline)}</p>
      <p><strong>Missão:</strong> ${escapeHtml(PROJECT_ABOUT.mission)}</p>
      <p><strong>Instituição:</strong> ${escapeHtml(PROJECT_ABOUT.institution)}</p>
      <p><strong>Unidade curricular:</strong> ${escapeHtml(PROJECT_ABOUT.course)} · ${escapeHtml(PROJECT_ABOUT.academicYear)}</p>
      <p><strong>Stack:</strong> ${escapeHtml(PROJECT_ABOUT.stack)}</p>
      <h3 style="margin-top:20px;color:var(--petrol)">A equipa</h3>
      <div class="members">${teamHtml}</div>
    </section>

    ${sectionsHtml}

    <p class="footer-note">
      ${escapeHtml(TEAM_CREDIT_LINE)} · Web: /ajuda e /sobre-nos · Admin: /admin/ajuda e /admin/sobre-nos · Mobile: Ajuda e Sobre nós
    </p>
  </main>
</body>
</html>
`;

mkdirSync(__dirname, { recursive: true });
writeFileSync(outPath, html, "utf8");
console.log(`Manual HTML escrito em ${outPath}`);
