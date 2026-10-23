// Pure display helpers shared by the B2B list and tour deletion guidance.
export const searchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

export function filterPooling(
  pools,
  { query = "", status = "", tour = "" } = {},
) {
  const term = searchText(query);
  return pools.filter(
    (p) =>
      (!status || p.status === status) &&
      (!tour || p.tour_id === tour) &&
      (!term || searchText(`${p.partner} ${p.tour_title}`).includes(term)),
  );
}

export function tourDeletionSummary(pools, tourId) {
  const related = pools.filter((p) => p.tour_id === tourId);
  const blocking = related.filter(
    (p) => p.status !== "cancelled" || p.paid > 0,
  );
  return {
    total: related.length,
    blocking: blocking.length,
    withReceipts: blocking.filter((p) => p.paid > 0).length,
  };
}
