-- DropIndex
DROP INDEX "users_roles_idx";

-- CreateIndex
CREATE INDEX "user_class_assignments_user_id_status_idx" ON "user_class_assignments"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_class_assignments_class_id_status_idx" ON "user_class_assignments"("class_id", "status");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");
