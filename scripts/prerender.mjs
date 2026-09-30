/**
 * Post-build step: renders the React app to static HTML and writes it into
 * dist/index.html, then adds the head tags that need build-time values
 * (canonical URL, social image, structured data, font preloads) plus
 * robots.txt and sitemap.xml.
 *
 * Runs after `vite build` and `vite build --ssr` (see the "build" npm script).
 */
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";

const root = process.cwd();
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
// Empty prefix: this script runs in a trusted Node build context (never shipped to the
// client), so it can read the whole .env file, not just VITE_-prefixed client-safe vars.
const env = { ...loadEnv("production", root, ""), ...process.env };

/** Same rule as src/config/env.ts: only absolute http(s) URLs are accepted. */
function httpUrl(value) {
  if (!value || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : undefined;
  } catch {
    return undefined;
  }
}

const renderHost = env.RENDER_EXTERNAL_URL; // Render sets this automatically for web services
const siteOrigin = (httpUrl(env.SITE_URL) ?? httpUrl(renderHost))?.origin;

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// 1. Render the app.
const { render } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const appHtml = render();
if (!appHtml.includes("<h1")) throw new Error("Prerender produced no <h1>; the app did not render.");

// 2. Head tags that depend on build-time values.
const head = [];
if (siteOrigin) {
  head.push(`<link rel="canonical" href="${escapeAttr(siteOrigin)}/" />`);
  head.push(`<meta property="og:url" content="${escapeAttr(siteOrigin)}/" />`);
  head.push(`<meta property="og:image" content="${escapeAttr(siteOrigin)}/og-image.png" />`);
  head.push(`<meta property="og:image:width" content="1200" />`);
  head.push(`<meta property="og:image:height" content="630" />`);
  head.push(
    `<meta property="og:image:alt" content="SnapClass: take attendance from a single class photo." />`,
  );
  head.push(`<meta name="twitter:image" content="${escapeAttr(siteOrigin)}/og-image.png" />`);
} else {
  console.warn(
    "[prerender] SITE_URL is not set: skipping canonical URL, social image and sitemap. See README > Environment variables.",
  );
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SnapClass",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "Attendance for teachers and students. SnapClass matches faces in class photos and students' voices, then lets the teacher review and confirm the report.",
  ...(siteOrigin ? { url: `${siteOrigin}/app` } : {}),
  author: { "@type": "Person", name: "Shreekanth A Guttedar" },
};
head.push(
  `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`,
);

// 3. Preload the two above-the-fold font files (hashed names, so look them up).
const assets = await readdir(path.join(dist, "assets"));
for (const pattern of [/^fraunces-latin-opsz-normal-.*\.woff2$/, /^hanken-grotesk-latin-wght-normal-.*\.woff2$/]) {
  const file = assets.find((name) => pattern.test(name));
  if (file) head.push(`<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />`);
}

// 4. Write index.html.
const indexPath = path.join(dist, "index.html");
const template = await readFile(indexPath, "utf8");
if (!template.includes("<!--app-html-->") || !template.includes("<!--seo-head-->")) {
  throw new Error("index.html is missing the <!--app-html--> or <!--seo-head--> placeholder.");
}
await writeFile(
  indexPath,
  template.replace("<!--app-html-->", () => appHtml).replace("<!--seo-head-->", () => head.join("\n    ")),
);

// 5. robots.txt and sitemap.xml. The app itself is behind sign-in and has no SEO value,
// so only the marketing page is listed/crawlable.
const robots = [
  "User-agent: *",
  "Allow: /$",
  "Disallow: /app",
  "Disallow: /login",
  "Disallow: /register",
  ...(siteOrigin ? ["", `Sitemap: ${siteOrigin}/sitemap.xml`] : []),
].join("\n");
await writeFile(path.join(dist, "robots.txt"), `${robots}\n`);
if (siteOrigin) {
  await writeFile(
    path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteOrigin}/</loc></url>\n</urlset>\n`,
  );
}

await rm(ssrDir, { recursive: true, force: true });
console.log(`[prerender] wrote dist/index.html (${(appHtml.length / 1024).toFixed(1)} KB of app HTML)${siteOrigin ? "" : " without site URL"}`);
