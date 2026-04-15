/**
 * Minimal line-diff. Uses the classic Myers-ish longest-common-subsequence DP
 * so we avoid pulling in a dependency. Output is an array of `{ type, line }`
 * tuples, where `type` is `equal` | `add` | `remove`.
 */
export type DiffLine = { type: "equal" | "add" | "remove"; line: string };

export function lineDiff(a: string, b: string): DiffLine[] {
  const A = a.split("\n");
  const B = b.split("\n");
  const m = A.length;
  const n = B.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (A[i] === B[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) {
      out.push({ type: "equal", line: A[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "remove", line: A[i++] });
    } else {
      out.push({ type: "add", line: B[j++] });
    }
  }
  while (i < m) out.push({ type: "remove", line: A[i++] });
  while (j < n) out.push({ type: "add", line: B[j++] });
  return out;
}
