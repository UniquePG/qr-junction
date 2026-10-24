-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "qr_codes_created_at_idx" ON "qr_codes"("created_at");

-- CreateIndex
CREATE INDEX "qr_codes_type_status_idx" ON "qr_codes"("type", "status");

-- CreateIndex
CREATE INDEX "review_responses_created_at_idx" ON "review_responses"("created_at");

-- CreateIndex
CREATE INDEX "restaurants_created_at_idx" ON "restaurants"("created_at");
