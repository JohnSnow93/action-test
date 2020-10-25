const lagou = require("./lagou");
const boss = require("./boss");
const processRawDataForEcharts = require("./processRawDataForEcharts");

async function start() {
  await lagou();
  await boss();
  await processRawDataForEcharts();
}

start();
