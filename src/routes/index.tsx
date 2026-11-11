import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Apple,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  Download,
  FilePlus2,
  Filter,
  HeartHandshake,
  Leaf,
  MapPin,
  Menu,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateMetrics,
  csvForRecords,
  DEMO_DATA,
  makeDonationFromMeal,
  STORAGE_KEY,
  type Donation,
  type FoodCategory,
  type FoodWiseData,
  type MealRecord,
  type MealType,
} from "@/lib/foodwise";

type PageKey = "Overview" | "Food Waste Analytics" | "Add Meal Record" | "Surplus Food Listings" | "Find Donations" | "Donation History" | "Reports" | "Guidelines";

const navigation: { label: PageKey; icon: typeof BarChart3; group: string }[] = [
  { label: "Overview", icon: BarChart3, group: "WORKSPACE" },
  { label: "Food Waste Analytics", icon: Leaf, group: "WORKSPACE" },
  { label: "Add Meal Record", icon: FilePlus2, group: "WORKSPACE" },
  { label: "Surplus Food Listings", icon: PackageCheck, group: "REDISTRIBUTION" },
  { label: "Find Donations", icon: Search, group: "REDISTRIBUTION" },
  { label: "Donation History", icon: ClipboardList, group: "REDISTRIBUTION" },
  { label: "Reports", icon: BarChart3, group: "INSIGHTS" },
  { label: "Guidelines", icon: CircleHelp, group: "INSIGHTS" },
];

const mealTypes: MealType[] = ["Breakfast", "Lunch", "Snacks", "Dinner"];
const categories: FoodCategory[] = ["Cooked food", "Packaged food", "Vegetables", "Fruits", "Other"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoodWise — Food waste analytics & donation coordination" },
      { name: "description", content: "Track meal waste, learn from kitchen records, and coordinate safe surplus food donations with FoodWise." },
      { property: "og:title", content: "FoodWise — Food waste analytics & donation coordination" },
      { property: "og:description", content: "A practical food-waste dashboard connecting kitchen insights with safe surplus-food pickup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FoodWiseApp,
});

function FoodWiseApp() {
  const [data, setData] = useState<FoodWiseData>(DEMO_DATA);
  const [page, setPage] = useState<PageKey>("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FoodWiseData;
        if (Array.isArray(parsed.meals) && Array.isArray(parsed.donations)) setData(parsed);
      }
    } catch {
      setNotice("Saved demo changes could not be loaded. Sample data is still available.");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      setNotice("This browser could not save changes for the next visit.");
    }
  }, [data, hydrated]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const metrics = useMemo(() => calculateMetrics(data), [data]);
  const navigate = (target: PageKey) => {
    setPage(target);
    setMobileMenuOpen(false);
    setNotice("");
  };

  const addMeal = (meal: MealRecord, donation: Donation | null) => {
    setData((current) => ({
      meals: [meal, ...current.meals],
      donations: donation ? [donation, ...current.donations] : current.donations,
    }));
    setNotice(donation ? "Meal saved and safe surplus added to available donations." : "Meal record saved.");
    setPage(donation ? "Surplus Food Listings" : "Food Waste Analytics");
  };

  const updateDonation = (id: string, status: Donation["status"], receiver?: string) => {
    setData((current) => ({
      ...current,
      donations: current.donations.map((donation) =>
        donation.id === id ? { ...donation, status, receiver: receiver ?? donation.receiver } : donation,
      ),
    }));
    setNotice(status === "Claimed" ? "Donation claimed. Pickup details are available below." : status === "Collected" ? "Collection confirmed. The food is now recorded as collected." : `Listing marked ${status.toLowerCase()}.`);
  };

  const renderPage = (): ReactNode => {
    if (page === "Overview") return <OverviewPage data={data} metrics={metrics} onNavigate={navigate} />;
    if (page === "Food Waste Analytics") return <AnalyticsPage data={data} />;
    if (page === "Add Meal Record") return <MealForm onSave={addMeal} onCancel={() => navigate("Overview")} />;
    if (page === "Surplus Food Listings") return <ListingsPage data={data} onAdd={() => navigate("Find Donations")} onStatus={updateDonation} />;
    if (page === "Find Donations") return <FindDonationsPage data={data} onStatus={updateDonation} />;
    if (page === "Donation History") return <DonationHistoryPage donations={data.donations} />;
    if (page === "Reports") return <ReportsPage data={data} metrics={metrics} />;
    return <GuidelinesPage />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <div className="mx-4 mb-5 rounded-md border border-border/70 bg-background/60 px-3 py-2.5">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">DEMO WORKSPACE</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-xs font-medium">Greenfield Hostel</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </div>
        </div>
        <Navigation page={page} onNavigate={navigate} />
        <div className="mt-auto border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">GF</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Greenfield Kitchen</p>
              <p className="text-[11px] text-muted-foreground">Demo administrator</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/25 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex h-full w-[min(310px,85vw)] flex-col border-r bg-sidebar" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between pr-2"><Brand /><Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><X /></Button></div>
            <Navigation page={page} onNavigate={navigate} />
          </div>
        </div>
      )}

      <div className="min-h-screen lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}><Menu /></Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span>FoodWise</span><span className="text-border">/</span><span className="truncate text-foreground">{page}</span></div>
              <p className="hidden text-[11px] text-muted-foreground sm:block">Tuesday, November 11, 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-sm border border-border bg-muted/70 px-2 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-chart-1" /> DEMO DATA</span>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-chart-5" /></Button>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">GF</div>
          </div>
        </header>
        <main className="mx-auto max-w-[1460px] px-4 pb-12 pt-7 sm:px-7 lg:px-9">
          <div className="mb-5 flex items-center gap-2 rounded-md border border-chart-2/30 bg-chart-2/10 px-3 py-2 text-xs text-foreground sm:hidden"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-chart-2" />Demo workspace · Changes stay in this browser</div>
          {notice && <div role="status" className="mb-5 flex items-start gap-2.5 rounded-md border border-primary/20 bg-accent/60 px-3.5 py-3 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="flex-1">{notice}</span><button aria-label="Dismiss message" className="text-muted-foreground" onClick={() => setNotice("")}><X className="h-4 w-4" /></button></div>}
          {renderPage()}
          <footer className="mt-12 border-t border-border/70 pt-4 text-[11px] leading-5 text-muted-foreground">FoodWise prototype · Demo information only · FoodWise supports coordination and does not certify food safety.</footer>
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return <div className="flex h-[66px] items-center gap-3 border-b border-sidebar-border px-5"><div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground"><Leaf className="h-5 w-5" /></div><div><div className="text-[17px] font-bold leading-none">FoodWise</div><div className="mt-1 text-[10px] text-muted-foreground">PREVENT · REDISTRIBUTE</div></div></div>;
}

function Navigation({ page, onNavigate }: { page: PageKey; onNavigate: (page: PageKey) => void }) {
  const groups = [...new Set(navigation.map((item) => item.group))];
  return <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-2">
    {groups.map((group) => <div key={group} className="mb-4">
      <p className="mb-1.5 px-2.5 pt-3 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground">{group}</p>
      {navigation.filter((item) => item.group === group).map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => onNavigate(label)} aria-current={page === label ? "page" : undefined} className={`mb-0.5 flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[12px] transition-colors ${page === label ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}><Icon className="h-4 w-4 shrink-0" /><span>{label}</span>{label === "Find Donations" && <span className="ml-auto rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">2</span>}</button>)}
    </div>)}
    <div className="mx-1 mt-5 rounded-md border border-border/70 bg-background/55 p-3"><div className="flex items-center gap-2 text-[11px] font-semibold"><ShieldCheck className="h-4 w-4 text-primary" /> Safer together</div><p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">Only share food you can confirm is safe and properly stored.</p><button type="button" className="mt-2 text-[10px] font-semibold text-primary" onClick={() => onNavigate("Guidelines")}>View guidelines <ArrowRight className="ml-1 inline h-3 w-3" /></button></div>
  </nav>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-primary">{eyebrow}</p><h1 className="text-2xl font-semibold tracking-normal sm:text-[28px]">{title}</h1><p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p></div>{action}</div>;
}

function MetricCard({ title, value, unit, note, icon: Icon, tone = "primary" }: { title: string; value: string; unit?: string; note: string; icon: typeof Leaf; tone?: "primary" | "warm" | "cool" | "neutral" }) {
  const toneClass = tone === "warm" ? "bg-chart-2/15 text-chart-2" : tone === "cool" ? "bg-chart-3/15 text-chart-3" : tone === "neutral" ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary";
  return <section className="min-w-0 rounded-md border border-border/80 bg-card p-4 sm:p-[18px]"><div className="flex items-center justify-between gap-2"><h2 className="text-[11px] font-medium text-muted-foreground sm:text-xs">{title}</h2><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${toneClass}`}><Icon className="h-4 w-4" /></div></div><div className="mt-3 flex items-baseline gap-1.5"><span className="text-[25px] font-semibold tabular-nums tracking-normal">{value}</span>{unit && <span className="text-xs text-muted-foreground">{unit}</span>}</div><p className="mt-1 text-[10px] leading-4 text-muted-foreground sm:text-[11px]">{note}</p></section>;
}

function OverviewPage({ data, metrics, onNavigate }: { data: FoodWiseData; metrics: ReturnType<typeof calculateMetrics>; onNavigate: (page: PageKey) => void }) {
  const weekMeals = data.meals.slice(0, 7).reverse();
  return <>
    <PageHeading eyebrow="TUESDAY · NOVEMBER 11, 2026" title="Good morning, Greenfield" description="A clearer view of today’s kitchen and community impact." action={<Button onClick={() => onNavigate("Add Meal Record")} className="h-9"><Plus /> Add meal record</Button>} />
    <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
      <MetricCard title="Food prepared" value={formatNumber(metrics.preparedKg)} unit="kg" note={`${data.meals.length} meal records · demo + saved`} icon={Utensils} />
      <MetricCard title="Food wasted" value={formatNumber(metrics.wastedKg)} unit="kg" note={`${metrics.wasteRate === null ? "No measured waste rate yet" : `${metrics.wasteRate.toFixed(1)}% of measured preparation`}`} icon={ArrowDownRight} tone="warm" />
      <MetricCard title="Waste rate" value={metrics.wasteRate === null ? "—" : metrics.wasteRate.toFixed(1)} unit={metrics.wasteRate === null ? "" : "%"} note={metrics.wasteRate === null ? "Needs measured prepared and wasted weights" : "Waste ÷ prepared · measured only"} icon={BarChart3} tone="cool" />
      <MetricCard title="Surplus listed" value={formatNumber(metrics.listedKg)} unit="kg" note="Listed quantity · not the same as collected" icon={Apple} tone="neutral" />
      <MetricCard title="Successfully collected" value={formatNumber(metrics.collectedKg)} unit="kg" note={`${metrics.successfulDonations} completed ${metrics.successfulDonations === 1 ? "donation" : "donations"}`} icon={HeartHandshake} />
      <MetricCard title="Active listings" value={String(metrics.activeListings)} note="Available or claimed, awaiting collection" icon={PackageCheck} tone="cool" />
    </div>

    <div className="mb-5 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
      <section className="min-w-0 rounded-md border border-border/80 bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-2"><div><h2 className="text-sm font-semibold">Weekly food waste trend</h2><p className="mt-1 text-[11px] text-muted-foreground">Measured kilograms · most recent 7 records</p></div><button type="button" onClick={() => onNavigate("Food Waste Analytics")} className="shrink-0 text-[11px] font-semibold text-primary">View analytics <ArrowRight className="ml-1 inline h-3 w-3" /></button></div>
        <TrendChart meals={weekMeals} />
      </section>
      <MealTypeBreakdown meals={data.meals} />
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="min-w-0 overflow-hidden rounded-md border border-border/80 bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3.5 sm:px-5"><div><h2 className="text-sm font-semibold">Recent meal records</h2><p className="mt-1 text-[10px] text-muted-foreground">Includes clearly marked demonstration records</p></div><button type="button" className="text-[11px] font-semibold text-primary" onClick={() => onNavigate("Food Waste Analytics")}>All records <ArrowRight className="ml-1 inline h-3 w-3" /></button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-xs"><thead><tr className="text-[10px] text-muted-foreground"><th className="px-4 py-2.5 font-medium sm:px-5">DATE · MEAL</th><th className="px-3 py-2.5 font-medium">MENU</th><th className="px-3 py-2.5 text-right font-medium">PREPARED</th><th className="px-4 py-2.5 text-right font-medium sm:px-5">WASTE</th></tr></thead><tbody>{data.meals.slice(0, 4).map((meal) => <tr key={meal.id} className="border-t border-border/60"><td className="px-4 py-3 sm:px-5"><div className="font-medium">{dateShort(meal.date)}</div><div className="mt-0.5 text-[10px] text-muted-foreground">{meal.mealType} · {meal.demo ? "Demo" : weekday(meal.date)}</div></td><td className="max-w-[190px] truncate px-3 py-3 text-muted-foreground">{meal.menuItems}</td><td className="px-3 py-3 text-right tabular-nums">{formatNumber(meal.preparedKg)} kg</td><td className="px-4 py-3 text-right font-medium tabular-nums sm:px-5">{formatNumber(meal.wastedKg)} kg</td></tr>)}</tbody></table></div>
      </section>
      <section className="min-w-0 rounded-md border border-border/80 bg-card">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5"><div><h2 className="text-sm font-semibold">Donation activity</h2><p className="mt-1 text-[10px] text-muted-foreground">Listed separately from food waste records</p></div><button type="button" className="text-[11px] font-semibold text-primary" onClick={() => onNavigate("Donation History")}>History <ArrowRight className="ml-1 inline h-3 w-3" /></button></div>
        <div className="divide-y divide-border/60">{data.donations.slice(0, 3).map((donation) => <div key={donation.id} className="flex items-start gap-3 px-4 py-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground"><HeartHandshake className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-medium">{donation.foodName}</p><StatusBadge status={donation.status} /></div><p className="mt-1 truncate text-[10px] text-muted-foreground">{donation.donor} · {formatNumber(donation.quantity)} {donation.unit}</p></div></div>)}</div>
        <div className="flex items-center gap-2 border-t border-border/60 px-4 py-3 text-[10px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />Only safe, confirmed food should be offered.</div>
      </section>
    </div>
    <section className="mt-4 rounded-md border border-primary/20 bg-accent/50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"><div className="flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></div><div><p className="text-xs font-semibold">Small adjustments make a difference</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Recent lunch records suggest reviewing preparation for the 400–420 cover range. Demo, rule-based suggestion — not a prediction.</p></div></div><Button variant="outline" size="sm" className="mt-3 shrink-0 sm:mt-0" onClick={() => onNavigate("Food Waste Analytics")}>Review insights <ArrowRight /></Button></section>
  </>;
}

function TrendChart({ meals }: { meals: MealRecord[] }) {
  const width = 620;
  const height = 220;
  const left = 34;
  const right = 20;
  const top = 14;
  const bottom = 34;
  const max = Math.max(12, ...meals.map((meal) => Math.max(meal.preparedKg ?? 0, meal.wastedKg ?? 0)) * 1.15);
  const x = (index: number) => left + (meals.length < 2 ? 0 : index * (width - left - right)) / (meals.length - 1);
  const y = (value: number) => top + ((height - top - bottom) * (max - value)) / max;
  const pointsFor = (pick: (meal: MealRecord) => number | null) => meals.map((meal, index) => `${x(index)},${y(pick(meal) ?? 0)}`).join(" ");
  return <div className="w-full overflow-hidden"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Chart comparing food prepared and wasted over the latest recorded meals" className="h-[205px] w-full overflow-visible sm:h-[220px]">
    {[0, 0.33, 0.66, 1].map((fraction) => <g key={fraction}><line x1={left} x2={width - right} y1={top + (height - top - bottom) * fraction} y2={top + (height - top - bottom) * fraction} className="fw-chart-grid" /><text x={left - 7} y={top + (height - top - bottom) * fraction + 4} textAnchor="end" className="fill-muted-foreground" fontSize="9">{Math.round(max * (1 - fraction))}</text></g>)}
    <polyline points={pointsFor((meal) => meal.preparedKg)} className="fw-chart-prepared" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points={pointsFor((meal) => meal.wastedKg)} className="fw-chart-waste" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {meals.map((meal, index) => <g key={meal.id}><circle cx={x(index)} cy={y(meal.preparedKg ?? 0)} r="3.5" className="fill-chart-1" /><circle cx={x(index)} cy={y(meal.wastedKg ?? 0)} r="3.5" className="fill-chart-2" /><text x={x(index)} y={height - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{weekdayShort(meal.date)}</text></g>)}
  </svg><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground"><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-1" />Prepared</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-2" />Waste</span><span className="ml-auto">kg · measured entries only</span></div></div>;
}

function MealTypeBreakdown({ meals }: { meals: MealRecord[] }) {
  const totals = mealTypes.map((type) => ({ type, total: meals.filter((meal) => meal.mealType === type).reduce((sum, meal) => sum + (meal.wastedKg ?? 0), 0), count: meals.filter((meal) => meal.mealType === type && meal.wastedKg !== null).length }));
  const maximum = Math.max(1, ...totals.map((item) => item.total));
  return <section className="rounded-md border border-border/80 bg-card p-4 sm:p-5"><div className="mb-4"><h2 className="text-sm font-semibold">Waste by meal type</h2><p className="mt-1 text-[11px] text-muted-foreground">Total measured waste</p></div><div className="space-y-4">{totals.map(({ type, total, count }) => <div key={type}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium">{type}</span><span className="tabular-nums text-muted-foreground">{total.toFixed(1)} kg <span className="text-[10px]">· {count} records</span></span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(total / maximum) * 100}%` }} /></div></div>)}</div><div className="mt-5 border-t border-border/70 pt-3 text-[10px] leading-4 text-muted-foreground">Use comparable records to spot patterns; missing measurements are excluded.</div></section>;
}

function AnalyticsPage({ data }: { data: FoodWiseData }) {
  const metrics = calculateMetrics(data);
  const byMeal = mealTypes.map((type) => ({ type, rows: data.meals.filter((meal) => meal.mealType === type && meal.wastedKg !== null) }));
  const highest = [...data.meals].filter((meal) => meal.wastedKg !== null).sort((a, b) => (b.wastedKg ?? 0) - (a.wastedKg ?? 0)).slice(0, 3);
  return <>
    <PageHeading eyebrow="PREVENT AVOIDABLE WASTE" title="Food waste analytics" description="Use measured meal records to spot patterns and make thoughtful preparation adjustments." action={<DownloadReport data={data} />} />
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4"><MetricCard title="Measured prepared" value={formatNumber(metrics.preparedKg)} unit="kg" note="Sum of recorded measurements" icon={Utensils} /><MetricCard title="Measured waste" value={formatNumber(metrics.wastedKg)} unit="kg" note="Unmeasured entries are excluded" icon={ArrowDownRight} tone="warm" /><MetricCard title="Measured waste rate" value={metrics.wasteRate === null ? "—" : metrics.wasteRate.toFixed(1)} unit={metrics.wasteRate === null ? "" : "%"} note="Waste divided by prepared" icon={BarChart3} tone="cool" /><MetricCard title="Meal records" value={String(data.meals.length)} note={`${data.meals.filter((meal) => meal.demo).length} sample · ${data.meals.filter((meal) => !meal.demo).length} saved`} icon={ClipboardList} tone="neutral" /></div>
    <div className="mb-4 grid gap-4 xl:grid-cols-[1.6fr_0.8fr]"><section className="rounded-md border border-border/80 bg-card p-4 sm:p-5"><div className="mb-3"><h2 className="text-sm font-semibold">Prepared versus waste</h2><p className="mt-1 text-[11px] text-muted-foreground">Measured food weights per meal record · kg</p></div><TrendChart meals={[...data.meals].slice(0, 10).reverse()} /></section><section className="rounded-md border border-border/80 bg-card p-4 sm:p-5"><h2 className="text-sm font-semibold">Waste by meal type</h2><p className="mb-4 mt-1 text-[11px] text-muted-foreground">Compare meals with recorded measurements</p><div className="space-y-4">{byMeal.map(({ type, rows }) => { const total = rows.reduce((sum, meal) => sum + (meal.wastedKg ?? 0), 0); const avg = rows.length ? total / rows.length : 0; return <div key={type} className="border-b border-border/50 pb-3 last:border-0"><div className="flex justify-between text-xs"><span>{type}</span><span className="font-medium tabular-nums">{total.toFixed(1)} kg</span></div><p className="mt-1 text-[10px] text-muted-foreground">{rows.length} records{rows.length ? ` · ${avg.toFixed(1)} kg average` : " · no measured entries"}</p></div>; })}</div></section></div>
    <div className="grid gap-4 xl:grid-cols-2"><section className="overflow-hidden rounded-md border border-border/80 bg-card"><div className="border-b border-border/60 px-4 py-3.5"><h2 className="text-sm font-semibold">Highest-waste meals</h2><p className="mt-1 text-[10px] text-muted-foreground">Ranked among entries with measured waste only</p></div>{highest.length ? highest.map((meal) => <div key={meal.id} className="flex items-start justify-between gap-4 border-b border-border/50 px-4 py-3 last:border-0"><div><p className="text-xs font-medium">{meal.menuItems}</p><p className="mt-1 text-[10px] text-muted-foreground">{meal.mealType} · {dateShort(meal.date)}</p></div><span className="shrink-0 text-xs font-semibold tabular-nums">{meal.wastedKg?.toFixed(1)} kg</span></div>) : <EmptyState title="No measured meals yet" detail="Add a meal record with a waste measurement to see comparisons." />}</section>
      <section className="rounded-md border border-primary/20 bg-accent/40 p-4 sm:p-5"><div className="flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></div><div><h2 className="text-sm font-semibold">Practical suggestion</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{highest[0] ? `Review the ${highest[0].mealType.toLowerCase()} plan for “${highest[0].menuItems}.” Its ${highest[0].wastedKg?.toFixed(1)} kg recorded waste makes it a useful starting point for checking portions and attendance.` : "As more meals are recorded, compare similar menus and attendance before adjusting batch sizes."}</p><p className="mt-3 text-[10px] font-medium text-primary">Rule-based demo guidance · not a machine-learning prediction</p></div></div></section></div>
    <div className="mt-4"><MealTable meals={data.meals} /></div>
  </>;
}

function MealForm({ onSave, onCancel }: { onSave: (meal: MealRecord, donation: Donation | null) => void; onCancel: () => void }) {
  const today = "2026-11-11";
  const [date, setDate] = useState(today);
  const [mealType, setMealType] = useState<MealType>("Lunch");
  const [expected, setExpected] = useState("420");
  const [served, setServed] = useState("397");
  const [safeForDonation, setSafeForDonation] = useState(false);
  const [context, setContext] = useState("");
  const [menu, setMenu] = useState("");
  const [prepared, setPrepared] = useState("");
  const [wasted, setWasted] = useState("");
  const [specialEvent, setSpecialEvent] = useState("");
  const [donor, setDonor] = useState("Greenfield Hostel Kitchen");
  const [location, setLocation] = useState("Greenfield Hostel, North Gate");
  const [contact, setContact] = useState("");
  const [deadline, setDeadline] = useState("2026-11-11T17:00");
  const [error, setError] = useState("");
  const expectedNum = Number(expected);
  const servedNum = Number(served);
  const parseOptional = (value: string) => value.trim() === "" ? null : Number(value);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const preparedNum = parseOptional(prepared);
    const wastedNum = parseOptional(wasted);
    if (!date || !menu.trim() || !expected || !served || expectedNum < 0 || servedNum < 0 || (preparedNum !== null && preparedNum < 0) || (wastedNum !== null && wastedNum < 0)) {
      setError("Add the date, meal type, menu, and valid non-negative attendance. Measurements may stay empty when unknown.");
      return;
    }
    const meal: MealRecord = { id: `m-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`, date, mealType, menuItems: menu.trim(), expectedStudents: expectedNum, peopleServed: servedNum, preparedKg: preparedNum, wastedKg: wastedNum, context, specialEvent, demo: false };
    const donation = safeForDonation ? makeDonationFromMeal(meal, true, donor.trim(), location.trim(), contact.trim(), `${date}T12:00`, deadline) : null;
    if (safeForDonation && !donation) { setError("A positive measured surplus is needed before it can be listed for donation."); return; }
    onSave(meal, donation);
  };
  return <>
    <PageHeading eyebrow="FOOD WASTE ANALYTICS" title="Add meal record" description="Record what was served, keep unknown weights empty, and review any surplus before donation." />
    <form onSubmit={submit} className="max-w-[880px] space-y-4">
      {error && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">{error}</div>}
      <section className="rounded-md border border-border/80 bg-card p-4 sm:p-6"><FormSectionTitle number="01" title="Meal details" subtitle="Choose the service and describe the menu." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Date" required><Input aria-label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></Field><Field label="Day of week"><Input aria-label="Day of week" value={date ? weekday(date) : "Select a date"} readOnly className="bg-muted/70" /></Field><Field label="Meal type" required><Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}><SelectTrigger aria-label="Meal type"><SelectValue /></SelectTrigger><SelectContent>{mealTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></Field><Field label="Menu items" required><Input aria-label="Menu items" placeholder="e.g. Rice, dal, mixed vegetables" value={menu} onChange={(event) => setMenu(event.target.value)} required /></Field></div>
      </section>
      <section className="rounded-md border border-border/80 bg-card p-4 sm:p-6"><FormSectionTitle number="02" title="Attendance & measurements" subtitle="Record measured amounts only; leave a weight empty if it is unknown." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Expected students" required><Input aria-label="Expected students" type="number" min="0" step="1" value={expected} onChange={(event) => setExpected(event.target.value)} required /></Field><Field label="People served" required><Input aria-label="People served" type="number" min="0" step="1" value={served} onChange={(event) => setServed(event.target.value)} required /></Field><Field label="Food prepared (kg)" hint="Optional · leave empty if not measured"><Input aria-label="Food prepared (kg)" type="number" min="0" step="0.1" placeholder="Not measured" value={prepared} onChange={(event) => setPrepared(event.target.value)} /></Field><Field label="Food wasted (kg)" hint="Optional · leave empty if not measured"><Input aria-label="Food wasted (kg)" type="number" min="0" step="0.1" placeholder="Not measured" value={wasted} onChange={(event) => setWasted(event.target.value)} /></Field></div>
        {expected !== "" && served !== "" && expectedNum >= 0 && servedNum > expectedNum && <p role="status" className="mt-3 rounded-md border border-chart-2/30 bg-chart-2/10 px-3 py-2 text-xs">People served exceeds the expected count. Please check both numbers before saving.</p>}
      </section>
      <section className="rounded-md border border-border/80 bg-card p-4 sm:p-6"><FormSectionTitle number="03" title="What shaped today’s service?" subtitle="Add context that could help explain differences in attendance or leftovers." /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Weather or holiday information"><Input aria-label="Weather or holiday information" placeholder="e.g. Light rain, public holiday" value={context} onChange={(event) => setContext(event.target.value)} /></Field><Field label="Special events"><Input aria-label="Special events" placeholder="e.g. Sports practice, cultural event" value={specialEvent} onChange={(event) => setSpecialEvent(event.target.value)} /></Field></div></section>
      <section className="rounded-md border border-primary/25 bg-accent/40 p-4 sm:p-5"><label className="flex cursor-pointer items-start gap-3"><Checkbox checked={safeForDonation} onCheckedChange={(checked) => setSafeForDonation(checked === true)} aria-label="Food is safe and suitable to donate" /><span><span className="block text-sm font-semibold">Offer measured surplus for donation</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Only check this after confirming the food is safe, edible, correctly stored and suitable for pickup. A meal record never automatically becomes a donation.</span></span></label>
        {safeForDonation && <div className="mt-4 grid gap-4 border-t border-primary/15 pt-4 sm:grid-cols-2"><Field label="Donor / organisation" required><Input aria-label="Donor / organisation" value={donor} onChange={(event) => setDonor(event.target.value)} required /></Field><Field label="Pickup location" required><Input aria-label="Pickup location" value={location} onChange={(event) => setLocation(event.target.value)} required /></Field><Field label="Contact information" required><Input aria-label="Contact information" placeholder="Phone or contact name" value={contact} onChange={(event) => setContact(event.target.value)} required /></Field><Field label="Safe-use deadline" required><Input aria-label="Safe-use deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} required /></Field></div>}
      </section>
      <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit"><Check /> Save meal record{safeForDonation ? " & list surplus" : ""}</Button></div>
    </form>
  </>;
}

function ListingsPage({ data, onAdd, onStatus }: { data: FoodWiseData; onAdd: () => void; onStatus: (id: string, status: Donation["status"], receiver?: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("all");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) ?? "").trim();
    if (!form.get("safetyConfirmed")) { setError("Confirm food safety before publishing a listing."); return; }
    const quantity = Number(get("quantity"));
    if (quantity <= 0) { setError("Enter a quantity greater than zero."); return; }
    const donation: Donation = { id: `d-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`, donor: get("donor"), foodName: get("foodName"), description: get("description"), category: get("category") as FoodCategory, quantity, unit: get("unit") as "kg" | "portions", preparedAt: get("preparedAt"), deadline: get("deadline"), storage: get("storage"), allergens: get("allergens") || "Not declared", location: get("location"), pickupWindow: get("pickupWindow"), contact: get("contact"), receiver: "", status: "Available" };
    onAddDonation(donation);
    event.currentTarget.reset();
    setSaved(true);
    setError("");
    setShowForm(false);
  };
  function onAddDonation(donation: Donation) { (window as Window & { __foodWiseAddDonation?: (donation: Donation) => void }).__foodWiseAddDonation?.(donation); }
  const active = data.donations.filter((donation) => donation.status === "Available" || donation.status === "Claimed");
  const visible = category === "all" ? active : active.filter((donation) => donation.category === category);
  return <>
    <PageHeading eyebrow="SAFE FOOD, SHARED WELL" title="Surplus food listings" description="Coordinate safe, edible surplus with clear pickup information and honest availability." action={<Button onClick={() => { setShowForm((value) => !value); setSaved(false); }}><Plus /> List surplus food</Button>} />
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-chart-2/30 bg-chart-2/10 px-3.5 py-3 text-xs"><span className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Only list food confirmed safe, edible, and appropriately stored. This platform does not certify food safety.</span></span><span className="shrink-0 text-[10px] font-medium text-muted-foreground">{active.length} active</span></div>
    {saved && <div className="mb-4 rounded-md border border-primary/20 bg-accent px-3 py-2.5 text-xs text-primary">Your listing is now available to receivers.</div>}
    {showForm && <DonationForm onSubmit={submit} error={error} onCancel={() => setShowForm(false)} />}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold">Donor view</p><p className="mt-0.5 text-[10px] text-muted-foreground">Your listings and collection status</p></div><label className="flex items-center gap-2 text-xs text-muted-foreground">Category <select aria-label="Filter listings by category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground"><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    {visible.length ? <div className="grid gap-3 lg:grid-cols-2">{visible.map((donation) => <DonationCard key={donation.id} donation={donation} onStatus={onStatus} />)}</div> : <EmptyState title="No active listings in this category" detail="Try another category, or list safe surplus food when it is available." />}
    <div className="mt-5 rounded-md border border-border/70 bg-card px-4 py-3 text-xs text-muted-foreground">Already have safe extra food recorded in a meal? <button type="button" className="font-semibold text-primary" onClick={onAdd}>Find donations and see receiver options <ArrowRight className="ml-1 inline h-3 w-3" /></button></div>
  </>;
}

function DonationForm({ onSubmit, error, onCancel }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; error: string; onCancel: () => void }) {
  return <section className="mb-5 rounded-md border border-border/80 bg-card p-4 sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-sm font-semibold">List safe surplus food</h2><p className="mt-1 text-[11px] text-muted-foreground">Accurate details help a receiver plan a safe, timely pickup.</p></div><Button variant="ghost" size="icon" aria-label="Close listing form" onClick={onCancel}><X /></Button></div>
    {error && <p role="alert" className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p>}
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Donor name / organisation" required><Input name="donor" aria-label="Donor name / organisation" placeholder="e.g. Greenfield Hostel Kitchen" required /></Field><Field label="Food name" required><Input name="foodName" aria-label="Food name" placeholder="e.g. Fresh vegetable pulao" required /></Field>
      <Field label="Food category" required><select name="category" aria-label="Food category" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" required>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field><div className="grid grid-cols-[1fr_120px] gap-2"><Field label="Quantity" required><Input name="quantity" aria-label="Quantity" type="number" min="0.1" step="0.1" placeholder="0" required /></Field><Field label="Unit" required><select name="unit" aria-label="Unit" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"><option value="kg">kg</option><option value="portions">portions</option></select></Field></div>
      <Field label="Date and time prepared" required><Input name="preparedAt" aria-label="Date and time prepared" type="datetime-local" required /></Field><Field label="Safe-use deadline" required><Input name="deadline" aria-label="Safe-use deadline" type="datetime-local" required /></Field><Field label="Storage conditions" required><Input name="storage" aria-label="Storage conditions" placeholder="e.g. Refrigerated at 4°C" required /></Field><Field label="Allergens and ingredients" hint="Say “none declared” if applicable"><Input name="allergens" aria-label="Allergens and ingredients" placeholder="e.g. Contains dairy; wheat" /></Field><Field label="Pickup location" required><Input name="location" aria-label="Pickup location" placeholder="Building, gate, or address" required /></Field><Field label="Pickup time window" required><Input name="pickupWindow" aria-label="Pickup time window" placeholder="e.g. Today · 2:00–4:00 pm" required /></Field><Field label="Contact information" required><Input name="contact" aria-label="Contact information" placeholder="Name and phone or desk" required /></Field><Field label="Short description"><Input name="description" aria-label="Short description" placeholder="Fresh, sealed portions ready to collect" /></Field><div className="sm:col-span-2"><label className="flex cursor-pointer items-start gap-2.5"><input type="checkbox" name="safetyConfirmed" className="mt-0.5 h-4 w-4 accent-primary" /><span className="text-xs leading-5">I confirm this food is safe, edible, and suitable to donate. I will disclose its preparation time, storage and allergens accurately.</span></label></div><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit"><Check /> Publish listing</Button></div>
    </form>
  </section>;
}

function FindDonationsPage({ data, onStatus }: { data: FoodWiseData; onStatus: (id: string, status: Donation["status"], receiver?: string) => void }) {
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [minimum, setMinimum] = useState("");
  const [deadline, setDeadline] = useState("");
  const donations = data.donations.filter((donation) => donation.status === "Available" || donation.status === "Claimed").filter((donation) => category === "all" || donation.category === category).filter((donation) => !location || donation.location.toLowerCase().includes(location.toLowerCase())).filter((donation) => !minimum || donation.quantity >= Number(minimum)).filter((donation) => !deadline || donation.deadline.slice(0, 10) <= deadline);
  return <>
    <PageHeading eyebrow="RECEIVER VIEW" title="Find food donations" description="Discover safe surplus nearby and claim only what your organisation can collect and use in time." />
    <div className="mb-5 rounded-md border border-chart-2/30 bg-chart-2/10 px-3.5 py-3 text-xs"><span className="font-semibold">Receiving organisation:</span> Hope Community Kitchen <span className="ml-1 text-[10px] text-muted-foreground">· demo account</span></div>
    <section className="mb-4 rounded-md border border-border/80 bg-card p-3.5"><div className="mb-3 flex items-center gap-2 text-xs font-semibold"><Filter className="h-4 w-4 text-primary" /> Find a suitable pickup</div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><label className="text-[10px] font-medium text-muted-foreground">Category<select aria-label="Filter donations by category" value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-[10px] font-medium text-muted-foreground">Location<Input aria-label="Filter by location" className="mt-1" placeholder="Area or pickup point" value={location} onChange={(event) => setLocation(event.target.value)} /></label><label className="text-[10px] font-medium text-muted-foreground">Minimum quantity (kg / portions)<Input aria-label="Minimum quantity" className="mt-1" type="number" min="0" step="0.1" placeholder="Any amount" value={minimum} onChange={(event) => setMinimum(event.target.value)} /></label><label className="text-[10px] font-medium text-muted-foreground">Use by date<Input aria-label="Pickup deadline filter" className="mt-1" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label></div><p className="mt-2 text-[10px] text-muted-foreground">Showing {donations.length} available {donations.length === 1 ? "listing" : "listings"}</p></section>
    {donations.length ? <div className="grid gap-3 lg:grid-cols-2">{donations.map((donation) => <DonationCard key={donation.id} donation={donation} receiverView onStatus={onStatus} />)}</div> : <EmptyState title="No matching donations" detail="Adjust your filters, or check again when a nearby donor adds a listing." />}
  </>;
}

function DonationCard({ donation, receiverView = false, onStatus }: { donation: Donation; receiverView?: boolean; onStatus: (id: string, status: Donation["status"], receiver?: string) => void }) {
  const receiver = "Hope Community Kitchen";
  return <article className="rounded-md border border-border/80 bg-card p-4 sm:p-[18px]"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground"><Apple className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">{donation.foodName}</h2><StatusBadge status={donation.status} /></div><p className="mt-1 text-[11px] text-muted-foreground">{donation.category} · {donation.demo ? "Demo listing" : "Saved listing"}</p></div></div>
    <p className="mt-3 text-xs leading-5 text-muted-foreground">{donation.description || "Surplus food available for pickup."}</p>
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border/60 py-3 text-[11px]"><DataPoint label="Available" value={`${formatNumber(donation.quantity)} ${donation.unit}`} icon={PackageCheck} /><DataPoint label="Prepared" value={dateTimeShort(donation.preparedAt)} icon={Clock3} /><DataPoint label="Pickup point" value={donation.location} icon={MapPin} /><DataPoint label="Use by" value={dateTimeShort(donation.deadline)} icon={CalendarDays} /></div>
    <div className="mt-3 space-y-1 text-[10px] leading-4 text-muted-foreground"><p><span className="font-semibold text-foreground">Storage:</span> {donation.storage}</p><p><span className="font-semibold text-foreground">Allergens:</span> {donation.allergens}</p><p><span className="font-semibold text-foreground">Pickup:</span> {donation.pickupWindow}</p>{receiverView && <p><span className="font-semibold text-foreground">Donor:</span> {donation.donor} · {donation.contact}</p>}{donation.receiver && <p><span className="font-semibold text-foreground">Receiver:</span> {donation.receiver}</p>}</div>
    {receiverView && donation.status === "Available" && <Button size="sm" className="mt-4 w-full" onClick={() => onStatus(donation.id, "Claimed", receiver)}><HeartHandshake /> Claim donation</Button>}
    {donation.status === "Claimed" && <div className="mt-3 rounded-md border border-chart-3/20 bg-chart-3/10 p-3"><p className="text-[11px] font-semibold">Pickup coordination</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{donation.pickupWindow} · {donation.location}<br />Contact {donation.contact}{donation.receiver ? ` · Claimed by ${donation.receiver}` : ""}</p>{!receiverView && <Button size="sm" variant="outline" className="mt-2" onClick={() => onStatus(donation.id, "Collected", donation.receiver || receiver)}><Check /> Confirm collected</Button>}</div>}
  </article>;
}

function DonationHistoryPage({ donations }: { donations: Donation[] }) {
  const rows = donations.filter((donation) => donation.status !== "Available");
  return <>
    <PageHeading eyebrow="REDISTRIBUTION RECORDS" title="Donation history" description="Follow each donation from claim to collection, with quantities kept separate from meal-waste measurements." action={<DownloadReport data={{ meals: [], donations }} />} />
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4"><HistoryStatus label="Available" count={donations.filter((item) => item.status === "Available").length} /><HistoryStatus label="Claimed" count={donations.filter((item) => item.status === "Claimed").length} /><HistoryStatus label="Collected" count={donations.filter((item) => item.status === "Collected").length} /><HistoryStatus label="Expired / cancelled" count={donations.filter((item) => item.status === "Expired" || item.status === "Cancelled").length} /></div>
    <section className="overflow-hidden rounded-md border border-border/80 bg-card"><div className="border-b border-border/60 px-4 py-3.5"><h2 className="text-sm font-semibold">Donation records</h2><p className="mt-1 text-[10px] text-muted-foreground">{rows.length} claimed, collected, expired, or cancelled entries · demo records are labeled</p></div>{rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead><tr className="text-[10px] text-muted-foreground"><th className="px-4 py-3 font-medium">FOOD</th><th className="px-3 py-3 font-medium">DONOR / RECEIVER</th><th className="px-3 py-3 font-medium">QUANTITY</th><th className="px-3 py-3 font-medium">DATE</th><th className="px-4 py-3 font-medium">STATUS</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} className="border-t border-border/60"><td className="px-4 py-3"><div className="font-medium">{item.foodName}</div><div className="mt-1 text-[10px] text-muted-foreground">{item.demo ? "Demo" : "Saved"} · {item.category}</div></td><td className="px-3 py-3"><div>{item.donor}</div><div className="mt-1 text-[10px] text-muted-foreground">{item.receiver || "Not yet assigned"}</div></td><td className="px-3 py-3 tabular-nums">{formatNumber(item.quantity)} {item.unit}</td><td className="px-3 py-3 text-muted-foreground">{dateShort(item.preparedAt.slice(0, 10))}</td><td className="px-4 py-3"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <EmptyState title="No donation activity yet" detail="Claim a listing to start tracking its journey." />}</section>
    <p className="mt-3 text-[11px] text-muted-foreground">A claimed listing counts as collected only after someone confirms pickup.</p>
  </>;
}

function ReportsPage({ data, metrics }: { data: FoodWiseData; metrics: ReturnType<typeof calculateMetrics> }) {
  return <>
    <PageHeading eyebrow="MEASURE WHAT MATTERS" title="Impact & reports" description="Share a transparent snapshot of measured kitchen data and donation activity." action={<DownloadReport data={data} />} />
    <div className="mb-5 rounded-md border border-chart-2/30 bg-chart-2/10 p-3.5 text-xs leading-5"><span className="font-semibold">Reading this report:</span> Demonstration figures are labeled. Food listed, food collected, and measured kitchen waste are separate measures. No meals-saved or emissions estimates are inferred.</div>
    <section className="mb-5"><h2 className="mb-3 text-xs font-semibold text-muted-foreground">MEASURED KITCHEN ACTIVITY</h2><div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><MetricCard title="Food waste recorded" value={formatNumber(metrics.wastedKg)} unit="kg" note="Measured waste only" icon={ArrowDownRight} tone="warm" /><MetricCard title="Food prepared" value={formatNumber(metrics.preparedKg)} unit="kg" note="Measured preparation only" icon={Utensils} /><MetricCard title="Meal records" value={String(data.meals.length)} note={`${data.meals.filter((meal) => meal.demo).length} demo · ${data.meals.filter((meal) => !meal.demo).length} saved`} icon={ClipboardList} tone="cool" /><MetricCard title="Meals with measured waste" value={String(data.meals.filter((meal) => meal.wastedKg !== null).length)} note={`of ${data.meals.length} meal records`} icon={BarChart3} tone="neutral" /></div></section>
    <section className="mb-5"><h2 className="mb-3 text-xs font-semibold text-muted-foreground">FOOD REDISTRIBUTION ACTIVITY</h2><div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><MetricCard title="Surplus food listed" value={formatNumber(metrics.listedKg)} unit="kg" note="Does not mean collected" icon={PackageCheck} tone="cool" /><MetricCard title="Food collected" value={formatNumber(metrics.collectedKg)} unit="kg" note="Confirmed collections only" icon={HeartHandshake} /><MetricCard title="Successful donations" value={String(metrics.successfulDonations)} note="Listings marked collected" icon={CheckCircle2} tone="neutral" /><MetricCard title="Active donors / receivers" value={`${metrics.activeDonors} / ${metrics.activeReceivers}`} note="Distinct names in active activity" icon={Apple} tone="warm" /></div></section>
    <div className="grid gap-4 xl:grid-cols-2"><MealTable meals={data.meals} /><DonationTable donations={data.donations} /></div>
  </>;
}

function GuidelinesPage() {
  const rules = [
    { title: "Offer only safe, edible food", text: "Do not list spoiled, unsafe, contaminated, or unsuitable items. If safety is uncertain, do not donate it." },
    { title: "Share accurate food information", text: "Disclose the preparation time, current storage conditions, ingredients, allergens, quantity, and safe-use deadline." },
    { title: "Claim what you can use in time", text: "Receiving organisations should claim only the amount they can collect promptly and use safely." },
    { title: "Collect and deliver hygienically", text: "Coordinate the pickup window, use clean containers and transport, and transfer food without unnecessary delay." },
    { title: "Donations are not for resale", text: "Redistributed food should go to people in need, not be resold." },
    { title: "Report concerns", text: "Do not claim a questionable listing. Raise safety concerns with the donor and the relevant local authority." },
  ];
  return <>
    <PageHeading eyebrow="RESPONSIBLE REDISTRIBUTION" title="Food safety & guidelines" description="Clear records and careful handoffs help donors and receivers coordinate responsibly." />
    <div className="mb-5 rounded-md border border-chart-2/30 bg-chart-2/10 p-4 sm:p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="text-sm font-semibold">Food safety is a shared responsibility</h2><p className="mt-1.5 text-xs leading-5 text-muted-foreground">FoodWise supports coordination and record keeping; it does not inspect food, certify safety, or guarantee that any listing meets legal requirements. Follow current FSSAI surplus-food guidance and applicable local rules.</p></div></div></div>
    <section className="grid gap-3 sm:grid-cols-2">{rules.map((rule, index) => <article key={rule.title} className="flex gap-3 rounded-md border border-border/80 bg-card p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">{String(index + 1).padStart(2, "0")}</span><div><h2 className="text-xs font-semibold">{rule.title}</h2><p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{rule.text}</p></div></article>)}</section>
    <section className="mt-5 rounded-md border border-border/80 bg-card p-4 sm:p-5"><h2 className="text-sm font-semibold">Good records make better decisions</h2><div className="mt-3 grid gap-3 text-xs sm:grid-cols-3"><div className="border-l-2 border-primary/50 pl-3"><p className="font-medium">Measure, don’t guess</p><p className="mt-1 leading-5 text-muted-foreground">Leave weights blank when they are unknown; missing is not zero.</p></div><div className="border-l-2 border-chart-2 pl-3"><p className="font-medium">Keep measures separate</p><p className="mt-1 leading-5 text-muted-foreground">Listed donations and confirmed collections are not kitchen waste totals.</p></div><div className="border-l-2 border-chart-3 pl-3"><p className="font-medium">Confirm each handoff</p><p className="mt-1 leading-5 text-muted-foreground">A claimed listing becomes collected only when pickup is confirmed.</p></div></div></section>
  </>;
}

function DonationTable({ donations }: { donations: Donation[] }) {
  return <section className="overflow-hidden rounded-md border border-border/80 bg-card"><div className="border-b border-border/60 px-4 py-3.5"><h2 className="text-sm font-semibold">Donation records</h2><p className="mt-1 text-[10px] text-muted-foreground">Listed quantities and handoff status</p></div><div className="divide-y divide-border/60">{donations.slice(0, 5).map((donation) => <div key={donation.id} className="flex items-start justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="truncate text-xs font-medium">{donation.foodName}</p><p className="mt-1 text-[10px] text-muted-foreground">{donation.donor} · {donation.demo ? "Demo" : "Saved"}</p></div><div className="shrink-0 text-right"><p className="text-[11px] tabular-nums">{formatNumber(donation.quantity)} {donation.unit}</p><div className="mt-1"><StatusBadge status={donation.status} /></div></div></div>)}</div></section>;
}

function MealTable({ meals }: { meals: MealRecord[] }) {
  return <section className="overflow-hidden rounded-md border border-border/80 bg-card"><div className="border-b border-border/60 px-4 py-3.5"><h2 className="text-sm font-semibold">Meal record summary</h2><p className="mt-1 text-[10px] text-muted-foreground">Measured entries only; blank weights remain unreported</p></div><div className="max-h-[330px] overflow-auto"><table className="w-full min-w-[460px] text-left text-xs"><thead className="sticky top-0 bg-card text-[10px] text-muted-foreground"><tr><th className="px-4 py-2.5 font-medium">MEAL / DATE</th><th className="px-3 py-2.5 font-medium">MENU</th><th className="px-3 py-2.5 text-right font-medium">PREP.</th><th className="px-4 py-2.5 text-right font-medium">WASTE</th></tr></thead><tbody>{meals.map((meal) => <tr key={meal.id} className="border-t border-border/60"><td className="px-4 py-2.5"><span className="font-medium">{meal.mealType}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{dateShort(meal.date)} · {meal.demo ? "Demo" : "Saved"}</span></td><td className="max-w-[160px] truncate px-3 py-2.5 text-muted-foreground">{meal.menuItems}</td><td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(meal.preparedKg)}</td><td className="px-4 py-2.5 text-right tabular-nums">{formatNumber(meal.wastedKg)}</td></tr>)}</tbody></table></div></section>;
}

function DownloadReport({ data }: { data: FoodWiseData }) {
  const download = () => {
    const blob = new Blob([csvForRecords(data)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "foodwise-demo-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <Button variant="outline" onClick={download}><Download /> Download CSV</Button>;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return <label className="block min-w-0 text-[11px] font-medium">{label}{required && <span className="ml-1 text-destructive">*</span>}<div className="mt-1.5">{children}</div>{hint && <span className="mt-1 block text-[10px] font-normal text-muted-foreground">{hint}</span>}</label>;
}

function FormSectionTitle({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return <div className="flex items-start gap-3"><span className="text-[10px] font-semibold text-primary">{number}</span><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p></div></div>;
}

function DataPoint({ label, value, icon: Icon }: { label: string; value: string; icon: typeof MapPin }) {
  return <div className="flex min-w-0 items-start gap-1.5"><Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /><div className="min-w-0"><p className="text-[9px] text-muted-foreground">{label}</p><p className="mt-0.5 break-words text-[10px] font-medium">{value}</p></div></div>;
}

function StatusBadge({ status }: { status: Donation["status"] }) {
  const style = status === "Collected" ? "border-chart-3/25 bg-chart-3/10 text-chart-3" : status === "Claimed" ? "border-chart-2/30 bg-chart-2/10 text-foreground" : status === "Available" ? "border-primary/25 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground";
  return <span className={`inline-flex shrink-0 items-center rounded-sm border px-1.5 py-0.5 text-[9px] font-medium ${style}`}>{status === "Collected" && <Check className="mr-1 h-2.5 w-2.5" />}{status}</span>;
}

function HistoryStatus({ label, count }: { label: string; count: number }) {
  return <div className="rounded-md border border-border/80 bg-card p-3.5"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{count}</p></div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-md border border-dashed border-border bg-card px-5 py-10 text-center"><div className="mx-auto grid h-9 w-9 place-items-center rounded-md bg-secondary text-secondary-foreground"><Leaf className="h-4 w-4" /></div><h2 className="mt-3 text-sm font-semibold">{title}</h2><p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">{detail}</p></div>;
}

function formatNumber(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function dateShort(value: string) {
  if (!value) return "—";
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function dateTimeShort(value: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function weekday(value: string) {
  if (!value) return "";
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.valueOf()) ? "" : parsed.toLocaleDateString("en-US", { weekday: "long" });
}

function weekdayShort(value: string) {
  if (!value) return "";
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.valueOf()) ? "" : parsed.toLocaleDateString("en-US", { weekday: "short" });
}