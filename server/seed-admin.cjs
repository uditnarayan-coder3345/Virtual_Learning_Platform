const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function seedAdmin(prisma) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Platform Admin';
  const phone = process.env.ADMIN_PHONE?.trim() || null;

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env or the process environment before seeding an admin.');
  }
  if (Buffer.byteLength(password, 'utf8') < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('ADMIN_PASSWORD must be between 8 and 72 bytes.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, role: 'ADMIN', status: 'APPROVED', name, phone },
    create: { name, email, password: passwordHash, role: 'ADMIN', status: 'APPROVED', phone },
    select: { id: true, email: true, role: true },
  });

  const existingCourse = await prisma.course.findFirst({ where: { title: 'Admin Validation Course' } });
  if (!existingCourse) {
    await prisma.course.create({
      data: {
        title: 'Admin Validation Course',
        description: 'Course used to validate admin course management.',
        category: 'Operations',
        instructorId: null,
        lessons: { create: [{ title: 'Welcome lesson', content: 'This course was created for admin feature validation.', duration: 15, materialUrl: 'https://example.com/welcome' }] },
        assignments: { create: [{ title: 'Setup assignment', description: 'Complete the setup check', dueDate: new Date(Date.now() + 86400000) }] },
        quizzes: { create: [{ title: 'Quick quiz', description: 'Check comprehension', totalMarks: 10, questions: { create: [{ question: 'What is the purpose of this course?', optionA: 'To validate admin features', optionB: 'To buy time', optionC: 'To learn navigation', optionD: 'To replace the app', correctAnswer: 'A' }] } }] },
      },
    });
  }

  console.log(`Admin account ready: ${admin.email} (${admin.role})`);
}

const prisma = new PrismaClient();
seedAdmin(prisma)
  .catch((error) => {
    console.error(error.message || 'Unable to seed admin account.');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
