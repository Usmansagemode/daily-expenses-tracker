// lib/dateUtils.ts
export interface Month {
  label: string;
  short: string;
  value: number; // 0-11
  quarter: number; // 1-4
}

export const MONTHS: Month[] = [
  { label: "January", quarter: 1, short: "Jan", value: 0 },
  { label: "February", quarter: 1, short: "Feb", value: 1 },
  { label: "March", quarter: 1, short: "Mar", value: 2 },
  { label: "April", quarter: 2, short: "Apr", value: 3 },
  { label: "May", quarter: 2, short: "May", value: 4 },
  { label: "June", quarter: 2, short: "Jun", value: 5 },
  { label: "July", quarter: 3, short: "Jul", value: 6 },
  { label: "August", quarter: 3, short: "Aug", value: 7 },
  { label: "September", quarter: 3, short: "Sep", value: 8 },
  { label: "October", quarter: 4, short: "Oct", value: 9 },
  { label: "November", quarter: 4, short: "Nov", value: 10 },
  { label: "December", quarter: 4, short: "Dec", value: 11 },
] as const;

// Utility functions
export const getMonthLabels = (): string[] => MONTHS.map((m) => m.label);
export const getShortMonthLabels = (): string[] => MONTHS.map((m) => m.short);
export const getMonthValues = (): number[] => MONTHS.map((m) => m.value);

export const getMonthByValue = (value: number): Month | undefined =>
  MONTHS.find((month) => month.value === value);

export const getMonthByLabel = (label: string): Month | undefined =>
  MONTHS.find((month) => month.label === label);

export const getCurrentMonth = (): Month => {
  const currentMonth = new Date().getMonth();
  return MONTHS[currentMonth];
};

// For your year options too
export const getYearOptions = (range: number = 10): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: range + 1 }, (_, i) => currentYear - range + i);
};
