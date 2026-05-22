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
  survivalDays: number; // hoeveel dagen je dit vol kunt houden (realistisch)
  weeklyPackages: number;
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

  // Hoeveel dagen dit mentaal vol te houden is (conservatief)
  // Medisch: micronutriënttekorten worden gevaarlijk na ~14 dagen
  const survivalDays = totalProteinG >= proteinNeededG * 0.8 && totalSodiumMg <= SODIUM_MAX_MG * 1.5
    ? 14
    : totalSodiumMg > SODIUM_MAX_MG * 2
    ? 7
    : 10;

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
    survivalDays,
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
