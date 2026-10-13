import { openDatabase, purgeExpired } from "../server/db.mjs";
const db = await openDatabase();
const count = await purgeExpired(db);
console.log(
  `Deleted ${count} tester workspaces older than 180 days. Also delete expired backups/CSV exports manually.`,
);
db.close();
