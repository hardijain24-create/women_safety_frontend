/**
 * TEMPORARY WORKAROUND for backend naive-timestamp bug.
 * 
 * The backend at women-safety-5lls.onrender.com returns datetime fields 
 * (e.g. alert created_at) as naive ISO strings without timezone offsets (e.g., '2026-07-19T06:24:55.462000').
 * This causes JS `new Date()` to parse them in the client's local timezone rather than UTC, 
 * leading to shifted times (e.g., 5.5 hours behind for users in India/IST).
 * 
 * This utility function appends a 'Z' (UTC specifier) ONLY IF the string does not already 
 * specify a timezone (no 'Z', no '+HH:MM', no '-HH:MM').
 * 
 * DELETE this utility and return to direct parsing once the backend returns proper 
 * timezone-aware UTC strings (e.g. ending in 'Z' or offset).
 */
export function parseServerDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  
  const trimmed = dateStr.trim();
  // If the string already ends in 'Z' or ends with a timezone offset like +HH:MM or -HH:MM (with or without colon)
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed);
  
  const parsedStr = hasTimezone ? trimmed : `${trimmed}Z`;
  return new Date(parsedStr);
}
