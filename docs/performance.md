# Restaurant performance

## Production checklist

1. **Supabase pooler**
   - `DATABASE_URL` = transaction pooler connection string
   - `DIRECT_URL` = direct (session) connection for migrations
2. **Indexes** — apply migration `20261112150000_restaurant_perf_indexes`
3. **Redis (optional)** — set `REDIS_URL` for:
   - read-through cache (profile, settings, tables, menus, active orders board)
   - multi-instance order pub/sub
   - If unset, all paths fall back to Postgres (safe degrade)
4. **PERF_LOG=1** — enable `[perf]` timing logs in production when debugging latency

## Cache keys

- `rest:{id}:profile|settings|tables|menus:index|menu:{menuId}|orders:active|overview`
- Soft size cap ~1.5MB; oversized menus skip Redis and hit DB
- Mutations call `invalidateRestaurant(...)` after successful writes

## Client

- TanStack Query provider wraps the app
- Orders floor uses skeletons + optimistic status updates
- Live ticks refetch orders only (not tables/menus)
