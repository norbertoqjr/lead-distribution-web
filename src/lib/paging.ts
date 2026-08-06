export const MAX_PER_PAGE = 100;

/** Parses page/perPage from the URL, clamping anything unusable. */
export function readPaging(params: { page?: string; perPage?: string }): {
  page: number;
  perPage: number;
  query: string;
} {
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const parsedPerPage = Number.parseInt(params.perPage ?? "20", 10) || 20;
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, parsedPerPage));

  return { page, perPage, query: `page=${page}&perPage=${perPage}` };
}

/**
 * Full-list request for controls that need every row: the assign-lead broker
 * picker and the distribution share editor. Capped at the API maximum, which
 * is enough for this system and keeps the request bounded.
 */
export const ALL = `page=1&perPage=${MAX_PER_PAGE}`;
