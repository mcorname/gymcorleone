const {
  calculateEpley1RM,
  calculateSetVolume,
  calculateBMI,
  evaluatePersonalRecord,
  evaluateProgressiveOverload
} = require('./packages/calculations/src/index.ts');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Test 1RM Epley
const oneRm100x1 = calculateEpley1RM(100, 1);
assert(oneRm100x1 === 100, `1RM for 100kg x 1 rep should be 100kg (got ${oneRm100x1})`);

const oneRm100x10 = calculateEpley1RM(100, 10);
// Epley: 100 * (1 + 10/30) = 100 * (1.3333...) = 133.33
assert(Math.abs(oneRm100x10 - 133.33) < 0.1, `1RM for 100kg x 10 reps should be ~133.33kg (got ${oneRm100x10})`);

// 2. Test Volume
const vol = calculateSetVolume(72.5, 10);
assert(vol === 725, `Volume for 72.5kg x 10 reps should be 725kg (got ${vol})`);

// 3. Test PR detection
const mockPRs = [
  { exerciseId: 'ex1', recordType: 'max_weight', recordValue: 80 }
];
const newSet = {
  id: 's1',
  workoutExerciseId: 'we1',
  setNumber: 1,
  setType: 'normal',
  weightKg: 85,
  reps: 8,
  isCompleted: true,
  volumeKg: 680,
  estimated1rmKg: 107.67
};
const prResults = evaluatePersonalRecord('ex1', 'Press Banca', newSet, mockPRs);
assert(prResults.some(r => r.recordType === 'max_weight' && r.newValue === 85), 'Should detect new max_weight PR');

// 4. Test Progressive Overload Advice
const overloadAdvice = evaluateProgressiveOverload(8, 12, [
  { weightKg: 20, reps: 12 },
  { weightKg: 20, reps: 12 }
]);
assert(overloadAdvice.type === 'increase_weight', 'Should suggest weight increase when max reps hit');

// 5. Test BMI
const bmi = calculateBMI(75, 178);
assert(bmi.bmi === 23.7 && bmi.classification === 'Normal', `BMI for 75kg/178cm should be 23.7 Normal (got ${bmi.bmi} ${bmi.classification})`);

console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
