import { describe, expect, it } from "vitest";

import { calculateMetrics, DEMO_DATA, makeDonationFromMeal, type MealRecord } from "@/lib/foodwise";

describe("FoodWise demo metrics and donation safety", () => {
  it("keeps surplus listed, confirmed collected, and kitchen waste as separate measures", () => {
    const metrics = calculateMetrics(DEMO_DATA);

    expect(metrics.listedKg).toBe(45);
    expect(metrics.collectedKg).toBe(20);
    expect(metrics.wastedKg).toBeCloseTo(36.8, 8);
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

    expect(makeDonationFromMeal(meal, false, "Kitchen", "Main gate", "Desk", "2026-11-11T12:00", "2026-11-11T16:00")).toBeNull();
    expect(makeDonationFromMeal({ ...meal, wastedKg: null }, true, "Kitchen", "Main gate", "Desk", "2026-11-11T12:00", "2026-11-11T16:00")).toBeNull();
    expect(makeDonationFromMeal({ ...meal, wastedKg: 0 }, true, "Kitchen", "Main gate", "Desk", "2026-11-11T12:00", "2026-11-11T16:00")).toBeNull();
    expect(makeDonationFromMeal(meal, true, "Kitchen", "Main gate", "Desk", "2026-11-11T12:00", "2026-11-11T16:00")?.quantity).toBe(2.5);
  });
});