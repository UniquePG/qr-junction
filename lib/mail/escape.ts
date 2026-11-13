export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function firstName(name?: string | null): string | null {
  if (!name?.trim()) return null;
  return name.trim().split(/\s+/)[0] || null;
}

export function greeting(name?: string | null): string {
  const first = firstName(name);
  return first ? `Hi ${first},` : "Hi,";
}

export function greetingHtml(name?: string | null): string {
  const first = firstName(name);
  return first ? `Hi ${escapeHtml(first)},` : "Hi,";
}