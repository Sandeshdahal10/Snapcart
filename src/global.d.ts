/**
 * Global mongoose cache used to store a single connection and its promise across
 * module reloads (e.g., in development with hot-reloading). This prevents
 * creating multiple connections when the module is re-imported.
 *
 * - connection: the active mongoose Connection or null
 * - promise: a Promise that resolves to a Connection or null
 */
import { Connection } from "mongoose";

declare global {
  var mongoose: {
    connection: Connection | null;
    promise: Promise<Connection> | null;
  };
}

export {};
