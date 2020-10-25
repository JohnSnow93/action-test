const fs = require("fs");

// 将数据转换为echarts所需格式

// const dataZhipin = require('./result/bossZhipinResult.js');
const {salaryLevelArray, yearLevelArray} = require('./utils');


function getChartA(data) {
    const districtArray = Array.from(new Set(data.map(i => i.district)));
    const options = [];

    let dataSortByDistrict = {};
    districtArray.forEach((district) => {
        dataSortByDistrict[district] = data.filter(i => i.district === district);
    });

    let s = 0;
    for (let i in dataSortByDistrict) {
        let dataCollection = dataSortByDistrict[i];
        let dataSortByYear = [];
        yearLevelArray.forEach((yearDefine) => {
            let certainYearData = dataCollection.filter(i => i.year === yearDefine);
            dataSortByYear.push(certainYearData);
        });
        let series = [];

        dataSortByYear.forEach((dataArray) => {
            debugger;
            let line = salaryLevelArray.map((salaryLevelDefine) => {
                // console.log(dataArray)
                let length = dataArray.filter(item => {
                    return item.salaryLevel === salaryLevelDefine
                }).length;
                if(length >0) s+=length;
                return length;
            });
            series.push({data: line})
        });

        options.push({
            title: {text: i},
            series,
        });
    }

    const option = {
        baseOption: {
            title: {
                text: '前端职位薪水',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: yearLevelArray,
                right: 'right',
                top: '5%'
            },
            timeline: {
                data: districtArray,
                axisType: 'category',
                autoPlay: true
            },
            grid: {
                bottom: 80,
            },
            yAxis: {
                name: '月薪',
                data: salaryLevelArray
            },
            xAxis: {
                name: '数量'
            },
            media: [
                // query 1
                {
                    query: {
                        maxAspectRatio: 1
                    },
                    option: {

                        grid: {
                            // left: 'center',
                            top: '100',
                            width: '80%',
                            height: '60%'
                        },
                        legend: {
                            left: '0',
                            top: '6%',
                            orient: 'horizontal'
                        },
                        timeline: {
                            left: '10%',
                            bottom: 0
                        }

                    }
                },
                //query 2
                {
                    query: {
                        minAspectRatio: 1
                    },
                    option: {
                        grid: {
                            left: 'center',
                            top: 130,
                            width: '60%',
                            height: '60%'

                        },
                        legend: {
                            right: '20%'
                        },
                        timeline: {
                            bottom: 30
                        }
                    }
                }
            ],
            series: yearLevelArray.map(i => ({ name: i, type: 'bar', stack: '1' }))
        },
        options,
    };

    return option;
}

function getWordCloudData(data){

    const countObj = {};
    data.forEach((jobData) => {
        jobData.keywords && jobData.keywords.forEach((keyword) => {
            if(countObj[keyword]){
                countObj[keyword] += 1;
            } else {
                countObj[keyword] = 1;
            }
        });
    });

    let resultArray = [];

    for (let key in countObj) {
        resultArray.push({
            name: key,
            value: countObj[key]
        })
    }

    return resultArray
}

function getPieChartData(data){

    let companyScale = {};
    let salaryPercent = {};
    let areaJobCount = {};

    data.forEach((job) => {
        if(companyScale[job.companyStaffAmount]){
            companyScale[job.companyStaffAmount] += 1;
        } else {
            companyScale[job.companyStaffAmount] = 1;
        }

        if(salaryPercent[job.salaryLevel]){
            salaryPercent[job.salaryLevel] += 1;
        } else {
            salaryPercent[job.salaryLevel] = 1;
        }

        if(areaJobCount[job.district]){
            areaJobCount[job.district] += 1;
        } else {
            areaJobCount[job.district] = 1;
        }
    });

    let companyScaleArr = [];
    let salaryPercentArr = [];
    let areaJobCountArr = [];

    for (let key in companyScale) {
        companyScaleArr.push({
            name: key,
            value: companyScale[key]
        })
    }

    for (let key in salaryPercent) {
        salaryPercentArr.push({
            name: key,
            value: salaryPercent[key]
        })
    }

    for (let key in areaJobCount) {
        areaJobCountArr.push({
            name: key,
            value: areaJobCount[key]
        })
    }

    return {
        companyScale: companyScaleArr,
        salaryPercent: salaryPercentArr,
        areaJobCount: areaJobCountArr,
    }
}

module.exports = function () {
    const data = require('./result/lagouResult.js');
    const echartsData = {
        chartA:  getChartA(data),
        cloudWord: getWordCloudData(data),
        pie: getPieChartData(data)
    }
    console.log('准备写入echartsData.json');
    fs.writeFile(__dirname + '/dist/chartsData.json', JSON.stringify(echartsData), (e) => {
        if(!e){
            console.log('成功写入文件'.bgGreen);
        } else {
            console.log('写入出错'.bgYellow);
            console.log(e);
        }
    });
};
