// Benchmark used for the Cloudflare decision (see DEPLOY_CLOUDFLARE.md): node scripts/measure-quicktype.mjs
// Ad-hoc benchmark: how much CPU time does one generate-code call cost?
// Cloudflare Workers free plan allows 10ms CPU per request, so this decides
// whether quicktype can stay server-side or must move to the browser.
import { InputData, jsonInputForTargetLanguage, quicktype } from 'quicktype-core';

const SMALL = JSON.stringify({
  id: 42,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  roles: ['admin', 'editor'],
  profile: { bio: 'Mathematician', website: 'https://example.com' },
});

// A more realistic medium payload (array of objects, nested).
const MEDIUM = JSON.stringify({
  users: Array.from({ length: 20 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    active: i % 2 === 0,
    tags: ['a', 'b', 'c'],
    address: { city: 'Seoul', zip: `0${i}000`, geo: { lat: 37.5, lng: 127.0 } },
  })),
  meta: { total: 20, page: 1, generatedAt: '2026-01-01T00:00:00Z' },
});

async function gen(jsonString, language) {
  const jsonInput = jsonInputForTargetLanguage(language);
  await jsonInput.addSource({ name: 'Root', samples: [jsonString] });
  const inputData = new InputData();
  inputData.addInput(jsonInput);
  const result = await quicktype({
    inputData,
    lang: language,
    rendererOptions: language === 'typescript' ? { 'just-types': 'true' } : undefined,
  });
  return result.lines.join('\n');
}

function cpuMs() {
  const u = process.cpuUsage();
  return (u.user + u.system) / 1000; // microseconds -> ms
}

async function bench(label, jsonString, language, iterations) {
  // Warm up once (cold) and measure it separately.
  const coldStart = cpuMs();
  const wStartWall = performance.now();
  await gen(jsonString, language);
  const cold = cpuMs() - coldStart;
  const coldWall = performance.now() - wStartWall;

  // Warm iterations.
  const start = cpuMs();
  const wallStart = performance.now();
  for (let i = 0; i < iterations; i++) await gen(jsonString, language);
  const totalCpu = cpuMs() - start;
  const totalWall = performance.now() - wallStart;
  const warm = totalCpu / iterations;
  const warmWall = totalWall / iterations;

  console.log(
    `${label.padEnd(26)} cold=${cold.toFixed(2)}ms cpu / ${coldWall.toFixed(2)}ms wall | ` +
      `warm avg=${warm.toFixed(2)}ms cpu / ${warmWall.toFixed(2)}ms wall (n=${iterations})`
  );
}

console.log('quicktype-core CPU benchmark (Node ' + process.version + ')\n');
await bench('small -> typescript', SMALL, 'typescript', 30);
await bench('small -> go', SMALL, 'go', 30);
await bench('small -> rust', SMALL, 'rust', 30);
await bench('medium -> typescript', MEDIUM, 'typescript', 30);
await bench('medium -> go', MEDIUM, 'go', 30);
await bench('medium -> java', MEDIUM, 'java', 30);
