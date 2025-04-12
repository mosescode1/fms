-- CreateEnum
CREATE TYPE "MEMBER_ROLE" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Members" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "userRole" "MEMBER_ROLE" NOT NULL DEFAULT 'USER',
    "organizationId" VARCHAR(255) NOT NULL,

    CONSTRAINT "Members_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Members" ADD CONSTRAINT "Members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
