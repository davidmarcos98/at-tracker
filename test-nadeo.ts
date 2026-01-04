const { nadeoClient } = require('./src/lib/nadeo');

async function test() {
  try {
    console.log('Testing Nadeo Client...\n');

    console.log('Fetching current TOTD map...');
    const todMap = await nadeoClient.getTotdMapsCurrentMonth();
    console.log('Current TOTD:', todMap.name);
    console.log('Author:', todMap.authorDisplayName);
    console.log('Gold Time:', todMap.goldTime, 'ms\n');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    console.log(`Fetching TOTD maps from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
    const maps = await nadeoClient.getTotdMaps(startDate, endDate);
    console.log(`Found ${maps.length} maps`);
    maps.forEach((map: { name: any; authorDisplayName: any; }) => {
      console.log(`  - ${map.name} by ${map.authorDisplayName}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
