"""Extract the frozen diagnostic cohort from three locally pinned NOAA NetCDF files."""

import argparse
import calendar
import hashlib
import json
from pathlib import Path

import h5py
import numpy as np

BASE_URL = "https://psl.noaa.gov/thredds/fileServer/Datasets/ncep.reanalysis/Monthlies/surface_gauss/"
SOURCES = [
    ("air.2m.mon.ltm.1991-2020.nc", 964084, "c86a3c575010ca2c9414b24022361c43be6966dcdc62c821c1918e9c44ca9be9"),
    ("hgt.sfc.gauss.nc", 55502, "0862a41820743c04e94c89b0475d734232f517431951dd9d413658e87d6f5d88"),
    ("lsmask.19294.nc", 26896, "e3a662d0421dd70d5a18ca1404495fb3eedf75d21472f648e91669dee64097dc"),
]


def extract(source_directory):
    for name, size, digest in SOURCES:
        content = (source_directory / name).read_bytes()
        if len(content) != size or hashlib.sha256(content).hexdigest() != digest:
            raise ValueError(f"Source pin mismatch: {name}")

    with h5py.File(source_directory / SOURCES[0][0], "r") as source:
        latitude = source["lat"][:].astype(np.float64)
        longitude = source["lon"][:].astype(np.float64)
        assert source["air"].attrs["units"] == b"degK"
        assert np.all(source["air"].attrs["scale_factor"] == 1)
        assert np.all(source["air"].attrs["add_offset"] == 0)
        temperature_c = source["air"][:].astype(np.float64) - 273.15
        assert np.all(source["valid_yr_count"][:] == 30)
        assert np.all(np.isfinite(temperature_c))
        assert np.all((temperature_c >= 150 - 273.15) & (temperature_c <= 400 - 273.15))
    with h5py.File(source_directory / SOURCES[1][0], "r") as source:
        assert np.array_equal(latitude, source["lat"][:])
        assert np.array_equal(longitude, source["lon"][:])
        assert source["hgt"].attrs["units"] == b"m"
        height_m = source["hgt"][0].astype(np.float64)
    with h5py.File(source_directory / SOURCES[2][0], "r") as source:
        assert np.array_equal(latitude, source["lat"][:])
        assert np.array_equal(longitude, source["lon"][:])
        source_mask = source["lsmask"][0]

    assert temperature_c.shape == (12, 94, 192)
    assert set(np.unique(source_mask).tolist()) == {-1.0, 0.0}
    for lat, lon, expected in [(25, 15, -1), (-5, -60, -1), (60, 100, -1),
                               (0, -150, 0), (0, -30, 0), (-20, 80, 0)]:
        row = np.argmin(abs(latitude - lat))
        column = np.argmin(abs(longitude - lon % 360))
        assert source_mask[row, column] == expected

    roots, gaussian_weights = np.polynomial.legendre.leggauss(len(latitude))
    assert np.max(abs(latitude - np.degrees(np.arcsin(roots[::-1])))) < 0.0001
    weights = np.broadcast_to(gaussian_weights[::-1, None], height_m.shape)
    month_days = np.array([
        sum(calendar.monthrange(year, month)[1] for year in range(1991, 2021)) / 30
        for month in range(1, 13)
    ], dtype=np.float64)
    annual_c = np.average(temperature_c, axis=0, weights=month_days)
    monthly_range_c = np.ptp(temperature_c, axis=0)

    land = source_mask == -1
    interior = land.copy()
    neighboring_heights = []
    for dy in [-1, 0, 1]:
        for dx in [-1, 0, 1]:
            interior &= np.roll(np.roll(land, dy, axis=0), dx, axis=1)
            neighboring_heights.append(np.roll(np.roll(height_m, dy, axis=0), dx, axis=1))
    interior[0] = False
    interior[-1] = False
    relief_m = np.max(neighboring_heights, axis=0) - np.min(neighboring_heights, axis=0)
    selected = interior & (abs(height_m) <= 250) & (relief_m <= 250)

    samples = []
    for row, column in zip(*np.nonzero(selected)):
        absolute_latitude = abs(latitude[row])
        training = absolute_latitude < 15 or 30 <= absolute_latitude < 45 or 60 <= absolute_latitude < 75
        samples.append({
            "sourceRow": int(row),
            "sourceColumn": int(column),
            "latitudeDegrees": float(latitude[row]),
            "areaWeight": float(weights[row, column]),
            "sourceHeightM": float(height_m[row, column]),
            "sourceNeighborhoodReliefM": float(relief_m[row, column]),
            "annualAirTemperatureC": float(annual_c[row, column]),
            "monthlyAirTemperatureRangeC": float(monthly_range_c[row, column]),
            "split": "train" if training else "holdout",
        })

    return {
        "schemaVersion": 1,
        "referenceKind": "NCEP-NCAR Reanalysis 1 monthly 2m air-temperature climatology; not raw observations",
        "sources": [{"file": name, "bytes": size, "sha256": digest, "url": BASE_URL + name}
                    for name, size, digest in SOURCES],
        "sourceGrid": {"rows": 94, "columns": 192, "longitudeStepDegrees": 1.875,
                       "areaWeight": "94-point Gaussian quadrature weight per source cell; equal longitude widths cancel"},
        "units": {"sourceTemperature": "K", "referenceTemperature": "C", "temperatureOffset": -273.15,
                  "sourceHeight": "geopotential m", "modelReliefConversion": "none"},
        "period": {"firstYear": 1991, "lastYear": 2020, "calendar": "Gregorian",
                   "monthWeightsDays": month_days.tolist(),
                   "aggregation": "Day-weighted monthly-climatology approximation, not recovered daily data"},
        "selection": {"landMaskValue": -1, "requireLand3x3": True,
                      "maxAbsoluteSourceHeightM": 250, "maxSourceNeighborhoodReliefM": 250},
        "split": {"trainAbsoluteLatitudeBands": [[0, 15], [30, 45], [60, 75]],
                  "holdoutAbsoluteLatitudeBands": [[15, 30], [45, 60]], "bounds": "inclusive lower, exclusive upper"},
        "samples": samples,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_directory", type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("noaa-low-relief-land.json"))
    args = parser.parse_args()
    result = extract(args.source_directory)
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(f"Extracted {len(result['samples'])} pinned source cells to {args.output}")
