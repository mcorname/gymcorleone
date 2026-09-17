import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchesExercise, normalizeSearchTerm } from '../src/search.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datasetPath = path.join(__dirname, '../../../apps/web/public/data/exercises_seed.json');
const exercises = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

console.log(`Testing search engine against ${exercises.length} exercises...`);

const testQueries = [
  { q: "press banca", expectedMatchKeyword: "bench press" },
  { q: "bench press", expectedMatchKeyword: "bench press" },
  { q: "pecho", expectedMatchKeyword: "chest" },
  { q: "chest", expectedMatchKeyword: "chest" },
  { q: "bíceps", expectedMatchKeyword: "bicep" },
  { q: "biceps", expectedMatchKeyword: "bicep" },
  { q: "mancuerna", expectedMatchKeyword: "dumbbell" },
  { q: "dumbbell", expectedMatchKeyword: "dumbbell" },
  { q: "jalón", expectedMatchKeyword: "pulldown" },
  { q: "lat pulldown", expectedMatchKeyword: "pulldown" },
  { q: "sentadilla", expectedMatchKeyword: "squat" },
  { q: "squat", expectedMatchKeyword: "squat" },
  { q: "peso muerto", expectedMatchKeyword: "deadlift" },
  { q: "deadlift", expectedMatchKeyword: "deadlift" }
];

let passed = 0;
let failed = 0;

for (const test of testQueries) {
  const matches = exercises.filter(ex => matchesExercise(ex, test.q));
  if (matches.length > 0) {
    console.log(`[PASS] Query "${test.q}" returned ${matches.length} results. Top result: "${matches[0].translations.es.name}" (${matches[0].name})`);
    passed++;
  } else {
    console.error(`[FAIL] Query "${test.q}" returned 0 results!`);
    failed++;
  }
}

// Test accent insensitivity: "bíceps" vs "biceps"
const matchesAccent = exercises.filter(ex => matchesExercise(ex, "bíceps"));
const matchesNoAccent = exercises.filter(ex => matchesExercise(ex, "biceps"));
if (matchesAccent.length === matchesNoAccent.length && matchesAccent.length > 0) {
  console.log(`[PASS] Accent insensitivity verified: "bíceps" (${matchesAccent.length}) === "biceps" (${matchesNoAccent.length})`);
  passed++;
} else {
  console.error(`[FAIL] Accent mismatch: "bíceps" (${matchesAccent.length}) vs "biceps" (${matchesNoAccent.length})`);
  failed++;
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
