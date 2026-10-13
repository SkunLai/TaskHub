import { backup } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { openDatabase } from "../server/db.mjs";
if (process.env.TURSO_DATABASE_URL)
  throw new Error(
    "Use the Turso database export workflow; this script backs up local SQLite only.",
  );
const db = await openDatabase();
const directory = resolve(process.env.DATA_DIR || "./data", "backups");
mkdirSync(directory, { recursive: true });
const target = resolve(
  directory,
  "taskhub-" + new Date().toISOString().replaceAll(":", "-") + ".sqlite",
);
await backup(db.localHandle, target);
db.close();
console.log("Backup saved: " + target);
