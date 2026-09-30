/**
 * Accepts only absolute http(s) URLs. Anything else (empty, malformed, or a
 * `javascript:` URL from a mis-set variable) is rejected so it can never end up
 * in an href.
 */
export function parseHttpUrl(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export const REPO_URL = parseHttpUrl(import.meta.env.VITE_REPO_URL);
