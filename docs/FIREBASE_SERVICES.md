# Firebase service activation guide

The starter installs Firebase SDKs but intentionally activates no data service.
Choose only what the selected workflow needs.

## Authentication

Use Firebase Authentication when the demo truly requires identity. For a timed
public demo, a read-only synthetic path is usually safer and faster. In a real
pilot, decide supported providers, account recovery, staff offboarding, session
length, and authorization roles before implementation.

## Firestore

Appropriate for small operational records and real-time queues. Before enabling:

1. Write the domain model and ownership rules.
2. Replace the deny-all rules with least-privilege paths.
3. Add emulator tests for allowed and rejected cases.
4. Create only required indexes.
5. Define retention and deletion.

## Storage

Enable only for a necessary upload workflow. Define content type/size limits,
ownership, malware/content review, retention, and whether original files contain
sensitive metadata. The checked-in rules deny all reads and writes.

## Emulator usage

```bash
npx firebase emulators:start --only apphosting,firestore,storage
```

Keep emulated and production project IDs visually distinct. Never use production
credentials for local development.

## Initialization

- Client: `getFirebaseClientApp()` supports explicit local web config or App
  Hosting's automatic initialization.
- Server: `getFirebaseAdminApp()` uses Application Default Credentials supplied by
  App Hosting, or emulator/local ADC configuration.

Do not initialize Firebase at module load when the selected route does not need it;
the included functions are lazy for that reason.
