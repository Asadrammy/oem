/**
 * Fuzzy search utility functions
 * Provides intelligent search that matches partial strings and handles typos
 */

/**
 * Calculate Levenshtein distance between two strings
 * Lower distance means more similar strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between two strings (0-1, higher is more similar)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - (distance / maxLength);
}

/**
 * Check if search term is a substring of the target (case-insensitive)
 */
function isSubstring(searchTerm: string, target: string): boolean {
  return target.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Check if search term matches any word in the target string
 */
function matchesAnyWord(searchTerm: string, target: string): boolean {
  const words = target.toLowerCase().split(/\s+/);
  const searchWords = searchTerm.toLowerCase().split(/\s+/);
  
  return searchWords.some(searchWord => 
    words.some(word => word.includes(searchWord) || searchWord.includes(word))
  );
}

/**
 * Fuzzy search configuration
 */
export interface FuzzySearchConfig {
  threshold?: number;        // Minimum similarity score (0-1, default: 0.3)
  substringWeight?: number;  // Weight for substring matches (default: 0.8)
  wordMatchWeight?: number;  // Weight for word matches (default: 0.6)
  similarityWeight?: number; // Weight for similarity score (default: 0.4)
  minLength?: number;        // Minimum search term length (default: 1)
}

/**
 * Calculate fuzzy score for a search term against a target string
 */
export function calculateFuzzyScore(
  searchTerm: string, 
  target: string, 
  config: FuzzySearchConfig = {}
): number {
  const {
    threshold = 0.3,
    substringWeight = 0.8,
    wordMatchWeight = 0.6,
    similarityWeight = 0.4,
    minLength = 1
  } = config;

  if (searchTerm.length < minLength) return 0;
  
  const searchLower = searchTerm.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Exact match gets highest score
  if (searchLower === targetLower) return 1;
  
  // Substring match gets high score
  if (isSubstring(searchTerm, target)) return substringWeight;
  
  // Word match gets medium-high score
  if (matchesAnyWord(searchTerm, target)) return wordMatchWeight;
  
  // Similarity score gets medium score
  const similarity = calculateSimilarity(searchTerm, target);
  if (similarity >= threshold) return similarity * similarityWeight;
  
  return 0;
}

/**
 * Search through an array of objects with fuzzy matching
 */
export function fuzzySearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  config: FuzzySearchConfig = {}
): T[] {
  if (!searchTerm.trim()) return items;
  
  const results = items.map(item => {
    let maxScore = 0;
    
    // Calculate score for each searchable field
    searchFields.forEach(field => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        const score = calculateFuzzyScore(searchTerm, fieldValue, config);
        maxScore = Math.max(maxScore, score);
      }
    });
    
    return { item, score: maxScore };
  })
  .filter(result => result.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(result => result.item);
  
  return results;
}

/**
 * Search through an array of strings with fuzzy matching
 */
export function fuzzySearchStrings(
  items: string[],
  searchTerm: string,
  config: FuzzySearchConfig = {}
): string[] {
  if (!searchTerm.trim()) return items;
  
  const results = items.map(item => ({
    item,
    score: calculateFuzzyScore(searchTerm, item, config)
  }))
  .filter(result => result.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(result => result.item);
  
  return results;
}

/**
 * Highlight search terms in text with HTML markup
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(
  items: string[],
  searchTerm: string,
  maxSuggestions: number = 5
): string[] {
  if (!searchTerm.trim()) return [];
  
  const suggestions = fuzzySearchStrings(items, searchTerm, { threshold: 0.2 })
    .slice(0, maxSuggestions);
  
  return suggestions;
}

