-- Dashboard analytics / kitchen board performance indexes

CREATE INDEX IF NOT EXISTS "scans_qr_code_id_scanned_at_idx"
  ON "scans"("qr_code_id", "scanned_at");

CREATE INDEX IF NOT EXISTS "menu_orders_restaurant_id_created_at_idx"
  ON "menu_orders"("restaurant_id", "created_at");

CREATE INDEX IF NOT EXISTS "menu_order_items_menu_item_id_idx"
  ON "menu_order_items"("menu_item_id");

CREATE INDEX IF NOT EXISTS "menu_order_events_order_id_status_idx"
  ON "menu_order_events"("order_id", "status");
