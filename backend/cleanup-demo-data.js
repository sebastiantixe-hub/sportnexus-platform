const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetDomains = ['correo.com', 'yahoo.com', 'sportnexus.com', 'hercix-demo.com'];

  console.log('🧹 Iniciando limpieza de datos demo de Hercix...');

  const usersToDelete = await prisma.user.findMany({
    where: {
      OR: targetDomains.map(domain => ({
        email: {
          endsWith: `@${domain}`
        }
      }))
    },
    select: {
      id: true,
      email: true
    }
  });

  const userIds = usersToDelete.map(u => u.id);

  if (userIds.length === 0) {
    console.log('✨ No hay usuarios demo para limpiar.');
    return;
  }

  console.log(`Encontrados ${userIds.length} usuarios demo para eliminar.`);

  // 1. Eliminar CrmNote
  await prisma.crmNote.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { createdById: { in: userIds } }
      ]
    }
  });

  // 2. Eliminar WearableMetric y WearableConnection
  await prisma.wearableMetric.deleteMany({
    where: { userId: { in: userIds } }
  });
  await prisma.wearableConnection.deleteMany({
    where: { userId: { in: userIds } }
  });

  // 3. Eliminar CoachRecommendation
  await prisma.coachRecommendation.deleteMany({
    where: {
      OR: [
        { athleteId: { in: userIds } },
        { coachId: { in: userIds } }
      ]
    }
  });

  // 4. Eliminar HealthMetric y UserGoal
  await prisma.healthMetric.deleteMany({
    where: { userId: { in: userIds } }
  });
  await prisma.userGoal.deleteMany({
    where: { userId: { in: userIds } }
  });

  // 5. Eliminar SupportTicket y Notification
  await prisma.supportTicket.deleteMany({
    where: { userId: { in: userIds } }
  });
  await prisma.notification.deleteMany({
    where: { userId: { in: userIds } }
  });

  // 6. Eliminar ProfessionalBooking
  await prisma.professionalBooking.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { service: { providerId: { in: userIds } } }
      ]
    }
  });

  // 7. Eliminar ProfessionalService
  await prisma.professionalService.deleteMany({
    where: { providerId: { in: userIds } }
  });

  // 8. Eliminar GymTrainer y TrainerProfile
  await prisma.gymTrainer.deleteMany({
    where: {
      OR: [
        { trainer: { userId: { in: userIds } } }
      ]
    }
  });
  await prisma.trainerProfile.deleteMany({
    where: { userId: { in: userIds } }
  });

  // 9. Eliminar Invoice
  await prisma.invoice.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { gym: { ownerId: { in: userIds } } }
      ]
    }
  });

  // 10. Eliminar Payment
  await prisma.payment.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { order: { userId: { in: userIds } } },
        { membership: { userId: { in: userIds } } }
      ]
    }
  });

  // 11. Eliminar OrderItem y Order
  await prisma.orderItem.deleteMany({
    where: {
      OR: [
        { order: { userId: { in: userIds } } },
        { order: { gym: { ownerId: { in: userIds } } } }
      ]
    }
  });
  await prisma.order.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { gym: { ownerId: { in: userIds } } }
      ]
    }
  });

  // 12. Eliminar UserMembership
  await prisma.userMembership.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { plan: { gym: { ownerId: { in: userIds } } } }
      ]
    }
  });

  // 13. Eliminar Reservation
  await prisma.reservation.deleteMany({
    where: {
      OR: [
        { userId: { in: userIds } },
        { class: { gym: { ownerId: { in: userIds } } } }
      ]
    }
  });

  // 14. Eliminar Class, Product, MembershipPlan, SponsorshipDeal, MarketingCampaign, VendorApplication de los gimnasios de estos dueños
  await prisma.class.deleteMany({
    where: { gym: { ownerId: { in: userIds } } }
  });
  await prisma.product.deleteMany({
    where: { gym: { ownerId: { in: userIds } } }
  });
  await prisma.membershipPlan.deleteMany({
    where: { gym: { ownerId: { in: userIds } } }
  });
  await prisma.sponsorshipDeal.deleteMany({
    where: { gym: { ownerId: { in: userIds } } }
  });
  await prisma.marketingCampaign.deleteMany({
    where: { gym: { ownerId: { in: userIds } } }
  });
  await prisma.vendorApplication.deleteMany({
    where: { gym: { ownerId: { in: userIds } } }
  });

  // 15. Eliminar Gyms
  await prisma.gym.deleteMany({
    where: { ownerId: { in: userIds } }
  });

  // 16. Eliminar RoleRequest
  await prisma.roleRequest.deleteMany({
    where: { userId: { in: userIds } }
  });

  // 17. Finalmente eliminar a los usuarios
  const deleteResult = await prisma.user.deleteMany({
    where: { id: { in: userIds } }
  });

  console.log(`✅ Se eliminaron con éxito ${deleteResult.count} usuarios demo y todos sus datos relacionados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
