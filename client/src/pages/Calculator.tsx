import { useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  calculateNutrition,
  generateSurvivalPlan,
  NOODLE_BRANDS,
  SURVIVAL_INGREDIENTS,
  ACTIVITY_LABELS,
  getSodiumSalt,
  type UserInput,
  type ActivityLevel,
  type Gender,
  type NutritionResult,
  type NoodleBrand,
  type SurvivalPlanResult,
} from "@/lib/nutrition";

interface Props {
  dark: boolean;
  onToggleDark: () => void;
}

export default function Calculator({ dark, onToggleDark }: Props) {
  // ===== FORM STATE =====
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [brandId, setBrandId] = useState("generic");

  // ===== RESULTS STATE =====
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [activeTab, setActiveTab] = useState("analyse");
  const resultsRef = useRef<HTMLDivElement>(null);

  // ===== SURVIVAL PLAN STATE =====
  const [survivalDays, setSurvivalDays] = useState(7);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [survivalPlan, setSurvivalPlan] = useState<SurvivalPlanResult | null>(null);
  const [prefsSet, setPrefsSet] = useState(false);

  const selectedBrand: NoodleBrand =
    NOODLE_BRANDS.find((b) => b.id === brandId) ?? NOODLE_BRANDS[0];

  function handleCalculate() {
    const input: UserInput = { weight, height, age, gender, activity };
    const r = calculateNutrition(input, selectedBrand);
    setResult(r);
    setSurvivalPlan(null);
    setPrefsSet(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handlePref(id: string, liked: boolean) {
    setPreferences((prev) => ({ ...prev, [id]: liked }));
  }

  function handleGeneratePlan() {
    if (!result) return;
    const plan = generateSurvivalPlan(result, survivalDays, preferences);
    setSurvivalPlan(plan);
    setPrefsSet(true);
  }

  // Ingrediënten waarvoor we voorkeur vragen (niet het halfpakketje, dat is altijd aan)
  const prefIngredients = SURVIVAL_INGREDIENTS.filter((i) => i.id !== "halfpacket");

  const sodiumPct = result ? Math.min((result.totalSodiumMg / 2000) * 100, 300) : 0;
  const sodiumColor =
    result && result.totalSodiumMg > 4000 ? "#c0392b"
    : result && result.totalSodiumMg > 2000 ? "#d68910"
    : "#27ae60";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg aria-label="Noodle Calc" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
              <path d="M8 16 L10 34 Q10 36 12 36 L28 36 Q30 36 30 34 L32 16 Z" fill="currentColor" opacity="0.15" />
              <path d="M8 16 L10 34 Q10 36 12 36 L28 36 Q30 36 30 34 L32 16 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <rect x="6" y="13" width="28" height="4" rx="2" fill="currentColor" opacity="0.8" />
              <path d="M14 22 Q17 20 20 22 Q23 24 26 22" stroke="hsl(28 85% 42%)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M13 27 Q16 25 19 27 Q22 29 25 27 Q27 26 27 27" stroke="hsl(28 85% 42%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M16 10 Q15 7 16 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" className="steam-1" />
              <path d="M20 9 Q19 6 20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" className="steam-2" />
              <path d="M24 10 Q23 7 24 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" className="steam-3" />
            </svg>
            <div>
              <h1 className="text-sm font-semibold leading-tight">Noodle Survival Calc</h1>
              <p className="text-xs text-muted-foreground">Overleef op instant noodles</p>
            </div>
          </div>
          <button data-testid="button-theme-toggle" onClick={onToggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Wissel thema">
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* ===== HERO ===== */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 border border-primary/20">
            🍜 Hoeveel pakjes voor een dag overleven?
          </div>
          <h2 className="text-xl font-bold mb-2">Instant Noodle Overlevingscalculator</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Bereken op basis van je lichaam en activiteitsniveau hoeveel pakjes je nodig hebt, wat je mist, en maak een persoonlijk overlevingsplan.
          </p>
        </div>

        {/* ===== INPUT FORM ===== */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6" data-testid="form-inputs">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Noodle merk</Label>
              <Select value={brandId} onValueChange={setBrandId}>
                <SelectTrigger data-testid="trigger-brand">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOODLE_BRANDS.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <span>{selectedBrand.calories} kcal</span>
                <span>·</span>
                <span>{selectedBrand.proteinG}g eiwit</span>
                <span>·</span>
                <span className="font-semibold" style={{ color: selectedBrand.sodiumMg > 1800 ? "var(--color-warning-custom)" : "inherit" }}>
                  {selectedBrand.sodiumMg}mg natrium
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Geslacht</Label>
              <div className="flex gap-2">
                {(["male", "female"] as Gender[]).map((g) => (
                  <button key={g} data-testid={`button-gender-${g}`} onClick={() => setGender(g)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${gender === g ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}>
                    {g === "male" ? "Man" : "Vrouw"}
                  </button>
                ))}
              </div>
            </div>

            <SliderField label="Gewicht" value={weight} min={40} max={150} step={1} unit="kg" onChange={setWeight} testId="slider-weight" />
            <SliderField label="Lengte" value={height} min={140} max={220} step={1} unit="cm" onChange={setHeight} testId="slider-height" />
            <SliderField label="Leeftijd" value={age} min={16} max={80} step={1} unit="jaar" onChange={setAge} testId="slider-age" />

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Activiteitsniveau</Label>
              <Select value={activity} onValueChange={(v) => setActivity(v as ActivityLevel)}>
                <SelectTrigger data-testid="trigger-activity"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button data-testid="button-calculate" className="w-full font-semibold text-base py-5" onClick={handleCalculate}>
              Bereken mijn overleving 🍜
            </Button>
          </div>

          {/* Right side — empty state or quick stats */}
          {!result ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center gap-4">
              <div className="text-6xl">🍜</div>
              <p className="text-muted-foreground text-sm max-w-xs">Vul je gegevens in en klik op bereken om te zien hoeveel pakjes je nodig hebt — en wat je dreigt te missen.</p>
              <div className="text-xs text-muted-foreground/60 space-y-1">
                <p>Berekeningen gebaseerd op:</p>
                <p>• Mifflin-St Jeor BMR formule</p>
                <p>• WHO natrium limiet (2000mg/dag)</p>
                <p>• EFSA eiwitaanbeveling (1.2g/kg)</p>
              </div>
            </div>
          ) : (
            <div ref={resultsRef} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card" data-testid="stat-packages">
                  <span className="stat-value">{result.packagesPerDay}×</span>
                  <span className="stat-label">Pakjes per dag</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{result.tdee}</span>
                  <span className="stat-label">TDEE (kcal)</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value" style={{ color: result.caloriesDeficit > 500 ? "var(--color-danger)" : "hsl(var(--primary))" }}>
                    {result.caloriesFromNoodles}
                  </span>
                  <span className="stat-label">Kcal uit noodles {result.caloriesDeficit > 0 ? `(−${result.caloriesDeficit})` : ""}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value" style={{ color: result.proteinDeficitG > 0 ? "var(--color-warning-custom)" : "hsl(var(--primary))" }}>
                    {result.totalProteinG}g
                  </span>
                  <span className="stat-label">Eiwit (nodig: {result.proteinNeededG}g)</span>
                </div>
              </div>

              {/* Sodium meter */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold">Natriumbelasting</span>
                  <span className="font-mono text-sm font-medium" style={{ color: sodiumColor }}>
                    {result.totalSodiumMg}mg = {getSodiumSalt(result.totalSodiumMg)}g zout
                  </span>
                </div>
                <div className="sodium-bar-track">
                  <div className="sodium-bar-fill" style={{ width: `${Math.min(sodiumPct / 3, 100)}%`, background: sodiumColor }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span style={{ color: "var(--color-success)" }}>WHO max (2000mg)</span>
                  <span>{result.totalSodiumMg}mg</span>
                </div>
              </div>

              {/* Survival timeline card */}
              <div className="rounded-xl border p-4 space-y-2"
                style={{
                  background: result.survivalTimeline.verdict === "ok" ? "var(--color-success-bg)" : "var(--color-warning-bg)",
                  borderColor: result.survivalTimeline.verdict === "ok" ? "var(--color-success)" : "var(--color-warning-custom)",
                }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">📅</span>
                  <p className="font-semibold text-sm">Hoe lang kun je dit volhouden?</p>
                </div>
                <p className="text-sm leading-relaxed">{result.survivalTimeline.shortTerm}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{result.survivalTimeline.mediumTerm}</p>
                <div className="pt-1 border-t border-black/10 dark:border-white/10">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold">Echt kritiek pas na: </span>
                    ~{result.survivalTimeline.criticalDays} dagen
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== TABBED DETAIL SECTIONS ===== */}
        {result && (
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="analyse" className="flex-1">🔬 Analyse</TabsTrigger>
                <TabsTrigger value="plan" className="flex-1">📦 Overlevingsplan</TabsTrigger>
              </TabsList>

              {/* ===== TAB 1: ANALYSE ===== */}
              <TabsContent value="analyse" className="space-y-8">
                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <section>
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">⚠️ Waarschuwingen</h3>
                    <div className="space-y-3">
                      {result.warnings.map((w, i) => (
                        <div key={i} className={`rounded-xl px-4 py-3 warning-${w.level}`}>
                          <div className="flex items-start gap-2">
                            <span className="text-lg shrink-0 mt-0.5">{w.icon}</span>
                            <div>
                              <p className="font-semibold text-sm">{w.title}</p>
                              <p className="text-sm mt-0.5 opacity-90">{w.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Realistische tijdlijn */}
                <section>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">📅 Realistische tijdlijn</h3>
                  <div className="space-y-3">
                    {[
                      {
                        period: "Dag 1–7",
                        status: "ok" as const,
                        text: result.survivalTimeline.shortTerm.replace("Dag 1–7: ", ""),
                      },
                      {
                        period: "Week 1–4",
                        status: "caution" as const,
                        text: result.survivalTimeline.mediumTerm.replace("Week 1–4: ", ""),
                      },
                      {
                        period: "Maand 1–3",
                        status: "warning" as const,
                        text: result.survivalTimeline.longTerm.replace("Maand 1–3: ", ""),
                      },
                      {
                        period: `Na ~${result.survivalTimeline.criticalDays} dagen`,
                        status: "risk" as const,
                        text: result.survivalTimeline.criticalPoint,
                      },
                    ].map((row, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{
                            background: row.status === "ok" ? "var(--color-success)" : row.status === "caution" ? "var(--color-info)" : row.status === "warning" ? "var(--color-warning-custom)" : "var(--color-danger)",
                          }} />
                          {i < 3 && <div className="w-0.5 h-6 bg-border" />}
                        </div>
                        <div className="pb-3">
                          <span className="text-xs font-semibold uppercase tracking-wide" style={{
                            color: row.status === "ok" ? "var(--color-success)" : row.status === "caution" ? "var(--color-info)" : row.status === "warning" ? "var(--color-warning-custom)" : "var(--color-danger)",
                          }}>{row.period}</span>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{row.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Micronutrients */}
                <section>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">🔬 Micronutriënttekorten</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {result.micronutrientDeficits.map((d, i) => (
                      <div key={i} className={`rounded-xl p-4 deficit-${d.status}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-semibold text-sm">{d.nutrient}</span>
                          <span className="text-xs px-2 py-1 rounded-full font-semibold shrink-0" style={{
                            background: d.status === "critical" ? "var(--color-danger)" : d.status === "low" ? "var(--color-warning-custom)" : "var(--color-info)",
                            color: "#fff",
                          }}>
                            {d.status === "critical" ? "Kritisch" : d.status === "low" ? "Laag" : "Matig"}
                          </span>
                        </div>
                        <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full mb-2 overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${d.percentOfRDI}%`,
                            background: d.status === "critical" ? "var(--color-danger)" : d.status === "low" ? "var(--color-warning-custom)" : "var(--color-info)",
                          }} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{d.percentOfRDI}% van dagbehoefte</p>
                        <p className="text-sm leading-relaxed" style={{ opacity: 0.8 }}>{d.consequence}</p>
                        <p className="text-sm mt-2 font-medium leading-relaxed">
                          <span className="text-muted-foreground">Oplossing: </span>{d.solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Weekly summary */}
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2">📦 Weekoverzicht (zonder extras)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {[
                      { label: "Pakjes/week", value: `${result.weeklyPackages}×`, emoji: "🍜" },
                      { label: "Natrium/dag", value: `${Math.round(result.totalSodiumMg / 100) / 10}g`, emoji: "🧂" },
                      { label: "Zout/dag", value: `${getSodiumSalt(result.totalSodiumMg)}g`, emoji: "🫙" },
                      { label: "Kritiek pas na", value: `~${result.survivalTimeline.criticalDays}d`, emoji: "⏱️" },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 p-3 bg-muted/30 rounded-xl">
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="font-mono font-semibold text-lg">{item.value}</span>
                        <span className="text-xs text-muted-foreground text-center">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20 text-sm text-center">
                    <span className="font-semibold text-primary">Gouden regel:</span>{" "}
                    <span className="text-muted-foreground">Gebruik het smaakpakketje maar <strong className="text-foreground">half</strong> — dat halveert je zoutinname direct.</span>
                  </div>
                </section>
              </TabsContent>

              {/* ===== TAB 2: OVERLEVINGSPLAN ===== */}
              <TabsContent value="plan" className="space-y-6">

                {/* Stap 1: Dagen instellen */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-base font-semibold mb-1">Stap 1 — Hoeveel dagen wil je overleven?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Stel in hoe lang je het moet volhouden. We berekenen wat je extra nodig hebt.</p>
                  <SliderField
                    label="Overlevingsdagen"
                    value={survivalDays}
                    min={1}
                    max={30}
                    step={1}
                    unit="dagen"
                    onChange={setSurvivalDays}
                    testId="slider-survival-days"
                  />
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[3, 7, 14, 30].map((d) => (
                      <button key={d} onClick={() => setSurvivalDays(d)}
                        className={`py-2 rounded-lg text-sm font-medium border transition-all ${survivalDays === d ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stap 2: Voorkeuren */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-base font-semibold mb-1">Stap 2 — Wat lust je?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Geef aan welke extra ingrediënten je wil of niet wil. We passen het plan hierop aan.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {prefIngredients.map((ing) => {
                      const pref = preferences[ing.id];
                      return (
                        <div key={ing.id} data-testid={`pref-${ing.id}`}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xl shrink-0">{ing.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{ing.nameShort}</p>
                              <p className="text-xs text-muted-foreground truncate">{ing.amountPerDay}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              data-testid={`pref-${ing.id}-yes`}
                              onClick={() => handlePref(ing.id, true)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${pref === true ? "bg-green-500 text-white border-green-500" : "bg-background border-border hover:bg-muted text-muted-foreground"}`}>
                              ✓ Ja
                            </button>
                            <button
                              data-testid={`pref-${ing.id}-no`}
                              onClick={() => handlePref(ing.id, false)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${pref === false ? "bg-red-500 text-white border-red-500" : "bg-background border-border hover:bg-muted text-muted-foreground"}`}>
                              ✗ Nee
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Niets aanvinken = alles is beschikbaar. Je kunt ook gewoon direct genereren.</p>
                </div>

                {/* Genereer knop */}
                <Button data-testid="button-generate-plan" className="w-full font-semibold text-base py-5" onClick={handleGeneratePlan}>
                  Genereer mijn {survivalDays}-daags overlevingsplan 🗓️
                </Button>

                {/* ===== PLAN RESULTAAT ===== */}
                {survivalPlan && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Dagelijkse voeding MET extras */}
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                      <h3 className="text-base font-semibold mb-4 text-primary flex items-center gap-2">
                        ✅ Dagelijkse voeding mét extra ingrediënten
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          {
                            label: "Calorieën",
                            value: `${survivalPlan.dailyNutritionWithExtras.calories} kcal`,
                            ok: survivalPlan.dailyNutritionWithExtras.calories >= result.tdee * 0.9,
                            target: `doel: ${result.tdee}`,
                          },
                          {
                            label: "Eiwit",
                            value: `${Math.round(survivalPlan.dailyNutritionWithExtras.proteinG)}g`,
                            ok: survivalPlan.dailyNutritionWithExtras.proteinG >= result.proteinNeededG * 0.9,
                            target: `doel: ${result.proteinNeededG}g`,
                          },
                          {
                            label: "Natrium",
                            value: `${Math.round(survivalPlan.dailyNutritionWithExtras.sodiumMg)}mg`,
                            ok: survivalPlan.dailyNutritionWithExtras.sodiumMg <= 2000,
                            target: "max: 2000mg",
                          },
                          {
                            label: "Vit C",
                            value: survivalPlan.dailyNutritionWithExtras.vitaminCCovered ? "Gedekt ✓" : "Ontbreekt ✗",
                            ok: survivalPlan.dailyNutritionWithExtras.vitaminCCovered,
                            target: "",
                          },
                        ].map((stat, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-xl text-center"
                            style={{ background: stat.ok ? "var(--color-success-bg)" : "var(--color-warning-bg)" }}>
                            <span className="font-mono font-bold text-base" style={{ color: stat.ok ? "var(--color-success)" : "var(--color-warning-custom)" }}>
                              {stat.value}
                            </span>
                            <span className="text-xs font-medium text-foreground">{stat.label}</span>
                            {stat.target && <span className="text-xs text-muted-foreground">{stat.target}</span>}
                          </div>
                        ))}
                      </div>

                      {/* Plan warnings */}
                      {survivalPlan.warnings.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {survivalPlan.warnings.map((w, i) => (
                            <div key={i} className="warning-warning rounded-lg px-3 py-2 text-sm flex gap-2 items-start">
                              <span>⚠️</span><span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dagmenu */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">🍽️ Dagmenu (herhaal elke dag)</h3>
                      <div className="space-y-3">
                        {/* Noodles eerst */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                          <span className="text-2xl">🍜</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{selectedBrand.name}</p>
                            <p className="text-xs text-muted-foreground">{result.packagesPerDay}× per dag · {result.caloriesFromNoodles} kcal · {result.totalProteinG}g eiwit</p>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground shrink-0">{result.packagesPerDay}×/dag</span>
                        </div>
                        {/* Extra ingrediënten */}
                        {survivalPlan.dailyIngredients.map((ing) => (
                          <div key={ing.id} className={`flex items-center gap-3 p-3 rounded-xl border ingredient-${ing.priority <= 2 ? "critical" : ing.priority <= 3 ? "high" : "medium"} bg-card`}>
                            <span className="text-2xl shrink-0">{ing.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{ing.nameDutch}</p>
                              <p className="text-xs text-muted-foreground flex flex-wrap gap-1">
                                {ing.fixes.slice(0, 3).map((f) => (
                                  <span key={f} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{f}</span>
                                ))}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-mono font-semibold">{ing.amountPerDayShort}</p>
                              {ing.caloriesPerDay > 0 && <p className="text-xs text-muted-foreground">+{ing.caloriesPerDay} kcal</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Boodschappenlijst */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-base font-semibold flex items-center gap-2">🛒 Boodschappenlijst voor {survivalPlan.days} dagen</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Geschatte totaalkosten: ~€{survivalPlan.totalEstimatedCost.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {survivalPlan.shoppingList.map((item, i) => (
                          <div key={i} data-testid={`shopping-item-${i}`}
                            className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                            <span className="text-xl w-8 text-center shrink-0">{item.ingredient.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{item.ingredient.nameDutch}</p>
                              <p className="text-xs text-muted-foreground">{item.totalAmountNote}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-mono font-semibold text-sm">{item.totalAmount}</p>
                              <p className="text-xs text-muted-foreground">~€{item.estimatedCost.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <span className="font-semibold text-sm">Totaal geschat</span>
                        <span className="font-mono font-bold text-lg text-primary">€{survivalPlan.totalEstimatedCost.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">* Prijzen zijn ruwe schattingen op basis van gemiddelde supermarktprijzen in NL.</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        <footer className="mt-10 pb-6 text-center text-xs text-muted-foreground/60 max-w-xl mx-auto leading-relaxed">
          <p>Berekeningen gebaseerd op Mifflin-St Jeor, WHO natriumrichtlijnen en EFSA eiwitaanbevelingen. Geen medisch advies.</p>
        </footer>
      </main>
    </div>
  );
}

function SliderField({ label, value, min, max, step, unit, onChange, testId }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; testId: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <Label className="text-sm font-semibold">{label}</Label>
        <span className="font-mono text-sm font-medium text-primary" data-testid={`${testId}-value`}>{value} {unit}</span>
      </div>
      <Slider data-testid={testId} min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} className="py-1" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} {unit}</span><span>{max} {unit}</span>
      </div>
    </div>
  );
}
