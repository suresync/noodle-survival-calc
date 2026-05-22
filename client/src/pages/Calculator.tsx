import { useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  calculateNutrition,
  NOODLE_BRANDS,
  ACTIVITY_LABELS,
  getSodiumSalt,
  type UserInput,
  type ActivityLevel,
  type Gender,
  type NutritionResult,
  type NoodleBrand,
} from "@/lib/nutrition";

interface Props {
  dark: boolean;
  onToggleDark: () => void;
}

export default function Calculator({ dark, onToggleDark }: Props) {
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [brandId, setBrandId] = useState("generic");
  const [result, setResult] = useState<NutritionResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const selectedBrand: NoodleBrand =
    NOODLE_BRANDS.find((b) => b.id === brandId) ?? NOODLE_BRANDS[0];

  function handleCalculate() {
    const input: UserInput = { weight, height, age, gender, activity };
    const r = calculateNutrition(input, selectedBrand);
    setResult(r);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const sodiumPct = result ? Math.min((result.totalSodiumMg / 2000) * 100, 300) : 0;
  const sodiumColor =
    result && result.totalSodiumMg > 4000
      ? "#c0392b"
      : result && result.totalSodiumMg > 2000
      ? "#d68910"
      : "#27ae60";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* SVG Logo */}
            <svg
              aria-label="Instant Noodle Calculator"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9"
            >
              {/* Cup shape */}
              <path d="M8 16 L10 34 Q10 36 12 36 L28 36 Q30 36 30 34 L32 16 Z" fill="currentColor" opacity="0.15" />
              <path d="M8 16 L10 34 Q10 36 12 36 L28 36 Q30 36 30 34 L32 16 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              {/* Lid */}
              <rect x="6" y="13" width="28" height="4" rx="2" fill="currentColor" opacity="0.8" />
              {/* Noodle lines */}
              <path d="M14 22 Q17 20 20 22 Q23 24 26 22" stroke="hsl(28 85% 42%)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M13 27 Q16 25 19 27 Q22 29 25 27 Q27 26 27 27" stroke="hsl(28 85% 42%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Steam */}
              <path d="M16 10 Q15 7 16 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" className="steam-1" />
              <path d="M20 9 Q19 6 20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" className="steam-2" />
              <path d="M24 10 Q23 7 24 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" className="steam-3" />
            </svg>
            <div>
              <h1 className="text-sm font-semibold leading-tight">Noodle Survival Calc</h1>
              <p className="text-xs text-muted-foreground">Overleef op instant noodles</p>
            </div>
          </div>
          <button
            data-testid="button-theme-toggle"
            onClick={onToggleDark}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Wissel thema"
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
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
            Bereken op basis van je lichaam en activiteitsniveau hoeveel pakjes je nodig hebt, wat je mist, en hoe lang je dit volhoudt.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* ===== INPUT FORM ===== */}
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6" data-testid="form-inputs">

            {/* Brand selector */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Noodle merk</Label>
              <Select value={brandId} onValueChange={setBrandId} data-testid="select-brand">
                <SelectTrigger className="w-full" data-testid="trigger-brand">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOODLE_BRANDS.map((b) => (
                    <SelectItem key={b.id} value={b.id} data-testid={`brand-option-${b.id}`}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-3 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <span>{selectedBrand.calories} kcal</span>
                <span>·</span>
                <span>{selectedBrand.proteinG}g eiwit</span>
                <span>·</span>
                <span className="font-semibold" style={{ color: selectedBrand.sodiumMg > 1800 ? "var(--color-warning-custom)" : "inherit" }}>
                  {selectedBrand.sodiumMg}mg natrium
                </span>
              </div>
            </div>

            {/* Geslacht */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Geslacht</Label>
              <div className="flex gap-2">
                {(["male", "female"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    data-testid={`button-gender-${g}`}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                      gender === g
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                  >
                    {g === "male" ? "Man" : "Vrouw"}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight slider */}
            <SliderField
              label="Gewicht"
              value={weight}
              min={40}
              max={150}
              step={1}
              unit="kg"
              onChange={setWeight}
              testId="slider-weight"
            />

            {/* Height slider */}
            <SliderField
              label="Lengte"
              value={height}
              min={140}
              max={220}
              step={1}
              unit="cm"
              onChange={setHeight}
              testId="slider-height"
            />

            {/* Age slider */}
            <SliderField
              label="Leeftijd"
              value={age}
              min={16}
              max={80}
              step={1}
              unit="jaar"
              onChange={setAge}
              testId="slider-age"
            />

            {/* Activity level */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Activiteitsniveau</Label>
              <Select value={activity} onValueChange={(v) => setActivity(v as ActivityLevel)}>
                <SelectTrigger data-testid="trigger-activity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k} data-testid={`activity-option-${k}`}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              data-testid="button-calculate"
              className="w-full font-semibold text-base py-5"
              onClick={handleCalculate}
            >
              Bereken mijn overleving 🍜
            </Button>
          </div>

          {/* ===== QUICK PREVIEW (pre-result) ===== */}
          {!result && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center gap-4">
              <div className="text-6xl">🍜</div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Vul je gegevens in en klik op bereken om te zien hoeveel pakjes je nodig hebt — en wat je dreigt te missen.
              </p>
              <div className="text-xs text-muted-foreground/60 space-y-1">
                <p>Berekeningen gebaseerd op:</p>
                <p>• Mifflin-St Jeor BMR formule</p>
                <p>• WHO natrium limiet (2000mg/dag)</p>
                <p>• EFSA eiwitaanbeveling (1.2g/kg)</p>
              </div>
            </div>
          )}

          {/* ===== RESULTS ===== */}
          {result && (
            <div ref={resultsRef} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card" data-testid="stat-packages">
                  <span className="stat-value">{result.packagesPerDay}×</span>
                  <span className="stat-label">Pakjes per dag</span>
                </div>
                <div className="stat-card" data-testid="stat-tdee">
                  <span className="stat-value">{result.tdee}</span>
                  <span className="stat-label">TDEE (kcal)</span>
                </div>
                <div className="stat-card" data-testid="stat-calories">
                  <span className="stat-value" style={{ color: result.caloriesDeficit > 500 ? "var(--color-danger)" : "hsl(var(--primary))" }}>
                    {result.caloriesFromNoodles}
                  </span>
                  <span className="stat-label">
                    Kcal uit noodles {result.caloriesDeficit > 0 ? `(−${result.caloriesDeficit} tekort)` : ""}
                  </span>
                </div>
                <div className="stat-card" data-testid="stat-protein">
                  <span className="stat-value" style={{ color: result.proteinDeficitG > 0 ? "var(--color-warning-custom)" : "hsl(var(--primary))" }}>
                    {result.totalProteinG}g
                  </span>
                  <span className="stat-label">Eiwit (nodig: {result.proteinNeededG}g)</span>
                </div>
              </div>

              {/* Sodium meter */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-2" data-testid="sodium-meter">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold">Natriumbelasting</span>
                  <span className="font-mono text-sm font-medium" style={{ color: sodiumColor }}>
                    {result.totalSodiumMg} mg natrium = {getSodiumSalt(result.totalSodiumMg)}g zout
                  </span>
                </div>
                <div className="sodium-bar-track">
                  <div
                    className="sodium-bar-fill"
                    style={{
                      width: `${Math.min(sodiumPct / 3, 100)}%`,
                      background: sodiumColor,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="font-medium" style={{ color: "var(--color-success)" }}>
                    WHO max (2000mg)
                  </span>
                  <span>{Math.round(result.totalSodiumMg)}mg</span>
                </div>
                {result.totalSodiumMg > 2000 && (
                  <p className="text-xs" style={{ color: sodiumColor }}>
                    {Math.round(result.totalSodiumMg / 2000 * 10) / 10}× de WHO-limiet — overweeg het smaakpakketje half te gebruiken
                  </p>
                )}
              </div>

              {/* Survival estimate */}
              <div className="rounded-xl border p-4 flex items-center gap-3"
                style={{
                  background: result.survivalDays <= 7 ? "var(--color-danger-bg)" : result.survivalDays <= 10 ? "var(--color-warning-bg)" : "var(--color-info-bg)",
                  borderColor: result.survivalDays <= 7 ? "var(--color-danger)" : result.survivalDays <= 10 ? "var(--color-warning-custom)" : "var(--color-info)",
                }}>
                <div className="text-3xl">⏱️</div>
                <div>
                  <p className="font-semibold text-sm">Geschatte overleefduur (zonder extras)</p>
                  <p className="text-lg font-mono font-medium" style={{ color: result.survivalDays <= 7 ? "var(--color-danger)" : result.survivalDays <= 10 ? "var(--color-warning-custom)" : "var(--color-info)" }}>
                    ~{result.survivalDays} dagen
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Daarna beginnen micronutriënttekorten merkbaar lichamelijke schade aan te richten
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== WARNINGS ===== */}
        {result && result.warnings.length > 0 && (
          <section className="mt-8" data-testid="section-warnings">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span>⚠️</span> Waarschuwingen
            </h3>
            <div className="space-y-3">
              {result.warnings.map((w, i) => (
                <div
                  key={i}
                  data-testid={`warning-item-${i}`}
                  className={`rounded-xl px-4 py-3 warning-${w.level}`}
                >
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

        {/* ===== MICRONUTRIENT DEFICITS ===== */}
        {result && (
          <section className="mt-8" data-testid="section-micronutrients">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span>🔬</span> Micronutriënttekorten bij uitsluitend instant noodles
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.micronutrientDeficits.map((d, i) => (
                <div
                  key={i}
                  data-testid={`deficit-${d.nutrient.toLowerCase().replace(/\s/g, '-')}`}
                  className={`rounded-xl p-4 deficit-${d.status}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm">{d.nutrient}</span>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold shrink-0"
                      style={{
                        background: d.status === "critical" ? "var(--color-danger)" : d.status === "low" ? "var(--color-warning-custom)" : "var(--color-info)",
                        color: "#fff",
                      }}
                    >
                      {d.status === "critical" ? "Kritisch" : d.status === "low" ? "Laag" : "Matig"}
                    </span>
                  </div>
                  {/* RDI bar */}
                  <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full mb-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${d.percentOfRDI}%`,
                        background: d.status === "critical" ? "var(--color-danger)" : d.status === "low" ? "var(--color-warning-custom)" : "var(--color-info)",
                      }}
                    />
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
        )}

        {/* ===== EXTRA INGREDIËNTEN ===== */}
        {result && (
          <section className="mt-8" data-testid="section-ingredients">
            <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
              <span>🛒</span> Aanbevolen extra ingrediënten
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Voeg dit toe aan je noodles om de ergste tekorten op te vullen
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.extraIngredients.map((ing, i) => (
                <div
                  key={i}
                  data-testid={`ingredient-${i}`}
                  className={`rounded-xl p-4 bg-card border border-border ingredient-${ing.priority} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm leading-tight">{ing.nameDutch}</span>
                    <span
                      className="text-xs px-2 py-1 rounded font-semibold shrink-0"
                      style={{
                        background: ing.priority === "critical" ? "var(--color-danger)" : ing.priority === "high" ? "var(--color-warning-custom)" : "var(--color-info)",
                        color: "#fff",
                      }}
                    >
                      {ing.priority === "critical" ? "Kritisch" : ing.priority === "high" ? "Hoog" : "Medium"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 font-medium">{ing.amount}</p>
                  <div className="flex gap-2 text-xs font-mono text-muted-foreground mb-2">
                    <span className="bg-muted px-2 py-1 rounded">+{ing.calories} kcal</span>
                    {ing.proteinG > 0 && <span className="bg-muted px-2 py-1 rounded">+{ing.proteinG}g eiwit</span>}
                  </div>
                  {ing.vitamins.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {ing.vitamins.map((v) => (
                        <span key={v} className="text-xs bg-primary/15 text-primary px-2 py-1 rounded-full font-semibold">
                          Vit {v}
                        </span>
                      ))}
                      {ing.minerals.slice(0, 2).map((m) => (
                        <span key={m} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed">{ing.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== WEEKLY SUMMARY ===== */}
        {result && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-5" data-testid="section-weekly">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span>📦</span> Weekoverzicht
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "Pakjes/week", value: `${result.weeklyPackages}×`, emoji: "🍜" },
                { label: "Natrium/dag", value: `${Math.round(result.totalSodiumMg / 100) / 10}g`, emoji: "🧂" },
                { label: "Zout/dag", value: `${getSodiumSalt(result.totalSodiumMg)}g`, emoji: "🫙" },
                { label: "Overleef (realistisch)", value: `~${result.survivalDays}d`, emoji: "⏱️" },
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
              <span className="text-muted-foreground">Gebruik het smaakpakketje maar <strong className="text-foreground">half</strong> om natrium te halveren. Voeg een ei + groenten toe voor een aanvaardbaar nooddieet.</span>
            </div>
          </section>
        )}

        {/* ===== DISCLAIMER ===== */}
        <footer className="mt-10 pb-6 text-center text-xs text-muted-foreground/60 max-w-xl mx-auto leading-relaxed">
          <p>
            Berekeningen zijn indicatief op basis van de Mifflin-St Jeor formule, WHO natriumrichtlijnen en EFSA eiwitaanbevelingen.
            Dit vervangt geen medisch advies. Raadpleeg een diëtist bij langdurige caloriebeperking.
          </p>
        </footer>
      </main>
    </div>
  );
}

// ===== REUSABLE SLIDER FIELD =====
function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  testId: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <Label className="text-sm font-semibold">{label}</Label>
        <span className="font-mono text-sm font-medium text-primary" data-testid={`${testId}-value`}>
          {value} {unit}
        </span>
      </div>
      <Slider
        data-testid={testId}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="py-1"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}
