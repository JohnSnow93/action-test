$(document).ready(function () {
  $.ajax({
    type: "GET",
    url: "./chartsData.json",
    dataType: "json",
    success: function(res){
      setSalaryChart(res.chartA);
      setWordCloud(res.cloudWord);
      setPieChart(res.pie);
    }
  });

});

function setSalaryChart(option) {
  const salaryChart = echarts.init(document.querySelector('#salary-chart'));
  salaryChart.setOption(option);
}

function setWordCloud(data) {
  const cahrt = echarts.init(document.querySelector('#word-cloud'));

  cahrt.setOption( {
    title: {text: "前端职位关键词", left: "center", top: 10},
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      width: '80%',
      height: '80%',
      sizeRange: [8, 60],
      rotationRange: [-90, 90],
      rotationStep: 45,
      drawOutOfBound: true,
      textStyle: {
        normal: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            // Random color
            return 'rgb(' + [
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160)
            ].join(',') + ')';
          }
        },
        emphasis: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: data
    }]
  });
}

function setPieChart(data) {
  const companyScale = echarts.init(document.querySelector('#company-scale'));
  const salaryPercent = echarts.init(document.querySelector('#salary-percent'));
  const areaJobCount = echarts.init(document.querySelector('#area-job-count'));
  companyScale.setOption(generateOption('招聘公司规模',data.companyScale));
  salaryPercent.setOption(generateOption('薪酬比例', data.salaryPercent));
  areaJobCount.setOption(generateOption('各行政区招聘数量', data.areaJobCount));

  function generateOption(title, data = []) {
    return {
      title: {
        text: title,
        left: 'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{b} : {c} ({d}%)"
      },
      legend: {
        bottom: 10,
        left: 'center',
        data: data.map(i => i.name)
      },
      series : [
        {
          type: 'pie',
          radius : '65%',
          center: ['50%', '50%'],
          selectedMode: 'single',
          data: data,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }
}
