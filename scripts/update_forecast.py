"""Fetch one small IBI sea patch + MET Norway and atomically publish a public JSON.
Credentials are accepted through environment variables only. No raw downloads persist.
"""
from __future__ import annotations

import bisect
from datetime import datetime, timedelta, timezone
import json
import math
import os
from pathlib import Path
import sys
import tempfile
import time
from urllib.request import Request, urlopen

class ForecastError(Exception):
    pass


UTC = timezone.utc
LAT, LON = 36.2246, -6.0617
DATASET = "cmems_mod_ibi_wav_anfc_0.027deg_PT1H-i"
VARIABLES = ["VHM0", "VTM02", "VMDR", "VTPK", "VHM0_SW1", "VTM01_SW1", "VMDR_SW1"]
DESTINATION = Path(__file__).resolve().parents[1] / "public/forecast.json"


def iso(value):
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")


def parse_time(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(UTC)


def number(value, minimum=0, maximum=1000):
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return round(result, 3) if math.isfinite(result) and minimum <= result <= maximum else None


def get_met():
    request = Request(
        f"https://api.met.no/weatherapi/locationforecast/2.0/complete?lat={LAT:.4f}&lon={LON:.4f}&altitude=0",
        headers={"User-Agent": "SantaKillaForecast/1.0 https://github.com/Callm3thebreeze/Santa-Killa", "Accept": "application/json"},
    )
    for attempt in range(3):
        try:
            with urlopen(request, timeout=45) as response:
                return json.load(response)
        except Exception:
            if attempt == 2:
                raise ForecastError("MET Norway no disponible; se conserva la previsión anterior") from None
            time.sleep(5 * (attempt + 1))


def met_hours(payload):
    units = payload["properties"]["meta"]["units"]
    if units.get("wind_speed") != "m/s" or units.get("wind_from_direction") != "degrees":
        raise ForecastError("Unidades MET inesperadas")
    if "wind_speed_of_gust" in units and units["wind_speed_of_gust"] != "m/s":
        raise ForecastError("Unidades de rachas inesperadas")
    result = {}
    for entry in payload["properties"]["timeseries"]:
        details = entry["data"]["instant"]["details"]
        speed = number(details.get("wind_speed"))
        gust = number(details.get("wind_speed_of_gust"))
        result[int(parse_time(entry["time"]).timestamp())] = {
            "wind": round(speed * 3.6, 2) if speed is not None else None,
            "windDirection": number(details.get("wind_from_direction"), maximum=360),
            "gusts": round(gust * 3.6, 2) if gust is not None else None,
            "windInterpolated": False,
        }
    if not result:
        raise ForecastError("MET devolvió una serie vacía")
    return result


def wind_at(timestamp, series):
    empty = {"wind": None, "windDirection": None, "gusts": None, "windInterpolated": False}
    if timestamp in series:
        return series[timestamp].copy()
    keys = sorted(series)
    i = bisect.bisect_left(keys, timestamp)
    if not 0 < i < len(keys):
        return empty  # Never extrapolate beyond the provider's time coverage.
    before, after = keys[i - 1], keys[i]
    if after - before > 6 * 3600:
        return empty
    fraction = (timestamp - before) / (after - before)
    result = {**empty, "windInterpolated": True}
    for key in ("wind", "windDirection", "gusts"):
        a, b = series[before][key], series[after][key]
        if a is None or b is None:
            continue
        delta = (b - a + 180) % 360 - 180 if key == "windDirection" else b - a
        value = a + delta * fraction
        result[key] = round(value % 360 if key == "windDirection" else value, 2)
    return result


def extract_waves(dataset):
    """Use one fixed nearest wet cell, never switch cells between forecast hours."""
    import numpy as np
    for name in VARIABLES:
        if name not in dataset:
            raise ForecastError(f"Variable IBI ausente: {name}")
    for name in ("VHM0", "VHM0_SW1"):
        if dataset[name].attrs.get("units") not in ("m", "meter", "metre"):
            raise ForecastError(f"Unidades de altura inesperadas: {name}")
    for name in ("VTM02", "VTPK", "VTM01_SW1"):
        if dataset[name].attrs.get("units") not in ("s", "second", "seconds"):
            raise ForecastError(f"Unidades de periodo inesperadas: {name}")
    for name in ("VMDR", "VMDR_SW1"):
        if dataset[name].attrs.get("units") not in ("degree", "degrees", "degree_true"):
            raise ForecastError(f"Unidades de dirección inesperadas: {name}")
    candidates = []
    for lat in dataset.latitude.values:
        for lon in dataset.longitude.values:
            distance = math.hypot(float(lat) - LAT, (float(lon) - LON) * math.cos(math.radians(LAT))) * 111.2
            point = dataset.sel(latitude=lat, longitude=lon)
            wet = np.isfinite(point.VHM0.values) & np.isfinite(point.VTM02.values) & np.isfinite(point.VMDR.values)
            if distance <= 10 and wet.mean() >= .9:
                candidates.append((distance, float(lat), float(lon)))
    if not candidates:
        raise ForecastError("No hay celda marina válida a menos de 10 km de El Palmar")
    distance, lat, lon = min(candidates)
    point = dataset.sel(latitude=lat, longitude=lon)
    fields = {"height": "VHM0", "period": "VTM02", "direction": "VMDR", "peakPeriod": "VTPK", "swellHeight": "VHM0_SW1", "swellPeriod": "VTM01_SW1", "swellDirection": "VMDR_SW1"}
    hours = []
    for i, stamp in enumerate(point.time.values):
        timestamp = int(stamp.astype("datetime64[s]").astype("int64"))
        row = {"timestamp": timestamp * 1000}
        for key, variable in fields.items():
            row[key] = number(point[variable].isel(time=i).item(), maximum=360 if "irection" in key else 100)
        hours.append(row)
    return hours, {"latitude": lat, "longitude": lon, "distanceKm": round(distance, 2)}


def build_forecast(waves, met, cell, now):
    wind = met_hours(met)
    hours = sorted([{**row, **wind_at(row["timestamp"] // 1000, wind)} for row in waves], key=lambda h: h["timestamp"])
    future = [h for h in hours if h["timestamp"] >= now.timestamp() * 1000 and h["height"] is not None and h["period"] is not None and h["wind"] is not None]
    if len(future) < 24 or len({h["timestamp"] for h in hours}) != len(hours):
        raise ForecastError("Previsión insuficiente o con horas duplicadas; no se publica")
    met_updated = parse_time(met["properties"]["meta"]["updated_at"])
    if now - met_updated > timedelta(hours=24) or met_updated > now + timedelta(minutes=10):
        raise ForecastError("La previsión de MET está desactualizada")
    return {
        "schemaVersion": 1, "generatedAt": iso(now), "status": "ready",
        "spot": {"name": "El Palmar", "latitude": LAT, "longitude": LON, "timezone": "Europe/Madrid", "marineCell": cell},
        "sources": {
            "marine": {"name": "E.U. Copernicus Marine Service", "dataset": DATASET, "url": "https://doi.org/10.48670/moi-00025", "retrievedAt": iso(now), "validUntil": iso(datetime.fromtimestamp(hours[-1]["timestamp"] / 1000, UTC))},
            "weather": {"name": "MET Norway", "url": "https://api.met.no/weatherapi/locationforecast/2.0/", "updatedAt": iso(met_updated), "licence": "CC BY 4.0"},
        },
        "units": {"height": "m", "period": "s", "direction": "degrees_from", "wind": "km/h", "gusts": "km/h"},
        "hours": hours,
    }


def atomic_write(payload, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(payload, ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n"
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=destination.parent, delete=False) as stream:
        temporary = Path(stream.name)
        try:
            stream.write(content)
        except Exception:
            temporary.unlink(missing_ok=True)
            raise
    try:
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)


def main():
    # Check before importing toolbox, avoiding interactive credential prompts in CI.
    if not all(os.environ.get(k) for k in ("COPERNICUSMARINE_SERVICE_USERNAME", "COPERNICUSMARINE_SERVICE_PASSWORD")):
        raise ForecastError("Configura los secretos COPERNICUSMARINE_SERVICE_USERNAME y COPERNICUSMARINE_SERVICE_PASSWORD")
    import copernicusmarine
    now = datetime.now(UTC)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
    dataset = copernicusmarine.open_dataset(
        dataset_id=DATASET, variables=VARIABLES,
        minimum_latitude=LAT - .08, maximum_latitude=LAT + .08,
        minimum_longitude=LON - .08, maximum_longitude=LON + .08,
        start_datetime=iso(start), end_datetime=iso(now + timedelta(days=7)),
        coordinates_selection_method="inside", raise_if_updating=True,
    )
    try:
        dataset.load()
        waves, cell = extract_waves(dataset)
    finally:
        dataset.close()
    payload = build_forecast(waves, get_met(), cell, now)
    atomic_write(payload, DESTINATION)
    print(f"Previsión actualizada: {len(payload['hours'])} horas, celda a {cell['distanceKm']} km")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # Do not print third-party exception strings/tracebacks that may contain tokens.
        message = str(error) if isinstance(error, ForecastError) else "Fallo del proveedor o de conexión"
        print(f"ERROR ({type(error).__name__}): {message}", file=sys.stderr)
        sys.exit(1)
