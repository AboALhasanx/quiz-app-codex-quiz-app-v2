/**
 * generate-manifest.js
 * Scans assets/pdfs/ and generates data/pdf-manifest.json
 * Run: node scripts/generate-manifest.js
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PDF_DIR = path.join(__dirname, "..", "assets", "pdfs");
const OUTPUT = path.join(__dirname, "..", "data", "pdf-manifest.json");

// Map from folder name (in assets/pdfs/) to subjectId (in data/subjects/)
const FOLDER_TO_SUBJECT_ID = {
  ai: "ai_data",
  algo: "ds_data",
  net: "cn_data",
  oop: "oop_data",
  os: "os_data",
  se: "se_data",
};

// Subject display names
const SUBJECT_NAMES = {
  ai: "الذكاء الاصطناعي",
  algo: "هياكل البيانات",
  net: "شبكات الحاسوب",
  oop: "البرمجة الكائنية",
  os: "أنظمة التشغيل",
  se: "هندسة البرمجيات",
};

// Derive chapterId from filename tokens.
// Filenames look like: AI_Ch01.pdf, Net_Ch01_Introduction.pdf, Sum_OS_Ch03.pdf
function extractChapterId(filename) {
  const base = path.basename(filename, ".pdf").replace(/^Sum_/, "");
  // Try to match Ch followed by digits (e.g., Ch01, Ch03)
  const match = base.match(/Ch(\d+)/i);
  if (match) return "ch" + parseInt(match[1], 10).toString();
  // Fallback: remove subject prefix (first word before underscore) and slugify the rest
  // e.g., "Net_Error_Detection" → "error_detection"
  //       "OOP_Abstraction" → "abstraction"
  const parts = base.split("_");
  // Remove the subject abbreviation prefix (first token like AI, Net, OOP, OS, SE, Algo)
  const withoutPrefix = parts.slice(1).join("_");
  return withoutPrefix.toLowerCase().replace(/[^a-z0-9]/g, "_") || base.toLowerCase();
}

function extractType(filename) {
  return filename.startsWith("Sum_") ? "summary" : "lecture";
}

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

const GITHUB_BASE =
  "https://github.com/AboALhasanx/quiz-app-pdfs/releases/download/v1";

// ── Walk PDFs ─────────────────────────────────────────
const manifest = {
  version: 1,
  updatedAt: new Date().toISOString(),
  remoteManifestUrl:
    "https://raw.githubusercontent.com/AboALhasanx/quiz-app-pdfs/master/manifest.json",
  files: [],
};

const folders = fs.readdirSync(PDF_DIR, { withFileTypes: true });

for (const folder of folders) {
  if (!folder.isDirectory()) continue;
  const subjectFolder = folder.name;
  const subjectId = FOLDER_TO_SUBJECT_ID[subjectFolder];
  if (!subjectId) {
    console.warn(`⚠ Skipping unknown folder: ${subjectFolder}`);
    continue;
  }

  const dirPath = path.join(PDF_DIR, subjectFolder);
  const pdfs = fs
    .readdirSync(dirPath)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();

  for (const filename of pdfs) {
    const fullPath = path.join(dirPath, filename);
    const stat = fs.statSync(fullPath);
    const checksum = sha256(fullPath);
    const type = extractType(filename);
    const chapterId = extractChapterId(filename);

    // Build a stable id from subject + type + chapter
    const prefix = type === "summary" ? "sum" : "lec";
    const id = `${subjectId}_${prefix}_${chapterId}`;

    // Flat URL — no subfolder in release
    const url = `${GITHUB_BASE}/${filename}`;

    const subjectName = SUBJECT_NAMES[subjectFolder] || subjectFolder;
    const name =
      type === "summary"
        ? `ملخص ${subjectName} الفصل ${chapterId.replace("ch", "")}`
        : `ملزمة ${subjectName} الفصل ${chapterId.replace("ch", "")}`;

    manifest.files.push({
      id,
      subjectId,
      chapterId,
      type,
      name,
      filename,
      url,
      size: stat.size,
      checksum,
      version: 1,
      updatedAt: stat.mtime.toISOString(),
    });
  }
}

manifest.files.sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2), "utf-8");
console.log(`✅ Generated ${OUTPUT}`);
console.log(`   ${manifest.files.length} files`);
console.log(`   remoteManifestUrl: ${manifest.remoteManifestUrl}`);

// Print first 3 URLs for verification
console.log("\n📁 First 3 entries:");
manifest.files.slice(0, 3).forEach((f) => {
  console.log(`   ${f.id}: ${f.url}`);
});
