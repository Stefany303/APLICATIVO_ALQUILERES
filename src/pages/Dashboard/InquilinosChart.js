import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

const InquilinosChart = ({ espaciosOcupados, espaciosDisponibles, totalEspacios, selectedYear }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart = null;

    const renderChart = () => {
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      // Generar datos para cada mes (por ahora usando los mismos valores)
      const ocupadosData = meses.map(() => espaciosOcupados);
      const disponiblesData = meses.map(() => espaciosDisponibles);

      const sColStackedOptions = {
        chart: {
          height: 230,
          type: 'bar',
          stacked: true,
          toolbar: {
            show: false,
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0,
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '15%',
            borderRadius: 5,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val;
          },
          style: {
            fontSize: '12px',
            colors: ['#fff']
          }
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        series: [
          {
            name: 'Ocupados',
            color: '#2E37A4',
            data: ocupadosData,
          },
          {
            name: 'Disponibles',
            color: '#00D3C7',
            data: disponiblesData,
          },
        ],
        xaxis: {
          categories: meses,
          labels: {
            style: {
              colors: '#333',
              fontSize: '12px'
            },
            rotate: -45,
            rotateAlways: false,
            hideOverlappingLabels: true,
          },
          title: {
            text: 'Meses',
            style: {
              color: '#333',
              fontSize: '12px',
              fontWeight: 500,
            },
          },
        },
        yaxis: {
          min: 0,
          max: totalEspacios + 10,
          tickAmount: Math.ceil((totalEspacios + 10) / 5),
          labels: {
            style: {
              colors: '#333',
            },
          },
          title: {
            text: 'Cantidad de Espacios',
            style: {
              color: '#333',
              fontSize: '12px',
              fontWeight: 500,
            },
          },
        },
        legend: {
          position: 'bottom',
          labels: {
            colors: '#333',
            useSeriesColors: false,
          },
        },
        grid: {
          borderColor: '#f1f1f1',
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        },
        tooltip: {
          y: {
            formatter: function (value) {
              return value + " espacios";
            }
          }
        }
      };

      if (chartRef.current) {
        if (chart) {
          chart.destroy();
        }
        chart = new ApexCharts(chartRef.current, sColStackedOptions);
        chart.render();
      }
    };

    renderChart();

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [espaciosOcupados, espaciosDisponibles, totalEspacios, selectedYear]);

  return <div ref={chartRef}></div>;
};

export default InquilinosChart;