const FORTALEZA_TIME_ZONE = 'America/Fortaleza';

const toDate = (value: Date | string | number): Date =>
  value instanceof Date ? value : new Date(value);

const monthDayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
});

const businessDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: FORTALEZA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: FORTALEZA_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: FORTALEZA_TIME_ZONE,
});

export function formatMonthDayBR(value: string): string {
  return monthDayFormatter.format(new Date(`${value}T12:00:00`));
}

export function getBusinessDateFortaleza(value = new Date()): string {
  return businessDateFormatter.format(value);
}

export function formatDate(value: Date | string | number): string {
  return dateFormatter.format(toDate(value));
}

export function formatTime(value: Date | string | number): string {
  return timeFormatter.format(toDate(value));
}

export function formatDateTime(value: Date | string | number): string {
  const date = toDate(value);
  return `${formatDate(date)} ${formatTime(date)}`;
}
