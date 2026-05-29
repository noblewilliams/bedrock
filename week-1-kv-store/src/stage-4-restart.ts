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

const rebuildIndex = async () => {
  index.clear();
  const data = await fs.readFile(DB_PATH, "utf8");
  const lines = data.split("\n").filter((line) => line.length > 0);

  let offset = 0;
  for (const line of lines) {
    const lineBytes = Buffer.byteLength(line + "\n"); // the full line as written, incl. newline
    const [key] = line.split(",");
    index.set(key, { offset, length: lineBytes }); // later writes overwrite earlier ones
    offset += lineBytes; // advance to where the next line starts
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

const mode = process.argv[2];

const main = async () => {
  if (mode === "write") {
    await seed(100000);
    console.log("Seeded 100k records. Index has", index.size, "entries.");
    console.log("Now exiting — the in-memory index is about to vanish.");
  } else if (mode === "read") {
    console.log("Index has", index.size, "entries at startup.");

    const rebuildTime = await time(async () => await rebuildIndex());
    console.log(
      `Rebuilt index in ${rebuildTime.toFixed(2)}ms. Now has`,
      index.size,
      "entries.",
    );

    const value = await dbGet("user50");
    console.log("dbGet('user50') returned:", value);
  } else {
    console.log("Usage: pass 'write' or 'read' as an argument");
  }
};

main().catch(console.error);
