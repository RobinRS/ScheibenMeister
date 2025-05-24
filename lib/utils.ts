import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dateFromString (dateString: string): Date {
  const parts = dateString.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid date format. Expected format: DD.MM.YYYY");
  }
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}
