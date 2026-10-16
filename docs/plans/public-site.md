# Public site plan

Strip the public site down to what is valuable to visitors and to the club: a home page built around the latest result and next fixture, a shop for club merchandise, sponsors with a way to become one, and a clear footer. Agreed with the club on 2026-10-16.

Work happens in two phases. Each phase starts by running its migration in the Supabase SQL editor.

| Phase | Delivers | Migration |
| --- | --- | --- |
| 1 | New header and footer, the new home page (hero and sponsors), `/news`, image uploads moved to Supabase, admin Sponsors and Enquiries | [0001_images_and_sponsors.sql](../../supabase/migrations/0001_images_and_sponsors.sql) |
| 2 | The shop: products, cart, guest checkout with Paystack (test mode), order tracking, admin Products, Orders and Shop settings, featured products on the home page | [0002_shop.sql](../../supabase/migrations/0002_shop.sql) |

## Decisions

**Site structure**
- Home page, top to bottom: hero (last result + next fixture), featured shop products (Phase 2), sponsors, footer.
- Kept as secondary pages: `/fixtures` (with the league table, now only here), `/players` (labelled "Squad"), `/club` (used as the About page), `/news` (new list page) and `/news/[id]`.
- Removed from the home page: the news carousel and news cards, and the league table.
- Header: one compact bar with the crest on the left; links **Fixtures · Squad · Shop · News · Club**; a cart icon with an item count once the shop exists. On phones the links collapse into a menu.
- Footer: crest, sitemap (the header links plus Become a sponsor and Shop policies), the four social links, a contact email (placeholder for now) and a copyright line.

**Hero**
- Two cards: last result and next fixture. Each shows both crests and team names, a Home/Away label from Valiant's side, and the score or the kick-off day and time. A "See all fixtures" link goes to `/fixtures`.
- No venue or competition name: the `matches` table has no venue and `competitions` is empty.
- If there is no next fixture, show "Next fixture to be announced". With no result either, show the crest and club name.

**Sponsors**
- Managed in a new admin Sponsors page, stored in Supabase.
- Two tiers: one **main** sponsor shown large, **partners** in a logo row. Each logo links to the sponsor's website. The database allows only one active main sponsor.
- "Become a sponsor" opens an enquiry form (name, company, email, phone, message). Enquiries are saved to Supabase and listed in an admin Enquiries page. Staff set each one to new, contacted or closed. The sidebar shows a badge with the number of new enquiries.
- The sponsor section links to `/club` ("Learn about the club").

**Images**
- All admin image uploads go to one public Supabase Storage bucket, `images`, through a server route. Folders: `players/`, `news/`, `sponsors/`, `products/`.
- This replaces the existing Firebase Storage uploads for player photos, news banners and images inside news articles.
- Images already uploaded to Firebase Storage stay there. Their URLs are saved in the data and keep working. Copying them to Supabase is optional later work.

**Shop**
- Products have one option type, normally "Size" (S, M, L, XL or "One size"), with stock tracked per variant. "Sold out" shows when a variant's stock is zero. No categories until there are about 20 products.
- New products start hidden until staff publish them. Staff choose which products are featured on the home page (about 4).
- Customers check out as guests (name, email, phone). There are no customer accounts. The cart is kept on the visitor's device.
- Fulfilment: free **pickup**, or **delivery within Lagos** for a flat fee. Out-of-Lagos customers see a "contact us" message. The pickup address, the fee and that message are editable in an admin Shop settings panel, as placeholders until the club fills them in.
- Payment: Paystack in **test mode**. Live keys are switched on once the club's Paystack account is approved.
- Orders appear in an admin Orders page. Staff move them through Paid → Ready → Completed. Orders that need a refund or restock are marked **Needs attention**, with the reason.
- After paying, the customer sees a confirmation page with their order number. Paystack emails its own payment receipt. A "track your order" page finds an order by its order number and email.
- `/shop/policies` covers delivery, returns and privacy, with placeholder text for the club to replace. Paystack checks for this page before approving live payments.

## How it fits together

- **Data access stays on the server.** As with players, teams and matches, every Supabase read and write goes through a Nitro route using `useSupabaseAdmin()` ([server/utils/supabase.ts](../../server/utils/supabase.ts)). Public routes select only public columns and only active rows. `/api/admin/**` routes are already protected by [server/middleware/admin.ts](../../server/middleware/admin.ts). The row level security in the migrations is a backstop for the publishable key, not the main protection.
- **New code follows the existing teams and matches pattern.** That means a `server/utils/<thing>.ts` for mapping rows, a Zod schema in `shared/utils/<thing>.ts` used by both the admin form and the route, and routes under `server/api/admin/<thing>/`.
- **Money is whole kobo** (`bigint`), the unit Paystack uses. It's formatted as ₦ only for display.
- **Public forms** (sponsor enquiry, checkout) get a hidden honeypot field and per-route rate limits through `nuxt-security`'s `rateLimiter`.

### Payment flow (Phase 2)

1. **Checkout:** `POST /api/shop/checkout` receives variant ids, quantities, customer details and the fulfilment choice. It doesn't trust prices from the browser. It loads the variants from the database, checks they're active and in stock, and adds the delivery fee from `shop_settings`. It then creates the order (`pending_payment`) and its items, asks Paystack to start a transaction with the order reference and total, and returns Paystack's payment page URL. The browser keeps the reference and email so the confirmation page can show the order.
2. **Back on the site:** Paystack sends the customer to `/shop/orders/<reference>`. That page asks the server to verify the transaction with Paystack, then calls `mark_order_paid`.
3. **Webhook:** `POST /api/paystack/webhook` checks Paystack's `x-paystack-signature` (HMAC-SHA512 of the raw body with the secret key), and on `charge.success` it calls `mark_order_paid`. Steps 2 and 3 can both happen in either order. The function only acts once. The webhook can't reach `localhost`, so local testing relies on step 2.
4. **`mark_order_paid`:** a database function in 0002. In one transaction it checks the amount paid matches the order total, checks stock, takes the stock and marks the order paid. If the amount is wrong or another customer took the last item first, nothing is taken and the order becomes `needs_attention`.
5. **Abandoned checkouts:** these stay `pending_payment` and are hidden from the default Orders view. Clearing them out can come later.

New settings in `.env`: `PAYSTACK_SECRET_KEY` (a `sk_test_…` key for now).

## Phase 1: Home page, sponsors, images

1. **Migration.** The club runs `0001_images_and_sponsors.sql` in the Supabase SQL editor.
2. **Image uploads to Supabase.**
   - Add `POST /api/admin/images`. It takes a multipart file and a folder, checks the type (JPEG, PNG, WebP) and the 5 MB limit, uploads under a random name, and returns the public URL.
   - Switch [pages/admin/players.vue](../../pages/admin/players.vue) (player photo), [pages/admin/news/index.vue](../../pages/admin/news/index.vue) (banner) and [components/TipTap.vue](../../components/TipTap.vue) (images in articles) to use it.
3. **Header.** Replace [components/Nav/Desktop.vue](../../components/Nav/Desktop.vue) and [components/Nav/Mobile.vue](../../components/Nav/Mobile.vue) with one responsive header (crest on the left; links; a phone menu). Leave room for the cart icon.
4. **Footer.** Rebuild the footer in [layouts/default.vue](../../layouts/default.vue): crest, sitemap, social links, a placeholder contact email and copyright.
5. **Hero.**
   - Build the result and fixture cards from the existing `/api/get-fixtures` (it already returns upcoming fixtures soonest first and past fixtures most recent first).
   - Handle the empty states.
   - Replace [components/MatchFixture.vue](../../components/MatchFixture.vue) if the new cards supersede it.
6. **Sponsors.**
   - Add `GET /api/sponsors` (public, active only, ordered) and admin CRUD routes under `/api/admin/sponsors`, with logo upload through step 2.
   - Add an admin Sponsors page.
   - Build the home page section with the main sponsor and the partners row. Remove the hardcoded `island-casino.png` once its sponsor is entered in the admin.
7. **Sponsor enquiries.**
   - Add the public `POST /api/sponsor-enquiries` (validated, honeypot, rate limited).
   - Add the "Become a sponsor" form on the home page (a modal or an anchor-linked section) with a success state.
   - Add admin routes and an Enquiries page with status and notes, and the count badge in [components/Admin/Sidebar.vue](../../components/Admin/Sidebar.vue).
8. **News.** Add a `/news` list page (from the existing `/api/get-news`, still Firestore). Remove the news sections and league table from [pages/index.vue](../../pages/index.vue). If nothing else uses `nuxt-swiper` after that, remove it.
9. **Check.** Test on a dev server at phone and desktop widths, including the hero's empty states and a sponsor enquiry end to end. Run `npm run build` before committing.

## Phase 2: Shop

1. **Migration.** The club runs `0002_shop.sql`.
2. **Admin.**
   - A Products page for products (name, slug, description, price, images, published, featured, order) with an editor for variants and stock.
   - A Shop settings panel.
   - An Orders page with status filters (Needs attention and Paid first), order details and status changes.
   - Sidebar entries, grouped under "Shop".
3. **Public catalogue.** `GET /api/shop/products` and `GET /api/shop/products/[slug]`. Pages at `/shop` and `/shop/[slug]` with a variant picker that shows "Sold out" for empty variants.
4. **Cart.** A device-stored cart (variant id and quantity) using `useStorage`. Prices and stock are refreshed from the server when the cart opens, and the header gets the cart icon.
5. **Checkout and payment.** `/shop/checkout`, then the payment flow above, then `/shop/orders/[reference]` for confirmation and order tracking (reference and email).
6. **Policies.** `/shop/policies` with placeholder text, linked from checkout and the footer.
7. **Home page.** A featured products section between the hero and the sponsors.
8. **Check.**
   - Complete a test-mode purchase with Paystack's test card.
   - Check that stock went down.
   - Check that paying twice for the last item marks the second order Needs attention.
   - Check that a changed price in the browser is ignored.
   - Run `npm run build` before committing.

## Deferred (not in either phase)

- **Email, through Resend.** Needs a domain the club owns, verified with DNS records. It would cover:
  - admin alerts for new paid orders and new sponsor enquiries
  - the customer's order confirmation email
  - the customer's "order ready" email
- **WhatsApp admin alerts**, through Meta's WhatsApp Business Platform. Triggered by new paid orders and new sponsor enquiries, sent to one shared club number. It needs:
  - a verified Meta Business account
  - a number that isn't registered in the WhatsApp app
  - an approved message template
- **Alert recipients:** one shared email address and one WhatsApp number in server settings. Per-admin preferences can come later.
- **Live Paystack keys**, once the club's account is approved.
- **Moving news from Firestore to Supabase.**
- **Venue and competition on the match cards.** Needs new `matches` columns and admin form fields.
- **Product categories, and per-variant prices** (e.g. XXL costing more).
- **Copying old images** from Firebase Storage to Supabase.
- **Clearing out abandoned `pending_payment` orders.**

## Needed from the club

- [ ] Run each migration at the start of its phase.
- [ ] Refresh the `/club` page content (it describes a 2019 tournament as upcoming).
- [ ] Contact email for the footer.
- [ ] Sponsor names, logos, website links and which one is the main sponsor.
- [ ] Pickup address, Lagos delivery fee and the outside-Lagos message.
- [ ] Shop policies text (delivery, returns, privacy).
- [ ] Paystack test secret key now; apply for live payments when the shop is ready.
- [ ] Products: names, prices, sizes, stock and photos.
