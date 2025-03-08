import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type ReactNode } from "react"
import * as React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Regex to match URLs
const urlRegex = /(https?:\/\/[^\s]+)/g;

// Convert URLs in text to clickable links
export function formatTextWithLinks(text: string): ReactNode[] {
  if (!text) return [];

  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];
  const result: ReactNode[] = [];
  let matchIndex = 0;

  parts.forEach((part, i) => {
    // Add non-URL text
    if (part && !part.match(urlRegex)) {
      result.push(part);
    }
    // Add URL as a link
    if (matches[matchIndex] && i < parts.length - 1) {
      result.push(
        React.createElement('a', {
          key: matchIndex,
          href: matches[matchIndex],
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-primary hover:underline',
          children: matches[matchIndex]
        })
      );
      matchIndex++;
    }
  });

  return result;
}