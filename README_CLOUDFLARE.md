# Cloudflare Pages + Web Analytics quickstart

## Build & preview locally

```bash
npm install
npm run cf:preview
```

## Build for Pages

```bash
npm run cf:build
```

Outputs to `.open-next`. Deploy by connecting this repo to Cloudflare Pages and pointing the build command to `npm run cf:build` with output directory `.open-next`.

> Tip: In Cloudflare Pages → Settings → Environment variables, set `NODE_VERSION=20` so the build uses the supported runtime.

### Environment Variables

- `NEXT_PUBLIC_CF_BEACON_TOKEN`: Web Analytics beacon token.

### Headers configuration

`public/_headers` ships security and cache tweaks automatically.
