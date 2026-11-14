/**
 * Helper for the backend's paginated list endpoints
 * (Hbackend/pagination.py -> NineResultsSetPagination).
 *
 * Those endpoints answer with:
 *   { count, total_pages, current_page, page_size, next, previous, results }
 *
 * The listing pages search, filter, sort and page (9 per page) in the browser,
 * so they need the complete list. This walks the backend pages and returns
 * every item. Plain array responses (non-paginated endpoints) pass through.
 */

/** Largest page the backend allows (max_page_size), to keep requests few. */
export const LIST_PAGE_SIZE = 100;

/** Hard stop so a misbehaving API can never cause an endless loop. */
const MAX_PAGES = 200;

export async function collectAllPages<T>(
    fetchPage: (page: number, pageSize: number) => Promise<unknown>
): Promise<T[]> {
    const first = (await fetchPage(1, LIST_PAGE_SIZE)) as any;

    // Non-paginated endpoint: already the full list
    if (Array.isArray(first)) return first as T[];
    if (!first || !Array.isArray(first.results)) return [];

    const items: T[] = [...first.results];
    const totalPages = Number(first.total_pages) || 0;
    let hasNext = Boolean(first.next);
    let page = 1;

    while (hasNext && page < MAX_PAGES && (totalPages === 0 || page < totalPages)) {
        page += 1;
        const data = (await fetchPage(page, LIST_PAGE_SIZE)) as any;
        if (!data || !Array.isArray(data.results) || data.results.length === 0) break;
        items.push(...data.results);
        hasNext = Boolean(data.next);
    }

    return items;
}
