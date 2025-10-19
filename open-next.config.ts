import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  cloudflare: {
    entry: {
      kind: "prerendered",
      include: ["/"],
    },
  },
};

export default config;
