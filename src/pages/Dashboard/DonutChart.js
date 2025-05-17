import React from "react";
import ReactApexChart from "react-apexcharts";

const DonutChart = ({ completados = 10, pendientes = 5, retrasados = 2 }) => {
  const series = [completados, pendientes, retrasados];
  
  const options = {
    chart: {
      height: 300,
      type: "donut",
    },
    labels: ["Completados", "Pendientes", "Retrasados"],
    colors: ["#0CE0FF", "#FFE600", "#FF0000"],
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              formatter: function () {
                return "Total";
              },
              fontSize: "18px",
              color: "#222",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 600,
              color: "#222",
            },
          },
        },
      },
    },
  };
  
  return (
    <div id="chart">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={300}
        width={"100%"}
      />
    </div>
  );
};

export default DonutChart;