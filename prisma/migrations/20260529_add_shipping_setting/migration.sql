CREATE TABLE IF NOT EXISTS "ShippingSetting" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "freeShipMinOrder" INTEGER NOT NULL DEFAULT 200000,
  "plusFreeShipMinOrder" INTEGER NOT NULL DEFAULT 199000,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShippingSetting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ShippingSetting" ("id", "freeShipMinOrder", "plusFreeShipMinOrder")
VALUES (1, 200000, 199000)
ON CONFLICT ("id") DO NOTHING;
