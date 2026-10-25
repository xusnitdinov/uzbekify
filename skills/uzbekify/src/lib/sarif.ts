/** SARIF 2.1.0 output for CI (GitHub code scanning compatible). */
import type { Finding, Severity } from "./types.js";

const SEVERITY_LEVEL: Record<Severity, string> = {
  error: "error",
  warn: "warning",
  info: "note",
};

export interface SarifResultLocation {
  file: string;
  line?: number;
  column?: number;
  keyPath?: string;
}

export function toSarif(
  results: { file: string; findings: Finding[]; keyPath?: string }[]
): unknown {
  const sarifResults: unknown[] = [];
  for (const { file, findings, keyPath } of results) {
    for (const f of findings) {
      sarifResults.push({
        ruleId: f.rule,
        level: SEVERITY_LEVEL[f.severity],
        message: {
          text: `${f.match ? `"${f.match}" — ` : ""}${f.message}${f.count > 1 ? ` (×${f.count})` : ""}`,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri: file },
              region: {
                startLine: f.line ?? 1,
                startColumn: f.column ?? 1,
              },
            },
            logicalLocations: keyPath
              ? [{ fullyQualifiedName: keyPath, name: keyPath }]
              : undefined,
          },
        ],
      });
    }
  }
  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "uzpro",
            informationUri: "https://github.com/xusnitdinov/uzbek-humanizer",
            version: "2.0.0",
            rules: [], // rule metadata lives in the linter messages
          },
        },
        results: sarifResults,
      },
    ],
  };
}
