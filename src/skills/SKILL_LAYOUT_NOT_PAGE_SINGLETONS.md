# Layout, not page — for singletons

> **🔧 Reuse & local setup**
>
> **🚀 First time?** Run `/ai-init SKILL_LAYOUT_NOT_PAGE_SINGLETONS` to fill the local definitions below interactively (or invoke `MANAGER_INIT.md`).
>
> **Layer:** SKILL (auto-triggered agent rule). Canonical copy — vendored at `docs/ai-product-builder/skills/SKILL_LAYOUT_NOT_PAGE_SINGLETONS.md`. **Additional install target:** `.claude/skills/layout-not-page-singletons/SKILL.md`.
>
> **Reusability:** template-ready — the "the second call throws" rule and the four singleton families are framework-agnostic; only `«LAYOUT_PATH»` and the specific host primitives (`«SINGLETON_PRIMITIVE»`) need swapping.
>
> **Pairs with:** `MANAGER_ARCHITECTURE.md` (where global state lives in the domain graph) and `RUNBOOK_E2E.md` (the second-navigation test that catches this class) — boundary: this skill owns the **routing scope** of a shared resource; the architecture MANAGER owns the domain shape around it.
>
> **Owns / defers to:** Owns the "which route-level file holds the singleton" decision for host-provided resources whose second-construction throws. Defers *how many domains may reach the singleton* → `MANAGER_ARCHITECTURE.md`; *what to test* → `MANAGER_TESTING_STRATEGY.md`; *the double-navigation e2e proof* → `RUNBOOK_E2E.md`.
>
> **Local definitions to provide per repo:**
> - `«LAYOUT_PATH»` — the route-tree layout file that will hold the singleton (e.g. `app/(shell)/layout.tsx` for Next App Router)
> - `«SINGLETON_PRIMITIVE»` — the primitive that throws on second construction in this codebase (e.g. `AudioContext.createMediaElementSource`, `new SharedWorker`, `navigator.serviceWorker.register` under some UAs)
> - `«INCIDENT_REF»` — how this repo cites the incident that motivated the rule

**Last reviewed:** «DATE»

---

## Frontmatter to install with

```yaml
---
name: layout-not-page-singletons
description: >-
  Framework singletons (`«SINGLETON_PRIMITIVE»`, `AudioContext.createMediaElementSource`,
  `new SharedWorker`, a `ref` holding a WebSocket, a page-level `<audio>` fed into an
  analyser) throw or duplicate on the second call. A page-level provider that mounts one
  will break the moment the user navigates to a sibling route and back («INCIDENT_REF»).
  The fix is not "make the provider a hook" or "add a `useMemo`" — it is to hoist the
  provider into the deepest layout that survives the navigations that would re-run it.
  Use when adding any of: an `AudioContext`, a `<video>`/`<audio>` element fed into an
  analyser or worklet, a `new SharedWorker` / `new Worker` intended to be shared across
  routes, a `WebSocket` / `EventSource` singleton, a `navigator.mediaDevices.getUserMedia`
  stream, a `PerformanceObserver`, a `ResizeObserver` on the viewport, or any provider
  named `*ContextProvider` mounted at `app/`page.tsx or similar. Especially fire when the
  session is about to wrap the primitive in a hook and add `useMemo` or a ref — that is
  the treatment that hides the bug on the FIRST render and ships it to the second
  navigation. Defer to `never-throws-contract` for handling primitives that resolve with
  `{ success: false }` instead of throwing; this skill owns whether the primitive is
  constructed in a scope that survives navigation at all.
---
```

---

## The damage

A page-level provider mounts once, works perfectly, and looks correct because the browser and the framework both cooperate to hide the bug on the first render.

Then the user navigates to a sibling route, back, and:

- `AudioContext.createMediaElementSource(<audio>)` throws `InvalidStateError: HTMLMediaElement already connected previously to a different MediaElementSourceNode`.
- `new SharedWorker('/w.js')` silently returns a *different* worker instance, and every message posted to it goes to a listener nobody is holding a reference to.
- A `WebSocket` in a ref is left dangling — the old one keeps its `onmessage` handler alive; the new one takes traffic; UI reads from either at random.
- `navigator.serviceWorker.register(...)` inside a component effect re-registers the same worker, doubling every push notification.
- A `<video>` element handed to a shape-detection worker becomes a stale reference; the *previous* video plays and the new one is muted.

None of these throws on the day the code is written, because the first mount is clean. All of them ship. All of them break in production the first time a user navigates. («INCIDENT_REF».)

**Blast radius.** Anything that ties the *DOM element* or the *host resource* to a lifecycle wider than a single page: audio pipelines, video worklets, real-time channels, background service workers, persistent websockets. Broken silently means the user hears no audio on the second track, the notification fires twice, the chat drops messages. The unifying property is that the host primitive **cannot be reconstructed** and the framework **will happily reconstruct it** on every navigation into and out of a page it lives on.

## When to use

- Adding an `AudioContext`, an `AnalyserNode`, an `AudioWorkletNode`, or feeding an `<audio>` / `<video>` element into any Web Audio graph.
- `new SharedWorker`, `new Worker`, `navigator.serviceWorker.register`, `new BroadcastChannel`.
- A `WebSocket` / `EventSource` intended to survive a route change.
- `navigator.mediaDevices.getUserMedia` — the returned `MediaStream` is a singleton in practice; a second call re-prompts the user.
- Any `*Provider` component mounted at the page level whose child effect calls one of the above.
- Any code that survives on the first mount but fails on the second — reviewing an e2e test that navigates twice and passes only on the first pass.
- Reviewing a PR that "fixes" the second-call bug by adding `useMemo`, a ref, or a `try/catch` around the primitive.

## The trap

```tsx
// ❌ Provider mounted at page — throws on the second visit.
// app/tracks/[slug]/page.tsx
export default function TrackPage({ params }) {
  return (
    <AudioAnalyserProvider>            {/* ← constructed anew each navigation */}
      <TrackPlayer slug={params.slug} />
      <FrequencyDance />
    </AudioAnalyserProvider>
  );
}

// components/AudioAnalyserProvider.tsx
export function AudioAnalyserProvider({ children }) {
  const [analyser, setAnalyser] = useState<AnalyserNode>();

  useEffect(() => {
    const ctx = new AudioContext();
    const audioEl = document.querySelector('audio')!;
    const src = ctx.createMediaElementSource(audioEl);  // ← throws on 2nd navigation
    const node = ctx.createAnalyser();
    src.connect(node); node.connect(ctx.destination);
    setAnalyser(node);
  }, []);

  return <AnalyserContext.Provider value={analyser}>{children}</AnalyserContext.Provider>;
}
```

The provider is at the page. The `<audio>` element it grabs is at the page. The `AudioContext` is at the page. On first visit, the tree renders, the effect runs, everything works — the developer commits, and it ships.

On the second visit to the same route (or a sibling route in the same route group), the framework unmounts the tree, remounts it, and re-runs the effect. `createMediaElementSource` refuses to construct because the *same DOM `<audio>` element* is still bound to the *previous* source that lives on the previous `AudioContext` which the framework did not explicitly tear down (because it is a JS object, not a React tree).

The tell: **the code has no explicit cleanup that un-does what the effect did.** Not because the author forgot cleanup — because there is no cleanup. `createMediaElementSource` is one-way. The primitive assumes it lives for the lifetime of the page process, and the page process is the *tab*, not the route.

### The "fix" that hides the bug

```tsx
// ❌ Still broken — now silently.
useEffect(() => {
  if (analyserRef.current) return;   // "already have one, skip"
  // ...construct
}, []);
```

This is worse: the provider now shows the *first* track's analyser to the second track's audio element, because the analyser is bound to a `<audio>` that was unmounted with the first page. No throw. Wrong frequencies. Ships.

## The fix — hoist to the deepest surviving layout

The rule: **construct the singleton in the deepest route-tree file that survives the navigations you intend to survive.**

```tsx
// ✅ Layout — one mount per tab, not per navigation.
// «LAYOUT_PATH»  (e.g. app/(shell)/layout.tsx)
export default function ShellLayout({ children }) {
  return (
    <AudioAnalyserProvider>
      <audio ref={audioRef} />        {/* ← the DOM element also lives at layout scope */}
      {children}
    </AudioAnalyserProvider>
  );
}
```

Two things move together:

1. **The provider** moves from `page.tsx` to `«LAYOUT_PATH»`. Framework layouts persist across navigations *within their scope* — the exact lifetime the singleton needs.
2. **The DOM element the singleton wraps** moves to the same layout. `createMediaElementSource` binds the audio element to the source *permanently*; if the element unmounts, the graph breaks. Both must share a lifetime.

The choice of *which* layout is not free:

- Route-group root (`app/(shell)/layout.tsx`) — survives navigations inside the group; loses on cross-group navigation.
- App root (`app/layout.tsx`) — survives everything except a hard reload.
- Nested layout (`app/tracks/layout.tsx`) — survives navigation between tracks; loses on leaving `/tracks/**`.

Pick the shallowest scope that covers the navigations the singleton must survive. Deeper than that costs nothing; shallower loses.

## What the naive fix still gets wrong

**1. Moving the provider to a layout without moving the DOM element is a partial fix.** If `<audio>` is still at page scope, the layout-level `AudioContext` outlives the element it wrapped — on second visit, the layout tries to reconnect an audio source whose target DOM node was unmounted with the previous page. The graph fires, no error, no sound. Move both together, or neither.

**2. A React `<StrictMode>` double-invoke will surface this class of bug in dev — and hide it in prod, where StrictMode is off.** If your dev server suddenly logs `InvalidStateError` on the first mount, the fix is not to catch and ignore it — StrictMode is telling you the primitive genuinely does not survive a second construction, and prod will hit the same wall on the second navigation. Treat the StrictMode error as the production e2e result.

**3. `getUserMedia` behaves differently — the *user prompt* is the singleton, not the stream.** A second `getUserMedia` call in the same page process without releasing the first stream will *silently succeed* on some browsers and re-prompt the user on others. Cache the returned `MediaStream` at layout scope and hand it out; only release on layout unmount.

**4. A `useEffect(() => { ... }, [])` with no cleanup is not "one-time"; it is "one-time per mount", and every navigation is a new mount.** The empty dependency array is not the mechanism you think it is at page scope. The only mechanism that gives you one-per-tab is the layout tree.

**5. Do not "solve" this with a module-level singleton.** `const ctx = new AudioContext()` at the top of a module will construct on first import and never re-construct — but the module reload semantics under HMR / dev-server / test isolation will bite in ways that are unrelated to your app. Layouts are the framework-blessed lifetime; use them.

## The proof obligation

The test that separates a real fix from a StrictMode-suppressed one is a double-navigation e2e:

```ts
// ✅ Runs against the pre-fix code, throws / hangs / logs the InvalidStateError.
test('audio pipeline survives navigation between tracks', async ({ page }) => {
  await page.goto('/tracks/first');
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('[data-testid=analyser-active]')).toBeVisible();

  await page.goto('/tracks/second');                    // ← the killing navigation
  await page.getByRole('button', { name: 'Play' }).click();

  // The pre-fix code throws InvalidStateError from createMediaElementSource
  // here; the console error surfaces via `page.on('pageerror', …)` and the
  // analyser element never becomes visible.
  await expect(page.locator('[data-testid=analyser-active]')).toBeVisible();

  const errors: Error[] = [];
  page.on('pageerror', (e) => errors.push(e));
  await page.goBack();
  await page.goForward();
  expect(errors).toEqual([]);   // ← the true assertion
});
```

Run this against the **pre-fix code** and watch it fail (either with a console error, a missing `analyser-active` element, or duplicate audio playback). If it passes against the broken code, it is one of the assertion shapes named in `SKILL_TESTS_THAT_CANNOT_FAIL.md`.

A unit test cannot replace this. The primitive's second-construction behaviour is a browser-runtime property; JSDOM does not model it. If you cannot run a browser e2e for a genuine reason, name that in the test comment and mark the branch as unproven — do not assert `expect(() => secondConstruct()).not.toThrow()` against JSDOM and call it covered.

## Checklist

- [ ] The singleton is constructed in `«LAYOUT_PATH»` (or a deeper layout scope that still covers the navigations it must survive), **not** in a `page.tsx`.
- [ ] The DOM element the singleton binds to (e.g. `<audio>`, `<video>`, `<canvas>`) lives in the **same** layout as the singleton.
- [ ] There is no `useMemo` / `useRef` / `if (ref.current) return` trick attempting to make a page-level primitive survive re-mount.
- [ ] If the framework has a StrictMode-equivalent double-invoke in dev, its errors are treated as production reproductions, not as noise to suppress.
- [ ] A double-navigation e2e test exists, was run against the pre-fix code, and observed to fail there.
- [ ] The `pageerror` listener in the e2e asserts `errors.toEqual([])`, not just `expect(page).toHaveText(...)` — a silent duplicate is the failure mode this skill guards against.
- [ ] `getUserMedia` streams are cached at layout scope; the release happens on layout unmount, not on effect cleanup.

## Related

- Incident / plan: «INCIDENT_REF»
- The domain-graph rule that says *which* domain owns the singleton: `MANAGER_ARCHITECTURE.md`
- The double-navigation e2e discipline: `RUNBOOK_E2E.md`
- The sibling rule for primitives that resolve `{ success: false }` instead of throwing: [[never-throws-contract]] — `SKILL_NEVER_THROWS_CONTRACT.md`
- Whether the double-navigation test above can actually fail: [[tests-that-cannot-fail]] — `SKILL_TESTS_THAT_CANNOT_FAIL.md`
