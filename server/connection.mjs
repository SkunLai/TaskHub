import { DatabaseSync } from "node:sqlite";
import { createClient } from "@libsql/client";
import { AsyncLocalStorage } from "node:async_hooks";

// The same async query contract supports local SQLite and a durable Turso database.
// A transaction owns its connection until commit; concurrent reads cannot see
// partially updated tour/task records on the local connection.
export function connectDatabase(filename) {
  const url = process.env.TURSO_DATABASE_URL;
  if (process.env.REQUIRE_REMOTE_DB === "1" && !url)
    throw new Error("TURSO_DATABASE_URL is required on ephemeral hosting.");
  if (process.env.REQUIRE_REMOTE_DB === "1" && !/^libsql:\/\//.test(url))
    throw new Error(
      "Ephemeral hosting requires a libsql:// cloud database URL.",
    );
  if (url && !process.env.TURSO_AUTH_TOKEN && !url.startsWith("file:"))
    throw new Error("Set TURSO_AUTH_TOKEN for the hosted database.");
  const remote = url
    ? createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
    : null;
  const local = remote ? null : new DatabaseSync(filename);
  // Cloud requests use separate database streams. Unlike a shared file handle,
  // they can read committed state while another connection owns a transaction.
  const parallelReads = Boolean(remote && !url.startsWith("file:"));
  const context = new AsyncLocalStorage();
  let queue = Promise.resolve();
  const exclusive = async (fn) => {
    const previous = queue;
    let release;
    queue = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await fn();
    } finally {
      release();
    }
  };
  const execute = async (sql, args, kind) => {
    const perform = async () => {
      if (remote) {
        const result = await (context.getStore() || remote).execute({
          sql,
          args,
        });
        if (kind === "run") return { changes: result.rowsAffected };
        const rows = result.rows.map((row) =>
          Object.fromEntries(
            result.columns.map((column, index) => [column, row[index]]),
          ),
        );
        return kind === "get" ? rows[0] : rows;
      }
      return local.prepare(sql)[kind](...args);
    };
    return context.getStore() || parallelReads ? perform() : exclusive(perform);
  };
  return {
    remote: Boolean(remote),
    prepare: (sql) =>
      Object.fromEntries(
        ["run", "get", "all"].map((kind) => [
          kind,
          (...args) => execute(sql, args, kind),
        ]),
      ),
    exec: async (sql) =>
      exclusive(async () => {
        if (remote) await remote.executeMultiple(sql);
        else local.exec(sql);
      }),
    transaction: (fn) =>
      exclusive(async () => {
        const tx = remote ? await remote.transaction("write") : true;
        if (local) local.exec("BEGIN IMMEDIATE");
        try {
          const result = await context.run(tx, fn);
          if (remote) await tx.commit();
          else local.exec("COMMIT");
          return result;
        } catch (error) {
          if (remote) {
            if (!tx.closed) await tx.rollback();
          } else local.exec("ROLLBACK");
          throw error;
        } finally {
          if (remote) tx.close();
        }
      }),
    close: () => {
      if (remote) remote.close();
      else local.close();
    },
    localHandle: local,
  };
}
