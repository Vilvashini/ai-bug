// utils/redact.js
export function redact(input) {
  if (!input) return input;
  let text = String(input);

  const rules = [
    { regex: /\b\d{1,3}(?:\.\d{1,3}){3}\b/g, tag: "[REDACTED:IP]" },
    { regex: /\b[A-Fa-f0-9]{32,}\b/g, tag: "[REDACTED:KEY]" },
    { regex: /https?:\/\/[^\s)"]+/gi, tag: "[REDACTED:URL]" },
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi, tag: "[REDACTED:EMAIL]" },
    { regex: /\b\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?\b/g, tag: "[REDACTED:TS]" },
    { regex: /[A-Za-z]:\\[^ \n\r\t]*/g, tag: "[REDACTED:PATH]" },
    { regex: /\/[^\s\n\r\t]+/g, tag: "[REDACTED:PATH]" },
    { regex: /user(name)?[:=]\s*\w+/gi, tag: "[REDACTED:USER]" },
    { regex: /\b[A-Za-z0-9_\-]{20,}\b/g, tag: "[REDACTED:API_KEY]" }
  ];

  for (const r of rules) text = text.replace(r.regex, r.tag);
  return text.replace(/[ \t]{2,}/g, " ");
}
