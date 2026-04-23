CREATE TABLE "ProductionFacility" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "storeId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProductionFacility_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductionFacility_storeId_name_address_key"
ON "ProductionFacility"("storeId", "name", "address");

ALTER TABLE "ProductionFacility"
ADD CONSTRAINT "ProductionFacility_storeId_fkey"
FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ProductionFacility" ("id", "name", "address", "description", "storeId")
SELECT
  md5("id" || '-default-facility'),
  COALESCE(NULLIF("name", ''), 'Cơ sở sản xuất mặc định'),
  COALESCE(NULLIF("address", ''), 'Chưa cập nhật'),
  COALESCE(NULLIF("description", ''), 'Cơ sở sản xuất mặc định của cửa hàng'),
  "id"
FROM "Store"
ON CONFLICT ("storeId", "name", "address") DO NOTHING;

INSERT INTO "ProductionFacility" ("id", "name", "address", "description", "storeId")
SELECT DISTINCT
  md5(p."storeId" || '-' || COALESCE(NULLIF(p."productionFacility", ''), 'Cơ sở sản xuất mặc định') || '-' || COALESCE(NULLIF(p."productionFacilityAddress", ''), 'Chưa cập nhật')),
  COALESCE(NULLIF(p."productionFacility", ''), 'Cơ sở sản xuất mặc định'),
  COALESCE(NULLIF(p."productionFacilityAddress", ''), 'Chưa cập nhật'),
  COALESCE(NULLIF(p."productionFacility", ''), 'Cơ sở sản xuất của sản phẩm'),
  p."storeId"
FROM "Product" p
ON CONFLICT ("storeId", "name", "address") DO NOTHING;

ALTER TABLE "Product"
ADD COLUMN "productionFacilityId" TEXT;

UPDATE "Product" p
SET "productionFacilityId" = pf."id"
FROM "ProductionFacility" pf
WHERE pf."storeId" = p."storeId"
  AND pf."name" = COALESCE(NULLIF(p."productionFacility", ''), 'Cơ sở sản xuất mặc định')
  AND pf."address" = COALESCE(NULLIF(p."productionFacilityAddress", ''), 'Chưa cập nhật');

UPDATE "Product" p
SET "productionFacilityId" = pf."id"
FROM "ProductionFacility" pf
WHERE p."productionFacilityId" IS NULL
  AND pf."storeId" = p."storeId";

ALTER TABLE "Product"
ALTER COLUMN "productionFacilityId" SET NOT NULL;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_productionFacilityId_fkey"
FOREIGN KEY ("productionFacilityId") REFERENCES "ProductionFacility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product"
DROP COLUMN "productionFacility",
DROP COLUMN "productionFacilityAddress";
