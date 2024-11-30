import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  await prisma.user.createMany({
    data: [
      {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        phone: '092812345',
      },
      {
        id: '2',
        email: 'mentor@example.com',
        name: 'Mentor User',
        role: 'MENTOR',
        phone: '092812345',
      },
      {
        id: '3',
        email: 'member@example.com',
        name: 'Member User',
        role: 'MEMBER',
        phone: '092812345',
      },
    ],
  });

  // Seed Groups
  await prisma.group.createMany({
    data: [
      { id: 'g1', name: 'Connect Group 1', leader_id: '1' }, // Leader is the Mentor User
      { id: 'g2', name: 'Connect Group 2', leader_id: '2' },
    ],
  });

  // Seed Connect Attendance
  await prisma.connectAttendance.createMany({
    data: [
      {
        id: 'ca1',
        group_id: 'g1',
        mentor_id: '2', // Mentor responsible
        location: 'Church Hall A',
        photo_url: 'https://example.com/photo1.jpg',
        date: new Date('2024-01-01'),
      },
      {
        id: 'ca2',
        group_id: 'g2',
        mentor_id: '2', // Mentor responsible
        location: 'Church Hall B',
        photo_url: 'https://example.com/photo2.jpg',
        date: new Date('2024-01-02'),
      },
    ],
  });

  // Seed General Attendance
  await prisma.generalAttendance.createMany({
    data: [
      {
        id: 'ga1',
        event_name: 'Seminar on Faith',
        user_id: '3', // Member User
        date: new Date('2024-01-03'),
      },
      {
        id: 'ga2',
        event_name: 'Prayer Night',
        user_id: '3',
        date: new Date('2024-01-04'),
      },
    ],
  });
}

main()
  .then(() => {
    console.log('Seeding completed!');
  })
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
