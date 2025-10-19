import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  output: ".open-next",
  cloudflare: {
    entry: {
      kind: "prerendered",
      include: ["/"],
      exclude: []
    }
  }
};

export default config;
