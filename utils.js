const request = require("request-promise");
const qs = require('qs');

const areaList = [{"name":"彭州市","adcode":"510182"},{"name":"都江堰市","adcode":"510181"},{"name":"青白江区","adcode":"510113"},{"name":"崇州市","adcode":"510184"},{"name":"大邑县","adcode":"510129"},{"name":"蒲江县","adcode":"510131"},{"name":"简阳市","adcode":"510185"},{"name":"金堂县","adcode":"510121"},{"name":"新津县","adcode":"510132"},{"name":"邛崃市","adcode":"510183"},{"name":"青羊区","adcode":"510105"},{"name":"温江区","adcode":"510115"},{"name":"金牛区","adcode":"510106"},{"name":"双流区","adcode":"510116"},{"name":"武侯区","adcode":"510107"},{"name":"郫都区","adcode":"510117"},{"name":"新都区","adcode":"510114"},{"name":"龙泉驿区","adcode":"510112"},{"name":"成华区","adcode":"510108"},{"name":"锦江区","adcode":"510104"}];

const salaryLevel = {
  '5K及以下': '5K及以下',
  '5k-10k': '5k-10k',
  '10k-15k': '10k-15k',
  '15k-20k': '15k-20k',
  '20k-30k': '20k-30k',
  '30k及以上': '30k及以上',
  '面议': '面议',
};
const salaryLevelArray = ["5K及以下", "5k-10k", "10k-15k", "15k-20k", '20k-30k' ,"30k及以上", "面议"];

const yearLevel = {
  '1年以下':'1年以下',
  '1-3年':'1-3年',
  '3-5年':'3-5年',
  '5-10年':'5-10年',
  '10年以上':'10年以上',
  '不限':'不限',
};
const yearLevelArray = ["1年以下", "1-3年", "3-5年", "5-10年", "10年以上", "不限"];

const districtNameList = areaList.map(i => i.name);

async function getDistrict(locationStr = ""){
  let district = '';
  for (let i = 0; i < districtNameList.length; i++) {
    if (locationStr.includes(districtNameList[i])){
      district = districtNameList[i];
      break;
    }
  }

  if(district) return Promise.resolve(district);
  else {
    try {
      const res = await request.get(`https://restapi.amap.com/v3/geocode/geo?${qs.stringify({
        key: 'b7a6dcbb3689af18c7f8b245be0df37b',
        address: locationStr,
        city: '成都'
      })}`, {
        json: true,
      });
      if(res.status === '1' && res.geocodes.length > 0){
        return Promise.resolve(res.geocodes[0].district);
      }
    } catch (e) {
      console.log(e);
      return Promise.resolve(null);
    }
  }
}

function getKeyWords(text = ""){
  let result = text.match(/\b[a-zA-Z]+\d?\b/ig) || [];
  return Array.from(new Set(result)).filter(str => str.length > 0);
}

function processSalary(salaryString = ""){
  if(!salaryString) return [];
  let salaryArr = salaryString.trim().split('-');
  if(salaryArr.length > 1){
    let start = parseInt(salaryArr[0]);
    start = Number.isNaN(start) ? 0 : start * 1000;
    let end = parseInt(salaryArr[1]);
    end = Number.isNaN(end) ? 0 : end * 1000;
    return [start, end];
  } else if (salaryArr.length === 1){
    let start = parseInt(salaryArr[0]);
    start = Number.isNaN(start) ? 0 : start * 1000;
    return [start];
  }
  return [];
}

function processSalaryLevel (salaryArray = []){
  if(salaryArray.length === 0) return '面议';
  else if(salaryArray.length === 1) {
    return getLevelText(salaryArray[0]);
  } else if(salaryArray.length === 2){
    let averageSalary = salaryArray[0] + salaryArray[1];
    return getLevelText(averageSalary/2)
  }

  function getLevelText(number = 0) {
    if(number <= 5000){
      return salaryLevel["5K及以下"];
    } else if(number > 5000 && number < 10000){
      return salaryLevel["5k-10k"];
    } else if(number >= 10000 && number < 15000){
      return salaryLevel["10k-15k"];
    } else if(number >= 15000 && number < 20000){
      return salaryLevel["15k-20k"];
    } else if(number >= 20000 && number < 30000){
      return salaryLevel["20k-30k"];
    } else if(number >= 30000) {
      return salaryLevel["30k及以上"];
    } else {
      return '面议';
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  sleep,
  areaList: districtNameList,
  getDistrict,
  getKeyWords,
  processSalary,
  processSalaryLevel,
  salaryLevel,
  salaryLevelArray,
  yearLevel,
  yearLevelArray,
};
