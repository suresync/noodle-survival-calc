// ============================================================
// INSTANT NOODLE SURVIVAL CALCULATOR — Voedingsberekeningen
// ============================================================

export type Gender = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export interface UserInput {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: Gender;
  activity: ActivityLevel;
}

export interface NoodleBrand {
  id: string;
  name: string;
  weightG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sodiumMg: number;
  saturatedFatG: number;
}

export interface ExtraIngredient {
  name: string;
  nameDutch: string;
  amount: string;
  calories: number;
  proteinG: number;
  sodiumMg?: number;
  vitamins: string[];
  minerals: string[];
  priority: "critical" | "high" | "medium";
  reason: string;
}

export interface NutritionResult {
  tdee: number;
  bmr: number;
  packagesPerDay: number;
  caloriesFromNoodles: number;
  caloriesDeficit: number;
  totalSodiumMg: number;
  totalProteinG: number;
  proteinNeededG: number;
  proteinDeficitG: number;
  warnings: Warning[];
  micronutrientDeficits: MicroDeficit[];
  extraIngredients: ExtraIngredient[];
  survivalTimeline: SurvivalTimeline;
  weeklyPackages: number;
}

export interface SurvivalTimeline {
  shortTerm: string;  // 1-7 dagen
  mediumTerm: string; // 1-4 weken
  longTerm: string;   // 1-3 maanden
  criticalPoint: string; // wanneer het echt gevaarlijk wordt
  criticalDays: number;  // na hoeveel dagen echt ingrijpen nodig
  verdict: "ok" | "caution" | "risk";
}

export interface Warning {
  level: "danger" | "warning" | "info";
  title: string;
  message: string;
  icon: string;
}

export interface MicroDeficit {
  nutrient: string;
  status: "critical" | "low" | "moderate";
  percentOfRDI: number;
  consequence: string;
  solution: string;
}

// Gemiddelde instant noodles pakje (bijv. Indomie / Knorr / Nissin)
export const NOODLE_BRANDS: NoodleBrand[] = [
  {
    id: "generic",
    name: "Standaard instant noodles",
    weightG: 85,
    calories: 385,
    proteinG: 8.5,
    carbsG: 52,
    fatG: 14,
    sodiumMg: 1760,
    saturatedFatG: 7,
  },
  {
    id: "indomie",
    name: "Indomie Mi Goreng (85g)",
    weightG: 85,
    calories: 400,
    proteinG: 9,
    carbsG: 55,
    fatG: 16,
    sodiumMg: 1600,
    saturatedFatG: 7.5,
  },
  {
    id: "nissin",
    name: "Nissin Cup Noodles (64g)",
    weightG: 64,
    calories: 290,
    proteinG: 6.5,
    carbsG: 40,
    fatG: 11,
    sodiumMg: 1430,
    saturatedFatG: 5.5,
  },
  {
    id: "mama",
    name: "MAMA Instant Noodles (90g)",
    weightG: 90,
    calories: 395,
    proteinG: 8,
    carbsG: 57,
    fatG: 14.5,
    sodiumMg: 1900,
    saturatedFatG: 7,
  },
  {
    id: "knorr",
    name: "Knorr Snack Noodles (68g)",
    weightG: 68,
    calories: 310,
    proteinG: 7,
    carbsG: 44,
    fatG: 11.5,
    sodiumMg: 1250,
    saturatedFatG: 5,
  },
  {
    id: "yumyum",
    name: "Yum Yum Chicken (60g)",
    weightG: 60,
    calories: 290,
    proteinG: 4.6,
    carbsG: 38,
    fatG: 13,
    sodiumMg: 1223,
    saturatedFatG: 6.1,
  },
];

// Activity multipliers (Mifflin-St Jeor)
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Zittend (nauwelijks beweging)",
  light: "Licht actief (1-3 dagen/week sporten)",
  moderate: "Matig actief (3-5 dagen/week)",
  active: "Actief (6-7 dagen/week)",
  very_active: "Zeer actief (zwaar werk / topsport)",
};

// Dagelijkse zout aanbeveling WHO: max 2000mg natrium (= 5g zout)
const SODIUM_MAX_MG = 2000;
// Eiwit aanbeveling: 0.83g per kg lichaamsgewicht (WHO/EFSA)
const PROTEIN_PER_KG = 0.83;
// Minimale veilige eiwitinname om spiermassa te behouden
const PROTEIN_MAINTAIN_MUSCLE_PER_KG = 1.2;

export function calculateBMR(input: UserInput): number {
  // Mifflin-St Jeor formule
  if (input.gender === "male") {
    return 10 * input.weight + 6.25 * input.height - 5 * input.age + 5;
  } else {
    return 10 * input.weight + 6.25 * input.height - 5 * input.age - 161;
  }
}

export function calculateTDEE(input: UserInput): number {
  const bmr = calculateBMR(input);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[input.activity]);
}

export function calculateNutrition(
  input: UserInput,
  brand: NoodleBrand
): NutritionResult {
  const bmr = Math.round(calculateBMR(input));
  const tdee = calculateTDEE(input);

  // Hoeveel pakjes nodig om TDEE te bereiken
  const packagesNeeded = tdee / brand.calories;
  // Maar ook beperkt door zout: max natrium / natrium per pakje
  const packagesBySodium = SODIUM_MAX_MG / brand.sodiumMg;

  // Je kunt nooit meer eten dan het zoutlimiet toestaat
  const packagesLimitedBySodium = packagesBySodium;
  const packagesActual = Math.min(
    Math.ceil(packagesNeeded),
    Math.floor(packagesBySodium) + 1 // een extra is acceptabel als nood
  );

  const effectivePackages = Math.max(1, Math.round(packagesNeeded));
  const caloriesFromNoodles = effectivePackages * brand.calories;
  const caloriesDeficit = Math.max(0, tdee - caloriesFromNoodles);
  const totalSodiumMg = effectivePackages * brand.sodiumMg;
  const totalProteinG = effectivePackages * brand.proteinG;
  const proteinNeededG = Math.round(input.weight * PROTEIN_MAINTAIN_MUSCLE_PER_KG);
  const proteinDeficitG = Math.max(0, proteinNeededG - totalProteinG);

  // ===== Waarschuwingen =====
  const warnings: Warning[] = [];

  // Zout waarschuwing
  if (totalSodiumMg > SODIUM_MAX_MG * 2) {
    warnings.push({
      level: "danger",
      icon: "🧂",
      title: "Ernstige zoutoverschrijding",
      message: `${Math.round(totalSodiumMg)} mg natrium per dag — dat is ${Math.round(totalSodiumMg / SODIUM_MAX_MG * 10) / 10}× de WHO-limiet van 2000 mg. Risico op hypertensie, nierschade en hartproblemen op de lange termijn.`,
    });
  } else if (totalSodiumMg > SODIUM_MAX_MG) {
    warnings.push({
      level: "warning",
      icon: "🧂",
      title: "Te veel zout",
      message: `${Math.round(totalSodiumMg)} mg natrium — boven de WHO-aanbeveling van 2000 mg/dag. Overweeg het smaakpakketje maar half te gebruiken.`,
    });
  }

  // Calorisch tekort
  if (caloriesDeficit > 500) {
    warnings.push({
      level: "danger",
      icon: "⚡",
      title: "Ernstig calorietekort",
      message: `Je mist ${caloriesDeficit} kcal per dag. Je lichaam gaat spiermassa afbreken voor energie. Voeg caloriedichte voeding toe (olijfolie, eieren, pindakaas).`,
    });
  } else if (caloriesDeficit > 200) {
    warnings.push({
      level: "warning",
      icon: "⚡",
      title: "Calorietekort",
      message: `Je mist ${caloriesDeficit} kcal per dag. Op de korte termijn is dit acceptabel, maar op de lange termijn leidt dit tot spier- en vetverlies.`,
    });
  }

  // Eiwittekort
  if (proteinDeficitG > 30) {
    warnings.push({
      level: "danger",
      icon: "💪",
      title: "Kritisch eiwittekort",
      message: `Slechts ${Math.round(totalProteinG)}g eiwit tegenover ${proteinNeededG}g nodig om spieren te behouden. Spierverlies start binnen 2 weken. Voeg direct eiwitbronnen toe.`,
    });
  } else if (proteinDeficitG > 0) {
    warnings.push({
      level: "warning",
      icon: "💪",
      title: "Eiwittekort",
      message: `${Math.round(totalProteinG)}g eiwit van noodles — je hebt ${proteinNeededG}g nodig. Voeg een ei of peulvruchten toe.`,
    });
  }

  // Micronutriënten altijd kritisch bij alleen instant noodles
  warnings.push({
    level: "warning",
    icon: "🥦",
    title: "Geen groenten of vezels",
    message: "Instant noodles bevatten vrijwel geen vitamine C, foliumzuur, kalium of vezels. Na 1-2 weken beginnen tekorten merkbaar te worden.",
  });

  // ===== Micronutriëntentekorten =====
  const micronutrientDeficits: MicroDeficit[] = [
    {
      nutrient: "Vitamine C",
      status: "critical",
      percentOfRDI: 2,
      consequence: "Scheurbuik na 4-8 weken: vermoeidheid, bloedend tandvlees, slecht wondgenezing",
      solution: "1 sinaasappel of 50g kiwi dekt de dagelijkse behoefte",
    },
    {
      nutrient: "Vitamine A",
      status: "critical",
      percentOfRDI: 5,
      consequence: "Nachtzichtproblemen, droge huid, verzwakt immuunsysteem",
      solution: "1 middelgrote wortel (80g) of halve zoete aardappel",
    },
    {
      nutrient: "Vitamine B12",
      status: "low",
      percentOfRDI: 8,
      consequence: "Bloedarmoede, zenuwschade bij maandenlang gebrek",
      solution: "1 ei levert 25% van de dagbehoefte; melk/yoghurt werkt ook",
    },
    {
      nutrient: "Calcium",
      status: "low",
      percentOfRDI: 6,
      consequence: "Botontkalking op lange termijn; spierkrampen",
      solution: "200ml melk of 125g yoghurt dekt ~25% van de dagbehoefte",
    },
    {
      nutrient: "IJzer",
      status: "low",
      percentOfRDI: 15,
      consequence: "Bloedarmoede: vermoeidheid, kortademigheid, concentratieproblemen",
      solution: "Linzen, bonen of spinazie; combineer met vitamine C voor betere opname",
    },
    {
      nutrient: "Kalium",
      status: "moderate",
      percentOfRDI: 20,
      consequence: "Spierkrampen, hartritme-onregelmatigheden bij hoog natriumgebruik",
      solution: "Banaan (358mg), aardappel (600mg) of tomaat",
    },
    {
      nutrient: "Vezels",
      status: "critical",
      percentOfRDI: 10,
      consequence: "Constipatie, slechte darmgezondheid, verhoogd risico op chronische ziekten",
      solution: "Groenten, fruit, volkoren producten of peulvruchten",
    },
    {
      nutrient: "Foliumzuur (B9)",
      status: "low",
      percentOfRDI: 8,
      consequence: "Bloedarmoede, vermoeidheid; extra kritisch bij zwangerschap",
      solution: "Spinazie, bonen, asperges of broccoli",
    },
  ];

  // ===== Extra ingrediënten aanbevelingen =====
  const extraIngredients: ExtraIngredient[] = [
    {
      name: "Egg",
      nameDutch: "Ei (gekookt/gepocheerd)",
      amount: "1-2 eieren",
      calories: 140,
      proteinG: 12,
      sodiumMg: 140,
      vitamins: ["B12", "B2", "D", "A"],
      minerals: ["Selenium", "Fosfor", "Jodium"],
      priority: "critical",
      reason: "Compleet eiwitprofiel + vitamine B12 — het goedkoopste overlevingsvoedsel",
    },
    {
      name: "Frozen spinach",
      nameDutch: "Spinazie (vers of diepvries)",
      amount: "100g",
      calories: 23,
      proteinG: 2.9,
      sodiumMg: 79,
      vitamins: ["C", "K", "A", "B9"],
      minerals: ["IJzer", "Calcium", "Kalium", "Magnesium"],
      priority: "critical",
      reason: "Dekt meerdere kritische tekorten tegelijk voor nauwelijks calorieën",
    },
    {
      name: "Canned beans",
      nameDutch: "Bonen uit blik (zwarte/kidney)",
      amount: "100g",
      calories: 127,
      proteinG: 8.7,
      sodiumMg: 5,
      vitamins: ["B9", "B1"],
      minerals: ["IJzer", "Kalium", "Magnesium", "Fosfor"],
      priority: "high",
      reason: "Eiwitten + vezels + foliumzuur — goedkoop en lang houdbaar",
    },
    {
      name: "Banana",
      nameDutch: "Banaan",
      amount: "1 middelgrote",
      calories: 89,
      proteinG: 1.1,
      sodiumMg: 1,
      vitamins: ["B6", "C"],
      minerals: ["Kalium", "Magnesium"],
      priority: "high",
      reason: "Corrigeert hoog kalium:natrium-disbalans van noodles; ook energieboost",
    },
    {
      name: "Olive oil",
      nameDutch: "Olijfolie / kokosolie",
      amount: "1 eetlepel (15ml)",
      calories: 120,
      proteinG: 0,
      sodiumMg: 0,
      vitamins: ["E"],
      minerals: [],
      priority: "high",
      reason: "Dicht calorietekort en bevat vitamine E en gezonde vetten",
    },
    {
      name: "Carrot",
      nameDutch: "Wortel",
      amount: "1 middelgrote (80g)",
      calories: 33,
      proteinG: 0.7,
      sodiumMg: 69,
      vitamins: ["A", "K", "B6"],
      minerals: ["Kalium"],
      priority: "high",
      reason: "Vitamine A — dekt vrijwel de volledige dagbehoefte, goedkoop en lang houdbaar",
    },
    {
      name: "Vitamin C source",
      nameDutch: "Sinaasappel / citroen",
      amount: "1 sinaasappel of sap van 1 citroen",
      calories: 62,
      proteinG: 1.2,
      sodiumMg: 0,
      vitamins: ["C", "B9"],
      minerals: ["Kalium"],
      priority: "critical",
      reason: "Voorkomt scheurbuik — 1 sinaasappel dekt 100% van de dagbehoefte aan vitamine C",
    },
    {
      name: "Frozen peas",
      nameDutch: "Diepvrieserwten",
      amount: "80g",
      calories: 66,
      proteinG: 5.4,
      sodiumMg: 5,
      vitamins: ["C", "K", "B1", "B9"],
      minerals: ["IJzer", "Magnesium"],
      priority: "medium",
      reason: "Goedkoop, lang bewaarbaar in vriezer, levert vezels en eiwitten",
    },
  ];

  // =========================================================
  // REALISTISCHE OVERLEEFDUUR TIJDLIJN
  // Gebaseerd op medische literatuur over vasten, micronutriënten
  // en natriumtolerantie. Noodles alleen = NIET dodelijk op korte termijn.
  // =========================================================
  const highSodium = totalSodiumMg > SODIUM_MAX_MG * 2;
  const criticalProtein = proteinDeficitG > 30;

  const survivalTimeline: SurvivalTimeline = {
    shortTerm: highSodium
      ? "Dag 1–7: Je voelt je prima. Mogelijk lichte dorst of hoofdpijn door hoog zoutgehalte — drink voldoende water."
      : "Dag 1–7: Geen merkbare problemen. Je lichaam heeft ruime voorraden van de meeste vitaminen.",
    mediumTerm: criticalProtein
      ? "Week 1–4: Vermoeidheid neemt toe. Door eiwitgebrek begin je langzaam spiermassa te verliezen (±100–200g/week). Nog geen acuut gevaar."
      : "Week 1–4: Lichte vermoeidheid mogelijk. Vitamine C-voorraad raakt na ~3–4 weken op als je geen fruit/groenten eet.",
    longTerm: "Maand 1–3: Na 4–8 weken zonder vitamine C kunnen eerste tekenen van scheurbuik optreden (tandvleesbloeding, vermoeidheid). IJzer- en foliumzuurtekort kan bloedarmoede veroorzaken. Nog steeds niet acuut levensbedreigend.",
    criticalPoint: highSodium
      ? "Het hoge zoutgehalte is op lange termijn (maanden–jaren) slecht voor je nieren en bloeddruk, maar is op korte termijn geen acuut gevaar zolang je voldoende water drinkt."
      : "Pas na meerdere maanden uitsluitend instant noodles worden tekorten echt gevaarlijk. Voeg af en toe een ei, stuk fruit of groente toe om dit ver uit te stellen.",
    criticalDays: highSodium ? 60 : 90,
    verdict: highSodium ? "caution" : criticalProtein ? "caution" : "ok",
  };

  return {
    tdee,
    bmr,
    packagesPerDay: effectivePackages,
    caloriesFromNoodles,
    caloriesDeficit,
    totalSodiumMg,
    totalProteinG: Math.round(totalProteinG),
    proteinNeededG,
    proteinDeficitG: Math.round(proteinDeficitG),
    warnings,
    micronutrientDeficits,
    extraIngredients,
    survivalTimeline,
    weeklyPackages: effectivePackages * 7,
  };
}

export function getSodiumSalt(sodiumMg: number): number {
  // 1g zout = 400mg natrium
  return Math.round((sodiumMg / 400) * 10) / 10;
}

export function getSodiumColor(sodiumMg: number): string {
  if (sodiumMg > SODIUM_MAX_MG * 2) return "danger";
  if (sodiumMg > SODIUM_MAX_MG) return "warning";
  return "ok";
}

// ============================================================
// SURVIVAL PLAN — X dagen overleven met ingredient voorkeuren
// ============================================================

export interface IngredientPreference {
  id: string;
  liked: boolean | null; // null = not yet set
}

export interface SurvivalIngredient {
  id: string;
  nameDutch: string;
  nameShort: string;
  emoji: string;
  // Per dag benodigde hoeveelheid
  amountPerDay: string;
  amountPerDayShort: string;
  // Wat het oplost
  fixes: string[];
  // Voedingswaarden per dag
  caloriesPerDay: number;
  proteinPerDay: number;
  sodiumOffsetMg: number; // negatief = vermindert netto natrium (bijv. halfpakje saus)
  // Categorisering
  category: "eiwit" | "vitamine" | "mineraal" | "calorie" | "vezel";
  priority: number; // 1 = hoogste prioriteit
  // Winkel info
  shelfLife: string; // houdbaarheid
  avgCostEur: number; // gemiddelde prijs in euro
}

export interface SurvivalPlanResult {
  days: number;
  totalPackages: number;
  dailyIngredients: SurvivalIngredient[];
  shoppingList: ShoppingItem[];
  dailyNutritionWithExtras: {
    calories: number;
    proteinG: number;
    sodiumMg: number;
    vitaminCCovered: boolean;
    vitaminACovered: boolean;
    fiberCovered: boolean;
    ironCovered: boolean;
  };
  warnings: string[];
  totalEstimatedCost: number;
}

export interface ShoppingItem {
  ingredient: SurvivalIngredient;
  totalAmount: string;
  totalAmountNote: string;
  estimatedCost: number;
  unit: string;
  quantity: number;
}

// Alle mogelijke survival ingrediënten met ID's voor voorkeur-matching
export const SURVIVAL_INGREDIENTS: SurvivalIngredient[] = [
  {
    id: "egg",
    nameDutch: "Eieren",
    nameShort: "Ei",
    emoji: "🥚",
    amountPerDay: "2 eieren",
    amountPerDayShort: "2 st.",
    fixes: ["eiwit", "B12", "vitamine D", "selenium"],
    caloriesPerDay: 140,
    proteinPerDay: 12,
    sodiumOffsetMg: 0,
    category: "eiwit",
    priority: 1,
    shelfLife: "3–4 weken (koel)",
    avgCostEur: 0.35,
  },
  {
    id: "spinach",
    nameDutch: "Spinazie (diepvries)",
    nameShort: "Spinazie",
    emoji: "🥬",
    amountPerDay: "100g",
    amountPerDayShort: "100g",
    fixes: ["vitamine C", "vitamine A", "ijzer", "foliumzuur", "vezels"],
    caloriesPerDay: 23,
    proteinPerDay: 2.9,
    sodiumOffsetMg: 0,
    category: "vitamine",
    priority: 2,
    shelfLife: "12 maanden (vriezer)",
    avgCostEur: 0.30,
  },
  {
    id: "banana",
    nameDutch: "Banaan",
    nameShort: "Banaan",
    emoji: "🍌",
    amountPerDay: "1 banaan",
    amountPerDayShort: "1 st.",
    fixes: ["kalium", "vitamine B6", "energie"],
    caloriesPerDay: 89,
    proteinPerDay: 1.1,
    sodiumOffsetMg: 0,
    category: "mineraal",
    priority: 3,
    shelfLife: "5–7 dagen (kamer)",
    avgCostEur: 0.20,
  },
  {
    id: "orange",
    nameDutch: "Sinaasappel / citroensap",
    nameShort: "Sinaasappel",
    emoji: "🍊",
    amountPerDay: "1 sinaasappel",
    amountPerDayShort: "1 st.",
    fixes: ["vitamine C", "foliumzuur"],
    caloriesPerDay: 62,
    proteinPerDay: 1.2,
    sodiumOffsetMg: 0,
    category: "vitamine",
    priority: 2,
    shelfLife: "2–3 weken (koel)",
    avgCostEur: 0.30,
  },
  {
    id: "carrot",
    nameDutch: "Wortel",
    nameShort: "Wortel",
    emoji: "🥕",
    amountPerDay: "1 wortel (80g)",
    amountPerDayShort: "1 st.",
    fixes: ["vitamine A", "vitamine K", "vezels"],
    caloriesPerDay: 33,
    proteinPerDay: 0.7,
    sodiumOffsetMg: 0,
    category: "vitamine",
    priority: 3,
    shelfLife: "3–4 weken (koel)",
    avgCostEur: 0.15,
  },
  {
    id: "beans",
    nameDutch: "Bonen (blik)",
    nameShort: "Bonen",
    emoji: "🫘",
    amountPerDay: "100g",
    amountPerDayShort: "100g",
    fixes: ["eiwit", "ijzer", "vezels", "foliumzuur", "kalium"],
    caloriesPerDay: 127,
    proteinPerDay: 8.7,
    sodiumOffsetMg: 0,
    category: "eiwit",
    priority: 2,
    shelfLife: "2–5 jaar (blik)",
    avgCostEur: 0.25,
  },
  {
    id: "oliveoil",
    nameDutch: "Olijfolie",
    nameShort: "Olijfolie",
    emoji: "🫒",
    amountPerDay: "1 el (15ml)",
    amountPerDayShort: "15ml",
    fixes: ["calorieën", "vitamine E", "gezonde vetten"],
    caloriesPerDay: 120,
    proteinPerDay: 0,
    sodiumOffsetMg: 0,
    category: "calorie",
    priority: 4,
    shelfLife: "18–24 maanden",
    avgCostEur: 0.20,
  },
  {
    id: "peas",
    nameDutch: "Diepvrieserwten",
    nameShort: "Erwten",
    emoji: "🟢",
    amountPerDay: "80g",
    amountPerDayShort: "80g",
    fixes: ["vitamine C", "vezels", "eiwit", "ijzer"],
    caloriesPerDay: 66,
    proteinPerDay: 5.4,
    sodiumOffsetMg: 0,
    category: "vezel",
    priority: 3,
    shelfLife: "12 maanden (vriezer)",
    avgCostEur: 0.20,
  },
  {
    id: "milk",
    nameDutch: "Halfvolle melk",
    nameShort: "Melk",
    emoji: "🥛",
    amountPerDay: "200ml",
    amountPerDayShort: "200ml",
    fixes: ["calcium", "B12", "vitamine D", "eiwit"],
    caloriesPerDay: 92,
    proteinPerDay: 6.8,
    sodiumOffsetMg: 0,
    category: "eiwit",
    priority: 3,
    shelfLife: "7–10 dagen (koel) / 6 mnd UHT",
    avgCostEur: 0.20,
  },
  {
    id: "lentils",
    nameDutch: "Linzen (blik/gekookt)",
    nameShort: "Linzen",
    emoji: "🍲",
    amountPerDay: "100g",
    amountPerDayShort: "100g",
    fixes: ["eiwit", "ijzer", "vezels", "foliumzuur"],
    caloriesPerDay: 116,
    proteinPerDay: 9,
    sodiumOffsetMg: 0,
    category: "eiwit",
    priority: 2,
    shelfLife: "3–5 jaar (droog) / 2–5 jaar (blik)",
    avgCostEur: 0.20,
  },
  {
    id: "halfpacket",
    nameDutch: "Smaakpakketje halveren",
    nameShort: "½ smaakpakketje",
    emoji: "🧂",
    amountPerDay: "½ pakketje",
    amountPerDayShort: "½ pakketje",
    fixes: ["natrium halveren"],
    caloriesPerDay: 0,
    proteinPerDay: 0,
    sodiumOffsetMg: -880, // scheelt ~880mg natrium
    category: "mineraal",
    priority: 1,
    shelfLife: "n.v.t.",
    avgCostEur: 0,
  },
  {
    id: "sweet_potato",
    nameDutch: "Zoete aardappel",
    nameShort: "Zoete aardappel",
    emoji: "🍠",
    amountPerDay: "100g",
    amountPerDayShort: "100g",
    fixes: ["vitamine A", "vezels", "kalium", "vitamine C"],
    caloriesPerDay: 86,
    proteinPerDay: 1.6,
    sodiumOffsetMg: 0,
    category: "vitamine",
    priority: 3,
    shelfLife: "2–4 weken (koel/donker)",
    avgCostEur: 0.30,
  },
];

export function generateSurvivalPlan(
  nutritionResult: NutritionResult,
  days: number,
  preferences: Record<string, boolean> // id -> liked
): SurvivalPlanResult {
  // Filter ingrediënten op voorkeur (true = lust het, false = lust het niet, ontbreekt = neutraal)
  const availableIngredients = SURVIVAL_INGREDIENTS.filter((ing) => {
    if (preferences[ing.id] === false) return false; // expliciet niet lekker
    return true;
  });

  // Sorteer op prioriteit
  const sorted = [...availableIngredients].sort((a, b) => a.priority - b.priority);

  // Selecteer de beste set om tekorten te dekken
  const selected: SurvivalIngredient[] = [];
  const fixesCovered = new Set<string>();

  // Altijd het halveren van smaakpakketje als natrium te hoog is
  const halfPacket = SURVIVAL_INGREDIENTS.find((i) => i.id === "halfpacket");
  if (halfPacket && nutritionResult.totalSodiumMg > 2000 && preferences["halfpacket"] !== false) {
    selected.push(halfPacket);
    fixesCovered.add("natrium halveren");
  }

  const criticalFixes = ["vitamine C", "vitamine A", "eiwit", "ijzer", "vezels", "B12", "kalium"];

  for (const ing of sorted) {
    if (ing.id === "halfpacket") continue;
    for (const fix of ing.fixes) {
      if (criticalFixes.includes(fix) && !fixesCovered.has(fix)) {
        selected.push(ing);
        ing.fixes.forEach((f) => fixesCovered.add(f));
        break;
      }
    }
    if (selected.length >= 5) break; // max 5 extra ingrediënten
  }

  // Voeg olijfolie toe als calorietekort > 300 en nog niet geselecteerd
  if (nutritionResult.caloriesDeficit > 300) {
    const olie = sorted.find((i) => i.id === "oliveoil");
    if (olie && !selected.find((s) => s.id === "oliveoil") && preferences["oliveoil"] !== false) {
      selected.push(olie);
    }
  }

  // Bereken dagelijkse voedingswaarden MET extras
  const extraCal = selected.reduce((s, i) => s + i.caloriesPerDay, 0);
  const extraProt = selected.reduce((s, i) => s + i.proteinPerDay, 0);
  const extraSodium = selected.reduce((s, i) => s + i.sodiumOffsetMg, 0);

  const dailyNutrition = {
    calories: nutritionResult.caloriesFromNoodles + extraCal,
    proteinG: nutritionResult.totalProteinG + extraProt,
    sodiumMg: Math.max(0, nutritionResult.totalSodiumMg + extraSodium),
    vitaminCCovered: selected.some((i) => i.fixes.includes("vitamine C")),
    vitaminACovered: selected.some((i) => i.fixes.includes("vitamine A")),
    fiberCovered: selected.some((i) => i.fixes.includes("vezels")),
    ironCovered: selected.some((i) => i.fixes.includes("ijzer")),
  };

  // Boodschappenlijst voor X dagen
  const shoppingList: ShoppingItem[] = [
    {
      ingredient: { id: "noodles", nameDutch: `Instant noodles (${nutritionResult.packagesPerDay}x/dag)`, nameShort: "Noodles", emoji: "🍜", amountPerDay: `${nutritionResult.packagesPerDay} pakjes`, amountPerDayShort: `${nutritionResult.packagesPerDay}×`, fixes: [], caloriesPerDay: 0, proteinPerDay: 0, sodiumOffsetMg: 0, category: "calorie", priority: 0, shelfLife: "12 maanden", avgCostEur: 0.35 },
      totalAmount: `${nutritionResult.packagesPerDay * days} pakjes`,
      totalAmountNote: `${nutritionResult.packagesPerDay} per dag × ${days} dagen`,
      estimatedCost: nutritionResult.packagesPerDay * days * 0.35,
      unit: "pakjes",
      quantity: nutritionResult.packagesPerDay * days,
    },
    ...selected
      .filter((i) => i.id !== "halfpacket")
      .map((ing) => {
        const qty = days;
        return {
          ingredient: ing,
          totalAmount: formatTotalAmount(ing, days),
          totalAmountNote: `${ing.amountPerDayShort} per dag × ${days} dagen`,
          estimatedCost: ing.avgCostEur * days,
          unit: ing.amountPerDayShort,
          quantity: qty,
        };
      }),
  ];

  const totalCost = shoppingList.reduce((s, i) => s + i.estimatedCost, 0);

  // Waarschuwingen
  const warnings: string[] = [];
  if (dailyNutrition.sodiumMg > 2000) {
    warnings.push(`Natrium nog steeds ${Math.round(dailyNutrition.sodiumMg)}mg/dag — gebruik het smaakpakketje maar half`);
  }
  if (dailyNutrition.calories < nutritionResult.tdee - 200) {
    warnings.push(`Nog steeds ${nutritionResult.tdee - dailyNutrition.calories} kcal onder je dagbehoefte — voeg olijfolie of noten toe`);
  }
  if (dailyNutrition.proteinG < nutritionResult.proteinNeededG * 0.9) {
    warnings.push(`Eiwit (${Math.round(dailyNutrition.proteinG)}g) nog onder minimum — overweeg extra ei of bonen`);
  }

  return {
    days,
    totalPackages: nutritionResult.packagesPerDay * days,
    dailyIngredients: selected,
    shoppingList,
    dailyNutritionWithExtras: dailyNutrition,
    warnings,
    totalEstimatedCost: Math.round(totalCost * 100) / 100,
  };
}

function formatTotalAmount(ing: SurvivalIngredient, days: number): string {
  // Slim formatteren per ingrediënt type
  if (ing.id === "egg") return `${days * 2} eieren`;
  if (ing.id === "banana" || ing.id === "orange" || ing.id === "carrot") return `${days} stuks`;
  if (ing.id === "spinach" || ing.id === "peas") return `${days * 100}g (${Math.ceil(days * 100 / 450)}× zak)`;
  if (ing.id === "beans" || ing.id === "lentils") return `${days * 100}g (${Math.ceil(days / 4)}× blik)`;
  if (ing.id === "oliveoil") return `${Math.round(days * 15)}ml`;
  if (ing.id === "milk") return `${Math.round(days * 0.2 * 10) / 10}L`;
  if (ing.id === "sweet_potato") return `${days * 100}g (~${days} stuks)`;
  return `${days}× ${ing.amountPerDayShort}`;
}
