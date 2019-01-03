const argv = require('minimist')(process.argv.slice(2), {
  string: ['config']
});
const CronJob = require('cron').CronJob;
const parser = require('./');
const got = require('got');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync(argv.config));
const HASS_URL = 'http://hassio';

function report (id, data) {
  const body = {
    state: 'unavailable'
  };
  if (data) {
    body.state = 'available';
    body.attributes = data.reduce((grp, item) => {
      grp[item.type] = item.price;
      return grp;
    }, {});
  }
  return got(`${HASS_URL}/homeassistant/api/states/${id}`, {
    json: true,
    body,
    headers: {
      Authorization: `Bearer ${process.env.HASSIO_TOKEN}`
    }
  });
}

console.log('app is starting with schedule of %s to scrape the following stations:\n%s', config.schedule, config.stations.map(s => s.url).join('\n'));

const job = new CronJob({
  cronTime: config.schedule,
  runOnInit: true,
  start: true,
  onTick: async function () {
    const results = {};
    for (const station of config.stations) {
      try {
        console.log('scraping %s', station.url);
        const data = await parser(station.url);
        results[station.id] = data;
        await report(station.id, data);
        console.log('data added to %s', station.id);
      } catch (x) {
        console.log('error occured while processing %s with id of %s', station.url, station.id);
        console.error(x);
        await report(station.id);
      }
    }

    console.log(JSON.stringify(results, null, 2));
  }
});

