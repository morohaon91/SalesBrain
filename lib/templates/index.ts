/**
 * Industry templates library exports and helpers
 */

export { INDUSTRY_TEMPLATES } from './industry-templates';
export type { IndustryTemplate, ScenarioPersona } from './industry-templates';

import { INDUSTRY_TEMPLATES, type IndustryTemplate } from './industry-templates';
import { INDUSTRY_LIST as NEW_INDUSTRY_LIST } from '@/lib/scenarios/mandatory-scenarios';

/**
 * Get list of all available industries for dropdowns.
 * Canonical 10-industry list sourced from the universal scenario system.
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

export function getIndustryList() {
  return INDUSTRY_LIST;
}
