// Run from the repository root: bun run scripts/check-no-em-dash.selfcheck.ts
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const guard = resolve("scripts/check-no-em-dash.ts");
const root = mkdtempSync(join(tmpdir(), "public-copy-check-"));
const dash = String.fromCodePoint(0x2014);
const documents = ["README.md", "CHANGELOG.md", "package.json"];
const sourceDirs = ["src"];

function write(file: string, text: string): void {
  const path = join(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

function check(expected: number, label: string): void {
  const result = spawnSync(process.execPath, [guard], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    expected,
    `${label}\n${result.stdout}${result.stderr}`,
  );
  if (expected === 1) assert.match(result.stderr, /(?:probe\.|README\.md)/);
}

try {
  for (const file of documents)
    write(file, file.endsWith(".json") ? "{}\n" : "Public docs.\n");
  for (const dir of sourceDirs)
    write(`${dir}/probe.ts`, 'export const text = "valid";\n');
  check(0, "clean public copy");
  for (const dir of sourceDirs) {
    write(
      `${dir}/nested/probe.ts`,
      `/** Public ${dash} description. */\nexport const copy = "valid";`,
    );
    check(1, `nested published JSDoc in ${dir}`);
    rmSync(join(root, dir, "nested"), { recursive: true });
  }

  const cases: [string, string, number][] = [
    [
      "exported JSDoc",
      `/** Public ${dash} description. */\nexport function copy(): string { return "valid"; }`,
      1,
    ],
    [
      "property JSDoc",
      `export interface Copy {\n /** Public ${dash} description. */\n text: string;\n}`,
      1,
    ],
    [
      "union member JSDoc",
      `export type Copy =\n /** Public ${dash} description. */\n | "valid";`,
      1,
    ],
    [
      "private declaration JSDoc",
      `export class Copy {\n /** Public declaration ${dash} description. */\n private copy(): void {}\n}`,
      1,
    ],
    ["literal source text", `export const text = "bad ${dash} copy";`, 1],
    ["Unicode string", 'export const text = "bad \\u2014 copy";', 1],
    ["Unicode template", "export const text = `bad \\u{2014} copy`;", 1],
    [
      "HTML template entity",
      "export const text = `<p>bad &mdash; copy</p>`;",
      1,
    ],
    [
      "decimal source entity",
      'export const text = "<p>bad &#08212; copy</p>";',
      1,
    ],
    [
      "hex source entity",
      'export const text = "<p>bad &#x02014; copy</p>";',
      1,
    ],
    [
      "internal comments",
      `// Internal ${dash} detail.\n/* Internal ${dash} detail. */\nexport function copy(): void { /** Internal ${dash} detail. */ }`,
      0,
    ],
    [
      "unpublished helper JSDoc",
      `/** Internal ${dash} detail. */\nfunction helper(): void {}\nexport const text = "valid";`,
      0,
    ],
    [
      "input decoding regex",
      `export function decode(text: string): string { return text.replace(/(?:${dash}|&mdash;|&#8212;|&#x2014;)/g, String.fromCodePoint(0x2014)); }`,
      0,
    ],
    ["JSDoc-looking string", 'export const text = "/** valid input */";', 0],
    [
      "explicit decoder exemption",
      `export const entities = {
 // eslint-disable-next-line no-restricted-syntax
 mdash: "${dash}"
};`,
      0,
    ],
    [
      "generated marker exemption",
      `// eslint-disable-next-line no-restricted-syntax
export const header = \`// GENERATED ${dash} DO NOT EDIT.\`;`,
      0,
    ],
    [
      "exemption stops at its statement",
      `// eslint-disable-next-line no-restricted-syntax
export const data = "${dash}";
export const copy = "bad ${dash} copy";`,
      1,
    ],
    [
      "typed internal JSDoc",
      `export function copy(): void {\n /** @type {"${dash}"} */\n let data;\n}`,
      0,
    ],
  ];
  for (const [label, text, expected] of cases) {
    for (const dir of sourceDirs) write(`${dir}/probe.ts`, text);
    check(expected, label);
  }
  for (const dir of sourceDirs)
    write(`${dir}/probe.ts`, 'export const text = "valid";\n');

  for (const text of [dash, "&mdash;", "&#8212;", "&#x2014;"]) {
    for (const dir of sourceDirs)
      write(`${dir}/probe.tsx`, `export const copy = <p>bad ${text} copy</p>;`);
    check(1, `JSX ${text === dash ? "literal" : "entity"}`);
  }
  for (const dir of sourceDirs) rmSync(join(root, dir, "probe.tsx"));

  for (const text of [
    dash,
    "&mdash;",
    "&#8212;",
    "&#x2014;",
    "\\u2014",
    "\\u{2014}",
  ]) {
    write("README.md", `Bad ${text} copy.\n`);
    check(1, "encoded document text");
  }
  write("README.md", "Public docs.\n");
  for (const dir of sourceDirs)
    write(`${dir}/probe.test.ts`, `export const test = "${dash}";`);
  check(0, "test inputs stay exempt");
  check(0, "clean after planted violations");
  console.log(
    "Public JSDoc, decoded strings, HTML entities and exemptions pass.",
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
