# Security, privacy, safety, and public-interest review

This is a prototype scaffold, not authorization to process sensitive government
or student data. Complete this review before moving beyond public or synthetic data.

## Data minimization questions

- Can the workflow work with counts, bands, or neighborhood labels instead of names?
- Can location be coarsened or entered transiently without storage?
- Can the demo use synthetic records?
- What is the deletion date and who owns deletion?
- Which fields would cause harm if exposed or misinterpreted?

Do not use real student education records, disability/service details, health or
mental-health details, immigration information, precise vulnerable-household
locations, credentials, or unannounced enforcement data in the hackathon build.

## Consequential decisions

A prototype may prioritize work for review, summarize evidence, or suggest next
steps. It must not autonomously determine eligibility, discipline, enforcement,
placement, benefit allocation, special-education services, clinical risk, or other
high-impact outcomes.

For every score or rank:

- show the factors and data freshness;
- permit human correction;
- avoid protected-class proxies where possible;
- measure false positives/negatives across relevant groups before operational use;
- provide an appeal/escalation route in any real pilot.

## Firebase controls

- Firestore and Storage rules deny all access initially.
- Secrets belong in Secret Manager and `apphosting.yaml` secret references.
- App Hosting runtime credentials use Application Default Credentials; do not
  download or commit service-account JSON.
- Public Firebase web configuration is not an authorization mechanism; rules and
  server checks still protect data.
- Create separate staging and production projects for any real pilot.

## Application controls

- Validate every untrusted input with an allowlist schema and explicit size limits.
- Escape/render user content as text; do not inject HTML.
- Put authorization checks at server/database boundaries.
- Add rate limits and abuse controls before public write endpoints.
- Never log full sensitive records or secrets.
- Set a clear retention/deletion policy for uploads and generated content.

## Accessibility and language access

State/local government and public-school digital services are subject to civil
rights and accessibility obligations. The U.S. Department of Justice's Title II
web/mobile rule uses WCAG 2.1 Level AA as the technical standard and currently
lists compliance dates in 2027 or 2028 depending on entity size/type.

Reference: [DOJ Title II web/mobile accessibility fact sheet](https://www.ada.gov/resources/2024-03-08-web-rule/)

Treat automated translation as a draft for high-stakes notices. Preserve the
source, label machine-translated text, support human review, and keep dates,
amounts, names, and required actions easy to verify.

## Pre-pilot review

Before real users or real data:

- [ ] data inventory and classification;
- [ ] legal/privacy/records review;
- [ ] threat model and abuse cases;
- [ ] authentication and least-privilege authorization;
- [ ] Firebase rules tests;
- [ ] accessibility evaluation;
- [ ] language-quality review;
- [ ] incident, correction, deletion, and rollback owners;
- [ ] monitoring for performance and disparate errors;
- [ ] explicit pilot success/stop criteria.
