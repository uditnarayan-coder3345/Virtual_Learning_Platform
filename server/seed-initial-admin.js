import { emitKeypressEvents } from 'node:readline';
import { prisma } from './src/config/database.js';
import { hashPassword } from './src/utils/auth.js';

const admin = {
  name: 'Udit Narayan Choudhury',
  email: 'uditnarayan3345@gmail.com',
  role: 'ADMIN',
  status: 'APPROVED',
};

function promptPasswordHidden() {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Run this seed from an interactive terminal so the password can be entered without echo.');
  }

  return new Promise((resolve, reject) => {
    process.stdout.write('Admin password (input hidden): ');
    emitKeypressEvents(process.stdin);
    process.stdin.setEncoding('utf8');
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let password = '';
    const finish = (error) => {
      process.stdin.removeListener('keypress', onKeypress);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(password);
    };
    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        finish(new Error('Admin seed cancelled.'));
      } else if (key.name === 'return' || key.name === 'enter') {
        finish();
      } else if (key.name === 'backspace') {
        password = password.slice(0, -1);
      } else if (!key.ctrl && !key.meta && character) {
        password += character;
      }
    };

    process.stdin.on('keypress', onKeypress);
  });
}

async function seedInitialAdmin() {
  const existing = await prisma.user.findUnique({
    where: { email: admin.email },
    select: { id: true, role: true },
  });
  if (existing?.role === 'ADMIN') {
    console.log('Admin account already exists; no changes were made.');
    return;
  }
  if (existing) {
    console.error('An account with this email already exists with a non-Admin role; no changes were made.');
    process.exitCode = 1;
    return;
  }

  const password = await promptPasswordHidden();
  if (Buffer.byteLength(password, 'utf8') < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    console.error('Password must be between 8 and 72 bytes. No account was created.');
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);
  try {
    const created = await prisma.user.create({
      data: { ...admin, password: passwordHash },
      select: { id: true, name: true, email: true, role: true },
    });
    console.log(`Admin account created: ${created.email} (${created.role}).`);
  } catch (error) {
    if (error?.code === 'P2002') {
      console.log('Admin account already exists; no duplicate was created.');
      return;
    }
    console.error('Unable to create the Admin account. No credentials were logged.');
    process.exitCode = 1;
  }
}

try {
  await seedInitialAdmin();
} catch (error) {
  console.error(error.message || 'Admin seed failed. No credentials were logged.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
