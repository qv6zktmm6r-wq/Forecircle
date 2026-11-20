import { spawn } from "node:child_process";
const args = process.argv.slice(2);
let port = "3000";
let host = "0.0.0.0";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port") port = args[++i];
  if (args[i] === "--host" || args[i] === "--hostname") host = args[++i];
}
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "apps/web",
    "--hostname",
    host,
    "--port",
    port,
  ],
  { stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } },
);
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => child.kill(s));
child.on("exit", (code) => process.exit(code ?? 1));
