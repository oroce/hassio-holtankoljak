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
  return got(`${HASS_URL}/homeassistant/api/sensor/${id}`, {
    json: true,
    body,
    headers: {
      'x-ha-access': process.env.HASSIO_TOKEN
    }
  });
}
const job = new CronJob(config.schedule, async function () {
  const results = {};
  for (const station of config.stations) {
    try {
      console.log('scraping %s', station.url);
      const data = await parser(station.url);
      results[station.id] = data;
      await report(station.id, data);
    } catch (x) {
      console.log('error occured while processing %s with id of %s', station.url, station.id);
      console.error(x);
      await report(station.id);
    }
  }

  console.log(JSON.stringify(results, null, 2));
}, null, true);

console.log('app has been started with schedule of %s to scrape the following stations:\n%s', config.schedule, config.stations.map(s => s.url).join('\n'));

job.start();
