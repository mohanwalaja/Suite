# Creative engine audit

The rendered audit covers all 172 registered subjects: 13 services, 80 festivals, 35 deities and 44 special days. It rendered 150 definitions per subject (25,800 renders) and compared all 1,922,100 within-subject pairs. A 32 × 40 mean-luminance bit signature flagged 10,703 pairs at or above 97% similarity, involving 171 subjects. Of these, 175 pairs had identical *signatures*, not necessarily identical image pixels. This coarse screen can produce false positives and misses, and does not establish an exact number of visually unique designs. See `visual-audit.json` for subject-level flags and the highest-similarity pair per subject.

The result does **not** meet the requested standard of 150 genuinely different visual identities per subject. For example, Birth Jathagam has 30 flagged pairs; the three word-led services have 1,257–1,297 flagged pairs each. The new third artwork direction improves the ten main services, but cannot by itself resolve recurring poster layouts. Manual review and further redesign are required, including English text, logo integrity, positioning and full-resolution quality on every render. Existing automated checks do not substitute for that review.

The repository contains 162 files in `public/art/scenes`, with 162 distinct SHA-256 hashes, and 149 thumbnail files in `public/art/thumbs`. These counts describe files, not a claim that all are independently verified or suitable for every subject. Ten new full-size detail plates and their ten thumbnails were added in this pass. The existing catalogue tests verify all 45 identified god-related festivals reference their respective deity artwork; visual correctness of all 25,800 outputs remains unverified.

## Scheduling and rotation limitations

A planner note is not a publication job. Scheduling requires an explicit action, configured Meta credentials, a connected account and a running single server instance with persistent storage. Unit tests use mocked Graph requests; real-account scheduling and public Meta image retrieval have not been tested. Meta Page tokens are now encrypted at rest using a server-side AES-256-GCM key. Other state and poster media remain unencrypted, so protect the server and its `.data` directory. Legacy plaintext state is rejected rather than silently loaded, and requires a secure offline migration or reconnection. Expired sessions, downtime or revoked permissions can stop jobs. Automatic retry is deliberately blocked once a Meta request has been attempted because timeouts, crashes and partial success can make the result uncertain; verify each destination before creating another job. A manual review action records acknowledgement only, not Meta confirmation. Notifications are shown in the application, not sent by email or push. DST gaps are rejected; repeated local times during a DST transition are not explicitly disambiguated. Multiple writers are prevented by an exclusive directory lease, not a multi-worker queue; a crash can require manual lock recovery.

History uses a per-event browser-storage journal to avoid unrelated tabs overwriting one another, but simultaneous selections are not locked and can still select the same unused design. Rotation prefers different recent composition and artwork but does not guarantee all combinations are unique; the visual audit above demonstrates why IDs alone are insufficient.

## Correction pass — rendered audit after three new word-led layouts

The unchanged 97% luminance-signature screening method was re-run across the full catalogue. The before result is `visual-audit.json`; the after result is `visual-audit-after.json`.

| Measure | Before | After |
| --- | ---: | ---: |
| Subjects rendered | 172 | 172 |
| Posters rendered | 25,800 | 25,800 |
| Within-subject pairs compared | 1,922,100 | 1,922,100 |
| Pairs flagged at 97% or higher | 10,703 | 8,323 |
| Identical 32 × 40 bit signatures | 175 | 104 |
| Subjects with flagged pairs | 171 | 171 |

The three word-led services were the target of the new editorial, geometric and contemporary compositions. Their respective flagged pair counts changed from 1,257 to 484 (Free Beta), 1,297 to 479 (Your Priest Is Busy), and 1,296 to 507 (Priest Team Ready). Birth Jathagam remains at 30 flagged pairs. Identical signatures do not necessarily mean pixel-identical images; this coarse screen can also miss duplicate compositions. All warnings are retained, not suppressed.

The after report contains every subject with `thresholdPassingCandidates`, a deterministic greedy set with no pair over the screening threshold. This is **not** a count of genuinely distinct compositions or an objective maximum. The `genuinelyDistinctVerified` value is null for every subject because the required detailed design review has not happened. The single subject with zero flags still requires manual review. No subject is marked complete.

CI now has a full rendered visual gate that fails if any pair is flagged or coverage is incomplete. With these results it is expected to fail. Fixing 8,323 flags, ensuring subject-specific artwork/layouts across unrelated subjects, checking every poster's text, logo and placement at full resolution, and independently verifying 150 genuinely distinct compositions for each subject all remain blockers. The limited improvement here must not be represented as completing that work.
