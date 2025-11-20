// utils/similarity.js
export function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean)
    .filter(t => t.length > 2);
}

export function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);

  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;

  const uni = new Set([...A, ...B]).size;
  return uni === 0 ? 0 : inter / uni;
}
