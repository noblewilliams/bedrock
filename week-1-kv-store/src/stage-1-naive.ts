import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "data", "stage1.db");

const dbSet = async (key: string, value: string) => {
  await fs.appendFile(DB_PATH, `${key},${value}\n`);
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

const main = async () => {
  await fs.writeFile(DB_PATH, "");

  await dbSet("user1", "Noble");
  await dbSet("user2", "John");
  await dbSet("user3", "Jane");
  await dbSet("user1", "Flintstone");

  console.log("user1:", await dbGet("user1")); // Flintstone
  console.log("user2:", await dbGet("user2")); // John
  console.log("user3:", await dbGet("user3")); // Jane
  console.log("user4:", await dbGet("user4")); // null
};

main().catch(console.error);
