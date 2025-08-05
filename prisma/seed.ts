import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create Users (including Mentors)
  const mentorAlice = await prisma.user.create({
    data: {
      google_id: 'seed_mentor_alice_123',
      email: 'mentor.alice@example.com',
      name: 'Alice Mentor',
      role: Role.MENTOR,
      gender: 'FEMALE',
      phone: '1234567890',
    },
  });

  const mentorBob = await prisma.user.create({
    data: {
      google_id: 'seed_mentor_bob_456',
      email: 'mentor.bob@example.com',
      name: 'Bob Mentor',
      role: Role.MENTOR,
      gender: 'MALE',
      phone: '0987654321',
    },
  });

  const memberCharlie = await prisma.user.create({
    data: {
      google_id: 'seed_member_charlie_789',
      email: 'charlie@example.com',
      name: 'Charlie',
      role: Role.MEMBER,
      gender: 'MALE',
      phone: '5555555555',
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: 'c8aac80e-1b7b-4cae-bff9-568f19cd2de4', // Id email Yosua from supabase
      google_id: 'c8aac80e-1b7b-4cae-bff9-568f19cd2de4',
      email: 'yosua.halim@gmail.com',
      name: 'Yosua Halim',
      role: Role.ADMIN,
      phone: '1234567890',
    },
  });

  const memberDiana = await prisma.user.create({
    data: {
      google_id: 'seed_member_diana_012',
      email: 'diana@example.com',
      name: 'Diana',
      role: Role.MEMBER,
      gender: 'FEMALE',
      phone: '4444444444',
    },
  });

  // Create Groups and Assign Mentors
  const groupAlpha = await prisma.group.create({
    data: {
      name: 'Group Alpha',
      mentor_id: mentorAlice.id,
    },
  });

  const groupBeta = await prisma.group.create({
    data: {
      name: 'Group Beta',
      mentor_id: mentorBob.id,
    },
  });

  // Assign Mentees to Groups
  await prisma.user.update({
    where: { id: memberCharlie.id },
    data: { group_id: groupAlpha.id },
  });

  await prisma.user.update({
    where: { id: memberDiana.id },
    data: { group_id: groupBeta.id },
  });

  // Create Events
  const event1 = await prisma.event.create({
    data: {
      name: 'Community Gathering',
      date: new Date('2024-12-10'),
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Annual Meetup',
      date: new Date('2024-12-15'),
    },
  });

  // Record Event Attendance
  await prisma.eventAttendance.createMany({
    data: [
      {
        user_id: mentorAlice.id,
        event_id: event1.id,
      },
      {
        user_id: memberCharlie.id,
        event_id: event1.id,
      },
      {
        user_id: mentorBob.id,
        event_id: event2.id,
      },
      {
        user_id: memberDiana.id,
        event_id: event2.id,
      },
      {
        user_id: admin.id,
        event_id: event2.id,
      },
    ],
  });

  // Create Connect Attendance
  await prisma.connectAttendance.create({
    data: {
      group_id: groupAlpha.id,
      notes: 'Community Center A',
      photo_url: 'https://example.com/photo1.jpg',
      date: new Date('2024-12-01'),
    },
  });

  await prisma.connectAttendance.create({
    data: {
      group_id: groupBeta.id,
      notes: 'Community Center B',
      photo_url: 'https://example.com/photo2.jpg',
      date: new Date('2024-12-02'),
    },
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
