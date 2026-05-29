import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INCLUDE_DIRS = ["app", "components", "lib", "assets", "prisma", "middlewares", "inngest", "scripts"];
const EXCLUDE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build"]);
const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".css", ".prisma", ".txt", ".sql"]);

const args = new Set(process.argv.slice(2));
const shouldFix = args.has("--fix");

const suspiciousPattern = /(?:Ã.|Â.|Æ.|Ä.|áº|á»|á¼|á½|á¾|ï»¿)/g;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!EXTENSIONS.has(path.extname(entry.name))) continue;
    out.push(full);
  }
  return out;
}

function toUtf8FromLatin1(text) {
  return Buffer.from(text, "latin1").toString("utf8");
}

function scoreViLike(text) {
  const viMarks = (text.match(/[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/gi) || []).length;
  const suspicious = (text.match(suspiciousPattern) || []).length;
  return viMarks * 2 - suspicious * 3;
}

function normalizeNewline(content) {
  return content.replace(/\r?\n/g, "\r\n");
}

const files = INCLUDE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
const issues = [];
let fixed = 0;

for (const file of files) {
  const raw = fs.readFileSync(file);
  let content = raw.toString("utf8");

  // Remove UTF-8 BOM
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  const suspiciousHits = content.match(suspiciousPattern);
  if (!suspiciousHits) {
    if (shouldFix) {
      const normalized = normalizeNewline(content);
      if (normalized !== raw.toString("utf8")) {
        fs.writeFileSync(file, normalized, "utf8");
      }
    }
    continue;
  }

  issues.push({ file, hits: suspiciousHits.length });

  if (!shouldFix) continue;

  const converted = toUtf8FromLatin1(content);
  const keepOriginal = scoreViLike(content) >= scoreViLike(converted);
  const best = keepOriginal ? content : converted;
  const normalized = normalizeNewline(best);

  if (normalized !== raw.toString("utf8")) {
    fs.writeFileSync(file, normalized, "utf8");
    fixed += 1;
  }
}

if (issues.length > 0) {
  console.log(`Found ${issues.length} file(s) with suspicious encoding patterns:`);
  for (const item of issues) {
    console.log(`- ${path.relative(ROOT, item.file)} (${item.hits} hit(s))`);
  }
} else {
  console.log("No suspicious encoding patterns found.");
}

if (shouldFix) {
  console.log(`Fixed/rewritten ${fixed} file(s).`);
}

if (issues.length > 0 && !shouldFix) {
  process.exitCode = 1;
}
