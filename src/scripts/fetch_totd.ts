import 'dotenv/config';

import { nadeoClient } from '@/src/lib/nadeo';
import { saveTotdMap } from '@/src/db/maps';

async function fetchTotd() {
    
    for (let backwardsMonths = 0; backwardsMonths < 100; backwardsMonths++) {
        const maps = await nadeoClient.getTotdMapsCurrentMonth(backwardsMonths);
        for (const map of maps.data) {
            console.log(`Saving TOTD map: ${map.name}`);
            await saveTotdMap(map);
        }
    }
    
    return process.exit(1)
}

fetchTotd();