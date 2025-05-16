import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import espacioService from '../../services/espacioService';
import inmuebleService from '../../services/inmuebleService';

const DonutChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart = null;

    const fetchData = async () => {
      try {
        const inmuebles = await inmuebleService.obtenerInmuebles();
        let pagosAlDia = 0;
        let pagosPendientes = 0;
        let pagosVencidos = 0;
        let sinContrato = 0;

        for (const inmueble of inmuebles) {
          const pisos = inmueble.pisos || [];
          for (const piso of pisos) {
            const espacios = await espacioService.obtenerEspaciosPorPiso(inmueble.id, piso.id);
            espacios.forEach(espacio => {
              if (espacio.contrato) {
                if (espacio.contrato.estadoPago === 'AL_DIA') {
                  pagosAlDia++;
                } else if (espacio.contrato.estadoPago === 'PENDIENTE') {
                  pagosPendientes++;
                } else if (espacio.contrato.estadoPago === 'VENCIDO') {
                  pagosVencidos++;
                }
              } else {
                sinContrato++;
              }
            });
          }
        }

        if (chartRef.current) {
          const donutChartOptions = {
            chart: {
              height: 350,
              type: 'donut',
              toolbar: {
                show: false
              }
            },
            series: [pagosAlDia, pagosPendientes, pagosVencidos, sinContrato],
            labels: ['Al Día', 'Pendientes', 'Vencidos', 'Sin Contrato'],
            colors: ['#2E37A4', '#FFA500', '#FF0000', '#808080'],
            plotOptions: {
              pie: {
                donut: {
                  size: '50%',
                  labels: {
                    show: true,
                    total: {
                      show: true,
                      label: 'Total',
                      formatter: function (w) {
                        return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                      }
                    }
                  }
                }
              }
            },
            dataLabels: {
              enabled: true,
              formatter: function (val) {
                return val.toFixed(1) + '%';
              }
            },
            legend: {
              position: 'bottom',
              offsetY: 0,
              height: 40
            }
          };

          if (chart) {
            chart.destroy();
          }

          chart = new ApexCharts(chartRef.current, donutChartOptions);
          chart.render();
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
      }
    };

    fetchData();

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default DonutChart;