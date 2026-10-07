import app from './app.js';
import { prisma } from './config/database.js';
import { config } from './config/dotenv.js';

try {
  await prisma.$connect();
  console.log('Database connected successfully');
} catch {
  console.error(
    'Database connection failed. Verify server/.env contains a valid Supabase DATABASE_URL. Connection details were not logged.',
  );
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
}

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
