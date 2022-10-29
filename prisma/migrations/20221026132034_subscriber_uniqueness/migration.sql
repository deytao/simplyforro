-- CreateIndex
CREATE UNIQUE INDEX "subscriber_subscription_id_user_id_key" ON "subscriber"("subscription_id", "user_id");
