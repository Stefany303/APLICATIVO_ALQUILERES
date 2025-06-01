import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const InquilinosChart = ({ espaciosData }) => {
  const [chartData, setChartData] = useState({
    series: [0, 0],
    options: {
      chart: {
        type: 'donut',
        height: 350,
        toolbar: { show: false },
      },
      labels: ['Ocupados', 'Disponibles'],
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
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
                formatter: (val) => val + '%',
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2E37A4',
                formatter: () => '100%',
              },
            },
          },
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (value, { seriesIndex }) => {
            const cantidad = seriesIndex === 0 
              ? parseInt(espaciosData.ocupados || 0) 
              : parseInt(espaciosData.disponibles || 0);
            return `${value}% (${cantidad} espacios)`;
          },
        },
      },
      colors: ['#2E37A4', '#FF9800'],
      responsive: [
        {
          breakpoint: 575,
          options: {
            chart: { height: 250 },
            legend: { position: 'bottom' },
          },
        },
      ],
    },
  });

  useEffect(() => {
    const ocupados = parseInt(espaciosData.ocupados || 0);
    const disponibles = parseInt(espaciosData.disponibles || 0);
    const total = ocupados + disponibles;

    if (total <= 0) {
      setChartData((prev) => ({
        ...prev,
        series: [100],
        options: {
          ...prev.options,
          labels: ['Sin datos'],
          colors: ['#E0E0E0'],
          plotOptions: {
            ...prev.options.plotOptions,
            pie: {
              ...prev.options.plotOptions.pie,
              donut: {
                ...prev.options.plotOptions.pie.donut,
                labels: {
                  ...prev.options.plotOptions.pie.donut.labels,
                  total: {
                    ...prev.options.plotOptions.pie.donut.labels.total,
                    formatter: () => 'N/A',
                  },
                },
              },
            },
          },
          tooltip: {
            ...prev.options.tooltip,
            y: {
              formatter: () => 'No hay datos',
            },
          },
        },
      }));
      return;
    }

    const pctOcupados = Math.round((ocupados / total) * 100);
    const pctDisponibles = 100 - pctOcupados;

    setChartData((prev) => ({
      ...prev,
      series: [pctOcupados, pctDisponibles],
      options: {
        ...prev.options,
        labels: ['Ocupados', 'Disponibles'],
        colors: ['#2E37A4', '#FF9800'],
        plotOptions: {
          ...prev.options.plotOptions,
          pie: {
            ...prev.options.plotOptions.pie,
            donut: {
              ...prev.options.plotOptions.pie.donut,
              labels: {
                ...prev.options.plotOptions.pie.donut.labels,
                total: {
                  ...prev.options.plotOptions.pie.donut.labels.total,
                  formatter: () => `${pctOcupados + pctDisponibles}%`,
                },
              },
            },
          },
        },
        tooltip: {
          ...prev.options.tooltip,
          y: {
            formatter: (value, { seriesIndex }) => {
              const cantidad = seriesIndex === 0 ? ocupados : disponibles;
              return `${value}% (${cantidad} espacios)`;
            },
          },
        },
      },
    }));
  }, [espaciosData]);

  return (
    <div id="inquilinos-chart">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="donut"
        height={350}
      />
    </div>
  );
};

export default InquilinosChart;
