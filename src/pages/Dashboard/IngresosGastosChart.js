import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const IngresosGastosChart = ({ ingresos, gastos, selectedYear }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        stacked: false,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [0, 0, 4],
        curve: 'smooth'
      },
      colors: ['#00A389', '#FF5722', '#2E37A4'],
      title: {
        text: 'Ingresos vs Gastos Mensuales',
        align: 'left',
        style: {
          fontSize: '16px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600
        }
      },
      grid: {
        borderColor: '#f1f1f1',
        padding: {
          bottom: 15
        }
      },
      fill: {
        opacity: [0.85, 0.85, 1],
        type: ['solid', 'solid', 'gradient'],
        gradient: {
          shade: 'light',
          type: "vertical",
          shadeIntensity: 0.5,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 50, 100],
          colorStops: []
        }
      },
      markers: {
        size: [0, 0, 5],
        colors: ['#00A389', '#FF5722', '#2E37A4'],
        strokeColors: '#fff',
        strokeWidth: 2
      },
      xaxis: {
        categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        title: {
          text: 'Mes'
        }
      },
      yaxis: [
        {
          title: {
            text: 'Monto (S/)'
          },
          min: 0,
          labels: {
            formatter: function(val) {
              return 'S/ ' + val.toFixed(0);
            }
          }
        }
      ],
      tooltip: {
        shared: true,
        intersect: false,
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
    console.log("Datos para gráfico de ingresos/gastos:", { ingresos, gastos, selectedYear });
    
    if ((ingresos && Array.isArray(ingresos) && ingresos.length > 0) || 
        (gastos && Array.isArray(gastos) && gastos.length > 0)) {
      procesarDatos(ingresos || [], gastos || []);
    } else {
      generarDatosEjemplo();
    }
  }, [ingresos, gastos, selectedYear]);

  const procesarDatos = (datosIngresos, datosGastos) => {
    try {
      // Inicializar arrays para todos los meses
      const ingresosPorMes = Array(12).fill(0);
      const gastosPorMes = Array(12).fill(0);
      const meses = Array(12).fill().map((_, i) => moment().month(i).format('MMM'));
      
      // Filtrar por año seleccionado y procesar datos de ingresos
      datosIngresos.forEach(item => {
        if (item.mes) {
          const [year, month] = item.mes.split('-');
          if (year === String(selectedYear)) {
            const monthIndex = parseInt(month) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
              ingresosPorMes[monthIndex] += parseFloat(item.total_ingresos || 0);
            }
          }
        }
      });
      
      // Filtrar por año seleccionado y procesar datos de gastos
      datosGastos.forEach(item => {
        if (item.mes) {
          const [year, month] = item.mes.split('-');
          if (year === String(selectedYear)) {
            const monthIndex = parseInt(month) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
              gastosPorMes[monthIndex] += parseFloat(item.total_gastos || 0);
            }
          }
        }
      });
      
      // Calcular balance neto (ingresos - gastos)
      const balanceNeto = ingresosPorMes.map((ingreso, i) => ingreso - gastosPorMes[i]);
      
      // Determinar el máximo valor para establecer el rango del eje Y
      const maxIngresos = Math.max(...ingresosPorMes);
      const maxGastos = Math.max(...gastosPorMes);
      const maxBalance = Math.max(...balanceNeto.map(Math.abs));
      const maxValue = Math.max(maxIngresos, maxGastos, maxBalance);
      
      // Si no hay datos significativos, usar datos de ejemplo
      if (maxValue <= 0) {
        console.log("No hay datos significativos, usando datos de ejemplo");
        return generarDatosEjemplo();
      }
      
      // Actualizar datos del gráfico
      setChartData({
        series: [
          {
            name: 'Ingresos',
            type: 'column',
            data: ingresosPorMes
          },
          {
            name: 'Gastos',
            type: 'column',
            data: gastosPorMes
          },
          {
            name: 'Balance Neto',
            type: 'line',
            data: balanceNeto
          }
        ],
        options: {
          ...chartData.options,
          xaxis: {
            ...chartData.options.xaxis,
            categories: meses
          },
          yaxis: [
            {
              title: {
                text: 'Monto (S/)'
              },
              min: 0,
              max: Math.ceil(maxValue * 1.2),
              labels: {
                formatter: function(val) {
                  return 'S/ ' + val.toFixed(0);
                }
              }
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error al procesar datos de ingresos y gastos:', error);
      generarDatosEjemplo();
    }
  };

  const generarDatosEjemplo = () => {
    const ingresos = [2500, 3500, 3200, 2800, 3000, 3800, 4200, 3500, 3000, 2700, 3200, 4000];
    const gastos = [1800, 2200, 2000, 1500, 2500, 2300, 2000, 1800, 2400, 2100, 1900, 2200];
    const balance = ingresos.map((ing, i) => ing - gastos[i]);
    
    setChartData({
      series: [
        {
          name: 'Ingresos',
          type: 'column',
          data: ingresos
        },
        {
          name: 'Gastos',
          type: 'column',
          data: gastos
        },
        {
          name: 'Balance Neto',
          type: 'line',
          data: balance
        }
      ],
      options: {
        ...chartData.options
      }
    });
  };

  return (
    <div id="chart">
      <ReactApexChart 
        options={chartData.options} 
        series={chartData.series} 
        type="line" 
        height={350}
      />
    </div>
  );
};

export default IngresosGastosChart; 