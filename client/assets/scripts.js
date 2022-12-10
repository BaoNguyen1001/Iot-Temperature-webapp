const socket = io();

window.Apex = {
  chart: {
    foreColor: "#fff",
    toolbar: {
      show: false,
    },
  },
  colors: ["#FCCF31", "#17ead9", "#f02fc2"],
  stroke: {
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: "#40475D",
  },
  xaxis: {
    axisTicks: {
      color: "#333",
    },
    axisBorder: {
      color: "#333",
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      gradientToColors: ["#F55555", "#6078ea", "#6094ea"],
    },
  },
  tooltip: {
    theme: "dark",
    x: {
      formatter: function (val) {
        const dateTime = new Date(val);
        const formatDateTime = new Date(dateTime.getUTCFullYear(), dateTime.getUTCMonth(), dateTime.getUTCDate(), dateTime.getUTCHours(), dateTime.getUTCMinutes(), dateTime.getUTCSeconds());
        return moment(formatDateTime).format("DD/MM/YYYY - HH:mm:ss");
        //return moment(dateTime).format("DD/MM/YYYY - HH:mm:ss");
      },
    },
  },
  yaxis: {
    decimalsInFloat: 2,
    opposite: true,
    labels: {
      offsetX: -10,
    },
  },
};

function convertData(data, type) {
  const time = data.Ts + 25200000;
  const value = data[type].toFixed();
  return [time, value];
}

function getInitLineData(data, type) {
  var series = [];
  data.map((item) => {
    const newItem = convertData({...item}, type);
    series.push(newItem);
  });
  return series;
}

function getInitCircleData(data, type) {
  const lastItem = data[data.length - 1];
  const result = lastItem[type].toFixed();
  return [result];
}

function updateLineData(data, type) {
  const newData = convertData(data[0], type);
  return newData;
}

var chartCircleTemp;
var chartCircleHumi;
var chartLine;

window.onload = () => {
  socket.emit("load", "load data");
  socket.on("load", (data) => {
    // Circle 1
    var optionsCircleTemp = {
      chart: {
        type: "radialBar",
        height: 250,
        offsetY: -50,
        offsetX: 10,
      },
      plotOptions: {
        radialBar: {
          size: undefined,
          inverseOrder: false,
          hollow: {
            margin: 5,
            size: "48%",
            background: "transparent",
          },
          track: {
            show: true,
            background: "#40475D",
            strokeWidth: "10%",
            opacity: 1,
            margin: 3, // margin is in pixels
          },
          dataLabels: {
            value: {
              formatter: function (val) {
                return parseInt(val) + "*C";
              },
            },
          },
        },
      },
      series: [getInitCircleData(data, "Temp")],
      labels: ["Temperature"],
      legend: {
        show: true,
        position: "left",
        offsetX: -30,
        offsetY: 10,
        formatter: function (val, opts) {
          return val + " - " + opts.w.globals.series[opts.seriesIndex] + "*C";
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          shadeIntensity: 0.5,
          inverseColors: true,
          gradientToColors: ["#FE4816"],
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
    };
    chartCircleTemp = new ApexCharts(
      document.querySelector("#circlechart-1"),
      optionsCircleTemp
    );
    chartCircleTemp.render();

    // Circle 2
    var optionsCircleHumi = {
      chart: {
        type: "radialBar",
        height: 250,
        offsetY: -50,
        offsetX: 20,
      },
      plotOptions: {
        radialBar: {
          size: undefined,
          inverseOrder: false,
          hollow: {
            margin: 5,
            size: "48%",
            background: "transparent",
          },
          track: {
            show: true,
            background: "#40475D",
            strokeWidth: "10%",
            opacity: 1,
            margin: 3, // margin is in pixels
          },
        },
      },
      series: [getInitCircleData(data, "Humi")],
      labels: ["Humidity"],
      legend: {
        show: true,
        position: "left",
        offsetX: -30,
        offsetY: 10,
        formatter: function (val, opts) {
          return val + " - " + opts.w.globals.series[opts.seriesIndex] + "%";
        },
      },
      fill: {
        type: "gradient",
        colors: ["#F288FF", "#9DA6E5"],
        gradient: {
          shade: "dark",
          type: "horizontal",
          shadeIntensity: 0.5,
          inverseColors: true,
          gradientToColors: ["#9DA6E5"],
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
    };
    chartCircleHumi = new ApexCharts(
      document.querySelector("#circlechart-2"),
      optionsCircleHumi
    );
    chartCircleHumi.render();

    // Line
    optionsLine = {
      chart: {
        height: 400,
        type: "line",
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: {
            speed: 1000,
          },
        },
        events: {
          animationEnd: function (chartCtx, opts) {
            const newData1 = chartCtx.w.config.series[0].data.slice();
            newData1.shift();
            const newData2 = chartCtx.w.config.series[1].data.slice();
            newData2.shift();

            // check animation end event for just 1 series to avoid multiple updates
            if (opts.el.node.getAttribute("index") === "0") {
              window.setTimeout(function () {
                chartCtx.updateOptions(
                  {
                    series: [
                      {
                        data: newData1,
                      },
                      {
                        data: newData2,
                      },
                    ],
                  },
                  false,
                  false
                );
              }, 300);
            }
          },
        },
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
        width: 5,
      },
      grid: {
        padding: {
          left: 0,
          right: 0,
        },
      },
      markers: {
        size: 0,
        hover: {
          size: 0,
        },
      },
      series: [
        {
          name: "Temperature",
          data: getInitLineData(data, "Temp"),
        },
        {
          name: "Humidity",
          data: getInitLineData(data, "Humi"),
        },
      ],
      xaxis: {
        type: "datetime",
        range: 45000//135000,
      },
      // yaxis: {
      //   min: 0,
      //   max: 100
      // },
      title: {
        text: "Processes",
        align: "left",
        style: {
          fontSize: "12px",
        },
      },
      legend: {
        show: true,
        floating: true,
        horizontalAlign: "left",
        onItemClick: {
          toggleDataSeries: false,
        },
        position: "top",
        offsetY: -28,
        offsetX: 60,
      },
    };

    chartLine = new ApexCharts(
      document.querySelector("#linechart"),
      optionsLine
    );
    chartLine.render();
  });
};

socket.on("update", (data) => {
  chartLine.updateSeries([
    {
      data: [
        ...chartLine.w.config.series[0].data,
        updateLineData(data, "Temp"),
      ],
    },
    {
      data: [
        ...chartLine.w.config.series[1].data,
        updateLineData(data, "Humi"),
      ],
    },
  ]);

  chartCircleTemp.updateSeries([data[0].Temp]);
  chartCircleHumi.updateSeries([data[0].Humi]);
  console.log("updated");
});

