# Rifa Arts & Crafts — Security-First Development Rules

> Drop this file as `CLAUDE.md` (Antigravity / Claude Code) or `.cursorrules` (Cursor) in your project root.
> Every file generated in this project must follow these rules, no exceptions.
> Stack: React + TypeScript + Vite + Tailwind + shadcn/ui + Supabase + Razorpay + Shiprocket

---

## Platform Context

Rifa Arts & Crafts is a two-sided Indian handmade marketplace with three user roles:
- **Buyer** — browses, purchases standard and custom handmade products
- **CraftMaker** — lists products, manages custom orders, receives payouts
- **Super Admin** — two separate admin areas:
  - `/admin` — existing CRM (Supabase-wired, manages inquiries + creator_applications)
  - `/admin/ops` — platform operations dashboard (mock data, Phase 2 will wire to Supabase)

The platform handles real financial data (Razorpay payments, 1% TCS deductions, maker payouts),
KYC documents (PAN, Aadhaar, bank details), and custom order proofs.
Security is non-negotiable.

---

| # | Rule | What it covers |
|---|---|---|
| 1 | Exposed Secrets | `.env` only, `.gitignore`, no keys in frontend |
| 2 | Rate Limiting | Per-endpoint limits, 429 responses |
| 3 | Input Validation | Zod schemas, server-side only, parameterised queries |
| 4 | Auth & Authorization | Supabase Auth, role checks per route, no plain-text passwords |
| 5 | SQL Injection | Supabase client + RLS only, never raw string queries |
| 6 | CORS | No wildcard `*` in production |
| 7 | HTTP Security Headers | `helmet`, CSP, HSTS, clickjacking prevention |
| 8 | File Upload Safety | MIME + size validation, UUID rename, Supabase Storage |
| 9 | Error Handling | No stack traces to client, structured logging |
| 10 | Dependency Security | `npm audit`, pinned versions |
| 11 | XSS Prevention | No `dangerouslySetInnerHTML`, no `eval()` |
| 12 | Deploy Checklist | Pre-deploy gate before every ship |
| 13 | KYC & Financial Data | PAN, Aadhaar, bank details — extra protection rules |
| 14 | Payments (Razorpay) | Server-side only, webhook verification, no raw keys in frontend |
| 15 | AI/LLM Rules | If AI features are added — prompt injection, token budgets |

---

## 🔐 1. SECRETS & ENVIRONMENT VARIABLES

**Never expose secrets in frontend code.**

All of the following MUST live in `.env` only — never in any `.tsx`, `.ts`, or `.js` file:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=         # Public — intentionally exposed (Supabase anon key)
SUPABASE_SERVICE_ROLE_KEY=      # NEVER in frontend — server/edge functions only
RAZORPAY_KEY_ID=                # Public — safe for frontend (publishable key)
RAZORPAY_KEY_SECRET=            # NEVER in frontend — server/edge functions only
SHIPROCKET_EMAIL=               # Server only
SHIPROCKET_PASSWORD=            # Server only
VITE_APP_URL=
```

Rules:
- `.env`, `.env.local`, `.env.*.local` MUST be in `.gitignore` — always verify before committing
- Generate a `.env.example` with all variable names but empty values
- `VITE_` prefix = safe for Vite frontend (non-secret values only)
- `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` are **never** `VITE_` prefixed
- All Razorpay payment captures, refunds, and payout triggers go through 
  Supabase Edge Functions — the secret key never touches the React frontend

```typescript
// ✅ Correct — public Supabase anon key in frontend
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ❌ Wrong — service role key must NEVER be in React code
const supabase = createClient(url, 'eyJhbGciOiJIUzI1NiIsInR5...');
```

---

## 🚦 2. RATE LIMITING

**Every public-facing endpoint must have rate limiting.**

Rifa-specific limits:

| Endpoint | Limit |
|---|---|
| `/auth` (buyer + craftmaker login/register) | 5 requests / 15 min per IP |
| `/craftmaker/register` (KYC submission) | 3 requests / hour per IP |
| Custom order submission (`/custom-order`) | 10 requests / hour per IP |
| Contact form (`/contact`) | 5 requests / 15 min per IP |
| Collaborate form (`/collaborate`) | 3 requests / hour per IP |
| Proof upload (CraftMaker) | 10 requests / 15 min per user |
| Image upload (listings) | 20 requests / 15 min per user |
| General API | 60 requests / min per IP |
| Razorpay webhook receiver | Validate signature — no rate limit needed |
| Shiprocket webhook receiver | Validate origin — no rate limit needed |

Implementation:
- Supabase Edge Functions: use Upstash Redis for rate limiting
- Vite dev server: no rate limiting needed locally
- Production: apply via Supabase Edge Function middleware or Vercel middleware
- Return `429 Too Many Requests` with `Retry-After` header
- Show user-friendly message in UI: "Too many attempts. Please wait X minutes."

---

## 🧹 3. INPUT VALIDATION & SANITIZATION

**Never trust user input. Validate and sanitize everything.**

Use **Zod** for all schema validation (already appropriate for the TypeScript stack).

Rifa-specific validation rules:

```typescript
// ✅ CraftMaker KYC — PAN validation
const panSchema = z.string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)')
  .toUpperCase();

// ✅ Indian PIN code validation
const pinSchema = z.string()
  .regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit PIN code');

// ✅ IFSC validation
const ifscSchema = z.string()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code');

// ✅ GSTIN validation (optional field)
const gstinSchema = z.string()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
  .optional();

// ✅ Indian mobile number
const mobileSchema = z.string()
  .regex(/^[6-9][0-9]{9}$/, 'Invalid Indian mobile number');

// ✅ Price validation (INR)
const priceSchema = z.number()
  .min(1, 'Minimum price is ₹1')
  .max(500000, 'Maximum price is ₹5,00,000')
  .multipleOf(0.01);

// ✅ Proof/listing image upload
const imageUploadSchema = z.object({
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  sizeBytes: z.number().max(10 * 1024 * 1024, 'Max 10MB per image'),
  fileName: z.string().max(100),
});
```

All validation happens **server-side** (Supabase Edge Functions or RLS policies).
Client-side validation in React forms is UX only — never relied upon for security.

---

## 🔑 4. AUTHENTICATION & AUTHORIZATION

Rifa uses **Supabase Auth** for all three user types.

**Role structure:**

```typescript
// User roles stored in profiles table
type RifaUserRole = 'buyer' | 'craftmaker' | 'admin';

// Every protected API call must check:
// 1. Is the user authenticated? (AuthN)
// 2. Do they have permission for this action? (AuthZ)
// 3. Do they own this resource? (ownership check)
```

**Rules:**

- Supabase Auth handles password hashing — never store passwords manually
- JWT tokens managed by Supabase — do not override or extend without reason
- Store session in Supabase's default secure storage — do not move to localStorage
- All CraftMaker dashboard routes (`/craftmaker/*`) must verify `role === 'craftmaker'`
- All Admin Ops routes (`/admin/ops/*`) must verify `role === 'admin'`
- The existing `/admin` CRM already has Supabase auth — do not change it
- KYC approval status must be checked before a CraftMaker can list products:

```typescript
// ✅ Always check role AND approval status for CraftMaker actions
const { data: profile } = await supabase
  .from('craftmaker_profiles')
  .select('status, kycVerified')
  .eq('userId', user.id)
  .single();

if (!profile || profile.status !== 'active' || !profile.kycVerified) {
  return { error: 'Forbidden — shop not active or KYC incomplete' };
}
```

- Proof upload, order status changes, and payout triggers must verify the 
  CraftMaker owns the specific order — never just check role alone
- Dispute resolution actions are Admin-only — verify `role === 'admin'` 
  on every Razorpay Refund API call

---

## 🛡️ 5. SQL & DATABASE SECURITY (Supabase RLS)

Rifa uses **Supabase** with **Row Level Security (RLS)** — this is the primary 
SQL injection defence layer.

**Rules:**

- RLS must be ENABLED on every table — never disabled in production
- Use the Supabase client for all queries — never raw SQL with user input
- Enable RLS policies that enforce ownership:

```sql
-- ✅ CraftMaker can only read their own listings
CREATE POLICY "craftmaker_own_listings" ON craftmaker_listings
  FOR ALL USING (auth.uid() = maker_user_id);

-- ✅ Buyers can only read their own orders
CREATE POLICY "buyer_own_orders" ON craftmaker_orders
  FOR SELECT USING (auth.uid() = buyer_user_id);

-- ✅ Admin can read everything (ops dashboard)
CREATE POLICY "admin_full_access" ON craftmaker_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

- Never use the `service_role` key in React — only in Supabase Edge Functions
- Do not return raw Supabase errors to the client — they can leak schema info
- KYC data (PAN, Aadhaar, bank details) must be in a separate table with 
  its own RLS policies — never included in general listing or order queries

---

## 🌐 6. CORS CONFIGURATION

- Do NOT use wildcard `*` CORS in production
- Supabase handles CORS for its own endpoints — configure allowed origins 
  in the Supabase dashboard
- For any custom Supabase Edge Functions, explicitly whitelist:

```typescript
// ✅ Correct for Supabase Edge Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ❌ Never in production
'Access-Control-Allow-Origin': '*'
```

- Razorpay webhook endpoint: validate `X-Razorpay-Signature` header — 
  do not rely on CORS for security here
- Shiprocket webhook endpoint: validate origin IP against Shiprocket's 
  known IP range

---

## 🪝 7. HTTP SECURITY HEADERS

Add to `vite.config.ts` for dev and to hosting platform (Vercel/Netlify) 
headers config for production:

```typescript
// vite.config.ts — dev server headers
server: {
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
}
```

```
# Vercel / Netlify headers config
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://checkout.razorpay.com; 
  frame-src https://api.razorpay.com; 
  img-src 'self' data: https://*.supabase.co https://storage.googleapis.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co 
              https://api.razorpay.com https://apiv2.shiprocket.in;

X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

Note: Razorpay checkout requires `https://checkout.razorpay.com` 
in `script-src` and `https://api.razorpay.com` in `frame-src` — 
include these or payments will break.

---

## 📤 8. FILE UPLOAD SECURITY

Rifa accepts file uploads in three places:
1. **Listing photos** (CraftMaker) — up to 8 images per listing
2. **Proof images** (CraftMaker) — design proof for custom orders
3. **Buyer spec uploads** (Buyer) — reference images for custom orders

Rules for all uploads:

- Validate MIME type AND file extension server-side — never trust client claim
- Allowed types: `image/jpeg`, `image/png`, `image/webp` only
- Size limits:
  - Listing photos: max 10MB per image
  - Proof images: max 20MB (design files can be large)
  - Buyer spec uploads: max 10MB
- All files stored in **Supabase Storage** — never on the web root
- Rename every uploaded file to a UUID before storage:

```typescript
// ✅ Always rename to UUID
const fileExt = file.name.split('.').pop();
const fileName = `${crypto.randomUUID()}.${fileExt}`;
const { data, error } = await supabase.storage
  .from('listing-photos')
  .upload(`${makerId}/${fileName}`, file);
```

- Supabase Storage bucket policies:
  - `listing-photos`: public read, authenticated write (maker owns folder)
  - `proof-images`: private — only maker + buyer of that order + admin can read
  - `buyer-specs`: private — only maker of that order + admin can read
- Never serve uploaded files with executable permissions
- Do not use the original filename in any database column or URL

---

## 🚨 9. ERROR HANDLING & LOGGING

- Never return Supabase error objects directly to the client
- Never expose Razorpay error details (they can contain partial card info)
- Standard error response shape across all Supabase Edge Functions:

```typescript
// ✅ Correct — generic message to client
return new Response(
  JSON.stringify({ error: 'Something went wrong. Please try again.' }),
  { status: 500 }
);

// ❌ Wrong — leaks internal info
return new Response(
  JSON.stringify({ error: error.message, stack: error.stack }),
  { status: 500 }
);
```

- Log errors server-side with: timestamp, user ID (if authenticated), 
  route, sanitised input shape (no PAN/Aadhaar values in logs)
- KYC-related errors: log the event type but NEVER log PAN, Aadhaar, 
  or bank account numbers — these are legally protected in India
- Use Sentry or Supabase's built-in logging for production error tracking
- Payment failures: log Razorpay order ID and error code only — 
  never log card details or UPI IDs

---

## 🔒 10. DEPENDENCY SECURITY

- Run `npm audit` after every `npm install` — fix all high/critical issues before committing
- Pin all dependency versions in `package.json`
- Key packages to keep updated (security-relevant for Rifa):
  - `@supabase/supabase-js` — auth + DB client
  - `razorpay` — payment processing
  - `zod` — input validation
  - `react-router-dom` — routing (XSS risk in older versions)
- Do not install packages that require `--legacy-peer-deps` without review
- Review any package that has install scripts (`postinstall`, `preinstall`) 
  before accepting

---

## 🧱 11. XSS PREVENTION

- Do NOT use `dangerouslySetInnerHTML` anywhere in the Rifa codebase
- CraftMaker product descriptions and shop bios are user-generated content — 
  always render as plain text, never as HTML
- Buyer review text is user-generated — plain text only
- Proof image captions — plain text only
- If rich text is ever needed (future), use `DOMPurify` to sanitise first:

```typescript
// ✅ Only if rich text is required — use DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(makerDescription) 
}} />

// ✅ Preferred — always use plain text rendering
<p>{makerDescription}</p>
```

- Never use `eval()` or `new Function()` with user-provided content
- All price displays must use a number formatter — never render raw ₹ strings 
  from the database without validation (prevents injection via price fields)

---

## 🇮🇳 13. KYC & FINANCIAL DATA PROTECTION (India-specific)

This section covers data protected under **India's IT Act, DPDP Act, and RBI guidelines**.

**PAN Card:**
- Never store in plain text if avoidable — mask on display: `ABCDE****F`
- Never log PAN values in error logs or analytics
- Only Admin (via server-side Supabase service role) can read full PAN

**Aadhaar:**
- Aadhaar storage is governed by UIDAI regulations
- Store only masked version: `****-****-1234`
- Do NOT store full 12-digit Aadhaar in your database — 
  use Razorpay Connect's KYC flow which handles Aadhaar verification 
  without your platform storing the raw number

**Bank Account Details:**
- Store only last 4 digits of account number in your DB
- Full account number and IFSC are handled by Razorpay Connect — 
  Razorpay stores these, not Rifa's database
- Never display full account number anywhere in the UI

**TCS (Tax Collected at Source):**
- TCS deduction (1%) is a legal obligation — do not remove or bypass this logic
- TCS records must be exportable as Excel for CA/GSTR-8 filing
- Never round TCS amounts — use precise decimal arithmetic

```typescript
// ✅ TCS calculation — always use precise math
const tcsAmount = parseFloat((orderAmount * 0.01).toFixed(2));
// Never: Math.round(orderAmount * 0.01)
```

---

## 💳 14. PAYMENTS — RAZORPAY SECURITY

**All Razorpay secret key usage goes through Supabase Edge Functions only.**

```
Frontend (React)     →  Razorpay Key ID only (VITE_RAZORPAY_KEY_ID)
Edge Function        →  Razorpay Key Secret (RAZORPAY_KEY_SECRET)
```

**Payment flow rules:**

```typescript
// ✅ Correct — create order in Edge Function, never in React
// Edge Function: create-razorpay-order
const razorpay = new Razorpay({
  key_id: Deno.env.get('RAZORPAY_KEY_ID'),
  key_secret: Deno.env.get('RAZORPAY_KEY_SECRET'),
});
const order = await razorpay.orders.create({ amount, currency: 'INR' });
```

**Webhook verification — mandatory:**
```typescript
// ✅ Always verify Razorpay webhook signature
import crypto from 'crypto';
const expectedSignature = crypto
  .createHmac('sha256', Deno.env.get('RAZORPAY_WEBHOOK_SECRET'))
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

if (expectedSignature !== razorpaySignature) {
  return new Response('Invalid signature', { status: 400 });
}
```

**Razorpay Route (split payouts) rules:**
- Payout to CraftMaker only triggers after delivery confirmation 
  from Shiprocket webhook — never before
- Payout hold logic must be enforced server-side — 
  a frontend state change alone must never release a held payout
- Force refund (dispute resolution) goes through Edge Function only — 
  Admin clicking "Force Refund" in the UI calls an Edge Function 
  which calls Razorpay Refund API — never Razorpay directly from React

**COD for custom orders — enforce server-side:**
```typescript
// ✅ Validate server-side, not just client-side
if (order.isCustom && paymentMethod === 'cod') {
  return new Response(
    JSON.stringify({ error: 'COD not available for custom orders' }),
    { status: 400 }
  );
}
```

---

## 🤖 15. AI/LLM RULES (if AI features are added to Rifa)

If AI features are added (e.g. product description generator, 
craft recommendation engine):

- Never send raw user input (product titles, buyer specs, 
  custom order notes) directly to an LLM
- Sanitise all inputs — remove any PAN/Aadhaar/phone patterns 
  before sending to LLM
- Store AI API key (Anthropic, OpenAI) in Supabase Edge Function env only — 
  never in Vite frontend
- Set `max_tokens` on every LLM call — no unbounded completions
- Per-user token budget: track in Supabase — flag abuse if a user 
  triggers >50 AI requests per day
- Validate and sanitise LLM output before rendering in UI — 
  LLM can generate HTML/script tags which would be XSS risks
- Never use LLM output to generate SQL queries or Supabase filter 
  expressions directly

---

## ☁️ 12. DEPLOYMENT CHECKLIST

Run this before every production deploy:

**Environment:**
- [ ] `.env` is not committed to git (`git status` check)
- [ ] All secrets set in Vercel/Netlify environment config
- [ ] `VITE_` prefixed variables contain NO secrets
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT a `VITE_` variable
- [ ] `RAZORPAY_KEY_SECRET` is NOT a `VITE_` variable

**Supabase:**
- [ ] RLS is ENABLED on every table
- [ ] Service role key is only used in Edge Functions
- [ ] Storage bucket policies are set correctly 
      (proof-images and buyer-specs are private)
- [ ] No public tables without RLS policies

**Payments:**
- [ ] Razorpay webhook signature verification is active
- [ ] Shiprocket webhook origin validation is active
- [ ] COD block for custom orders is enforced server-side
- [ ] TCS deduction logic is live and tested

**Application:**
- [ ] Debug mode / Vite dev logs are OFF
- [ ] No `console.log` statements with PAN/Aadhaar/bank data
- [ ] HTTPS enforced — no HTTP in production
- [ ] Rate limiting active on contact, collaborate, register, 
      custom-order, and auth routes
- [ ] CORS restricted to production domain only
- [ ] `npm audit` run — no high/critical vulnerabilities

**Existing Admin CRM (`/admin`):**
- [ ] `/admin` route still protected by Supabase auth login
- [ ] `admins`, `inquiries`, `creator_applications` tables untouched
- [ ] Existing CRM functions correctly post-deploy

---

*These rules apply to every file generated in this project.*
*When in doubt, err on the side of security over convenience.*
*The platform handles real money, real KYC documents, and real Indian tax compliance.*
*A security breach is not just a technical failure — it is a legal liability.*
