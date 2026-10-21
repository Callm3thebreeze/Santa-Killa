/** Initial editorial thresholds, pending calibration by El Palmar instructors.
 * Significant model wave height is NOT breaking-wave height at the beach. */
export type Panorama = 'Plato' | 'Principiante' | 'Intermedio' | 'Avanzado' | 'Consultar escuela' | 'Sin datos';
export type SurfHour = {
  timestamp: number;
  height: number | null;
  period: number | null;
  direction: number | null;
  wind: number | null;
  windDirection: number | null;
  gusts: number | null;
  peakPeriod?: number | null;
  swellHeight?: number | null;
  swellPeriod?: number | null;
  swellDirection?: number | null;
  windInterpolated?: boolean;
};
export const thresholds = { flat: 0.3, beginner: 0.8, intermediate: 1.4, maximum: 2, longPeriod: 12, strongWind: 25, strongGusts: 35 };
const valid = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
export function classify(hour: SurfHour): { label: Panorama; reason: string } {
  const { height: h, period: p, wind: w, gusts: g } = hour;
  if (!valid(h) || !valid(p) || !valid(w) || (g !== null && !valid(g)) || h < 0 || p <= 0 || w < 0 || (g !== null && g < 0))
    return { label: 'Sin datos', reason: 'Faltan datos fiables para estimar el nivel.' };
  if (h > thresholds.maximum || w >= thresholds.strongWind || (g !== null && g >= thresholds.strongGusts))
    return { label: 'Consultar escuela', reason: 'Oleaje o viento exigente. La escuela debe valorar la sesión.' };
  if (h < thresholds.flat) return { label: 'Plato', reason: 'Muy poco oleaje previsto; consultar alternativas con la escuela.' };
  let level = h < thresholds.beginner ? 0 : h < thresholds.intermediate ? 1 : 2;
  // Longer periods carry more energy. Escalate one band conservatively.
  if (p >= thresholds.longPeriod) level = Math.min(2, level + 1);
  const missingGusts = g === null ? ' Rachas no disponibles; valoración pendiente de la escuela.' : '';
  return { label: (['Principiante', 'Intermedio', 'Avanzado'] as const)[level], reason: (p >= thresholds.longPeriod ? 'El periodo largo aumenta la energía del mar y eleva la exigencia estimada.' : 'Estimación por altura y periodo, con revisión de viento disponible.') + missingGusts };
}
export function localParts(timestamp: number) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(timestamp));
  const get = (key: string) => parts.find(p => p.type === key)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}
export function cardinal(degrees: number | null) {
  if (!valid(degrees)) return '—';
  return ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(degrees / 45) % 8];
}

export type Forecast = {
  schemaVersion: 1;
  generatedAt: string | null;
  status: 'ready' | 'pending';
  hours: SurfHour[];
};
export function forecastAge(generatedAt: string | null, now = Date.now()) {
  if (!generatedAt) return 'expired';
  const age = now - Date.parse(generatedAt);
  if (!Number.isFinite(age) || age < -5 * 60000 || age > 48 * 3600000) return 'expired';
  return age > 18 * 3600000 ? 'stale' : 'fresh';
}
export function parseForecast(data: unknown): Forecast {
  if (!data || typeof data !== 'object') throw new Error('Previsión inválida');
  const source = data as Record<string, unknown>;
  if (source.schemaVersion !== 1 || !Array.isArray(source.hours) || source.hours.length > 300) throw new Error('Formato de previsión inválido');
  if (source.status === 'pending' && source.generatedAt === null && source.hours.length === 0)
    return { schemaVersion: 1, generatedAt: null, status: 'pending', hours: [] };
  if (source.status !== 'ready' || typeof source.generatedAt !== 'string' || !Number.isFinite(Date.parse(source.generatedAt))) throw new Error('Fecha de previsión inválida');
  let previous = 0;
  const hours = source.hours.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object') throw new Error('Hora inválida');
    const row = raw as Record<string, unknown>;
    if (!valid(row.timestamp) || row.timestamp <= previous) throw new Error('Horas duplicadas o desordenadas');
    previous = row.timestamp;
    const clean: Record<string, number | null | boolean> = { timestamp: row.timestamp };
    for (const key of ['height', 'period', 'direction', 'wind', 'windDirection', 'gusts', 'peakPeriod', 'swellHeight', 'swellPeriod', 'swellDirection']) {
      const n = row[key];
      const maximum = key.toLowerCase().includes('direction') ? 360 : key === 'wind' || key === 'gusts' ? 500 : 100;
      clean[key] = valid(n) && n >= 0 && n <= maximum ? n : null;
    }
    clean.windInterpolated = row.windInterpolated === true;
    return clean as SurfHour;
  });
  if (!hours.length) throw new Error('Previsión vacía');
  return { schemaVersion: 1, generatedAt: source.generatedAt, status: 'ready', hours };
}
export async function loadForecast(): Promise<Forecast> {
  // Same static public file in development and production. No provider credentials
  // or direct requests to external weather services in the browser.
  const response = await fetch('/forecast.json', { cache: 'no-cache', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Previsión no disponible');
  return parseForecast(await response.json());
}
