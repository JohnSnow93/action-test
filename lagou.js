const request = require("request-promise");
const qs = require('qs');
const colors = require('colors');
const fs = require("fs");
const {sleep, getKeyWords, processSalary, processSalaryLevel, yearLevel} = require('./utils');

let cookies = '';
const city = encodeURIComponent('成都');
const jobName = encodeURIComponent('前端');
let publicHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36",
    "Referer": `https://www.lagou.com/jobs/list_${jobName}?labelWords=&fromSearch=true&suginput=`,
    "Content-Type": "application/x-www-form-urlencoded;charset = UTF-8"
};

function formatJobYear(str){
    let result = yearLevel['不限'];
    switch (str) {
        case '应届毕业生' : result = yearLevel["1年以下"]; break;
        case '1年以内' : result = yearLevel["1年以下"]; break;
        case '1-3年' : result = yearLevel["1-3年"]; break;
        case '3-5年' : result = yearLevel["3-5年"]; break;
        case '5-10年' : result = yearLevel["5-10年"]; break;
        case '10年以上' : result = yearLevel["10年以上"]; break;
    }
    return result;
}

function processData(jobDataArray = []){
    return jobDataArray.map((job) => {
        let salary = processSalary(job.salary)
        return {
            district: job.district,
            education: job.education,
            companyStaffAmount: job.companySize,
            companyFinancialStatus: job.financeStage,
            salary,
            salaryLevel: processSalaryLevel(salary),
            keywords: job.positionLables || [],
            year: formatJobYear(job.workYear),
            site: '拉勾'
        }
    });
}

async function getPageSessionCookie(){
    console.log('正在刷新Cookie'.bgMagenta);
    const res = await request.get(`https://www.lagou.com/jobs/list_${jobName}?city=${city}&labelWords=&fromSearch=true&suginput=`, {
        resolveWithFullResponse: true,
        headers: {
            ...publicHeaders
        }
    });
    return res.headers['set-cookie'];
}

async function fetchPosition(page = 1) {
    try {
        const res = await request.post(`https://www.lagou.com/jobs/positionAjax.json?needAddtionalResult=false&city=${city}`, {
            // resolveWithFullResponse: true,
            headers: {
                'Cookie': cookies,
                ...publicHeaders,
            },
            json: true,
            body: qs.stringify({
                first: page === 1,
                pn: page,
                kd: '前端'
            })
        });
        console.info(`成功获取第${page}页数据, 共${res.content.positionResult.result.length}条数据`.green);
        if(!res.content) {
          return { result: [] }
        }
        let result = [];
        try {
            result = processData(res.content.positionResult.result);
        } catch (e) {
            console.warn(e)
            result = [];
        }
        return { result, totalCount: res.content.positionResult.totalCount };
    } catch (e) {
        console.warn(`请求第${page}页发生错误，错误信息如下：`);
        console.warn(e);
        return { result: [] };
    }
}

async function start() {
    console.log("开始获取拉钩网数据");
    let page = 1;
    let res = [];
    let maxPage = 5; // 根据网站显示，最大页数是30页，每页15条
    while (page <= maxPage && !(res instanceof Error)){
        // 每4页需要刷新一次cookie
        if(page % 4 === 0 || page === 1){
            cookies = await getPageSessionCookie();
        }
        // 获取每页的数据和所有数据的总长度
        let { result, totalCount } = await fetchPosition(page);
        if(page === 1){
            // 如果数据分页数不足30页，则maxPage需要调整哦
            maxPage = Math.min(maxPage, Math.ceil(totalCount / 15));
            console.log(`最大页数${maxPage}`)
        }
        // 每次请求间进行一些延时
        await sleep(3000 * Math.random() + page * 1000);
        if(result.length < 15) break;
        res = res.concat(result);
        page ++;
    }
    console.info('请求结束');

    // 将请求的数据保存到文件中，保存位置是/result/lagouResult.js
    await new Promise((resolve, reject) => {
        fs.writeFile(__dirname + '/result/lagouResult.js', 'module.exports = ' + JSON.stringify(res), (e) => {
            if(!e){
                console.log('成功写入文件');
            } else {
                console.log('写入出错', e);
            }
            resolve();
        });
    })
}

module.exports = start;
