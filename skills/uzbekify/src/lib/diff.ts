/** Word-level diff (LCS) for before/after rewrites. */

export interface DiffOp {
  type: "same" | "add" | "del";
  text: string;
}

function tokenize(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) ?? [];
}

/** Compute word-level LCS diff between two texts. */
export function diffWords(a: string, b: string): DiffOp[] {
  const at = tokenize(a).filter((t) => t.trim().length > 0);
  const bt = tokenize(b).filter((t) => t.trim().length > 0);
  const n = at.length;
  const m = bt.length;
  // LCS table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = at[i] === bt[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (at[i] === bt[j]) {
      push(ops, "same", at[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(ops, "del", at[i]);
      i++;
    } else {
      push(ops, "add", bt[j]);
      j++;
    }
  }
  while (i < n) push(ops, "del", at[i++]);
  while (j < m) push(ops, "add", bt[j++]);
  return ops;
}

function push(ops: DiffOp[], type: DiffOp["type"], text: string) {
  const last = ops[ops.length - 1];
  if (last && last.type === type) {
    last.text += " " + text;
  } else {
    ops.push({ type, text });
  }
}

/** Render a diff with markers. */
export function renderDiff(ops: DiffOp[]): string {
  const parts: string[] = [];
  for (const op of ops) {
    if (op.type === "same") parts.push(op.text);
    else if (op.type === "del") parts.push(`{-${op.text}-}`);
    else parts.push(`{+${op.text}+}`);
  }
  return parts.join(" ");
}

/** Short summary: how many tokens changed. */
export function diffStats(ops: DiffOp[]): { added: number; removed: number; same: number } {
  let added = 0;
  let removed = 0;
  let same = 0;
  for (const op of ops) {
    const n = op.text.trim() ? op.text.trim().split(/\s+/).length : 0;
    if (op.type === "add") added += n;
    else if (op.type === "del") removed += n;
    else same += n;
  }
  return { added, removed, same };
}
