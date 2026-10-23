# Field Atlas — research progress demo
Author: Chetan Bavdhankar

## Publish with GitHub Pages
1. Create a public GitHub repository (for example `universe-field-atlas`).
2. Upload the CONTENTS of this folder to the repository root, preserving subfolders. Do not upload the enclosing folder or the ZIP itself. No token or build is needed.
3. Open Settings → Pages → Build and deployment → Deploy from a branch.
4. Select `main` and `/ (root)`, then Save. GitHub displays your site address after deployment.
5. Share that address with colleagues. All paths are relative and support repository subpaths.

## Local preview
Double-click START_LOCAL.cmd on Windows with Python installed; open http://localhost:8080.
Alternatively run `python -m http.server 8080` from this folder. Opening index.html directly with file:// may fail because browsers restrict JavaScript module loading. Hosting over HTTP fixes this.
No npm install, API key, backend, account integration, or inference is needed to view the site. WebGL2 and hardware acceleration are required. Vendored Three.js 0.180.0 is included, with its MIT license.

## Explore
Drag to orbit, scroll to zoom, right-drag to pan. Use Fit view and the radius slider to inspect the full box. Toggle density isosurfaces, sampling nodes, velocity arrows, streamlines and a Z slice. Click a visible sampling node for its values. Save image downloads a locally generated PNG with provenance. The points are mesh samples, not individual galaxies.

## Scientific scope
This release contains SEVEN field products: one published observation-derived 2M++ reference, five epochs of the same approximate particle-mesh simulation, and one near-present-epoch Mini-Uchuu simulation reference. Select products with the FIELD PRODUCT menu. The epoch slider appears only for the five approximate PM snapshots (z=9, 4, 2, 1, 0). These are separate products and cannot be treated as the history of the observed Universe.

The 2M++ product is the published luminosity-weighted tracer-density contrast and predicted peculiar velocity, derived from galaxy survey observations. It is an external inferred reference, not direct matter-density or full three-component velocity measurements, and not our own accepted observed reconstruction. Survey gaps can be model-completed. Its Galactic coordinates and fixed observer origin are preserved. Source: Carrick et al. (2015), https://arxiv.org/abs/1504.04627 , https://doi.org/10.1093/mnras/stv547 .

The following scope notes refer specifically to Mini-Uchuu: The arbitrary simulation-box centre is not the Milky Way; axes are not Galactic axes. Galactic re-centring is disabled. Mini-Uchuu itself has only one epoch; it is not linked to the approximate PM time sequence.
Density is a two-draw probability-sampled collisionless particle estimate smoothed at R=40 comoving Mpc. Velocities are a SEPARATE cutoff-9 curl-free least-squares fit to 32,768 host-halo velocities, with minimum wavelength about 196.8 comoving Mpc. The two fields have not yet passed a joint physical consistency validation. The native 64-cubed display grid is not the physical recovery resolution.
The R40 sampling precision screen passed; the finer R20 screen failed and was retained. Particle sampling uncertainty is not propagated into the displayed velocity. Streamlines are instantaneous field geometry, not trajectories. No calibrated posterior uncertainty, observed-Universe scientific acceptance, cluster-scale dynamics, or time evolution is claimed.

## Files and reproducibility
`index.html`, `app.js`, `math.mjs`, `style.css`, `vendor/` and `snapshot.js` plus `data/` are the complete static application. Snapshot values use the SAME five-decimal serialization and native node sampling as the local viewer. `provenance/` contains release evidence and hashes; `research_code/` contains the native reference producer and recursively resolved local Python dependencies, plus its audit and mathematical operator code. These research scripts are archival source, not a portable full pipeline: their original large inputs, environment, and D-drive paths are intentionally not bundled. The ready-to-run deliverable is the static viewer.
`tools/export_static_snapshot.py` refreshes the included products from a running local viewer at 127.0.0.1:8768. Run it after a newly validated compatible backend revision, then upload the refreshed snapshot and checksum manifest. The hosted page never contacts your computer. Publishing does not automatically rerun science.
`SHA256SUMS.json` hashes every bundled file except itself. `verify_package.py` checks it using only Python's standard library.

## Sources and rights
Mini-Uchuu: Ishiyama et al. (2021), MNRAS 506, 4210–4231, https://doi.org/10.1093/mnras/stab1755 ; public source documentation https://www.skiesanduniverses.org/Simulations/Uchuu/ . This is an unofficial derived visualization, not an endorsed release. No original telescope catalogue or full simulation download is included. The scientific source retains its original attribution and terms. No new blanket license is granted over third-party data or research source. Three.js is covered by vendor/LICENSE.

## Release verification
All bundled scene values come from the hash-checking existing backend adapter; no new scientific fit is performed. Static hashes and browser controls are verified separately from scientific validity. Native Mini-Uchuu and PM coordinates are simulation axes. Only the 2M++ reference uses the observed Galactic chart. The source archive covers selected reference builders and their local import dependencies, not the entire historical project or its large datasets.
