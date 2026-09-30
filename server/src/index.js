import { createApp } from "./app.js";
import { env } from "./env.js";
import "./db.js"; // runs migrations on boot

const app = createApp();
app.listen(env.port, () => {
  console.log(`[server] SnapClass listening on port ${env.port} (${env.isProd ? "production" : "development"})`);
});
