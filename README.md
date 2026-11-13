# Corino

A reference implementation of the [`@moonbase.sh/react`](https://www.npmjs.com/package/@moonbase.sh/react) SDK on Next.js 16, dressed up as the storefront of **Corino Studio**: a fictional Oslo-based audio-plugin company selling two plugins (HALO, a saturator, and DRIFT, a granular reverb) plus a bundle.

It shows what a real, server-rendered React site built on Moonbase looks like end-to-end: marketing landing page, cart, checkout, account area, product downloads, license activation, and voucher redemption, all wired with SDK hooks. Every page is prerendered with the real catalog (and refreshed hourly), so the first paint has real names and prices, not a skeleton.

Live at <https://corino-react.moonbase.sh>.

This is the React counterpart of the [Vue storefront](https://github.com/moonbase-sh/corino-vue-storefront) (Nuxt 4 + `@moonbase.sh/vue`): same shop, same design, same routes and tenant callback URLs. There's also a [single-page HTML version](https://github.com/moonbase-sh/corino-storefront) if you want a much smaller integration with no build step.

## What's in the box

Every flow a plugin shop needs, wired with SDK hooks:

- **Landing page** with live pricing, discount badges, and an "owned → Download" CTA swap driven by `useProduct`, `useBundle` and `usePrice`.
- **Cart drawer** with product icons, names, line totals, and a checkout button that opens Moonbase's checkout overlay via `cart.checkout()`. Cleans up after itself on the `checkoutCompleted` event.
- **Login modal** using `useAuth().signIn()`.
- **Account area** at `/account` with nested routes for profile, owned products, purchase history with PDF receipts, and voucher redemption. Browser back/forward, deep links, and tab state all work the way you'd expect.
- **Product detail** at `/account/products/[id]` showing OS-aware download buttons (`useOwnedProduct`, `downloadProduct`), device activations with revoke (`useProductActivations`, `revokeActivation`), and external licenses rendered for key codes, file downloads, and iLok deposits (`useProductLicenses`).
- **License activation** at `/activate` covering both activation modes: the `?token=…` online flow via `useActivationRequest` (activating straight away with an owned license), and the offline machine-file upload via `activateProduct(token, ActivationMethod.Offline)`.
- **Cookie consent** banner that asks only the visitors the store needs consent from, using `useAttributionConsent()`, so the SDK knows whether to keep the ad click IDs they arrived with.
- **Product reviews**: each plugin's stars and review count under its name, and a reviews modal with the score, a filter by stars, sorting, "Show more", translations and helpful votes. A customer who bought a plugin here writes, edits and withdraws their review in the same modal or on the product's account page. All of it is `useReviews()`.

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

The site connects to the public `https://corino-demo.moonbase.sh` tenant by default. To point it at your own tenant, drop a `.env.local` next to `next.config.ts`:

```env
NEXT_PUBLIC_MOONBASE_ENDPOINT=https://your-tenant.moonbase.sh
```

The product and bundle IDs (`halo`, `drift`, `duo-bundle`) live in `src/lib/config.ts`. If you fork this for a different tenant, those are the strings to change.

`npm run build && npm start` runs the production build locally.

## Deployment

The site runs on [Vercel](https://vercel.com), as the `corino-react-storefront` project in the Moonbase team, with no configuration beyond Vercel's Next.js defaults. `corino-react.moonbase.sh` is a CNAME in the `moonbase.sh` Route 53 zone pointing at Vercel, next to `corino-vue.moonbase.sh` for the Vue version.

Pages are prerendered at build time and regenerated in the background at most once an hour (the catalog is fetched with `next: { revalidate: 3600 }` in `lib/catalog.ts`, and Next regenerates the pages built from it on the same schedule), so a price change in Moonbase reaches the server-rendered HTML within the hour without a redeploy. The browser always loads a fresh catalog for the visitor on top of it.

To deploy your own fork:

1. Import the repo in Vercel (or run `vercel` in it). The Next.js preset needs no changes.
2. Set `NEXT_PUBLIC_MOONBASE_ENDPOINT` in the project's environment variables if you're pointing it at your own tenant.
3. Add your domain to the project, and point a CNAME at the target Vercel shows you.

Any host that runs Next.js works the same way.

## Stack

- **[Next.js 16](https://nextjs.org)** with the App Router, hosted on Vercel with hourly ISR
- **[`@moonbase.sh/react`](https://www.npmjs.com/package/@moonbase.sh/react)** for catalog data, auth, cart, inventory, order history, vouchers, activation, and price formatting
- Plain CSS in `src/app/globals.css`: no Tailwind, no CSS modules, no design system
- Space Grotesk, JetBrains Mono and Inter, self-hosted with `next/font`

## Project layout

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx                # fonts, build-time catalog, providers, site chrome
│   │   ├── globals.css               # all styles
│   │   ├── page.tsx                  # landing page (a server component)
│   │   ├── not-found.tsx             # 404
│   │   ├── activate/                 # license activation (auto + manual)
│   │   ├── login/                    # LogIn callback
│   │   ├── sign-up/                  # ConfirmAccount callback
│   │   ├── confirm-email/            # ConfirmEmail callback
│   │   ├── forgot-password/          # ResetPassword callback (request + reset)
│   │   ├── download/                 # DownloadProduct callback
│   │   ├── subscriptions/            # ManageSubscription callback
│   │   ├── order-completed/          # thank-you page after checkout
│   │   └── account/
│   │       ├── (tabs)/               # route group: shares the header + tabs + sign-in gate
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx          # Account tab
│   │       │   ├── products/         # Products list
│   │       │   │   └── [id]/         # Product detail
│   │       │   ├── purchases/        # Purchases tab
│   │       │   └── redeem/           # Redeem tab
│   │       └── confirm-email-change/ # ConfirmEmailChange callback (outside the tabs)
│   ├── components/
│   │   ├── Providers.tsx             # <StorefrontProvider> + UI state
│   │   ├── StorefrontEffects.tsx     # checkout completed → /order-completed, ?add_product=… deep links
│   │   ├── DemoBanner.tsx            # "this is a demo" strip
│   │   ├── SiteNav.tsx               # auth-aware nav with cart badge
│   │   ├── SiteFooter.tsx            # newsletter sign-up, cookie settings
│   │   ├── CartDrawer.tsx            # right-side cart + checkout button
│   │   ├── CartLine.tsx              # icon + name + price line
│   │   ├── LoginModal.tsx            # email / password sign-in
│   │   ├── ProductDownloadModal.tsx  # OS-aware downloads, for trials and owned products
│   │   ├── DownloadList.tsx          # the download buttons both of the above share
│   │   ├── CookieBanner.tsx          # ad tracking consent, reopened from the footer
│   │   ├── AuthPage.tsx              # shared shell for callback pages
│   │   ├── landing/                  # hero, plugin cards, artwork, bundle, features, trust
│   │   ├── account/                  # shell, profile, products, product detail, purchases, redeem
│   │   ├── activation/               # online flow, offline upload, file input, product card
│   │   └── reviews/                  # rating line, modal, list, card, your review, form, stars
│   └── lib/
│       ├── config.ts                 # Moonbase endpoint + product IDs
│       ├── catalog.ts                # fetches the catalog on the server (`fetchCatalog`)
│       ├── ui.tsx                    # what's open: cart, login, download and reviews modals, cookie banner
│       ├── newsletter.ts             # whether this browser joined the newsletter
│       ├── reviews.ts                # review wording, form checks, terms link
│       └── format.ts                 # dates and error messages
├── public/assets/                    # plugin artwork (SVG + PNG)
├── next.config.ts
└── package.json
```

Each callback page is a `page.tsx` server component (its title, the static shell) next to the client component that does the work, so a route's whole story is in its folder.

## How it works

Everything flows from one storefront object and a handful of SDK hooks. The SDK is a regular npm dependency; the storefront is made once and handed to `<StorefrontProvider>`, and from there every component pulls live data or fires actions through the hooks.

### 1. Boot: `lib/catalog.ts`, `components/Providers.tsx`

The root layout is a server component. It fetches the catalog with the SDK's `fetchCatalog` and passes it down:

```tsx
// lib/catalog.ts
fetchCatalog(moonbaseEndpoint, { fetch: { next: { revalidate: 3600 } } })

// app/layout.tsx
const catalog = await getCatalog()
<Providers initialCatalog={catalog}>…</Providers>
```

`Providers` is a client component that gets the storefront with `getStorefront`:

```tsx
// components/Providers.tsx
const storefront = getStorefront(moonbaseEndpoint, { initialCatalog, persistUtm: true })
return <StorefrontProvider storefront={storefront}>…</StorefrontProvider>
```

Three things worth knowing:

- **The server renders real prices.** With `initialCatalog`, the storefront on the server has the catalog, so every prerendered page has real names and prices in its HTML. Nobody is signed in on the server and it has no cart, so those parts render empty.
- **Hydration never mismatches.** The SDK's hooks read the storefront through `useSyncExternalStore`, and in the browser they hydrate against the same server state (that catalog, an empty cart, nobody signed in) before switching to the browser's own: the cart from local storage, the signed-in customer, and a catalog priced for this visitor.
- **One storefront per tab.** `getStorefront` hands back the same storefront every time in the browser, however often React renders `Providers` (Strict Mode renders it twice in development), and a new one per render on the server. Its options only count the first time. Don't call `createStorefront` in a component: every call is another storefront following the tab.

`<StorefrontProvider>` also tidies up after Next's router: a buyer coming back from the hosted checkout arrives with `mb_*` parameters, which the router puts back on the address as the page hydrates, and the provider takes them off again.

Site-wide reactions to the storefront live in `components/StorefrontEffects.tsx`, mounted once in the layout:

```tsx
useStorefrontEvent('checkoutCompleted', () => {
  hideCart()
  storefront.closeCheckout()
  router.push('/order-completed')
})
```

### 2. Hooks

Every piece of data the UI reads comes from one of these. Hooks return plain values, and a component renders again only when the part of the storefront it reads changes.

| Hook | Where it's used |
| --- | --- |
| `useProduct(id)`, `useBundle(id)` | `PluginCard`, `BundleSection`, `ProductDownloadModal` (a trial's files), `AutoActivation`: `defaultVariation`, `owned`, `iconUrl`, `name`, `downloads`. `null` for an ID of `null` |
| `usePrice(variation)` | `PluginCard`, `BundleSection`, `AutoActivation`: `price`, `originalPrice` and `saving`, written in the visitor's currency |
| `useCartActions()`, `useCurrency()` | `PluginCard`, `BundleSection`, `CartLine`, `AutoActivation`: `addToCart`, `setQuantity`, `removeFromCart`, and the currency |
| `useCart()` | `SiteNav` (badge), `CartDrawer` (items, `total`, `checkout`) |
| `useAuth()` | `SiteNav`, `LoginModal`, `AccountShell`, `account/Info`, the callback pages: `user`, `loaded`, `signIn`, `update`, `setPassword`, `signOut`, `confirmAccount`, `confirmEmail`, … |
| `useOwnedProducts()`, `useOwnedProduct(id)` | `account/Products`, `account/ProductDetail`, `ProductDownloadModal` (owned files) |
| `useProductActivations(id)`, `useProductLicenses(id)` | `account/ProductDetail` |
| `useOrderHistory()` | `account/Purchases` |
| `useSubscription(id)` | `app/subscriptions/` |
| `useInventory()` | `DownloadList`, `account/ProductDetail`, `ManualActivation`: `downloadProduct`, `revokeActivation`, `activateProduct` |
| `useOrders()` | `account/Purchases`: `downloadReceipt` |
| `useVoucher()` | `account/Redeem`: `redeem(code)` |
| `useCommunicationPreferences()` | `SiteFooter`: `subscribe({ email })` for the newsletter |
| `useActivationRequest(token, { autoFulfill: true })` | `activation/AutoActivation`: `activationRequest`, `fulfillTrial`, `loading`, `fulfilling`, `completing`, `error` |
| `useAttributionConsent()` | `CookieBanner`: `required`, `answer`, `setAnswer` |
| `useStorefront()`, `useStorefrontEvent()` | `StorefrontEffects`: the storefront itself, and its `checkoutCompleted` event. `reviews/YourReview` refreshes the catalog with it after a review is posted |
| `useReviews()` | `reviews/*`, `account/ProductDetail`: `enabled`, `getReviews`, `getMoreReviews`, `getMyReview`, `saveReview`, `withdrawReview`, `voteOnReview` |
| `useVendor()` | `reviews/List`, `reviews/Form`: the store's name, which signs its replies and the consent line |

**Product cards don't render when the cart changes.** `usePrice`, `useCurrency` and `useCartActions` only render again when what they return changes, so the plugin cards and the bundle section stay put while the cart fills. `useCart` renders on every cart change, so only the nav badge and the drawer use it. Cart lines read their product or bundle from the line itself (`item.product`, `item.bundle`), which `useCart` fills in from the catalog.

**Account data loads itself.** The account hooks return `{ data, loading, error, reload }`, and the lists add `hasMore` and `loadMore`. They load for whoever is signed in, again when that changes, and keep what they loaded: coming back to a tab shows it at once and refreshes it in the background. After revoking an activation, the product page calls `reload()` on the activations and the product, since the seat count lives on the product. With nobody signed in they load nothing, so the free-trial modal, which signed-out visitors open, takes its files from the catalog product instead.

**Downloads** are ordered and labelled with the SDK's `visitorPlatform`, `sortDownloads` and `describeDownload` ("macOS, Apple Silicon (27 MB)").

Every function a hook returns keeps its identity across renders, so they go straight into effect dependency lists (`useEffect(…, [email, code, confirmEmail])`) without wrapping.

Every price on the site is written by the SDK: `usePrice` for catalog prices, and `formatMoney` for cart lines, totals and orders. It writes prices the way Moonbase's checkout does, so the site and the checkout overlay agree, and for a currency `Intl` doesn't know it gives the bare amount instead of throwing out of a render.

### 3. User actions

Every user-facing action calls a single SDK function. There's no command layer or action bus in between: components call the hook they need and use what it returns.

| Action | SDK call |
| --- | --- |
| Add product to cart | `useCartActions().addToCart(product)` then `useUi().showCart()` |
| Add bundle to cart | `useCartActions().addToCart(bundle)` then `useUi().showCart()` |
| Start checkout | `cart.checkout({ redirect: false, returnUrl: pathname })` |
| Sign in | `useAuth().signIn(email, password)` |
| Sign out | `useAuth().signOut()` |
| Update profile | `useAuth().update(name, email, undefined, communicationPreferences)` |
| Change password | `useAuth().setPassword(oldPassword, newPassword)` |
| Download a product | `useInventory().downloadProduct(download)` |
| Revoke an activation | `useInventory().revokeActivation(activation)`, then `reload()` the activations and the product |
| Activate (online) | Automatic with an owned license (`autoFulfill`), or `useActivationRequest(token).fulfillTrial(optIn)` |
| Activate (offline) | `useInventory().activateProduct(token, ActivationMethod.Offline)` returns a `data:` URL for the license file |
| Download a receipt | `useOrders().downloadReceipt(order)` |
| Answer the cookie banner | `useAttributionConsent().setAnswer(granted)` |
| Redeem voucher | `useVoucher().redeem(code)` |
| Join the newsletter | `useCommunicationPreferences().subscribe({ email })` |
| Read a product's reviews | `useReviews().getReviews(productId, { sort, stars })`, then `getMoreReviews(next)` |
| Write or edit a review | `useReviews().saveReview(productId, { rating, title, body, displayName, anonymous, allowUse: true }, existing)` |
| Withdraw a review | `useReviews().withdrawReview(productId)` |
| Vote on a review | `useReviews().voteOnReview(productId, reviewId, 'up' \| 'down' \| 'none')` |

A checkout's promise settles when its overlay closes, which can be minutes later, so the cart drawer keeps its "Loading…" state in `useState` rather than in a transition, as the SDK's README advises.

### 4. Routes

| Route | What it does |
| --- | --- |
| `/` | Landing page: hero, HALO + DRIFT cards, bundle, features, trust, footer |
| `/account` | Profile (name / email / newsletter / change password / log out) |
| `/account/products` | List of owned products with icon, name, and license count |
| `/account/products/[id]` | Downloads (with OS detection), device activations with revoke, external licenses (key code / file / iLok) |
| `/account/purchases` | Completed orders, newest first: date, what was bought, total, refund status, and a PDF receipt for each. "Show more" loads the next page |
| `/account/redeem` | Voucher code input |
| `/activate` | License activation. With `?token=…` shows the auto flow; without, the offline machine-file upload flow |
| `/order-completed` | Thank-you page the site navigates to after the checkout overlay takes payment |

`/account/products/[id]` has no pages at build time (`generateStaticParams` returns `[]`): each renders the first time it's visited and is cached after, since there's nothing customer-specific in it until the browser loads what they own. That covers products the catalog doesn't list, which customers can still own.

The cart drawer, login modal and download modal are mounted once in `app/layout.tsx` and opened from anywhere via `useUi().showCart()` / `showLogin()` / `showTrial(id)` / `showDownloads(id)`.

Pages that read the query string (`useSearchParams`) render inside a `<Suspense>` boundary, so they prerender as a shell and a loading state, and the browser fills in the rest. Pages that depend on who's signed in prerender as "Loading…" for the same reason: there's nobody signed in on the server.

### 5. Tenant callback URLs (custom storefront mode)

When a Moonbase tenant is in **custom storefront mode**, the backend redirects users to a set of merchant-configured URLs for activation, authentication, downloads, and order/subscription flows. The tenant settings map to the `CustomStorefrontLocations` shape in the backend. This app provides handlers for every one of them, at the same paths as the Vue version, so either site can sit behind the same tenant.

Configure the following paths on your tenant. The backend appends them to your storefront origin:

| Tenant setting | Path to configure | Query parameters the backend appends | Page that handles it |
| --- | --- | --- | --- |
| `AutoActivation` | `/activate` | `token` | `app/activate/`: auto flow via `useActivationRequest(token, { autoFulfill: true })` |
| `OfflineActivation` | `/activate` | _(none)_ | `app/activate/`: manual machine-file upload via `useInventory().activateProduct(token, ActivationMethod.Offline)` |
| `LogIn` | `/login` | _(none)_ | `app/login/`: email/password sign-in, redirects to `/account` on success |
| `ConfirmAccount` | `/sign-up` | `email`, `code` | `app/sign-up/`: calls `useAuth().confirmAccount(email, code)`; asks for a password when the response carries a `resetPasswordToken` |
| `ConfirmEmail` | `/confirm-email` | `email`, `code` | `app/confirm-email/`: calls `useAuth().confirmEmail(email, code)` |
| `ConfirmEmailChange` | `/account/confirm-email-change` | `email`, `code` | `app/account/confirm-email-change/`: calls `useAuth().confirmEmailChange(email, code)` |
| `ResetPassword` | `/forgot-password` | `email`, `code` | `app/forgot-password/`: dual mode, a "new password" form when the link carries `email` and `code`, otherwise an "enter email" request form that calls `useAuth().forgotPassword(email)` |
| `DownloadProduct` | `/download` | `product_id`, `version` (optional), `key` (optional) | `app/download/`: redirects signed-in customers to `/account/products/[product_id]`, where the OS-aware download list lives; prompts sign-in otherwise |
| `Checkout` | _(leave unset)_ | | This app uses the embedded checkout overlay opened from the cart drawer (`cart.checkout({ redirect: false })`). The `Checkout` URL is optional: leaving it unset lets the backend fall back to its hosted checkout for any flows that need to resume an order (e.g. abandoned-cart emails) |
| `ManageSubscription` | `/subscriptions` | `subscription_id` | `app/subscriptions/`: loads the subscription with `useSubscription(id)` and shows basic detail. Corino doesn't sell subscriptions, so this is a stub; extend it for tenants that do |

All callback pages share a small `AuthPage` shell (`src/components/AuthPage.tsx`) for the eyebrow + title + panel layout.

The confirmation pages send their code from an effect. React runs effects twice in development under Strict Mode, and a code only works once, so the SDK hands a second call with the same email and code the first one's result instead of asking Moonbase again.

### 6. Deep links

`components/StorefrontEffects.tsx` checks the address for `?add_product=…` and `?add_bundle=…` on the first page load and adds the matching item to the cart. This is what makes marketing links like `/?add_product=halo` work: drop someone into the page with the product already in their cart and the drawer open. It then takes the parameters off the address, so reloading the page doesn't add another. Delete that effect if you don't need it.

### 7. Cookie consent

The SDK picks up the UTM tags, referrer and ad click IDs (`gclid`, `fbclid`, `msclkid`, …) a visitor arrives with, and sends them with the cart, checkout and sign-up so sales can be put down to the campaign that brought them. A click ID identifies the visitor's click, so the SDK only keeps one once the visitor has agreed to marketing cookies. Without consent it still keeps the UTM tags, the referring site, and which ad platform the click came from, for the tab.

Who has to be asked is a store setting in Moonbase (Account settings > Storefront > Features > "Ad and campaign tracking": always, only outside the EEA, the UK and Switzerland, or only with cookie consent). The catalog the browser loads reports the answer for each visitor, and the SDK follows it until the visitor answers. `CookieBanner.tsx` gets everything it needs from one hook:

```tsx
const { required, answer, setAnswer } = useAttributionConsent()
const open = cookieSettingsOpen || (required === true && answer === null)
```

- `required` is `undefined` until the browser has loaded the catalog for this visitor. The catalog the page was rendered with was fetched by the server, so it describes the server's location, not the visitor's.
- `setAnswer` passes the answer to the storefront and remembers it in the browser, and the storefront starts from it on the next visit. That's why `Providers` doesn't pass `attributionConsent`.
- "Cookie settings" in the footer opens the banner again for anyone (`cookieSettingsOpen` in `lib/ui.tsx`), so an answer can be changed later.

If your site already has a consent manager (Cookiebot, OneTrust, …), drop the banner and call `storefront.setAttributionConsent(granted)` from its marketing-consent callback instead. That one remembers nothing, since the consent manager reports on every page.

### 8. Reviews

Reviews stay hidden until the store takes them: turn on "Product reviews" under Account settings > Storefront > Features in Moonbase. `useReviews().enabled` follows that setting, and everything on the site that shows reviews checks it.

- **The score comes with the catalog.** Each product's `rating` (the average, the count, and how many reviews have each number of stars) is part of the catalog, so the prerendered page already has the stars under HALO and DRIFT (`components/reviews/RatingLine.tsx`). `hasRating(rating)` says whether there's a score to show: a product with no published reviews has none.
- **The reviews load when the modal opens** (`components/reviews/List.tsx`): `getReviews(productId, { sort, stars })` for the first page and `getMoreReviews(next)` for each "Show more". They load again when the visitor signs in or out, since each review says how the reader voted and whether it's their own. A vote comes back with the review's new totals, so the list isn't read again.
- **Only customers who bought a product here can review it.** For whoever is signed in, the catalog's `mayReview` says whether they may and `reviewed` whether they have a review standing, and the site offers "Write a review" or "Your review" only then. `getMyReview(productId)` says where their review stands (being checked, published, not published, or asking for help, which reviews aren't for) and whether they may change it now (`components/reviews/YourReview.tsx`).
- **Posting needs the reviewer's agreement.** `saveReview(productId, review, existing)` sends `allowUse: true`, which lets the store use the review in its marketing, so the form says so next to its button and links the "Reviews" section of the store's terms (`<store>/terms-of-use#reviews`). `existing` is true once they have a review, in whatever state: a second one is refused.
- **A new review is checked before it shows**, usually within a minute, so the site asks `getMyReview` again every few seconds until it has been, then refreshes the catalog (`useStorefront().refreshCatalog()`) for the new score.

A review in another language comes with an English translation, shown unless the reader's browser reads the original, with a switch between the two. The wording of every review state follows Moonbase's own review screens, and lives in `lib/reviews.ts` with the form's checks against `REVIEW_LIMITS`.

Review-request emails link to Moonbase's own review page, not to this site, so there's no callback page for them.

## Differences from the Vue version

The two sites are meant to stay in step. Where they differ, it's because of how Next and React work:

- **Hosting.** Vercel with hourly regeneration, where the Vue version is a static export on GitHub Pages rebuilt on each push.
- **Storefront boot.** Vue round-trips the SDK's state through Nuxt's `useState` payload; React starts the storefront from `initialCatalog` and lets the SDK hydrate against it.
- **SDK hooks where the Vue version has its own code.** Account data (`useOwnedProducts` and the rest), cookie consent (`useAttributionConsent`, which also remembers the answer), prices (`usePrice`), activating with an owned license (`autoFulfill`), and download ordering (`sortDownloads`). The Vue version loads, remembers and sorts these itself; move it over as `@moonbase.sh/vue` gets the same.
- **Free-trial downloads** come from the catalog product, which lists the public files, rather than a request to the customer's inventory.
- **Standalone account page.** `/account/confirm-email-change` sits outside the `(tabs)` route group instead of being special-cased in the account layout.
- **Drawer and banner animations** are plain CSS transitions on an `.open` class rather than Vue's `<Transition>`.
- **Artwork.** DRIFT's particles are scattered with a seeded generator, and the hero's spectrum is rounded, so the server and the browser draw them identically and the landing page hydrates without a mismatch.
- **Small extras:** Escape closes the cart drawer and modals, `?add_product=` is removed from the address after it's used, and each page has its own `<title>`.

## Theming

The site's own visual language (the dark amber + blue palette, the JetBrains Mono captions, the chrome-corner markers on the plugin art) is all in `src/app/globals.css`, ported unchanged from the Vue version apart from the font variables and the open/close transitions. There's no design system to fight with.

The **checkout overlay** (opened by `cart.checkout()`) is themed per-tenant in the Moonbase admin, not from this app. If you want the overlay to match your storefront, configure that in your tenant settings.

## Further reading

- [Moonbase React SDK docs](https://moonbase.sh/docs/storefronts/sdks/react/): hook reference
- [`@moonbase.sh/react` on npm](https://www.npmjs.com/package/@moonbase.sh/react)
- [Moonbase docs home](https://moonbase.sh/docs/)
