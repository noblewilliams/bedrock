import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "data", "stage3.db");

const index = new Map<string, { offset: number; length: number }>();

const dbSet = async (key: string, value: string) => {
  const line = `${key},${value}\n`;
  const offset = (await fs.stat(DB_PATH)).size;

  await fs.appendFile(DB_PATH, line);

  index.set(key, { offset, length: Buffer.byteLength(line) });
};

const seed = async (count: number) => {
  await fs.writeFile(DB_PATH, "");
  index.clear();
  for (let i = 1; i <= count; i++) {
    await dbSet(`user${i}`, `value${i}`);
  }
};

const dbGet = async (key: string) => {
  const dataToRead = index.get(key);
  if (!dataToRead) return null;

  const buffer = Buffer.alloc(dataToRead.length);

  const file = await fs.open(DB_PATH, "r");

  try {
    await file.read(buffer, 0, dataToRead.length, dataToRead.offset);
  } finally {
    await file.close();
  }

  const line = buffer.toString("utf8");

  const [k, v] = line.trim().split(",");
  if (k === key) {
    return v;
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

  const early = await benchmark("user1", 1000);
  const late = await benchmark("user100000", 1000);
  const missing = await benchmark("user999999", 1000);

  console.log("user1 (db top):  ", early);
  console.log("user100000 (db bottom): ", late);
  console.log("user999999 (missing from db):", missing);
};

main().catch(console.error);
