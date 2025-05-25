import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';

const DonutChart = ({ completados, pendientes, retrasados, montoCompletado, montoPendiente }) => {
  const [chartData, setChartData] = useState({
    series: [70, 30, 0],
    options: {
      chart: {
        type: 'donut',
        toolbar: {
          show: false,
        },
      },
      labels: ['Completados', 'Pendientes', 'Retrasados'],
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '85%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontFamily: 'Poppins, sans-serif',
                color: '#2E37A4',
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
                color: undefined,
                offsetY: 2,
                formatter: function (val) {
                  return val + '%';
                },
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2E37A4',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + '%';
                },
              },
            },
          },
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function(value, { seriesIndex, w }) {
            if (montoCompletado !== undefined && montoPendiente !== undefined) {
              const montos = [montoCompletado, montoPendiente, 0];
              return `${value}% (S/ ${montos[seriesIndex].toFixed(2)})`;
            }
            return `${value}%`;
          }
        }
      },
      colors: ['#2E37A4', '#FF9800', '#DC3545'], // azul para completados, naranja para pendientes, rojo para retrasados
      responsive: [
        {
          breakpoint: 575,
          options: {
            chart: {
              height: 250,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  });

  useEffect(() => {
    // Calcular porcentajes basados en montos, no en conteos
    console.log("Montos para gráfico:", { completados, pendientes, montoCompletado, montoPendiente });
    
    // Obtener los montos como números
    const montoCompletadoNum = parseFloat(montoCompletado || 0);
    const montoPendienteNum = parseFloat(montoPendiente || 0);
    const montoTotal = montoCompletadoNum + montoPendienteNum;
    
    if (montoTotal <= 0) {
      // Si no hay datos de montos, mostrar 100% "Sin datos"
      setChartData(prevState => ({
        ...prevState,
        series: [100],
        options: {
          ...prevState.options,
          labels: ['Sin datos'],
          colors: ['#E0E0E0'], // Gris claro para "sin datos"
          plotOptions: {
            ...prevState.options.plotOptions,
            pie: {
              ...prevState.options.plotOptions.pie,
              donut: {
                ...prevState.options.plotOptions.pie.donut,
                labels: {
                  ...prevState.options.plotOptions.pie.donut.labels,
                  total: {
                    ...prevState.options.plotOptions.pie.donut.labels.total,
                    formatter: function () {
                      return 'Sin pagos';
                    },
                  },
                },
              },
            },
          },
          tooltip: {
            ...prevState.options.tooltip,
            y: {
              formatter: function() {
                return 'No hay datos disponibles';
              }
            }
          }
        },
      }));
      return;
    }
    
    // Calcular porcentajes basados en montos
    const completadosPct = Math.round((montoCompletadoNum / montoTotal) * 100) || 0;
    const pendientesPct = Math.round((montoPendienteNum / montoTotal) * 100) || 0;
    
    // Ajustar para asegurar que la suma sea 100%
    let ajuste = 100 - (completadosPct + pendientesPct);
    
    const seriesData = [
      completadosPct + (ajuste > 0 ? ajuste : 0),
      pendientesPct
    ];
    
    // Eliminar categorías con 0%
    let labels = ['Pagados', 'Pendientes'];
    let colors = ['#00C851', '#FF9800']; // Verde para pagados, naranja para pendientes
    let filteredSeries = [];
    let filteredLabels = [];
    let filteredColors = [];
    
    seriesData.forEach((value, index) => {
      if (value > 0) {
        filteredSeries.push(value);
        filteredLabels.push(labels[index]);
        filteredColors.push(colors[index]);
      }
    });
    
    if (filteredSeries.length === 0) {
      // Si no hay datos filtrados, mostrar datos por defecto
      filteredSeries = [100];
      filteredLabels = ['Sin datos'];
      filteredColors = ['#E0E0E0'];
    }
    
    // Actualizar el gráfico
    setChartData(prevState => ({
      ...prevState,
      series: filteredSeries,
      options: {
        ...prevState.options,
        labels: filteredLabels,
        colors: filteredColors,
        tooltip: {
          ...prevState.options.tooltip,
          y: {
            formatter: function(value, { seriesIndex }) {
              const label = filteredLabels[seriesIndex];
              const monto = label === 'Pagados' ? montoCompletadoNum : montoPendienteNum;
              return `${value}% (S/ ${monto.toFixed(2)})`;
            }
          }
        },
        plotOptions: {
          ...prevState.options.plotOptions,
          pie: {
            ...prevState.options.plotOptions.pie,
            donut: {
              ...prevState.options.plotOptions.pie.donut,
              labels: {
                ...prevState.options.plotOptions.pie.donut.labels,
                total: {
                  ...prevState.options.plotOptions.pie.donut.labels.total,
                  formatter: function () {
                    return `S/ ${montoTotal.toFixed(2)}`;
                  },
                },
              },
            },
          },
        },
      },
    }));
  }, [completados, pendientes, retrasados, montoCompletado, montoPendiente]);

  return (
    <div id="chart">
      <ReactApexChart options={chartData.options} series={chartData.series} type="donut" height={280} />
    </div>
  );
};

export default DonutChart;