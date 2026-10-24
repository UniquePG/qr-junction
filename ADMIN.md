# QR Junction Admin Console

The admin console lives in this same Next.js app. Customer traffic stays on `qrjunction.in` / `www.qrjunction.in`. Ops traffic uses `admin.qrjunction.in`.

Locally open `/admin` and `/admin/login`. In production the admin host rewrites `/` to `/admin` and `/login` to `/admin/login`.

## First admin

Regular `/register` always creates `USER`. Promote an existing account after deploy:

```sql
UPDATE users SET role = 'OWNER' WHERE email = 'you@yourdomain.com';
```

`ADMIN_EMAILS` is a comma-separated allow-list. Matching `USER` accounts are promoted to `ADMIN` on first successful `/api/admin/me` check.

## Vercel and DNS

1. Keep the current Vercel project. Do not create a second app.
2. In Vercel: **Domains → Add** `admin.qrjunction.in`. Leave `www.qrjunction.in` as it is.
3. DNS: `CNAME admin` → `cname.vercel-dns.com` (or the target Vercel shows).
4. Add these environment variables to the same Vercel project:

```
NEXT_PUBLIC_ADMIN_HOST=admin.qrjunction.in
NEXT_PUBLIC_APP_HOST=www.qrjunction.in
ADMIN_EMAILS=you@yourdomain.com
```

5. One `git push` updates both sites.
6. After the first deploy, set `role = OWNER` on your user if it is not already in `ADMIN_EMAILS`.

`middleware.ts` only rewrites the admin host. Customer routes such as `/dashboard` and `/register` never render on `admin.qrjunction.in`.

## Local check

1. Run `npx prisma migrate deploy` so the admin aggregate indexes exist.
2. Start the app and open `http://localhost:3000/admin/login`.
3. Sign in with an `OWNER` / `ADMIN` account, or an email listed in `ADMIN_EMAILS`.
4. A normal `USER` account is signed out with “not authorized”.


npm run admin:create -- admin@qrjunction.in Admin@123
node scripts/index.js you@domain.com YourPassword