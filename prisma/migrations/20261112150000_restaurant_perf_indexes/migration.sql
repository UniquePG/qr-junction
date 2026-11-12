-- Performance indexes for restaurant menu tree, tables, QR, and unpaid orders.

CREATE INDEX IF NOT EXISTS "menus_restaurant_id_idx" ON "menus"("restaurant_id");
CREATE INDEX IF NOT EXISTS "menus_restaurant_id_is_default_idx" ON "menus"("restaurant_id", "is_default");

CREATE INDEX IF NOT EXISTS "menu_categories_menu_id_idx" ON "menu_categories"("menu_id");
CREATE INDEX IF NOT EXISTS "menu_categories_menu_id_order_idx" ON "menu_categories"("menu_id", "order");
CREATE INDEX IF NOT EXISTS "menu_categories_restaurant_id_menu_id_idx" ON "menu_categories"("restaurant_id", "menu_id");

CREATE INDEX IF NOT EXISTS "menu_items_category_id_idx" ON "menu_items"("category_id");
CREATE INDEX IF NOT EXISTS "menu_items_category_id_order_idx" ON "menu_items"("category_id", "order");

CREATE INDEX IF NOT EXISTS "restaurant_tables_restaurant_id_idx" ON "restaurant_tables"("restaurant_id");
CREATE INDEX IF NOT EXISTS "restaurant_tables_restaurant_id_table_number_idx" ON "restaurant_tables"("restaurant_id", "table_number");

CREATE INDEX IF NOT EXISTS "qr_codes_restaurant_id_idx" ON "qr_codes"("restaurant_id");

CREATE INDEX IF NOT EXISTS "menu_orders_restaurant_id_status_paid_at_idx" ON "menu_orders"("restaurant_id", "status", "paid_at");
