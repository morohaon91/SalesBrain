/**
 * Industry templates library exports and helpers
 */

export { INDUSTRY_TEMPLATES } from './industry-templates';
export type { IndustryTemplate, ScenarioPersona } from './industry-templates';

import { INDUSTRY_TEMPLATES, type IndustryTemplate } from './industry-templates';

/**
 * Get list of all available industries for dropdowns
 */
export const INDUSTRY_LIST = Object.values(INDUSTRY_TEMPLATES).map(template => ({
  value: template.industry,
  label: template.displayName,
}));

/**
 * Get a specific industry template by industry key
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
