import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ReactNode } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Regex to match URLs
const urlRegex = /(https?:\/\/[^\s]+)/g;

// Convert URLs in text to clickable links
export function formatTextWithLinks(text: string): ReactNode[] {
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];
  let result: ReactNode[] = [];

  parts.forEach((part, i) => {
    if (part) {
      result.push(part);
    }
    if (matches[i]) {
      result.push(
        <a 
          key={`link-${i}`}
          href={matches[i]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {matches[i]}
        </a>
      );
    }
  });

  return result;
}