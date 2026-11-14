export type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";
export type FoodCategory = "Cooked food" | "Packaged food" | "Vegetables" | "Fruits" | "Other";
export type DonationStatus = "Available" | "Claimed" | "Collected" | "Expired" | "Cancelled";

export type MealRecord = {
  id: string;
  date: string;
  mealType: MealType;
  menuItems: string;
  expectedStudents: number | null;
  peopleServed: number | null;
  preparedKg: number | null;
  consumedKg?: number | null;
  wastedKg: number | null;
  context: string;
  specialEvent: string;
  demo?: boolean;
};

export type Donation = {
  id: string;
  donor: string;
  foodName: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: "kg" | "portions";
  preparedAt: string;
  deadline: string;
  storage: string;
  allergens: string;
  location: string;
  pickupWindow: string;
  contact: string;
  receiver: string;
  status: DonationStatus;
  demo?: boolean;
};

export type FoodWiseData = { meals: MealRecord[]; donations: Donation[] };

export const STORAGE_KEY = "foodwise-prototype-v1";

export const DEMO_DATA: FoodWiseData = {
  meals: [
    { id: "m-1", date: "2026-11-11", mealType: "Lunch", menuItems: "Steamed rice, dal, mixed vegetables", expectedStudents: 420, peopleServed: 397, preparedKg: 82, wastedKg: 8.2, context: "Warm, clear", specialEvent: "", demo: true },
    { id: "m-2", date: "2026-11-10", mealType: "Dinner", menuItems: "Chapati, paneer curry, salad", expectedStudents: 380, peopleServed: 354, preparedKg: 71, wastedKg: 5.8, context: "", specialEvent: "Cultural evening", demo: true },
    { id: "m-3", date: "2026-11-10", mealType: "Breakfast", menuItems: "Poha, fruit, tea", expectedStudents: 390, peopleServed: 368, preparedKg: 56, wastedKg: 3.4, context: "", specialEvent: "", demo: true },
    { id: "m-4", date: "2026-11-09", mealType: "Lunch", menuItems: "Rice, sambar, cabbage poriyal", expectedStudents: 410, peopleServed: 379, preparedKg: 79, wastedKg: 6.5, context: "Light rain", specialEvent: "", demo: true },
    { id: "m-5", date: "2026-11-08", mealType: "Dinner", menuItems: "Vegetable pulao, raita", expectedStudents: 370, peopleServed: 345, preparedKg: 68, wastedKg: 5.1, context: "", specialEvent: "", demo: true },
    { id: "m-6", date: "2026-11-07", mealType: "Snacks", menuItems: "Idli, coconut chutney", expectedStudents: 220, peopleServed: 202, preparedKg: 34, wastedKg: 2.1, context: "", specialEvent: "Sports practice", demo: true },
    { id: "m-7", date: "2026-11-06", mealType: "Lunch", menuItems: "Rice, rajma, cucumber", expectedStudents: 400, peopleServed: 385, preparedKg: 77, wastedKg: 5.7, context: "", specialEvent: "", demo: true },
  ],
  donations: [
    { id: "d-1", donor: "Greenfield Hostel Kitchen", foodName: "Fresh vegetable pulao", description: "Freshly prepared, sealed portions", category: "Cooked food", quantity: 12, unit: "kg", preparedAt: "2026-11-11T11:30", deadline: "2026-11-11T17:00", storage: "Hot-held above 60°C", allergens: "Contains cashews", location: "Greenfield Hostel, North Gate", pickupWindow: "Today · 1:00–3:00 pm", contact: "Kitchen desk · 98765 43210", receiver: "Hope Community Kitchen", status: "Collected", demo: true },
    { id: "d-2", donor: "Campus Dining Hall", foodName: "Seasonal fruit boxes", description: "Whole, washed apples and bananas", category: "Fruits", quantity: 18, unit: "kg", preparedAt: "2026-11-11T09:00", deadline: "2026-11-12T12:00", storage: "Cool, dry storage", allergens: "None declared", location: "Campus Dining Hall, Service Entrance", pickupWindow: "Today · 2:00–5:00 pm", contact: "Dining desk · 98765 12340", receiver: "", status: "Available", demo: true },
    { id: "d-3", donor: "Saffron Caterers", foodName: "Individually packed dal", description: "Sealed meal portions prepared this morning", category: "Packaged food", quantity: 24, unit: "portions", preparedAt: "2026-11-11T08:00", deadline: "2026-11-11T16:00", storage: "Refrigerated at 4°C", allergens: "Contains lentils", location: "Saffron Caterers, Main Street", pickupWindow: "Today · 12:30–2:30 pm", contact: "Meera · 98765 98760", receiver: "", status: "Available", demo: true },
    { id: "d-4", donor: "Riverside Mess", foodName: "Fresh spinach bunches", description: "Rinsed and sorted, ready to use", category: "Vegetables", quantity: 7, unit: "kg", preparedAt: "2026-11-10T16:00", deadline: "2026-11-12T10:00", storage: "Refrigerated", allergens: "None declared", location: "Riverside Mess, East Entrance", pickupWindow: "Tomorrow · 8:00–10:00 am", contact: "Kitchen · 98765 44420", receiver: "", status: "Claimed", demo: true },
    { id: "d-5", donor: "Maple Hostel", foodName: "Steamed rice & dal", description: "Freshly cooked and kept covered", category: "Cooked food", quantity: 8, unit: "kg", preparedAt: "2026-11-09T12:00", deadline: "2026-11-09T17:00", storage: "Hot-held above 60°C", allergens: "Contains lentils", location: "Maple Hostel, South Gate", pickupWindow: "Nov 9 · 1:00–3:00 pm", contact: "Dining office · 98765 30030", receiver: "Neighbourhood Food Bank", status: "Collected", demo: true },
  ],
};

export function calculateMetrics(data: FoodWiseData) {
  const prepared = data.meals.reduce((sum, meal) => sum + (meal.preparedKg ?? 0), 0);
  const consumed = data.meals.reduce((sum, meal) => sum + (meal.consumedKg ?? 0), 0);
  const measuredWaste = data.meals.reduce((sum, meal) => sum + (meal.wastedKg ?? 0), 0);
  const listedKg = data.donations.filter((donation) => donation.unit === "kg" && donation.status !== "Cancelled").reduce((sum, donation) => sum + donation.quantity, 0);
  const collectedKg = data.donations.filter((donation) => donation.unit === "kg" && donation.status === "Collected").reduce((sum, donation) => sum + donation.quantity, 0);
  return {
    preparedKg: data.meals.some((meal) => meal.preparedKg !== null) ? prepared : null,
    consumedKg: data.meals.some((meal) => meal.consumedKg != null) ? consumed : null,
    wastedKg: data.meals.some((meal) => meal.wastedKg !== null) ? measuredWaste : null,
    wasteRate: prepared > 0 && data.meals.some((meal) => meal.wastedKg !== null) ? (measuredWaste / prepared) * 100 : null,
    listedKg,
    collectedKg,
    activeListings: data.donations.filter((donation) => donation.status === "Available" || donation.status === "Claimed").length,
    successfulDonations: data.donations.filter((donation) => donation.status === "Collected").length,
    activeDonors: new Set(data.donations.filter((donation) => donation.status !== "Expired" && donation.status !== "Cancelled").map((donation) => donation.donor)).size,
    activeReceivers: new Set(data.donations.filter((donation) => donation.status === "Collected" || donation.status === "Claimed").map((donation) => donation.receiver).filter(Boolean)).size,
  };
}

export function makeDonationFromMeal(
  meal: MealRecord,
  safeAndSuitable: boolean,
  safeSurplusKg: number | null,
  donor: string,
  location: string,
  contact: string,
  preparedAt: string,
  deadline: string,
): Donation | null {
  if (!safeAndSuitable || safeSurplusKg === null || safeSurplusKg <= 0) return null;
  return {
    id: `d-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
    donor,
    foodName: meal.menuItems || `${meal.mealType} surplus`,
    description: `Surplus from ${meal.mealType.toLowerCase()} meal service.`,
    category: "Cooked food",
    quantity: safeSurplusKg,
    unit: "kg",
    preparedAt,
    deadline,
    storage: "Disclose current storage conditions before pickup",
    allergens: "Please confirm ingredients and allergens",
    location,
    pickupWindow: "Coordinate pickup with the donor",
    contact,
    receiver: "",
    status: "Available",
  };
}

export function csvForRecords(data: FoodWiseData) {
  const rows = [
    ["Record type", "Date", "Name / meal", "Quantity / prepared (kg)", "Consumed (kg)", "Waste (kg)", "Status"],
    ...data.meals.map((meal) => ["Meal", meal.date, `${meal.mealType}: ${meal.menuItems}`, String(meal.preparedKg ?? ""), String(meal.consumedKg ?? ""), String(meal.wastedKg ?? ""), meal.demo ? "Demo" : "Recorded"]),
    ...data.donations.map((donation) => ["Donation", donation.preparedAt.slice(0, 10), donation.foodName, `${donation.quantity} ${donation.unit}`, "", "", donation.status]),
  ];
  return rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
}