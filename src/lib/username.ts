/** One rule for the signup form's browser check and the server's check. Usernames are stored lowercase. */
export const USERNAME_PATTERN = "[A-Za-z0-9_]{3,24}";

export const USERNAME_HINT = "3–24 characters: letters, numbers, and underscores. Saved in lowercase.";

export function normalizeUsername(raw: string): string | null {
  const username = raw.trim();
  return new RegExp(`^${USERNAME_PATTERN}$`).test(username) ? username.toLowerCase() : null;
}
