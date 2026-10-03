// No em dash in the text consumers read. ESLint covers every string in src/ (eslint.config.mjs,
// NO_EM_DASH); this covers what ESLint does not parse: the README, the changelog and
// package.json (the description shows on npm). An em dash gives away AI-written text.

import { readFileSync } from "node:fs";

const EM_DASH = /—|\\u2014|\\u\{2014\}|&mdash;|&#(?:0*8212|x0*2014);/i;
const files = ["README.md", "CHANGELOG.md", "package.json"];

const problems = files.flatMap((file) =>
  readFileSync(file, "utf8")
    .split("\n")
    .flatMap((line, i) =>
      EM_DASH.test(line) ? [`${file}:${i + 1}: ${line.trim()}`] : [],
    ),
);

if (problems.length > 0) {
  console.error(
    `Em dash found in ${problems.length} user-facing line(s). Use a period, comma, colon or parentheses:\n` +
      problems.join("\n"),
  );
  process.exit(1);
}
console.log(`no em dash in ${files.length} user-facing files`);
