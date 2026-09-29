import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { earthMonthlyThermalReference as monthly } from "../../fixtures/earth-thermal/monthly-reference.js";
import { earthThermalReference as annual } from "../../fixtures/earth-thermal/reference.js";

describe("monthly NOAA evidence for the unchanged annual cohort", () => {
  it("pins both fixtures without replacing the annual payload or source admission", () => {
    const digest = (name: string) =>
      createHash("sha256")
        .update(readFileSync(new URL(`../../fixtures/earth-thermal/${name}`, import.meta.url)))
        .digest("hex");
    expect(digest("noaa-low-relief-land.json")).toBe(
      "8540f4a8864fe3bd240b6038a7251bfdd4be2f6033880c386c7c412d67848a20"
    );
    expect(digest("monthly-low-relief-land.json")).toBe(
      "cdc4f1dd74a3ec6f9f92a55307ac273902a3f83ba34f010df372ce50dbf71a1f"
    );
    expect(monthly.annualFixture).toEqual({
      file: "noaa-low-relief-land.json",
      sha256: digest("noaa-low-relief-land.json"),
    });
    expect(monthly.sources).toEqual(annual.sources);
    expect(monthly.sourceGrid).toEqual(annual.sourceGrid);
    expect(monthly.selection).toEqual(annual.selection);
    expect(monthly.split).toEqual(annual.split);
    expect(monthly.period).toEqual(annual.period);
    expect(monthly.units.modelReliefConversion).toBe("none");
    expect(monthly.units.monthlyTemperature).toContain("not instantaneous");
    expect(monthly.solarAlignment).toContain("none");
  });

  it("retains the exact cells, order, heights, weights and splits with Jan-Dec source means", () => {
    expect(monthly.samples).toHaveLength(411);
    expect(monthly.samples.filter((sample) => sample.split === "train")).toHaveLength(196);
    expect(monthly.samples.filter((sample) => sample.split === "holdout")).toHaveLength(215);
    expect(
      new Set(monthly.samples.map((sample) => `${sample.sourceRow}:${sample.sourceColumn}`)).size
    ).toBe(411);
    for (const [index, sample] of monthly.samples.entries()) {
      const { longitudeDegreesEast, monthlyAirTemperatureC, ...originalSample } = sample;
      expect(originalSample).toEqual(annual.samples[index]!);
      expect(longitudeDegreesEast).toBe(
        sample.sourceColumn * annual.sourceGrid.longitudeStepDegrees
      );
      expect(longitudeDegreesEast).toBeGreaterThanOrEqual(0);
      expect(longitudeDegreesEast).toBeLessThan(360);
      expect(monthlyAirTemperatureC).toHaveLength(12);
      expect(monthlyAirTemperatureC.every(Number.isFinite)).toBe(true);
      expect(Math.min(...monthlyAirTemperatureC)).toBeGreaterThanOrEqual(150 - 273.15);
      expect(Math.max(...monthlyAirTemperatureC)).toBeLessThanOrEqual(400 - 273.15);
    }
  });

  it("recomputes every frozen annual mean and monthly range from the retained months", () => {
    const weights = monthly.period.monthWeightsDays;
    const yearDays = weights.reduce((sum, days) => sum + days, 0);
    for (const sample of monthly.samples) {
      const reconstructedAnnual =
        sample.monthlyAirTemperatureC.reduce(
          (sum, temperature, index) => sum + temperature * weights[index]!,
          0
        ) / yearDays;
      expect(reconstructedAnnual).toBe(sample.annualAirTemperatureC);
      expect(
        Math.max(...sample.monthlyAirTemperatureC) - Math.min(...sample.monthlyAirTemperatureC)
      ).toBe(sample.monthlyAirTemperatureRangeC);
    }
  });

  it("distinguishes source month labels from Gregorian aggregation weights and solar instants", () => {
    expect(monthly.months.map(({ number }) => number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(monthly.months.map(({ name }) => name)).toEqual([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]);
    for (const [index, month] of monthly.months.entries()) {
      let days = 0;
      for (let year = 1991; year <= 2020; year++) {
        days += new Date(Date.UTC(year, month.number, 0)).getUTCDate();
      }
      expect(month.totalDaysInPeriod).toBe(days);
      expect(monthly.period.monthWeightsDays[index]).toBe(days / 30);
    }
    expect(monthly.months.reduce((sum, month) => sum + month.totalDaysInPeriod, 0)).toBe(10958);
    expect(monthly.sourceTime.calendarAttribute).toBeNull();
    expect(monthly.period.calendar).toBe("Gregorian");
    expect(monthly.sourceTime.interpretedActualRange).toBe(
      "0001/01/01 00:00:00 - 0001/12/01 00:00:00"
    );
    expect(monthly.sourceTime.monthStartOffsetsDays).toEqual([
      0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
    ]);
    expect(
      monthly.sourceTime.valuesHours.map((time) => (time - monthly.sourceTime.valuesHours[0]!) / 24)
    ).toEqual(monthly.sourceTime.monthStartOffsetsDays);
    expect(monthly.sourceTime.climatologyBoundsHours).toHaveLength(12);
    expect(
      monthly.sourceTime.climatologyBoundsHours.every(
        (bounds) => bounds.length === 2 && bounds[0]! < bounds[1]!
      )
    ).toBe(true);
  });
});
