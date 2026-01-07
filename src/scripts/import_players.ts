import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '@/src/db/index';
import { players } from '@/db/schema';

const FILE_PATH = path.join(process.cwd(), 'all_users.json');

async function importPlayers() {
  try {
    const jsonData = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
    
    const values = Object.entries(jsonData).map(([username, accountId]) => ({
      displayName: username,
      accountId: accountId as string,
    }));
    
    const batchSize = 20000;
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      await db.insert(players).values(batch).onConflictDoNothing();
      const inserted = Math.min(i + batchSize, values.length);
      const percentage = Math.round((inserted / values.length) * 100);
      console.log(`Inserted batch of ${batch.length} (${inserted}/${values.length} - ${percentage}%)`);
    }
    
    console.log(`Imported ${values.length} players total`);
  } catch (error) {
    console.error('Error importing players:', error);
  }
}

importPlayers();