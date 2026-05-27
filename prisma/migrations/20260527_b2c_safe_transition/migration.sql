-- Safe B2C transition (non-destructive):
-- 1) Add marker columns on Store
-- 2) Mark one store as system if none exists
-- 3) Disable seller mode for non-system stores (data remains intact)

ALTER TABLE "Store"
ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Store"
ADD COLUMN IF NOT EXISTS "sellerDisabled" BOOLEAN NOT NULL DEFAULT false;

-- Ensure at least one system store exists.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Store" WHERE "isSystem" = true) THEN
    UPDATE "Store"
    SET "isSystem" = true
    WHERE "id" = (
      SELECT "id"
      FROM "Store"
      ORDER BY "isActive" DESC, "updatedAt" DESC, "createdAt" DESC
      LIMIT 1
    );
  END IF;
END $$;

-- Mark non-system stores as seller-disabled in B2C mode.
UPDATE "Store"
SET "sellerDisabled" = true
WHERE "isSystem" = false;
