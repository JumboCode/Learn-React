/**
 * Accepts only same-origin absolute paths. "//evil.com" and "/\evil.com" are protocol-relative URLs that browsers
 * resolve to another host, so they are rejected along with anything that is not a path.
 */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export function loginPath(next: string, error?: string): string {
  const params = new URLSearchParams({ next });
  if (error) params.set("error", error);
  return `/login?${params}`;
}
