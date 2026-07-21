# Release checklist

- [ ] Selected idea and plan are current.
- [ ] Scope cuts are logged.
- [ ] No real sensitive data is in source, fixtures, screenshots, or logs.
- [ ] `.env.local` is ignored.
- [ ] Firebase rules remain deny-by-default unless intentionally reviewed/tested.
- [ ] `npm run preflight` passes.
- [ ] Chromium golden path and axe check pass.
- [ ] Docker build passes when Docker is part of the fallback plan.
- [ ] App Hosting project/backend IDs are correct.
- [ ] Live `/api/health` works.
- [ ] Mobile/keyboard manual checks pass.
- [ ] Presenter has rehearsed and fallback media is ready.
- [ ] Rollback owner and known-good rollout are identified.
