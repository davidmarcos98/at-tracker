import 'dotenv/config';

import { nadeoClient } from '@/src/lib/nadeo';
import { saveTotdMap } from '@/src/db/maps';

async function fetchTotd() {

    // TODO january 24th 2025 missing?
    
    for (let backwardsMonths = 63; backwardsMonths < 67; backwardsMonths++) {
        console.log(backwardsMonths, " backwards");
        const maps = await nadeoClient.getTotdMapsCurrentMonth(backwardsMonths);
        for (const map of maps.data) {
            console.log(`Saving TOTD map: ${map.name}`);
            await saveTotdMap(map);
        }
    }
    
    return process.exit(1)
}

fetchTotd();