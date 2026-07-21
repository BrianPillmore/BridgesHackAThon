# Data reuse request — Austin Open Now and cooling-center layers

**Status:** draft, not sent. Review and send from a real address before quoting any response.
**Why it exists:** two City of Austin ArcGIS items SafeHeat would benefit from report **No License Provided**, so reuse terms must be obtained in writing before any row-level data is retained or redistributed.

## What is actually blocked

| Item                                  | Service                           | Blocked action                               | Allowed today                       |
| ------------------------------------- | --------------------------------- | -------------------------------------------- | ----------------------------------- |
| `bbe3d11e5ee74cb1a132ad952e58fda4`    | `HSO_Open_Now_Facilities` layer 3 | Retaining/redistributing cooling-center rows | Schema and item metadata inspection |
| `Cooling_Centers_Census_Block_Groups` | same org                          | Bundling the 789-row layer in the app        | Citing aggregate statistics         |

Nothing in the conference demo depends on this request. The four statistics in `situationContext` are aggregate figures cited to a public source, which is ordinary use of public information. This request is about a **pilot**, where row-level operational data would need to live inside the product.

## Who to contact

The `HSO_` prefix indicates the City of Austin **Homeless Strategy Office** as data owner. Open Now is publicly presented as a resource finder for unhoused residents. Confirm the current steward before sending; ArcGIS item ownership and program staffing both change.

Reasonable routes:

- the Open Now item's listed owner in the City of Austin ArcGIS organization;
- the City's open-data team via `data.austintexas.gov`;
- the Homeless Strategy Office general contact;
- for `Cooling_Centers_Census_Block_Groups`, likely the Office of Sustainability or Watershed/Planning GIS staff — verify rather than assume.

## Draft message

> Subject: Reuse terms for Open Now facilities layer and cooling-center block-group layer
>
> Hello,
>
> I am working on an open-source proof of concept for municipal heat-response coordination, developed for a BRIDGES conference hackathon and intended as a public-interest reference implementation rather than a commercial product.
>
> Two City of Austin ArcGIS items are relevant, and both currently report "No License Provided," so I want to ask before using anything beyond schema inspection:
>
> 1. `HSO_Open_Now_Facilities` (item `bbe3d11e5ee74cb1a132ad952e58fda4`), specifically the layer 3 point data including `resource_type = cooling_center`.
> 2. `Cooling_Centers_Census_Block_Groups`.
>
> To date I have used only publicly documented schema metadata and aggregate statistics. I have not retained or redistributed any row-level data from either layer.
>
> I would appreciate guidance on four points:
>
> - What reuse terms apply to these layers, and is there a license the City would like cited?
> - Is there an approved process for taking a reviewed offline snapshot for a non-commercial pilot?
> - Who is the appropriate operational owner if a pilot needed to record event-time facility status — staffed, cooled, and open — as distinct from the administrative `status` field?
> - Are there existing City efforts in this space I should be building toward rather than alongside?
>
> On the last point, my working assumption is that Austin already publishes strong heat and siting analysis, and that the gap worth addressing is event-time operational truth during a heat event: whether a specific site is actually open, who owns the problem when it closes, and what the after-action record shows. I would rather complement that work than duplicate it.
>
> Happy to share the repository and the data-source documentation.
>
> Thank you,
> Brian Pillmore

## Before sending

- Verify the current data steward; do not address the Homeless Strategy Office by assumption.
- Do not imply City endorsement, partnership, or that a pilot is approved.
- Do not attach or link any downloaded rows from either layer.
- If a reply grants terms, record them in `DATA_LICENSE_AND_ATTRIBUTION.md` with the date, the granting person and office, and the exact scope granted. A verbal or informal yes is not a license.
