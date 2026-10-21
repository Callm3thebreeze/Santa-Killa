import { cardinal, classify, forecastAge, loadForecast, localParts, type SurfHour } from '../lib/surf';
import { pricing } from '../data/pricing';

const root = document.querySelector<HTMLElement>('[data-surf-booking]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-booking-form]')!;
  const date = form.elements.namedItem('date') as HTMLInputElement;
  const hour = form.elements.namedItem('hour') as HTMLSelectElement;
  const level = form.elements.namedItem('level') as HTMLSelectElement;
  const people = form.elements.namedItem('people') as HTMLInputElement;
  const lesson = form.elements.namedItem('lesson') as HTMLSelectElement;
  const status = root.querySelector<HTMLElement>('[data-forecast-status]')!;
  const days = root.querySelector<HTMLElement>('[data-days]')!;
  const rows = root.querySelector<HTMLElement>('[data-forecast-rows]')!;
  const advice = root.querySelector<HTMLElement>('[data-advice]')!;
  const retry = root.querySelector<HTMLButtonElement>('[data-retry]')!;
  const review = root.querySelector<HTMLElement>('[data-booking-review]')!;
  const link = root.querySelector<HTMLAnchorElement>('[data-booking-link]')!;
  const waveHour = root.querySelector<HTMLInputElement>('[data-wave-hour]')!;
  const today = () => localParts(Date.now()).date;
  date.min = today();
  date.value = today();
  let forecast: SurfHour[] = [];
  let generatedAt: string | null = null;
  let selectedDate = date.value;
  const readableDate = (value: string) => new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00Z`));
  const format = (value: number | null, unit: string) => value === null ? '—' : `${value.toLocaleString('es-ES', { maximumFractionDigits: 1 })} ${unit}`;
  const selectedForecast = () => forecast.find(item => {
    const local = localParts(item.timestamp);
    return local.date === date.value && local.hour === Number(hour.value.slice(0, 2));
  });
  function update(syncWave = true) {
    review.hidden = true;
    const minimum = date.value === today() ? Date.now() : 0;
    for (const option of hour.options) {
      // Compare Madrid wall time without depending on the visitor's timezone.
      const now = localParts(minimum || Date.now());
      option.disabled = minimum > 0 && Number(option.value.slice(0, 2)) <= now.hour;
    }
    if (hour.selectedOptions[0]?.disabled) hour.value = Array.from(hour.options).find(o => !o.disabled)?.value ?? '';
    hour.setCustomValidity(hour.value ? '' : 'No quedan horas para hoy. Elige otro día.');
    const selected = selectedForecast();
    if (syncWave && hour.value) waveHour.value = String(Number(hour.value.slice(0, 2)));
    const visualForecast = forecast.find(item => {
      const local = localParts(item.timestamp);
      return local.date === date.value && local.hour === Number(waveHour.value);
    });
    updateWave(visualForecast);
    if (!selected) {
      advice.textContent = 'Sin previsión disponible para esta hora. Puedes consultar la sesión con la escuela.';
    } else {
      const result = classify(selected);
      const mismatch = ['Principiante', 'Intermedio', 'Avanzado'].indexOf(result.label) > ['Principiante', 'Intermedio', 'Avanzado'].indexOf(level.value);
      advice.textContent = `${result.label} · ${result.reason}${mismatch ? ' La exigencia prevista supera tu nivel. Solicita una alternativa al monitor.' : ''} La escuela confirma si es adecuado para ti.`;
    }
    const price = pricing[lesson.value === 'privada' ? 1 : 0].price;
    root!.querySelector<HTMLElement>('[data-price]')!.textContent = lesson.value === 'privada' ? `${price} · referencia para clase privada; confirmar precio del grupo` : `${price} · 1 h 30 min · total orientativo ${35 * (Number(people.value) || 1)} €`;
  }
  function updateWave(selected: SurfHour | undefined) {
    const visualTime = `${waveHour.value.padStart(2, '0')}:00`;
    waveHour.setAttribute('aria-valuetext', `${visualTime}, hora de El Palmar`);
    root!.querySelector<HTMLOutputElement>('[data-wave-time]')!.value = visualTime;
    const summary = root!.querySelector<HTMLElement>('[data-surf-summary]')!;
    const result = selected ? classify(selected) : { label: 'Sin datos' as const };
    summary.dataset.level = result.label;
    root!.querySelector<HTMLElement>('[data-wave-date]')!.textContent = date.value ? readableDate(date.value) : 'Elige un día';
    const copy = {
      'Plato': ['El mar está casi plano', 'Se espera muy poco oleaje. Consulta con la escuela si se puede dar clase o elegir otro momento.'],
      'Principiante': ['Olas pequeñas · principiante', 'Un panorama de olas pequeñas para iniciarse. El monitor valorará el viento y la zona de práctica.'],
      'Intermedio': ['Mar con más energía · intermedio', 'La sesión puede exigir más control de la tabla y experiencia cogiendo olas.'],
      'Avanzado': ['Mar exigente · avanzado', 'Se prevé una sesión para surfistas con experiencia. Consulta las condiciones con el equipo.'],
      'Consultar escuela': ['Mar para valorar con el equipo', 'El oleaje o el viento son exigentes. Habla con la escuela antes de elegir tu sesión.'],
      'Sin datos': ['Sin previsión para esta hora', 'Puedes solicitar tu clase y preguntar al equipo por las condiciones.'],
    }[result.label];
    root!.querySelector<HTMLElement>('[data-wave-level]')!.textContent = copy[0];
    root!.querySelector<HTMLElement>('[data-wave-copy]')!.textContent = copy[1];
    const hasHeight = selected?.height !== null && selected?.height !== undefined && Number.isFinite(selected.height) && selected.height >= 0;
    root!.querySelector('[data-wave-art]')!.setAttribute('visibility', hasHeight ? 'visible' : 'hidden');
    root!.querySelector<HTMLElement>('[data-wave-empty]')!.hidden = hasHeight;
    if (hasHeight && selected) {
      const height = selected.height!;
      // Illustration only: bounded for legibility, not an absolute physical scale.
      const scale = height < .3 ? Math.max(.04, height / 2) : .4 + .6 * Math.min(1, height / 2);
      const top = 180 - 137 * scale;
      root!.querySelector('[data-wave-shape]')!.setAttribute('transform', `translate(0 ${180 * (1 - scale)}) scale(1 ${scale})`);
      root!.querySelector('[data-wave-ruler]')!.setAttribute('y1', String(top));
      root!.querySelector('[data-wave-ruler-top]')!.setAttribute('d', `M56 ${top} H68`);
      const label = root!.querySelector('[data-wave-height]')!;
      label.setAttribute('y', String(Math.max(30, top - 12)));
      label.textContent = format(height, 'm');
      root!.querySelector('[data-wave-description]')!.textContent = `Altura estimada del oleaje: ${format(height, 'metros')}. ${copy[0]}. Dibujo orientativo.`;
    } else {
      root!.querySelector('[data-wave-description]')!.textContent = 'Sin datos de altura para esta hora.';
    }
  }
  waveHour.addEventListener('input', () => {
    const time = `${waveHour.value.padStart(2, '0')}:00`;
    const option = Array.from(hour.options).find(o => o.value === time && !o.disabled);
    if (option) hour.value = time;
    update(false);
  });
  function render() {
    days.replaceChildren();
    for (const day of [...new Set(forecast.map(item => localParts(item.timestamp).date))].filter(day => day >= today())) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = readableDate(day);
      button.setAttribute('aria-pressed', String(day === selectedDate));
      button.addEventListener('click', () => {
        selectedDate = day;
        date.value = day;
        if (day > today()) { hour.value = '09:00'; waveHour.value = '9'; }
        render(); update(false);
      });
      days.append(button);
    }
    rows.replaceChildren();
    for (const item of forecast.filter(item => {
      const local = localParts(item.timestamp);
      return local.date === selectedDate && local.hour >= 9 && local.hour <= 19 && item.timestamp > Date.now();
    })) {
      const result = classify(item);
      const tr = document.createElement('tr');
      const values = [`${String(localParts(item.timestamp).hour).padStart(2, '0')}:00`, result.label, `${format(item.height, 'm')} / ${cardinal(item.direction)}`, format(item.period, 's'), `${format(item.wind, 'km/h')} / ${cardinal(item.windDirection)}`, format(item.gusts, 'km/h')];
      values.forEach((value, index) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        if (index === 1) { cell.dataset.panorama = result.label; cell.title = result.reason; }
        tr.append(cell);
      });
      rows.append(tr);
    }
    if (!rows.children.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.textContent = 'No hay previsión de próximas horas para este día.';
      tr.append(td); rows.append(tr);
    }
  }
  async function refresh() {
    retry.hidden = true;
    status.textContent = 'Consultando oleaje y viento…';
    try {
      const data = await loadForecast();
      generatedAt = data.generatedAt;
      const age = forecastAge(generatedAt);
      forecast = age === 'expired' ? [] : data.hours;
      if (data.status === 'pending') {
        status.textContent = 'La primera previsión está pendiente de descarga. Puedes consultar las condiciones con la escuela.';
      } else if (age === 'expired') {
        status.textContent = 'La previsión ha caducado. Consulta las condiciones actuales con la escuela.';
      } else {
        const updated = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(generatedAt!));
        status.textContent = `${age === 'stale' ? 'Actualización pendiente · última previsión' : 'Previsión actualizada'}: ${updated}. ${age === 'stale' ? 'Datos antiguos: confirma las condiciones con la escuela.' : 'Descarga programada cada 6 horas.'}`;
      }
    } catch {
      forecast = [];
      generatedAt = null;
      status.textContent = 'No se ha podido consultar la previsión. Puedes solicitar información a la escuela.';
      retry.hidden = false;
    }
    render(); update();
  }
  retry.addEventListener('click', refresh);
  form.addEventListener('input', () => {
    if (date.value !== selectedDate && date.value > today()) hour.value = '09:00';
    selectedDate = date.value;
    render(); update();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    date.min = today();
    update();
    if (!form.reportValidity()) return;
    // Use the data generation time, never the visitor's fetch time.
    const selected = forecastAge(generatedAt) === 'fresh' ? selectedForecast() : undefined;
    const panorama = selected ? classify(selected).label : 'Sin previsión actual disponible';
    const summary = `${readableDate(date.value)} (${date.value}), ${hour.value} (hora de El Palmar). Clase ${lesson.value === 'privada' ? 'privada' : 'en grupo'}, ${people.value} persona(s), nivel ${level.value}.`;
    root!.querySelector<HTMLElement>('[data-booking-summary]')!.textContent = summary;
    const message = `¡Hola, Santa Killa! Quiero solicitar una clase de surf.\n${summary}\nPanorama orientativo: ${panorama}.\n¿Podéis confirmar disponibilidad, condiciones y precio? Entiendo que esta solicitud está pendiente de vuestra confirmación.`;
    const url = new URL(root!.dataset.whatsapp!);
    url.searchParams.set('text', message);
    link.href = url.toString();
    review.hidden = false;
    link.focus();
  });
  update();
  void refresh();
  // Re-check both updates and expiry for visitors who keep the page open.
  window.setInterval(() => { if (!document.hidden) void refresh(); }, 15 * 60000);
}
