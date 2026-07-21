# TypeScript 7 readiness

TypeScript 7.0.2 is current, but it is intentionally not the compiler used by the
production build in this scaffold. The release replaces the prior JavaScript
compiler implementation and does not expose the compiler API entrypoint that
stable Next.js builds currently expect.

The active baseline is TypeScript 6.0.3. A current Next.js reproduction matrix
shows that compiler completing a Next.js 16.2 CI build where TypeScript 7.0.2
fails. Firebase App Hosting's currently active Next.js line is 15.2.x, so adopting
an unsupported newer framework solely to force TypeScript 7 would add two event-day
risks at once.

## Re-evaluation checklist

Before upgrading:

- [ ] Stable Next.js documents support for TypeScript 7's CLI/native compiler.
- [ ] Firebase App Hosting marks that Next.js line active or LTS.
- [ ] The repository builds with `CI=1 npm run verify` from a clean lockfile.
- [ ] Unit, browser, mobile, and accessibility tests pass.
- [ ] The standalone Docker image builds and serves `/api/health`.
- [ ] A real App Hosting rehearsal rollout succeeds.
- [ ] `scripts/check-stack-compatibility.mjs`, `docs/STACK.md`, and Dependabot rules are updated together.

Until then, use TypeScript 6.0.3 for deterministic builds and evaluate TypeScript 7
only in a disposable branch. Do not make this migration during the one-hour build.

Primary evidence:

- [Next.js issue: TypeScript 7 misdetected during build](https://github.com/vercel/next.js/issues/95490)
- [Next.js issue: stable CI failure and TypeScript 6.0.3 passing result](https://github.com/vercel/next.js/issues/95801)
- [Firebase App Hosting support schedule](https://firebase.google.com/docs/app-hosting/frameworks-tooling)
