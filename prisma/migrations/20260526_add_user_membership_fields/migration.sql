ALTER TABLE "User"
ADD COLUMN "membershipPlan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN "membershipStatus" TEXT NOT NULL DEFAULT 'inactive',
ADD COLUMN "membershipPeriod" TEXT,
ADD COLUMN "membershipExpiresAt" TIMESTAMP(3),
ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT;
