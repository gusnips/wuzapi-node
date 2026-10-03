// Check public documents, published JSDoc and decoded source text.
// Implementation comments and regular expressions are not copy.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const EM_DASH = /\u2014|\\u2014|\\u\{2014\}|&mdash;|&#(?:0*8212|x0*2014);/i;
const files = ["README.md", "CHANGELOG.md", "package.json"];

const problems = new Set<string>();
function checkLines(file: string, text: string, firstLine = 0): void {
  text.split("\n").forEach((line, i) => {
    if (EM_DASH.test(line))
      problems.add(`${file}:${String(firstLine + i + 1)}: ${line.trim()}`);
  });
}

function jsDocs(source: ts.SourceFile): Map<string, ts.CommentRange> {
  const comments = new Map<string, ts.CommentRange>();
  function visit(node: ts.Node): void {
    for (const range of ts.getLeadingCommentRanges(source.text, node.pos) ??
      []) {
      const comment = source.text.slice(range.pos, range.end);
      if (comment.startsWith("/**")) {
        comments.set(
          comment
            .replace(/^\s*\* ?/gm, "")
            .replace(/\s+/g, " ")
            .trim(),
          range,
        );
      }
    }
    for (const child of node.getChildren(source)) visit(child);
  }
  visit(source);
  return comments;
}

function isCopyExempt(node: ts.Node, source: ts.SourceFile): boolean {
  // Reuse the source's explicit ESLint exemptions for decoder data and generated markers.
  for (
    let current = node;
    !ts.isSourceFile(current);
    current = current.parent
  ) {
    if (
      (ts.getLeadingCommentRanges(source.text, current.pos) ?? []).some(
        (range) =>
          /eslint-disable-next-line\s+no-restricted-syntax\b/.test(
            source.text.slice(range.pos, range.end),
          ),
      )
    )
      return true;
  }
  return false;
}

function checkSource(file: string): void {
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  // Syntax-only declaration emission drops function bodies and their internal JSDoc.
  const declaration = ts.createSourceFile(
    file,
    ts.transpileDeclaration(text, { fileName: file }).outputText,
    ts.ScriptTarget.Latest,
    true,
  );
  const sourceDocs = jsDocs(source);
  for (const comment of jsDocs(declaration).keys()) {
    const range = sourceDocs.get(comment);
    if (range) {
      checkLines(
        file,
        text.slice(range.pos, range.end),
        source.getLineAndCharacterOfPosition(range.pos).line,
      );
    }
  }
  function visit(node: ts.Node): void {
    if (ts.isJSDoc(node)) return;
    if (
      (ts.isStringLiteralLike(node) ||
        ts.isTemplateLiteralToken(node) ||
        ts.isJsxText(node)) &&
      !isCopyExempt(node, source)
    ) {
      checkLines(
        file,
        node.text,
        source.getLineAndCharacterOfPosition(node.getStart(source)).line,
      );
    }
    for (const child of node.getChildren(source)) visit(child);
  }
  visit(source);
}

for (const file of files) checkLines(file, readFileSync(file, "utf8"));
for (const dir of ["src"]) {
  for (const file of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    if (/\.(?:test|spec|d)\.tsx?$/.test(file) || !/\.tsx?$/.test(file))
      continue;
    checkSource(join(dir, file));
  }
}

if (problems.size > 0) {
  console.error(
    `Em dash found in ${String(problems.size)} user-facing line(s). Use a period, comma, colon or parentheses:\n` +
      [...problems].join("\n"),
  );
  process.exit(1);
}
console.log("no em dash in public text or published JSDoc");
