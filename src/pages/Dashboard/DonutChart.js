import React, { useEffect, useState } from 'react';
import ApexCharts from 'apexcharts';
import espacioService from '../../services/espacioService';
import inmuebleService from '../../services/inmuebleService';

const DonutChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

        if (document.querySelector('#donut-chart-dash')) {
          const donutChartOptions = {
            chart: {
              height: 290,
              type: 'donut',
              toolbar: {
                show: false,
              },
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '50%',
              },
            },
            dataLabels: {
              enabled: false,
            },
            series: [pagosAlDia, pagosPendientes, pagosVencidos, sinContrato],
            labels: ['Al Día', 'Pendientes', 'Vencidos', 'Sin Contrato'],
            colors: ['#2E37A4', '#FFA500', '#FF0000', '#808080'],
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200,
                  },
                  legend: {
                    position: 'bottom',
                  },
                },
              },
            ],
            legend: {
              position: 'bottom',
              labels: {
                colors: '#333',
                useSeriesColors: false
              }
            },
          };

          const donut = new ApexCharts(
            document.querySelector('#donut-chart-dash'),
            donutChartOptions
          );

          donut.render();
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
        setError('Error al cargar los datos de pagos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '290px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return <div id="donut-chart-dash"></div>;
};

export default DonutChart;