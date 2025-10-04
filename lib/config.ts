// src/lib/config.ts

export const DEFAULT_API_BASE_URL = "https://platform-api-test.joulepoint.com";

// Build API URL dynamically
export function getApiUrl(company: string): string {
  if (!company) return DEFAULT_API_BASE_URL;

  // remove spaces and lowercase
  const clean = company.trim().toLowerCase();

  return `https://${clean}.platform-api-test.joulepoint.com`;
}
