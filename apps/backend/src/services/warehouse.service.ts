import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const getWarehouseWithData = async (warehouseId: number) => {
  return await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    select: {
      id: true,
      warehouseOwnerType: true,
      warehouseType: true,
      address: true,
      googleLocation: true,
      city: true,
      state: true,
      postalCode: true,
      zone: true,
      totalSpaceSqft: true,
      offeredSpaceSqft: true,
      numberOfDocks: true,
      clearHeightFt: true,
      compliances: true,
      otherSpecifications: true,
      ratePerSqft: true,
      availability: true,
      uploadedBy: true,
      isBroker: true,
      photos: true,
      createdAt: true,
      status_updated_at: true,
      visibility: true,
      WarehouseData: {
        select: {
          id: true,
          latitude: true,
          longitude: true,
          fireNocAvailable: true,
          fireSafetyMeasures: true,
          landType: true,
          approachRoadWidth: true,
          dimensions: true,
          parkingDockingSpace: true,
          pollutionZone: true,
          powerKva: true,
          vaastuCompliance: true,
        },
      },
    },
  });
};
