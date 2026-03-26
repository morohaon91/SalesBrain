/**
 * Industry templates library exports and helpers
 */

export { INDUSTRY_TEMPLATES } from './industry-templates';
export type { IndustryTemplate, ScenarioPersona } from './industry-templates';

import { INDUSTRY_TEMPLATES, type IndustryTemplate } from './industry-templates';

// New industry list — matches the 10 industries in industry-scenarios.ts
import { INDUSTRY_LIST as NEW_INDUSTRY_LIST } from './industry-scenarios';

/**
 * Get list of all available industries for dropdowns
 * Uses the new canonical 10-industry list for consistency across the app
 */
export const INDUSTRY_LIST = NEW_INDUSTRY_LIST.map((name) => ({
  value: name,
  label: name,
}));

/**
 * Get a specific industry template by industry key (legacy support)
 */
export function getIndustryTemplate(industry: string | null | undefined): IndustryTemplate | undefined {
  if (!industry) return undefined;
  return INDUSTRY_TEMPLATES[industry as keyof typeof INDUSTRY_TEMPLATES];
}

/**
 * Get the list of industries
 */
export function getIndustryList() {
  return INDUSTRY_LIST;
}
