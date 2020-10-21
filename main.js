const lagou = require("./lagou");
const processRawDataForEcharts = require("./processRawDataForEcharts");

async function start() {
  await lagou();
  await processRawDataForEcharts();
}

start();