# Budget-sized external particle-density reference

## Completed source and transport work

All 400 publisher-listed Mini-Uchuu snapshot-50 GADGET parts passed independent metadata replay. Their local counts sum to 16,777,216,000 particles. The header NumFiles=4000 disagreement with the 400 actual manifest parts remains recorded. Native particle a=0.9998868107795715 and the float32-rounded header box/cosmology are preserved; the catalogue's a=0.99989 is the corresponding rounded Consistent Trees epoch. The nominal published comoving side 400 Mpc/h and h=0.6774 govern derived coordinates.

Two fixed probability draws sample 128 row-order strata per file, selecting a cyclic 128-particle block in each. Each draw contains 6,553,600 sampled position rows; 13,107,200 rows across both draws are not claimed to be independent or unique across draws. Inclusion weights are Nstratum/128. All files and strata contribute, without value-based exclusions or an assumption that the first file or row ordering is representative. The small-population enumeration test confirms the expected weighted CIC map equals full CIC under this design.

All 800 file/draw cases completed in one 735.6-second bounded attempt. Every requested byte interval was independently retrieved twice and matched after multipart decoding. Actual response-body traffic was 335,465,600 bytes, below the fixed 400 MB cap, with 1,600 requests and no recorded errors. Both raw responses, byte ranges, hashes and source ETags are retained. This is sampled-range reproducibility, not full-file publisher MD5 verification: the entire roughly 520 GB snapshot and its full particle IDs have not been downloaded or verified.

## Maps and independent calculations

All sampled coordinates passed finite/native-support checks; no point or value was excluded. Weighted periodic CIC counts on 64^3 and 128^3 grids conserve the declared total to relative 1.14e-16 or better. Particle contrast is count/(Ntotal/Ngrid^3)-1; constant particle mass cancels. Fixed Gaussian smoothing radii are 20 and 40 comoving Mpc. Grid spacings are respectively 9.22645 and 4.61323 comoving Mpc, not independently recovered physical scales.

Independent replay reads every sampled float and both transport responses, uses scatter accumulation instead of the producer's bincount CIC, and uses a separate real-FFT smoother. Maximum relative count discrepancy is 5.56e-15 and maximum field discrepancy is 1.89e-15. The report is results/mini_particle_density_v1.json, with independent checks in mini_particle_density_checks_v1.json. Both draws and every radius/grid remain saved, including failures.

| Gaussian radius [comoving Mpc] | Two-draw relative RMS, 64 grid | Two-draw relative RMS, 128 grid | Grid discrepancy, first/second draw | Fixed disagreement screen |
|---|---:|---:|---|---|
| 20, secondary | 0.20303 | 0.20578 | 0.01887 / 0.01880 | FAIL |
| 40, primary | 0.09516 | 0.09548 | 0.00543 / 0.00547 | PASS |

The predeclared primary limits were <=0.10 for draw disagreement and <=0.02 for grid disagreement. Passing this feasibility screen does not turn two draws into calibrated error bars or exact matter truth. At 20 Mpc, sampling disagreement is about 20%; that result is retained rather than hidden or repaired by changing the seed/sample budget. The source is one correlated collisionless simulation snapshot, without observational validation, baryonic/galaxy physics or cosmic-variance intervals.

## Live reference view

The existing backend now exposes three additional diagnostic arrays: the mean R40 sampled contrast, the independently audited primary coarse host-halo velocity fit, and a signed half-draw density difference. All 605 previous entries are preserved, giving 608 registered products. The half difference is explicitly not posterior SD. The velocity is a separately fitted host-halo field with minimum represented wavelength 196.831 comoving Mpc; this display does not impose a joint density/velocity likelihood or claim exact particle velocity.

The new simulation-reference scene is [available locally](http://127.0.0.1:8768/field-viewer?scene=updates-20261023%3Amini-uchuu-particle-halo-reference%3Adensity). It loads from registered backend arrays without recomputing inference or rebuilding the frontend. Browser checks confirmed simulation labels, native axes, disabled Galactic recentering and unavailable posterior-spread controls. The display radius now follows backend grid extent for simulation-reference scenes, allowing 520 Mpc to cover this cube. Other scene kinds keep their previous radius cap. No physical arrays changed in this UI patch.

The exported PNG includes source revision and display settings, and browser console errors were absent during the checks. The scene uses an arbitrary simulation-box centre, not the Milky Way or Local Group. Our observational origin and all seven empirical acceptance gates remain unchanged. No newly accepted observed field is registered.

Figures: results/mini_particle_density_figure_v2.png/.pdf are A4 portrait; presentation v2 gives colourbar labels more right margin, preserving frozen v1 analysis and the first figure. The native velocity and residual-structure figures and results notes provide complementary limitations. The full-source halo MD5 qualification is separate from the partial particle-range qualification and must not be transferred to it.

## Next scientific step

Test density/velocity consistency at matched Fourier bandwidth under the native cosmology before attempting a harder line-of-sight and uncertain-distance reconstruction. The new native linear-continuity operator passes Einstein-de Sitter, independent growth-ODE, analytic plane-wave, CIC-compensation and divergence-sign/unit checks. Native f=0.52139314 and aHf=35.317026 km/s/Mpc under the stated flat matter-plus-Lambda model. It has not yet been applied to these physical particle-density maps or scored against the native halos. See NEXT_NATIVE_COUPLED_FIELD_STEP_2026_10_23.md. This preparation is not an executed density-driven velocity validation.
