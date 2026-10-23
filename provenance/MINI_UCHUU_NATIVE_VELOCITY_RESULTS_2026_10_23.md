# Independent native halo velocity representation benchmark

## Question and status

How well can the current coarse, curl-free periodic velocity representation describe host-halo velocities from an external nonlinear N-body simulation, before introducing uncertain distances or line-of-sight-only observations? This first physical-reference test is complete and independently replayed. It is not an accepted observed-Universe reconstruction or a complete matter-density validation.

## Source and admission

The anonymous producer Mini-Uchuu catalogue MiniUchuu_halolist_z0p00.h5 contains 33,585,418 native halo rows and 81 datasets. All 6,470,500,176 bytes passed the publisher MD5 1726f0b56b34cddd736bdbe191b3fec9 and an independent sequential MD5/SHA256 replay. Local SHA256 is 29643f064aa1b2362efaa962b47c5ca79ee9c03bc373b29de728107779efe731. Transfer attempts, partial prefix, segment provenance and the completed original source are retained on D.

Required native arrays were checked across every row before applying the scientific sample definition: signed integer IDs, uniqueness, finite positions/velocities/masses, nonnegative virial mass, periodic coordinate support and the exact native catalogue scale factor 0.99989. Two exact upper coordinate endpoints were mapped to the equivalent periodic origin in the derived coordinate chart; raw values were preserved. The initial prospective assumption a=1 was corrected from already archived native filename and producer snapshot metadata before physical admission or fit outcomes, with an explicit amendment and separate execution profile.

Native h=0.6774 gives side 590.4930617 comoving Mpc; velocity units are physical peculiar km/s. These coordinates are neither proper distances nor Galactic/Milky Way positions. The native snapshot is approximately redshift zero, not an evolutionary sequence. The full source contains 28,952,020 distinct hosts, zero phantom rows and 2,388,038 rows above the fixed mass threshold. The intersection pid=-1, phantom=0 and Mvir>=10^11 Msun/h contains 2,084,668 eligible hosts.

Exact-ID SplitMix64 ranking with seed 2026103001 selected 65,536 hosts without a spatial crop. The first 32,768 hash ranks train the model; the next 32,768 are held out. Independent scalar hashing, all-eligible ranking and direct source-row replay confirmed the split and payloads. IDs never pass through floating-point numbers. Held velocities are stored separately; their admission replay checks source identity, whereas held prediction scores remain unopened until all four fit audits pass.

## Fixed model and calculations

For each representative integer wavevector k of the +/- pair, the velocity columns are khat cos(2π k·x/L) and khat sin(2π k·x/L), with three additional constant bulk components. All training velocities enter unregularized float64 least squares. Four prespecified squared-wave-number cutoffs are retained, with cutoff 9 primary. No held-out tuning or case exclusions are used.

The training design is object-major with three rows per halo. Each fit reports full rank, singular values, training residual sum of squares, normalized normal-equation residual and direct prediction consistency. Independent complex-exponential evaluation confirms the saved held predictions without reading held velocities. All four fits and their audits passed. Maximum independent complex-prediction discrepancy is below 1.8e-12 km/s; normal-equation residuals are below 2.1e-14.

The held vector RMS error is sqrt(mean_i sum_j (vhat_ij-v_ij)^2); it is not a one-component dispersion. Component correlations and signed biases are also retained. Baselines are zero velocity in the native frame and the training-only mean velocity. All comparisons are number-weighted at the selected host positions, not volume-weighted matter-flow measurements.

## Results

| Squared cutoff | Parameters including bulk | Minimum comoving wavelength [Mpc] | Held vector RMS [km/s] | Component correlations x/y/z |
|---|---:|---:|---:|---|
| 1 | 9 | 590.493 | 518.214 | 0.247 / 0.082 / 0.251 |
| 4 | 35 | 295.247 | 478.852 | 0.446 / 0.393 / 0.443 |
| 9, primary | 125 | 196.831 | 438.441 | 0.567 / 0.548 / 0.570 |
| 16 | 259 | 147.623 | 414.527 | 0.627 / 0.606 / 0.636 |

Zero and training-bulk baseline vector RMS values are respectively 530.059 and 530.063 km/s. All four fitted representations reduce held squared error relative to either baseline. The primary cutoff reduces vector RMS by approximately 17.3% relative to training bulk; the finest tested case reduces it by approximately 21.8%. These descriptive improvements do not certify calibrated uncertainty or precision across independent volumes.

The A4 portrait figure results/native_halo_velocity_figure_v3.png (also .pdf) shows the fixed resolution comparison, the primary x-component prediction against native held velocity, and speed/residual distributions. Large true velocities remain compressed toward coarse predicted flows. No point was removed for disagreement. The independently replayed summary is results/native_halo_velocity_summary_v3.json, with checks in native_halo_velocity_summary_checks_v3.json; maximum scalar-metric replay discrepancy is 5.6e-12.

## Reporting failure preserved

The initial v2 summary failed independent correlation replay for the constant training-bulk baseline. Floating-point centering produced an approximately -1.46e-17 pseudo-correlation where Pearson correlation is undefined. V3 explicitly recognizes constant predictions or truths and stores null. New 32,768-row constant/nonzero fixtures pass. Original v2 sources and summary remain; no fits, predictions, RMS values or sample choices changed. See NATIVE_HALO_CORRELATION_REPORTING_AMENDMENT_2026_10_23.md.

## Implications and remaining limits

This external source demonstrates useful large-scale velocity signal in the representation, alongside substantial unresolved halo motion. It prevents treating numerical plane-wave recovery as sufficient physical validation. Smaller-scale flows, transverse components, tracer/nonlinear motions and finite representation may contribute; this experiment does not isolate those causes. Curl-free behaviour is imposed by the chosen basis, not discovered from the native Universe. A finer display grid cannot recover omitted modes or cluster-scale dynamics.

The same correlated volume supplies training and held hosts. There are no cosmic-variance confidence intervals, population coverage claims, Hubble-flow inversion, redshift/distance likelihood, inferred matter-density truth, galaxy-spin interpretation or Milky Way origin. Exact full 3D training velocities are more informative than real observations; this is a representation benchmark rather than observational reconstruction performance.

Next, quantify residual structure transparently, then define and qualify a native-cosmology radial-velocity/uncertain-distance observation contract. Any new resolution/model choice is development on this volume and needs fresh validation, rather than calling the existing held scores untouched. Independent matter-density validation requires particle data: a metadata-only access review found a first-file num_files=4000 header versus 400 directory files, so no particle-density truth has been admitted. Halo counts or summed virial masses will not substitute for complete matter density. The original observed selection failure and all seven empirical field gates remain closed.

## Sources and reproducibility pointers

- [Ishiyama et al. (2021), Uchuu DR1](https://doi.org/10.1093/mnras/stab1755), MNRAS 506, 4210–4231: external simulation context. This benchmark is our separate analysis, not a reproduction of their concentration results.
- [Producer halo definitions](https://skiesanduniverses.org/Simulations/Uchuu/HaloCatalogues/) and [native snapshot mapping](https://www.skiesanduniverses.org/resources/Uchuu400_snapshot_redshift_scalefactor.txt); exact raw header and source hashes govern the parser.
- config/native_halo_velocity_execution_v2.json freezes source admission and physical fits; config/native_halo_reporting_execution_v3.json freezes corrected reporting.
- MINI_UCHUU_NATIVE_REFERENCE_DESIGN_2026_10_23.md, MINI_UCHUU_EXECUTION_REVIEW_2026_10_23.md, MINI_UCHUU_EPOCH_AMENDMENT_2026_10_23.md record the prospective design and source correction. Old profile v1 remains preserved and unexecuted.
