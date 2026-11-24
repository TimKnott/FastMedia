# FastMedia.Pro

[FastMedia.Pro](https://fastmedia.pro) showcases the agency’s websites and e-commerce work, CRM and API integrations, booking flows, and SEO and PPC services. This repository contains the public site, portfolio and administration tools.

## Development

The frontend uses React, TypeScript and Vite. Use Bun so the build can run the prerender step and dependency installation uses the committed Bun lockfile.

```sh
bun install --frozen-lockfile
bun run dev
bun run lint
bun run test
bun run build
```

Use the project’s authorised secret store for managed backend and integration credentials. Read `AGENTS.md` before changing application behaviour.

## Release checks

The production build includes SEO prerendering. Run `bun run seo:live` to check the live portfolio SEO output. Use the [production acceptance issue](https://github.com/TimKnott/FastMedia/issues/2) for the outstanding lead capture, CRM, email and mobile checks.

[Lovable project](https://lovable.dev/projects/faf4a9b8-8a61-403f-9d1f-15d5029793d2) · [Portfolio tracker](https://github.com/TimKnott/FastMedia/issues/11)
