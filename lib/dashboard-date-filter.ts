export const DASHBOARD_PRESETS = [
  "today",
  "yesterday",
  "last7days",
  "last30days",
  "thisMonth",
  "all",
  "custom",
] as const;

export type DashboardDatePreset = (typeof DASHBOARD_PRESETS)[number];

export type DashboardDateFilterInput = {
  preset?: string;
  startDate?: string;
  endDate?: string;
};

export type DashboardDateFilterResolved = {
  preset: DashboardDatePreset;
  startDate: Date | null;
  endDate: Date | null;
  startDateInput: string;
  endDateInput: string;
  isValid: boolean;
  error?: string;
};

const DAY_END_TIME = { hours: 23, minutes: 59, seconds: 59, ms: 999 };

function isDashboardDatePreset(value: string): value is DashboardDatePreset {
  return DASHBOARD_PRESETS.includes(value as DashboardDatePreset);
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(
    DAY_END_TIME.hours,
    DAY_END_TIME.minutes,
    DAY_END_TIME.seconds,
    DAY_END_TIME.ms,
  );
  return next;
}

function parseDateInput(input?: string): Date | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function resolveDashboardDateFilter(
  input: DashboardDateFilterInput,
): DashboardDateFilterResolved {
  const now = new Date();
  const rawPreset = (input.preset ?? "today").trim();
  const preset = isDashboardDatePreset(rawPreset) ? rawPreset : "today";
  const parsedStart = parseDateInput(input.startDate);
  const parsedEnd = parseDateInput(input.endDate);

  if (preset === "custom") {
    if (!parsedStart || !parsedEnd) {
      return {
        preset,
        startDate: null,
        endDate: null,
        startDateInput: input.startDate ?? "",
        endDateInput: input.endDate ?? "",
        isValid: false,
        error: "Please provide both start and end dates for custom range.",
      };
    }

    const start = startOfDay(parsedStart);
    const end = endOfDay(parsedEnd);
    if (start.getTime() > end.getTime()) {
      return {
        preset,
        startDate: null,
        endDate: null,
        startDateInput: input.startDate ?? "",
        endDateInput: input.endDate ?? "",
        isValid: false,
        error: "Start date cannot be after end date.",
      };
    }

    return {
      preset,
      startDate: start,
      endDate: end,
      startDateInput: input.startDate ?? "",
      endDateInput: input.endDate ?? "",
      isValid: true,
    };
  }

  if (preset === "all") {
    return {
      preset,
      startDate: null,
      endDate: null,
      startDateInput: "",
      endDateInput: "",
      isValid: true,
    };
  }

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  if (preset === "today") {
    return {
      preset,
      startDate: todayStart,
      endDate: todayEnd,
      startDateInput: "",
      endDateInput: "",
      isValid: true,
    };
  }

  if (preset === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      preset,
      startDate: startOfDay(yesterday),
      endDate: endOfDay(yesterday),
      startDateInput: "",
      endDateInput: "",
      isValid: true,
    };
  }

  if (preset === "last7days" || preset === "last30days") {
    const days = preset === "last7days" ? 7 : 30;
    const start = new Date(todayStart);
    start.setDate(start.getDate() - (days - 1));
    return {
      preset,
      startDate: start,
      endDate: todayEnd,
      startDateInput: "",
      endDateInput: "",
      isValid: true,
    };
  }

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    preset: "thisMonth",
    startDate: startOfDay(thisMonthStart),
    endDate: todayEnd,
    startDateInput: "",
    endDateInput: "",
    isValid: true,
  };
}
