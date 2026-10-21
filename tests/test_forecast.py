import importlib.util
import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path
import tempfile
import unittest

import numpy as np
import xarray as xr

spec = importlib.util.spec_from_file_location('forecast', Path(__file__).resolve().parents[1] / 'scripts/update_forecast.py')
f = importlib.util.module_from_spec(spec)
spec.loader.exec_module(f)
NOW = datetime(2026, 10, 21, 12, tzinfo=timezone.utc)


def met_payload():
    return {'properties': {'meta': {'updated_at': f.iso(NOW), 'units': {'wind_speed': 'm/s', 'wind_from_direction': 'degrees'}}, 'timeseries': [
        {'time': f.iso(NOW + timedelta(hours=h)), 'data': {'instant': {'details': {'wind_speed': 5, 'wind_from_direction': 350 if h == 0 else 10}}}}
        for h in range(0, 49, 6)
    ]}}


class ForecastTests(unittest.TestCase):
    def test_met_units_missing_gusts_and_interpolation(self):
        series = f.met_hours(met_payload())
        point = f.wind_at(int((NOW + timedelta(hours=3)).timestamp()), series)
        self.assertEqual(point['wind'], 18)
        self.assertEqual(point['windDirection'], 0)
        self.assertIsNone(point['gusts'])
        self.assertTrue(point['windInterpolated'])
        self.assertIsNone(f.wind_at(int((NOW - timedelta(hours=1)).timestamp()), series)['wind'])
        del series[int((NOW + timedelta(hours=6)).timestamp())]
        self.assertIsNone(f.wind_at(int((NOW + timedelta(hours=3)).timestamp()), series)['wind'])

    def test_bad_units_fail(self):
        payload = met_payload()
        payload['properties']['meta']['units']['wind_speed'] = 'km/h'
        with self.assertRaises(f.ForecastError):
            f.met_hours(payload)

    def test_one_fixed_wet_cell_not_land(self):
        times = np.arange('2026-10-21T00', '2026-10-23T00', dtype='datetime64[h]')
        data = np.ones((48, 1, 2))
        data[:, 0, 0] = np.nan  # Nearest cell is land; next is sea.
        dataset = xr.Dataset({name: (('time', 'latitude', 'longitude'), data.copy()) for name in f.VARIABLES}, coords={'time': times, 'latitude': [f.LAT], 'longitude': [f.LON, f.LON - .027]})
        for name in f.VARIABLES:
            dataset[name].attrs['units'] = 'degree' if name.startswith('VMDR') else 's' if name.startswith('VT') else 'm'
        waves, cell = f.extract_waves(dataset)
        self.assertEqual(cell['longitude'], f.LON - .027)
        self.assertEqual(len(waves), 48)
        self.assertEqual(waves[0]['period'], 1)
        self.assertLess(cell['distanceKm'], 10)

    def test_output_validation_and_atomic_preservation(self):
        waves = [{'timestamp': int((NOW + timedelta(hours=h)).timestamp() * 1000), 'height': .6, 'period': 8} for h in range(48)]
        payload = f.build_forecast(waves, met_payload(), {'latitude': f.LAT, 'longitude': f.LON}, NOW)
        self.assertEqual(payload['hours'][0]['wind'], 18)
        with tempfile.TemporaryDirectory() as folder:
            dest = Path(folder) / 'forecast.json'
            f.atomic_write(payload, dest)
            prior = dest.read_bytes()
            with self.assertRaises(ValueError):
                f.atomic_write({'invalid': math.nan}, dest)
            self.assertEqual(dest.read_bytes(), prior)
            self.assertEqual(json.loads(prior)['schemaVersion'], 1)
        with self.assertRaises(f.ForecastError):
            f.build_forecast(waves[:5], met_payload(), {}, NOW)
        stale = met_payload()
        stale['properties']['meta']['updated_at'] = f.iso(NOW - timedelta(days=2))
        with self.assertRaises(f.ForecastError):
            f.build_forecast(waves, stale, {}, NOW)


if __name__ == '__main__':
    unittest.main()
