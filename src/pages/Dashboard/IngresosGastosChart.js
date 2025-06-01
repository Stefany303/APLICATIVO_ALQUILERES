import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import 'moment/locale/es';
import Select from 'react-select';

moment.locale('es');

const IngresosGastosChart = ({ ingresos, gastos, selectedYear, onYearChange }) => {
  // Opciones de año (desde 2025 hacia atrás)
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: 2025 - i,
    label: (2025 - i).toString()
  }));

  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'line',
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
            reset: false,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [0, 0, 4],
        curve: 'smooth',
      },
      colors: ['#00A389', '#FF5722', '#2E37A4'],
      title: {
        text: 'Ingresos vs Gastos Mensuales',
        align: 'left',
        style: {
          fontSize: '16px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
        },
      },
      grid: {
        borderColor: '#f1f1f1',
        padding: {
          bottom: 15,
        },
      },
      fill: {
        opacity: [0.85, 0.85, 1],
        type: ['solid', 'solid', 'gradient'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 50, 100],
          colorStops: [],
        },
      },
      markers: {
        size: [0, 0, 5],
        colors: ['#00A389', '#FF5722', '#2E37A4'],
        strokeColors: '#fff',
        strokeWidth: 2,
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Mes',
        },
      },
      yaxis: [
        {
          title: {
            text: 'Monto (S/)',
          },
          min: 0,
          labels: {
            formatter: function (val) {
              return 'S/ ' + val.toFixed(0);
            },
          },
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val) {
            return 'S/ ' + val.toFixed(2);
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetY: -10,
      },
    },
  });

  useEffect(() => {
    console.log("Datos para gráfico de ingresos/gastos:", { ingresos, gastos, selectedYear });
    if (
      (Array.isArray(ingresos) && ingresos.length > 0) ||
      (Array.isArray(gastos) && gastos.length > 0)
    ) {
      procesarDatos(ingresos || [], gastos || []);
    } else {
      mostrarSinDatos();
    }
  }, [ingresos, gastos, selectedYear]);

  const procesarDatos = (datosIngresos, datosGastos) => {
    try {
      const ingresosPorMes = new Array(12).fill(0);
      const gastosPorMes = new Array(12).fill(0);
      const meses = moment.monthsShort();

      datosIngresos.forEach((item) => {
        if (item.mes) {
          const [year, month] = item.mes.split('-');
          if (year === String(selectedYear)) {
            const idx = parseInt(month, 10) - 1;
            if (idx >= 0 && idx < 12) {
              ingresosPorMes[idx] += parseFloat(item.total_ingresos || 0);
            }
          }
        }
      });

      datosGastos.forEach((item) => {
        if (item.mes) {
          const [year, month] = item.mes.split('-');
          if (year === String(selectedYear)) {
            const idx = parseInt(month, 10) - 1;
            if (idx >= 0 && idx < 12) {
              gastosPorMes[idx] += parseFloat(item.total_gastos || 0);
            }
          }
        }
      });

      const balanceNeto = ingresosPorMes.map((ing, i) => ing - gastosPorMes[i]);
      const maxIngresos = Math.max(...ingresosPorMes);
      const maxGastos = Math.max(...gastosPorMes);
      const maxBalance = Math.max(...balanceNeto.map((v) => Math.abs(v)));
      const maxValue = Math.max(maxIngresos, maxGastos, maxBalance);

      if (maxValue <= 0) {
        console.log("No hay datos significativos");
        mostrarSinDatos();
        return;
      }

      const nuevasSeries = [
        {
          name: 'Ingresos',
          type: 'column',
          data: ingresosPorMes,
        },
        {
          name: 'Gastos',
          type: 'column',
          data: gastosPorMes,
        },
        {
          name: 'Balance Neto',
          type: 'line',
          data: balanceNeto,
        },
      ];

      setChartData((prev) => ({
        series: nuevasSeries,
        options: {
          ...prev.options,
          chart: {
            ...prev.options.chart,
            type: 'line',
          },
          xaxis: {
            ...prev.options.xaxis,
            categories: meses,
          },
          yaxis: [
            {
              title: {
                text: 'Monto (S/)',
              },
              min: 0,
              max: Math.ceil(maxValue * 1.2),
              labels: {
                formatter: function (val) {
                  return 'S/ ' + val.toFixed(0);
                },
              },
            },
          ],
        },
      }));
    } catch (err) {
      console.error('Error al procesar datos de ingresos y gastos:', err);
      mostrarSinDatos();
    }
  };

  const mostrarSinDatos = () => {
    const meses = moment.monthsShort();
    setChartData((prev) => ({
      series: [
        { name: 'Ingresos', type: 'column', data: [] },
        { name: 'Gastos', type: 'column', data: [] },
        { name: 'Balance Neto', type: 'line', data: [] }
      ],
      options: {
        ...prev.options,
        chart: {
          ...prev.options.chart,
          type: 'line',
        },
        xaxis: {
          ...prev.options.xaxis,
          categories: meses,
        },
        yaxis: [
          {
            ...prev.options.yaxis[0],
            max: 1000,
          },
        ],
        annotations: {
          points: [{
            x: 5,
            y: 500,
            marker: {
              size: 0
            },
            label: {
              text: 'No hay datos disponibles',
              style: {
                color: '#666',
                fontSize: '14px'
              }
            }
          }]
        }
      },
    }));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Análisis Financiero ({selectedYear})</h4>
        <Select
          className="custom-react-select"
          defaultValue={yearOptions.find(opt => opt.value === selectedYear)}
          onChange={(opt) => onYearChange(opt.value)}
          options={yearOptions}
          components={{ IndicatorSeparator: () => null }}
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
              boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
              borderRadius: '10px',
              fontSize: '14px',
              minHeight: '40px'
            }),
            dropdownIndicator: (base, state) => ({
              ...base,
              transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
              transition: '250ms',
              width: '30px',
              height: '30px'
            })
          }}
        />
      </div>
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={350}
        />
      </div>
    </div>
  );
};

export default IngresosGastosChart;
