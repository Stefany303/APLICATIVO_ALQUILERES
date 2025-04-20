import React, { useEffect, useState } from 'react';
import ApexCharts from 'apexcharts';
import espacioService from '../../services/espacioService';
import inmuebleService from '../../services/inmuebleService';

const InquilinosChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const inmuebles = await inmuebleService.obtenerInmuebles();
        const ocupacionMensual = Array(12).fill(0);
        const disponibilidadMensual = Array(12).fill(0);

        for (const inmueble of inmuebles) {
          const pisos = inmueble.pisos || [];
          for (const piso of pisos) {
            const espacios = await espacioService.obtenerEspaciosPorPiso(inmueble.id, piso.id);
            espacios.forEach(espacio => {
              const fechaContrato = espacio.contrato ? new Date(espacio.contrato.fechaInicio) : null;
              if (fechaContrato) {
                const mes = fechaContrato.getMonth();
                if (espacio.estado === 'OCUPADO') {
                  ocupacionMensual[mes]++;
                } else if (espacio.estado === 'DISPONIBLE') {
                  disponibilidadMensual[mes]++;
                }
              }
            });
          }
        }

        if (document.querySelector('#patient-chart')) {
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
              },
            },
            dataLabels: {
              enabled: false,
            },
            series: [
              {
                name: 'Ocupados',
                color: '#2E37A4',
                data: ocupacionMensual,
              },
              {
                name: 'Disponibles',
                color: '#00D3C7',
                data: disponibilidadMensual,
              },
            ],
            xaxis: {
              categories: [
                'Ene',
                'Feb',
                'Mar',
                'Abr',
                'May',
                'Jun',
                'Jul',
                'Ago',
                'Sep',
                'Oct',
                'Nov',
                'Dic',
              ],
              labels: {
                style: {
                  colors: '#333',
                },
              },
            },
            yaxis: {
              labels: {
                style: {
                  colors: '#333',
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
          };

          const chart = new ApexCharts(
            document.querySelector('#patient-chart'),
            sColStackedOptions
          );

          chart.render();
        }
      } catch (error) {
        console.error('Error fetching occupancy data:', error);
        setError('Error al cargar los datos de ocupación');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '230px' }}>
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

  return <div id="patient-chart"></div>;
};

export default InquilinosChart;