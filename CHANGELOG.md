# Changelog

## 0.19.0 — 2026-09-21

- Added bounded definition-only `grid.with_step` for deterministic per-axis progression of existing finite numeric definition settings over fixed `gx`, `gy`, and `gz` loop variables.
- Requires `x`/`y`/`z` axis maps with 1..32 finite numeric deltas, matching own finite numeric `instance.with` bases, at least one changed setting per provided axis, and at least two cells on each progression axis.
- Allows a definition grid axis to remain translation-stationary when that same axis owns validated setting progression; primitive grids reject `with_step`.
- Composes setting progression with existing definition `rot_step` and scalar/vector `scale_step` without exposing caller-authored expressions.
- Proves the complete bounded Cartesian position+rotation+scale+settings authored-state domain remains finite and distinct, including non-adjacent cross-axis setting cancellation.
- Deliberately does not invent positivity, range, semantic-effect, or visual-effect rules for arbitrary external definition settings; the referenced definition/runtime owns their meaning.
- Reuses the exact same grid-setting rule inside `intent.compose`.
- Added pinned-runtime proof that current MorphTile resolves a real parametric definition, consumes multi-axis width/depth setting expressions, compiles four finite recipe parts, and differs from a fixed-setting control.
- Preserved regression-first evidence: exact head `4180d56c9f4cf981507006d81f4aa9125070df29` produced expected failing Actions run `35559047033`; functional head `f49e0523b3fa7de7cd2e018b0da2822f505e2675` then passed Actions run `35559135517` before version/documentation receipts.

## 0.18.0 — 2026-09-21

- Added bounded per-axis definition-instance `grid.scale_step` using fixed `x`, `y`, and `z` progression keys over existing `gx`, `gy`, and `gz` loop variables.
- Supports either scalar scale deltas on every provided grid axis or vector scale deltas on every provided grid axis; mixed scalar/vector axes and base-step coercion HOLD rather than inventing broadcast semantics.
- A definition grid axis may remain at one translation coordinate when that same axis has validated scale progression; active axes with neither translation nor their own rotation/scale progression still HOLD.
- Requires at least two cells on every scale-progression axis and proves every generated scalar/vector scale remains finite and strictly positive across the complete Cartesian domain.
- Proves combined position+rotation+scale authored states stay distinct, including non-adjacent cross-axis cancellation.
- Allows bounded definition grid scale and rotation progression to coexist through the same compact nested-loop substrate and reuses the exact rule inside `intent.compose`.
- Primitive grids reject `scale_step` and continue to use primitive `size_step`; grid definition-setting progression remains a separate HELD semantic.
- Added pinned-runtime proof that current MorphTile resolves a real definition, consumes multi-axis per-cell scale expressions with simultaneous rotation, compiles finite changing geometry, and differs from a fixed-scale control.
- Preserved regression-first evidence: head `53ef8211f1876f807627978a2be73d090113b7cb` produced the expected failing PR run `35555607978` before the capability existed; implementation head `f685894d1b9c325159aa088bb2d47bcc4fae832f` then passed run `35555720791`.

## 0.17.0 — 2026-09-21

- Added bounded per-axis primitive `grid.size_step` using fixed `x`, `y`, and `z` progression keys over existing `gx`, `gy`, and `gz` loop variables.
- A primitive grid axis may remain at one translation coordinate when that same axis has validated size progression; active axes with neither translation nor their own rotation/size progression still HOLD.
- Requires exactly three finite dimension deltas per provided axis, at least one changed size component, and at least two cells on every size-progression axis.
- Proves every generated primitive size component stays finite and strictly positive across the complete Cartesian grid before emission.
- Proves combined position+rotation+size authored states stay distinct, so cross-axis cancellation cannot silently stack cells.
- Allows bounded grid size and rotation progression to coexist through the same compact nested-loop substrate and reuses the exact rule inside `intent.compose`.
- Definition-instance grids reject `size_step`; grid definition-setting and definition-scale progression remain separate HELD semantics.
- Added pinned-runtime proof that current MorphTile consumes multi-axis per-cell size expressions with simultaneous rotation and compiles finite changing geometry relative to a fixed-size control.
- Preserved regression-first evidence: head `ff4fbabdbfaa51a99fafd0f98ba70d1398d1d155` produced 284 pass / 6 expected fail before the capability existed.

## 0.16.0 — 2026-09-21

- Added bounded per-axis `grid.rot_step` for primitive and definition-instance grids using fixed `x`, `y`, and `z` progression keys over existing `gx`, `gy`, and `gz` loop variables.
- An active grid axis may remain at one translation coordinate only when that same axis has a validated rotation progression; active axes with neither movement nor their own progression still HOLD.
- Proves every generated position+rotation state across the complete 2..64-cell grid is finite and unique as authored state before emission; canceling multidimensional progressions HOLD instead of silently stacking cells.
- Reuses the same rule inside `intent.compose` and keeps the emitted grid compact instead of materializing placements or exposing arbitrary expression authoring.
- Added pinned-runtime proof that current MorphTile consumes the emitted per-cell rotation expression as finite changing geometry relative to a fixed-rotation control.
- Preserved an intermediate receiver-found defect where inactive progression axes were emitted as `null` expression terms; repaired it by omitting inactive axes rather than coercing them.
- Kept grid setting, primitive-size and definition-scale progression HELD as separate multidimensional semantics.

## 0.15.0 — 2026-09-21

- Added a bounded repeat-distinctness rule so `step: [0,0,0]` may be used when an existing validated `with_step`, `rot_step`, `size_step`, or `scale_step` changes authored target state.
- Reuses the existing repeat progression validators rather than exposing another progression grammar; malformed, no-op, wrong-target, non-positive, overflow, or single-placement progressions still HOLD.
- Restores the exact authored base position before candidate emission, so the private validation-only translation never reaches MorphTile matter.
- Added the missing `repeat.with_step` invariant that `count` must be at least 2, matching rotation/size/scale progression so an authored delta cannot be accepted when it can never affect a placement.
- Reuses the same rule through standalone `intent.repeat` and repeat blocks inside `intent.compose`.
- Added pinned-runtime proof that current MorphTile compiles a zero-translation repeat with bounded size + rotation progression into finite non-empty geometry.
- Preserved the zero-translation HOLD when no bounded progression is present and made no visual-uniqueness claim for symmetric primitives or unused external-definition settings.

## 0.14.0 — 2026-09-20

- Extended definition-instance `repeat.scale_step` with a bounded 3-vector form for deterministic anisotropic whole-form growth/shrink.
- Requires exactly three finite deltas, at least one non-zero axis, and at least two repeated placements.
- Accepts a positive finite vector `instance.scale`, or MorphTile's exact implicit unit vector `[1,1,1]` when scale is omitted; scalar/vector base-step coercion remains HELD.
- Proves every generated per-axis scale remains finite and strictly positive across the complete bounded repeat domain before emission.
- Reuses the same rule through `intent.compose` and keeps zero-delta axes as exact base values.
- Added pinned-runtime proof that real MorphTile evaluates Form-generated vector scale expressions into finite changing geometry distinct from a fixed-vector-scale control.
- Kept primitive scale progression, grid scale progression, arbitrary expressions and autonomous geometry invention HELD.

## 0.13.0 — 2026-09-20

- Added bounded scalar `repeat.scale_step` for definition-instance repeats so reusable whole forms can grow or shrink as `base + i * delta` without exposing arbitrary recipe expressions.
- Requires a finite non-zero scalar delta, at least two placements, and a positive scalar base or MorphTile's implicit unit scale.
- Proves every generated scale remains finite and strictly positive across the complete bounded repeat domain before emission.
- Reuses the same progression inside `intent.compose` and composes with existing definition `with_step` and `rot_step`.
- Added pinned-runtime proof through a real resolved MorphTile definition.

## 0.12.0 — 2026-09-20

- Added bounded primitive `repeat.size_step` so repeated primitive dimensions can grow, shrink or taper as `base + i * delta`.
- Requires a finite 3-vector delta, at least one changed axis, at least two placements, and a primitive repeat target.
- Proves every generated size component remains finite and strictly positive across the complete bounded repeat domain before emission.
- Reuses the same rule inside `intent.compose` and composes with `rot_step`.
- Re-pinned receiver evidence to MorphTile `2bdf8eade1376055473b9cc1b11734b72a5566e5`.

## 0.11.0 — 2026-09-20

- Repaired definition-instance setting normalization so authored own keys such as `__proto__`, `constructor`, and `toString` remain exact data instead of being interpreted through JavaScript object prototypes.
- Re-pinned Form to merged MorphTile own-key core `63a65c70bb702cb9ac979ec04233ffaa7ed5d179` and added a real receiver proof that a Form-authored own `__proto__` definition setting changes compiled geometry.
- Added bounded `repeat.rot_step` for primitive and definition-instance repeats so an existing normalized target rotation may progress as `base + i * delta` over the fixed repeat index.
- Requires a finite 3-vector delta, at least one non-zero rotation axis, and at least two repeated placements; malformed or no-op requests HOLD instead of being guessed.
- Checks every generated rotation value across the complete bounded repeat domain before emission so finite authored values cannot silently expand to non-finite recipe matter.
- Reuses the same rule inside `intent.compose` repeat blocks rather than adding a second composition language.
- Added pinned-runtime proof that MorphTile executes the generated rotation expressions and produces geometry different from the equivalent non-rotating repeat while retaining the same bounded part/triangle count.
- Grounded the rule in MorphTile's existing recipe/preset pattern: ordinary repeated matter already uses loop-index-driven rotation for spiral/stair-like geometry; Form now exposes the smallest deterministic version without opening arbitrary expression authoring.
- Kept per-axis grid-setting progression, recursive/general recipe synthesis, caller-authored expressions, autonomous geometry invention and visual/aesthetic acceptance HELD.

## 0.10.0 — 2026-09-20

- Added descriptor-safe preflight of the complete caller-authored Form request before geometry normalization or JSON-backed result transport.
- Form now refuses authored values that portable JSON would invoke, rewrite, drop, or reinterpret instead of silently changing geometry or provenance.
- Added `HOLD_FORM_INPUT_NONFINITE_VALUE` for `NaN`/infinite authored values and `HOLD_FORM_INPUT_NONPORTABLE_VALUE` for accessors, `toJSON`/functions, `undefined`, symbols, bigint, `-0`, sparse or decorated arrays, cycles, non-plain objects, symbol-keyed properties, non-enumerable authored fields, and JavaScript Proxy values.
- The preflight reads property descriptors rather than caller values, so accessor-backed recipe geometry and caller-controlled `toJSON` hooks HOLD without being executed.
- Hardened that preflight for JavaScript Proxy values: live or revoked Proxy objects now HOLD before prototype/key/descriptor/array reflection can execute caller-controlled traps or escape as an uncaught revoked-Proxy throw, including when the root request itself is proxied and HOLD metadata is being derived.
- Added regressions proving accessor, `toJSON`, live Proxy trap, and revoked root Proxy code paths fail closed without caller execution or uncaught throws; non-finite recipe coordinates do not become `null`; and ordinary portable caller recipes remain unchanged without mutating their source request.
- Kept MorphTile runtime validation as the authority for portable caller-authored recipe semantics; this change protects Form's producer-side source integrity before that runtime boundary.

## 0.9.0 — 2026-09-20

- Added bounded `repeat.with_step` for definition-instance repeats so existing finite numeric `instance.with` settings may progress as `base + i * delta` over the fixed repeat index.
- Requires 1..32 finite deltas, a matching numeric base setting for every stepped key, at least one non-zero delta, and a definition-instance target; malformed/no-op/primitive-target requests HOLD.
- Reuses MorphTile's existing recipe expression and definition-setting runtime semantics without exposing arbitrary caller-authored expression trees.
- Preserves fixed settings that are not stepped and keeps definition discovery/closure outside Form Machine.
- Added pinned-runtime conformance proving three repeated parametric planes compile deterministically with width spans 1, 2 and 3.
- Kept multidimensional grid-setting progression, arbitrary expressions, autonomous definition discovery, visual acceptance and CANON HELD.

## 0.8.0 — 2026-09-20

- Extended `intent.compose` so direct primitive/definition targets can be combined with the already-bounded repeat and grid patterns in one ordered recipe.
- Reuses the existing repeat/grid normalizers rather than adding a second generic loop authoring surface.
- Added a cumulative 64-placement budget across direct, repeat, and grid blocks so compact syntax cannot silently multiply into an unbounded request.
- Added fail-closed checks for ambiguous block kinds and recursive/unknown compose fields.
- Preserves `DEFINITION_RUNTIME_RESOLUTION_REQUIRED` when a definition is referenced through a patterned block.
- Added pinned-runtime conformance for one direct plane + three repeated planes + a 2x2 grid compiling deterministically as eight recipe parts.
- Kept recursive compose, arbitrary loop bodies, conditions, custom expressions, definition discovery, visual acceptance and CANON HELD.

## 0.7.0 — 2026-09-20

- Added `intent.compose` for bounded ordered mixing of normalized primitive parts and reusable definition instances in one MorphTile recipe.
- Preserved definition runtime-resolution warnings and fail-closed handling for malformed, oversized, ambiguous or unknown composition fields.
- Added exact runtime conformance for mixed primitive + definition recipe matter against MorphTile `ef2b3c6986aa1a333247feffc43a8443f17239d0`.
- Aligned package/machine metadata before final exact-head verification.

## 0.6.0 — 2026-09-20

- Added `intent.grid` for bounded deterministic axis-aligned 1D/2D/3D composition using one normalized primitive part or definition instance.
- Added fail-closed validation for three-axis integer counts, finite spacing, active-axis non-zero step, exactly one target, and a 2..64 total-cell budget.
- Compiles active grid axes into MorphTile's existing nested recipe-loop substrate with fixed `gx`, `gy`, and `gz` loop variables rather than materializing copied parts.
- Reuses the existing primitive and definition-instance vocabularies, including definition `with`, transforms and scale.
- Added exact runtime-conformance receipts for a six-plane primitive grid and a four-cell definition grid against the current pinned MorphTile runtime.
- Kept arbitrary nested-loop, condition and expression synthesis HELD; the grid is a fixed deterministic creation rule, not a general recipe-language authoring surface.

## 0.5.0 — 2026-09-20

- Added `intent.instances` for bounded deterministic reuse of 1..64 existing MorphTile definitions through recipe `use` parts.
- Added fail-closed validation for definition ids, up to 32 finite numeric `with` settings, finite position/rotation, and positive scalar/vector scale.
- Extended compact `intent.repeat` so its single target may be either a bounded primitive part or a bounded definition instance; both compile into MorphTile's existing loop/index substrate.
- Kept definition discovery, body copying, dependency closure, provenance and merge authority outside Form Machine.
- Added explicit `DEFINITION_RUNTIME_RESOLUTION_REQUIRED` warnings because a valid reference still depends on the runtime world's definitions.
- Advanced the exact runtime pin to MorphTile `a579182ae585e5722ac87dd0cc8209963b18d000` and added runtime conformance for resolved definition reuse, parametric settings, repeated definition use, deterministic receipts and missing-world HOLD behavior.

## 0.4.0 — 2026-09-20

- Added `intent.repeat` for bounded compact parametric repetition of one normalized primitive.
- Bounded repeat count to 1..64 and required a finite non-zero translation step so identical same-location duplicates fail closed.
- Unknown repeat fields and unknown repeated-part fields now HOLD instead of being silently ignored.
- Compiles repeats into MorphTile's existing deterministic recipe loop/index expressions rather than materializing copied parts.
- Made `recipe`, `parts`, and `repeat` mutually exclusive composition modes.
- Advanced the exact runtime pin to MorphTile `4346df01ed18cd1336064f9323d7766ff4f6338a` and added an exact repeat runtime-conformance receipt.

## 0.3.0 — 2026-09-20

- Added `intent.parts` for deterministic flat primitive composition using the existing MorphTile recipe substrate.
- Bounded the lane to 1..64 parts and normalized every part through the same primitive vocabulary/parameter rules.
- Added fail-closed HOLDs for unknown per-part fields, unsupported shapes, malformed parameters, more than 64 parts, and ambiguous simultaneous `parts` + `recipe` requests.
- Added pinned-runtime proof that normalized parts compile to the same exact receipt as the equivalent caller-supplied recipe.
- Kept surface/look fields outside Form Machine's composition vocabulary.

## 0.2.0 — 2026-09-20

- Added an explicit deterministic primitive vocabulary for box, sphere, cylinder, cone, wedge, and plane.
- Added bounded validation for size, local position/rotation, radial segment counts, cylinder taper, and box subdivision.
- Unknown forms and invalid parameters now HOLD instead of relying on MorphTile's default-box compiler fallback.
- Preserved the existing caller-supplied recipe path unchanged.

## 0.1.0 — 2026-09-19

- Established the isolated repository boundary.
- Added provisional envelope v0.1, machine manifest, fixture, executable proof, tests, and minimal CI.
- Pinned the exact MorphTile v0.4 commit tested as a contract target.
- Recorded unsupported work as HOLD or NOT TESTED.
