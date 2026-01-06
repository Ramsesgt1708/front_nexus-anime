export function formatDateLocal(value?: string | null, locale = 'es-MX') {
  if (!value) return 'Sin fecha';
  const hasTZ = /Z|[+-]\d{2}:?\d{2}$/.test(value);
  const source = hasTZ ? value : `${value}Z`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(source));
}