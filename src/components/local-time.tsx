"use client";

import { useSyncExternalStore } from "react";

const FORMATS = {
  date: { month: "short", day: "numeric", year: "numeric" },
  dateTime: { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

const subscribe = () => () => {};

/**
 * Formats a timestamp in the viewer's own time zone. The server does not know that zone (it would print UTC on
 * Vercel), and hydration keeps server-rendered text, so the server renders nothing and the client fills it in.
 */
export function LocalTime({ value, format }: { value: string; format: keyof typeof FORMATS }) {
  const inBrowser = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <time dateTime={value}>
      {inBrowser ? new Intl.DateTimeFormat(undefined, FORMATS[format]).format(new Date(value)) : ""}
    </time>
  );
}
