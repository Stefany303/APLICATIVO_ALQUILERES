import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import 'moment/locale/es';

// Configurar moment para usar español
moment.locale('es');

const TendenciasIngresosChart = ({ ingresos, ingresosPrevistos, selectedYear }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'line',
        height: 300,
        toolbar: {
          show: false
        }
      },
      stroke: {
        curve: 'smooth',
        width: [3, 3]
      },
      colors: ['#2E37A4', '#00A389'],
      title: {
        text: `Tendencias de Ingresos (${selectedYear})`,
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
        }
      },
      markers: {
        size: 4
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Mes'
        },
        labels: {
          rotate: -45,
          style: {
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Monto (S/)'
        },
        min: 0,
        labels: {
          formatter: function(val) {
            return 'S/ ' + val.toFixed(0);
          }
        }
      },
      tooltip: {
        shared: true,
        y: {
          formatter: function(val) {
            return 'S/ ' + val.toFixed(2);
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetY: -10
      }
    }
  });

  useEffect(() => {
    // Obtener meses únicos que aparecen en ambos arrays
    const mesesSet = new Set();
    ingresos.forEach(item => mesesSet.add(item.mes));
    ingresosPrevistos.forEach(item => mesesSet.add(item.mes));

    // Convertir a array y ordenar cronológicamente (YYYY-MM string)
    const mesesArray = Array.from(mesesSet).sort((a, b) => a.localeCompare(b));

    // Formatear cada "YYYY-MM" a "MMM-YY"
    const categorias = mesesArray.map(m =>
      moment(m, 'YYYY-MM').format('MMM-YY')
    );

    // Construir serie de valores reales
    const datosActual = mesesArray.map(m => {
      const encontrado = ingresos.find(item => item.mes === m);
      return encontrado ? encontrado.total_ingresos : 0;
    });

    // Construir serie de valores previstos
    const datosPrevisto = mesesArray.map(m => {
      const encontrado = ingresosPrevistos.find(item => item.mes === m);
      return encontrado ? encontrado.total_ingresos : 0;
    });

    setChartData(prev => ({
      series: [
        {
          name: 'Ingresos Actuales',
          data: datosActual
        },
        {
          name: 'Ingresos Previstos',
          data: datosPrevisto
        }
      ],
      options: {
        ...prev.options,
        title: {
          ...prev.options.title,
          text: `Tendencias de Ingresos (${selectedYear})`
        },
        xaxis: {
          ...prev.options.xaxis,
          categories: categorias
        }
      }
    }));
  }, [ingresos, ingresosPrevistos, selectedYear]);

  return (
    <div id="tendencias-ingresos-chart">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={300}
      />
    </div>
  );
};

export default TendenciasIngresosChart;
