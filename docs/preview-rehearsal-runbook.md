# Preview rehearsal environment

This runbook records the temporary, non-production environment created for
GitHub issue #17. It contains no credential values. Do not add tokens, bypass
secrets, cookie values, or screenshots of protected settings to this file.

## Verified configuration matrix

| Concern | Recorded value | Scope and evidence |
| --- | --- | --- |
| Sanity project | `t03519e6` | Existing project; the production dataset was not copied or modified. |
| Rehearsal dataset | `preview-rehearsal` | Public temporary dataset. At provisioning it contained 0 recipes, 0 articles, 0 products, and 0 kitchen items; its 12 records were Sanity system documents. |
| Viewer credential | `Preview rehearsal Viewer 2026-07-14` | Sanity Viewer role. The value exists only as Vercel's sensitive, server-only `SANITY_API_READ_TOKEN` Preview variable. |
| Vercel project | `benson98/nibbles-with-nifa` | Existing project; rehearsal variables are scoped to Preview. |
| Vercel deployment | `dpl_8rzdUNTvqvZWiAcoXjnnASFi2EGo` | Target `preview`, status `Ready`, built from committed HEAD `0b0adad`. |
| Immutable rehearsal origin | `https://nibbles-with-nifa-ke7g8z4wk-benson98.vercel.app` | Deployment-specific URL. Do not substitute the branch alias. |
| Vercel protection | Vercel Authentication temporarily disabled by the release owner | Hosted Presentation requires the browser to permit the deployment's cross-site Draft Mode cookie. Anonymous requests remain outside Sanity Draft Mode. |
| Sanity CORS | Exact immutable rehearsal origin | Added with credentials enabled. No wildcard origin was added. |
| Hosted Studio | `https://nibbles-with-nifa-preview-rehearsal.sanity.studio/` | Separate rehearsal-only Studio deployment using `preview-rehearsal`, rebuilt from committed HEAD `0b0adad` after the deployment rotation. |
| Hosted Studio app | `hkpniidm9khfqy9why4sh8wn` | Separate from the existing production Studio app. |
| Presentation frontend | Exact immutable rehearsal origin | Embedded Studio uses Vercel's build-provided `NEXT_PUBLIC_VERCEL_URL`; hosted Studio uses `SANITY_STUDIO_PREVIEW_URL`. |

## Environment-variable scopes

### Vercel Preview

| Variable | Value policy |
| --- | --- |
| `CONTENT_SOURCE` | `sanity` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Non-secret Sanity project identifier |
| `NEXT_PUBLIC_SANITY_DATASET` | `preview-rehearsal` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Repository API version |
| `NEXT_PUBLIC_VERCEL_URL` | System-provided immutable deployment hostname |
| `SANITY_API_READ_TOKEN` | Sensitive, server-only Viewer credential |

`SANITY_WRITE_TOKEN` is absent. No Editor, Administrator, mutation-capable,
or publicly prefixed credential belongs in the Vercel frontend environment.

### Hosted Studio build

The rehearsal Studio build received only these configuration names:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
- `SANITY_STUDIO_API_VERSION`
- `SANITY_STUDIO_PREVIEW_URL`
- `SANITY_STUDIO_BASEPATH`

No Viewer or write token was supplied to the Studio build. The final deployment
command explicitly reported all five non-secret `SANITY_STUDIO_*` variables
above as its complete environment-variable bundle input.

## Manual verification checklist

- [x] Release owner confirmed the dataset, Viewer role, Vercel Preview scopes,
  sensitive read-token presence, and write-token absence in the dashboards.
- [x] The immutable Vercel deployment is `Ready` and targets Preview.
- [x] The exact origin was added to Sanity CORS with credentials.
- [x] The deployed embedded Studio bundle contains the replacement immutable
  frontend origin.
- [x] Hosted Studio Presentation loads the same immutable frontend origin.
- [x] Signed Draft Mode can be entered and exited from the hosted Studio.
- [x] A draft-only document is visible in authenticated Presentation and absent
  from the same public route after exiting Draft Mode.

All issue #17 manual checks are confirmed. The environment remains temporary;
the separately authorized cleanup below has not been performed.

## 2026-07-14 security rotation

A browser network capture exposed temporary signed Presentation parameters and
the prior deployment's Draft Mode bypass cookie. No values were copied into the
repository. With explicit release-owner approval:

1. The prior deployment and immutable origin were deleted; the old origin now
   returns `404`.
2. Ten temporary `sanity.previewUrlSecret` records were deleted across the two
   capture attempts. A follow-up query returned a count of zero while retaining
   the rehearsal recipe draft.
3. Committed HEAD `0b0adad` was deployed without the dirty working tree,
   producing the replacement deployment and origin recorded above.
4. The old CORS origin was removed and the replacement exact origin was added
   with credentials.
5. The hosted rehearsal Studio was rebuilt against the replacement origin.

The repository's `sanity.cli.ts` binds the normal deployment command to the
production Studio app ID. A hostname passed with `--url` does not override that
binding. During rotation, one command therefore briefly deployed the rehearsal
Studio bundle to the production Studio app. The production Studio was
immediately rebuilt with the observed `production` dataset and
`https://nibbles-with-nifa.vercel.app` frontend; no content mutation command was
issued. The release owner subsequently confirmed that the expected production
content is present. The rehearsal Studio was then deployed by overriding only
the temporary deployment snapshot to app `hkpniidm9khfqy9why4sh8wn`. Future
rehearsal Studio deployments must explicitly target that app ID before
deployment.

## Later cleanup — separate authorization required

Do not perform these steps as part of issue #17. After the content rehearsal is
accepted, obtain explicit release-owner authorization and then:

1. Confirm whether rehearsal content must be retained or exported.
2. Remove the exact immutable origin from Sanity CORS.
3. Revoke the Sanity token labelled `Preview rehearsal Viewer 2026-07-14`.
4. Restore or remove the rehearsal-specific Vercel Preview overrides. Recover
   the prior dataset value from owner records; do not assume it was
   `production`. Confirm again that no frontend write credential exists.
5. Undeploy only the hosted Studio app identified above; do not target the
   existing production Studio app.
6. Delete the recorded Vercel Preview deployment if it is no longer needed.
7. Delete `preview-rehearsal` last, only after content-retention decisions are
   complete.
8. Verify the production dataset, production Studio, and production frontend
   were not changed by cleanup.
