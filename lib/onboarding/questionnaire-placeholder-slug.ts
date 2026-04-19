/**
 * Maps tenant industry (same strings as registration / {@link INDUSTRY_LIST})
 * to i18n keys under `onboarding.placeholders.<slug>.*`.
 */
const INDUSTRY_TO_PLACEHOLDER_SLUG: Record<string, string> = {
  'Legal Services': 'legalServices',
  'Construction & Contracting': 'constructionContracting',
  'Real Estate Services': 'realEstateServices',
  'Financial Advisory': 'financialAdvisory',
  'Business Consulting': 'businessConsulting',
  'Marketing & Creative Agencies': 'marketingCreative',
  'Home Services': 'homeServices',
  'Health & Wellness Coaching': 'healthWellness',
  'IT & Technology Services': 'itTechnology',
  'Interior Design': 'interiorDesign',
};

export function getQuestionnairePlaceholderSlug(
  industry: string | null | undefined
): string {
  const trimmed = industry?.trim();
  if (!trimmed) return 'default';
  return INDUSTRY_TO_PLACEHOLDER_SLUG[trimmed] ?? 'default';
}
