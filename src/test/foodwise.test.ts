import { describe, expect, it } from "vitest";

import { calculateMetrics, DEMO_DATA, makeDonationFromMeal, type MealRecord } from "@/lib/foodwise";

describe("FoodWise demo metrics and donation safety", () => {
  it("keeps surplus listed, confirmed collected, and kitchen waste as separate measures", () => {
    const metrics = calculateMetrics(DEMO_DATA);

    expect(metrics.listedKg).toBe(45);
    expect(metrics.collectedKg).toBe(20);
    expect(metrics.wastedKg).toBeCloseTo(36.8, 8);
    expect(metrics.consumedKg).toBeNull();
    expect(metrics.successfulDonations).toBe(2);
  });

  it("does not create a donation unless measured surplus is explicitly confirmed safe", () => {
    const meal: MealRecord = {
      id: "test-meal",
      date: "2026-11-11",
      mealType: "Lunch",
      menuItems: "Rice and dal",
      expectedStudents: 100,
      peopleServed: 90,
      preparedKg: 20,
      wastedKg: 2.5,
      context: "",
      specialEvent: "",
    };

    const listingDetails = ["Kitchen", "Main gate", "Desk", "2026-11-11T12:00", "2026-11-11T16:00", "Refrigerated", "None declared", "1:00–3:00 pm"] as const;
    expect(makeDonationFromMeal(meal, false, 2.5, ...listingDetails)).toBeNull();
    expect(makeDonationFromMeal(meal, true, null, ...listingDetails)).toBeNull();
    expect(makeDonationFromMeal(meal, true, 0, ...listingDetails)).toBeNull();
    expect(makeDonationFromMeal(meal, true, 1.2, ...listingDetails)?.quantity).toBe(1.2);
    expect(makeDonationFromMeal(meal, true, 1.2, ...listingDetails)?.quantity).not.toBe(meal.wastedKg);
  });

  it("keeps explicit consumed-weight totals separate and blank until measured", () => {
    const meal = { ...DEMO_DATA.meals[0], consumedKg: 62 };
    const metrics = calculateMetrics({ meals: [meal], donations: [] });

    expect(metrics.consumedKg).toBe(62);
    expect(metrics.wastedKg).toBe(8.2);
  });
});