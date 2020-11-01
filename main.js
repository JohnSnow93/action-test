const lagou = require("./lagou");
const boss = require("./boss");
const processData = require("./processData");

async function start() {
  // await lagou();
  await boss();
  await processData();
}

start();
