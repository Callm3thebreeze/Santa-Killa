import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import ts from 'typescript';
const compiled = ts.transpileModule(readFileSync(new URL('../src/lib/surf.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('exports', 'require', 'module', compiled)(mod.exports, createRequire(import.meta.url), mod);
const { classify, localParts, parseForecast, forecastAge } = mod.exports;
const hour = { timestamp: 0, height: .5, period: 8, wind: 10, gusts: 15, direction: 270, windDirection: 90 };
test('missing and invalid data never recommend a level', () => {
  for (const key of ['height', 'period', 'wind']) {
    for (const value of [null, NaN, Infinity, -1]) assert.equal(classify({ ...hour, [key]: value }).label, 'Sin datos');
  }
});
test('strong wind, gusts and large swell override small-wave labels', () => {
  assert.equal(classify({ ...hour, height: .1, gusts: 35 }).label, 'Consultar escuela');
  assert.equal(classify({ ...hour, wind: 25 }).label, 'Consultar escuela');
  assert.equal(classify({ ...hour, height: 2.1 }).label, 'Consultar escuela');
});
test('threshold boundaries and period energy escalation', () => {
  for (const [height, label] of [[.29,'Plato'],[.3,'Principiante'],[.8,'Intermedio'],[1.4,'Avanzado'],[2,'Avanzado']]) assert.equal(classify({ ...hour, height }).label, label);
  assert.equal(classify({ ...hour, period: 12 }).label, 'Intermedio');
});
test('Madrid dates and hours across daylight saving transition', () => {
  assert.deepEqual(localParts(Date.parse('2026-10-24T22:00:00Z')), { date: '2026-10-25', hour: 0 });
  assert.deepEqual(localParts(Date.parse('2026-10-25T08:00:00Z')), { date: '2026-10-25', hour: 9 });
});
test('missing gusts remain unknown while invalid gusts never recommend a level', () => {
  const result = classify({ ...hour, gusts: null });
  assert.equal(result.label, 'Principiante');
  assert.match(result.reason, /Rachas no disponibles/);
  assert.equal(classify({ ...hour, gusts: -1 }).label, 'Sin datos');
  assert.equal(classify({ ...hour, gusts: NaN }).label, 'Sin datos');
});
test('static JSON validation rejects duplicates and sanitizes missing fields', () => {
  const payload = { schemaVersion: 1, status: 'ready', generatedAt: '2026-10-21T12:00:00Z', hours: [{ ...hour, timestamp: 1792584000000, gusts: undefined }] };
  assert.equal(parseForecast(payload).hours[0].gusts, null);
  assert.throws(() => parseForecast({ ...payload, hours: [...payload.hours, ...payload.hours] }));
  assert.throws(() => parseForecast({ ...payload, schemaVersion: 2 }));
  assert.equal(parseForecast({ schemaVersion: 1, status: 'pending', generatedAt: null, hours: [] }).status, 'pending');
});
test('age uses generation time and rejects expired/future/invalid forecasts', () => {
  const now = Date.parse('2026-10-21T12:00:00Z');
  assert.equal(forecastAge('2026-10-21T06:00:00Z', now), 'fresh');
  assert.equal(forecastAge('2026-10-20T12:00:00Z', now), 'stale');
  for (const date of [null, 'bad', '2026-10-19T11:00:00Z', '2026-10-21T13:00:00Z']) assert.equal(forecastAge(date, now), 'expired');
});
