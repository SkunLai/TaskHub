import { todayVietnam } from "./dates.mjs";

// Vietnamese visitors can search with or without accents and extra spaces.
export function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLocaleLowerCase("vi")
    .trim()
    .replace(/\s+/g, " ");
}

export function matchesTourSearch(tour, query, destination) {
  if (destination && tour.destination !== destination) return false;
  const text = [tour.title, tour.destination, tour.code, tour.route]
    .filter(Boolean)
    .join(" ");
  return normalizeSearchText(text).includes(normalizeSearchText(query));
}

export function hasScheduleFilters({
  from = "",
  to = "",
  availableOnly = false,
}) {
  return Boolean(from || to || availableOnly);
}

// Unknown dates/capacity in reference content cannot satisfy inventory filters.
// ISO YYYY-MM-DD strings sort in calendar order without local timezone shifts.
export function matchesTourSchedule(
  tour,
  { from = "", to = "", availableOnly = false },
  today = todayVietnam(),
) {
  if (from && to && from > to) return false;
  if ((from || to) && !tour.departure) return false;
  if (from && tour.departure < from) return false;
  if (to && tour.departure > to) return false;
  if (availableOnly) {
    if (!tour.departure || tour.departure < today) return false;
    if (!Number.isFinite(tour.capacity) || !Number.isFinite(tour.reserved))
      return false;
    if (tour.capacity <= tour.reserved) return false;
  }
  return true;
}
