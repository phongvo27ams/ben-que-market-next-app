CREATE TABLE IF NOT EXISTS "ComboSetting" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "maxComboItems" INTEGER NOT NULL DEFAULT 1,
  "comboDiscountPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ComboSetting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ComboSetting" ("id", "maxComboItems", "comboDiscountPercent")
VALUES (1, 1, 10)
ON CONFLICT ("id") DO NOTHING;
