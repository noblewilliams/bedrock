import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "data", "stage2.db");

const seed = async (count: number) => {
  let data = "";

  for (let i = 1; i <= count; i++) {
    data += `user${i},value${i}\n`;
  }

  await fs.writeFile(DB_PATH, data);
};

const dbGet = async (key: string) => {
  const data = await fs.readFile(DB_PATH, "utf8");
  const lines = data.split("\n").filter((d: string) => d.length > 0);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const [k, v] = line.split(",");
    if (k === key) {
      return v;
    }
  }
  return null;
};

const time = async (fn: () => Promise<unknown>) => {
  const start = performance.now();
  await fn();
  const end = performance.now();

  return end - start;
};

const benchmark = async (key: string, runs: number) => {
  const times = [];

  for (let i = 0; i < runs; i++) {
    const t = await time(async () => await dbGet(key));
    times.push(t);
  }

  const sorted = times.sort((a, b) => a - b);

  return {
    p50: sorted[Math.floor(runs * 0.5)],
    p99: sorted[Math.floor(runs * 0.99)],
  };
};

const main = async () => {
  await seed(100000);

  console.log("Benchmarking 1000 reads each...\n");

  const early = await benchmark("user1", 1000); // near the start of the file
  const late = await benchmark("user100000", 1000); // near the end
  const missing = await benchmark("user999999", 1000); // never written

  console.log("user1 (early): ", early);
  console.log("user100000 (late): ", late);
  console.log("user999999 (missing):", missing);
};

main().catch(console.error);
