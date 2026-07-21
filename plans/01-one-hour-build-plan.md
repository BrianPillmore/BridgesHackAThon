# One-hour build plan

|  Time | Owner        | Deliverable                              | Exit test                      |
| ----: | ------------ | ---------------------------------------- | ------------------------------ |
|   0–5 | Product lead | User, pain, decision, outcome            | Four lines are specific        |
|  5–10 | Team         | Five-box golden path and cuts            | Everyone can repeat it         |
| 10–25 | Builder(s)   | Clickable vertical slice                 | Happy path completes           |
| 25–35 | Design/data  | Priority explanation and visible benefit | Before/after is obvious        |
| 35–43 | Builder(s)   | Empty/error/fallback states              | Upstream failure is survivable |
| 43–49 | Test owner   | Checks and browser smoke                 | Required commands pass         |
| 49–55 | Deploy owner | Live rollout                             | URL and health endpoint work   |
| 55–60 | Presenter    | Rehearsed story                          | Finishes in 90 seconds         |

## Scope authority

The product lead may cut any feature that does not directly support the golden
path. The deploy owner may freeze merges at minute 43.
