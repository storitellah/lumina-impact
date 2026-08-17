// OpenNext Cloudflare adapter config.
// Docs: https://opennext.js.org/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Default (in-memory) incremental cache is fine for this mostly-dynamic app.
  // For production ISR/caching, provision an R2 bucket in wrangler.toml and
  // swap in the R2 cache:
  //
  //   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
  //   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
});
