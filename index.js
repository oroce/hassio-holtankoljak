const cheerio = require('cheerio');
const got = require('got');

async function main (station) {
  const response = await got('https://holtankoljak.hu/benzinkutak/' + station);

  const $ = cheerio.load(response.body);
  const $table = $('.station-data-left .station-data.data-green');
  const res = $table.find('.data-col').get().map(el => {
    const type = $(el).find('.data-left').text().trim().toLowerCase();
    const priceRaw = $(el).find('.data-right').text().trim();
    const price = priceRaw === '-' ? null : parseFloat(priceRaw, 10);
    return { type, price };
  });
  return res;
}

module.exports = main;

if (module.parent == null) {
  const station = process.argv.slice(2).join('');
  main(station).then(res => console.log(JSON.stringify(res, null, 2)));
}
