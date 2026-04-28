const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function clampInt(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

/**
 * Parse page / pageSize from URL search params with safe defaults and an upper bound on page size.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  options?: { defaultPageSize?: number; maxPageSize?: number }
): { page: number; pageSize: number } {
  const defaultPageSize = options?.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const maxPageSize = options?.maxPageSize ?? MAX_PAGE_SIZE;

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = clampInt(rawPage, 1, Number.MAX_SAFE_INTEGER, 1);

  const rawSize = parseInt(searchParams.get("pageSize") || String(defaultPageSize), 10);
  const pageSize = clampInt(rawSize, 1, maxPageSize, defaultPageSize);

  return { page, pageSize };
}

export { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };
