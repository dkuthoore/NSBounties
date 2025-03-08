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

  parts.forEach((part, i) => {
    if (part) {
      result.push(part);
    }
    if (matches[i]) {
      result.push(
        React.createElement('a', {
          key: i,
          href: matches[i],
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-primary hover:underline',
          children: matches[i]
        })
      );
    }
  });

  return result;
}