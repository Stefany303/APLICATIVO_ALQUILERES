import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import 'moment/locale/es';

// Configurar moment para usar español
moment.locale('es');

const InquilinosChart = ({ espaciosData, selectedYear }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'area',
        height: 350,
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      colors: ['#2E37A4', '#FF9800'],
      title: {
        text: 'Distribución de Espacios por Inmueble',
        align: 'left',
        style: {
          fontSize: '16px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600
        }
      },
      grid: {
        borderColor: '#f1f1f1',
        row: {
          colors: ['transparent', 'transparent'],
          opacity: 0.5
        },
      },
      markers: {
        size: 4
      },
      xaxis: {
        type: 'category',
        categories: [],
        title: {
          text: 'Inmuebles'
        },
        labels: {
          rotate: -45,
          trim: true,
          style: {
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Espacios'
        },
        min: 0,
        forceNiceScale: true
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
      },
      tooltip: {
        shared: true,
        y: {
          formatter: function(val) {
            return val;
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      annotations: {
        yaxis: [
          {
            y: 0,
            borderColor: '#999',
            borderWidth: 1,
            opacity: 0.3
          }
        ]
      }
    }
  });

  // Procesar datos cuando cambien
  useEffect(() => {
    if (espaciosData && Array.isArray(espaciosData) && espaciosData.length > 0) {
      // Usar datos proporcionados
      procesarDatosReales(espaciosData);
    } else {
      // Generar datos de ejemplo
      generarDatosEjemplo();
    }
  }, [espaciosData, selectedYear]);

  const procesarDatosReales = (datos) => {
    try {
      console.log("Procesando datos espacios:", datos);
      
      // Extraer categorías (nombres de inmuebles)
      const nombresInmuebles = datos.map(item => {
        // Acortar nombres largos
        const nombre = item.inmueble_nombre || '';
        return nombre.length > 12 ? nombre.substring(0, 10) + '...' : nombre;
      });
      
      // Extraer datos para ocupados y disponibles
      const espaciosOcupados = datos.map(item => parseInt(item.espacios_ocupados || 0));
      const espaciosDisponibles = datos.map(item => parseInt(item.espacios_disponibles || 0));
      
      // Calcular tasa de ocupación para cada inmueble
      const tasasOcupacion = datos.map(item => {
        const totalEspacios = parseInt(item.total_espacios || 0);
        const ocupados = parseInt(item.espacios_ocupados || 0);
        return totalEspacios > 0 ? Math.round((ocupados / totalEspacios) * 100) : 0;
      });

      // Actualizar el gráfico
      setChartData({
        series: [
          {
            name: 'Espacios Ocupados',
            data: espaciosOcupados
          },
          {
            name: 'Espacios Disponibles',
            data: espaciosDisponibles
          },
          {
            name: 'Tasa de Ocupación (%)',
            data: tasasOcupacion,
            type: 'line'
          }
        ],
        options: {
          ...chartData.options,
          xaxis: {
            ...chartData.options.xaxis,
            categories: nombresInmuebles
          },
          colors: ['#2E37A4', '#FF9800', '#52c41a'],
          stroke: {
            width: [3, 3, 4],
            curve: 'smooth',
            dashArray: [0, 0, 5]
          },
          yaxis: [
            {
              title: {
                text: 'Espacios',
              },
              min: 0,
            },
            {
              opposite: true,
              title: {
                text: 'Tasa de Ocupación (%)',
              },
              min: 0,
              max: 100,
              labels: {
                formatter: function(val) {
                  return val + '%';
                }
              }
            }
          ],
          tooltip: {
            shared: true,
            intersect: false,
            y: {
              formatter: function(val, { seriesIndex }) {
                if (seriesIndex === 2) {
                  return val + '%';
                }
                return val;
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al procesar datos del gráfico:', error);
      generarDatosEjemplo(); // Usar datos de ejemplo como fallback
    }
  };

  const generarDatosEjemplo = () => {
    // Construir datos de ejemplo
    const inmuebles = ['Edificio A', 'Edificio B', 'Edificio C', 'Edificio D'];
    const ocupados = [12, 19, 8, 5];
    const disponibles = [6, 2, 4, 8];
    const tasaOcupacion = ocupados.map((val, idx) => {
      const total = val + disponibles[idx];
      return total > 0 ? Math.round((val / total) * 100) : 0;
    });

    // Actualizar el gráfico
    setChartData({
      series: [
        {
          name: 'Espacios Ocupados',
          data: ocupados
        },
        {
          name: 'Espacios Disponibles',
          data: disponibles
        },
        {
          name: 'Tasa de Ocupación (%)',
          data: tasaOcupacion,
          type: 'line'
        }
      ],
      options: {
        ...chartData.options,
        xaxis: {
          ...chartData.options.xaxis,
          categories: inmuebles
        },
        colors: ['#2E37A4', '#FF9800', '#52c41a'],
        stroke: {
          width: [3, 3, 4],
          curve: 'smooth',
          dashArray: [0, 0, 5]
        },
        yaxis: [
          {
            title: {
              text: 'Espacios',
            },
            min: 0,
          },
          {
            opposite: true,
            title: {
              text: 'Tasa de Ocupación (%)',
            },
            min: 0,
            max: 100,
            labels: {
              formatter: function(val) {
                return val + '%';
              }
            }
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function(val, { seriesIndex }) {
              if (seriesIndex === 2) {
                return val + '%';
              }
              return val;
            }
          }
        }
      }
    });
  };

  return (
    <div id="chart">
      <ReactApexChart 
        options={chartData.options} 
        series={chartData.series} 
        type="area" 
        height={350}
      />
    </div>
  );
};

export default InquilinosChart;