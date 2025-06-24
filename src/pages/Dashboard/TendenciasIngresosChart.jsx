import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import 'moment/locale/es';
import pagoService from '../../services/pagoService';

// Configurar moment para usar español
moment.locale('es');

const TendenciasIngresosChart = ({ ingresos, ingresosPrevistos, selectedYear }) => {
  const [eficienciaPagos, setEficienciaPagos] = useState({});
  const [pagosPrevistosCalculados, setPagosPrevistosCalculados] = useState({});
  const [pagosActualesCalculados, setPagosActualesCalculados] = useState({});
  
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
        width: [3, 3, 2],
        dashArray: [0, 5, 0]
      },
      colors: ['#2E37A4', '#00A389', '#FFC107'],
      title: {
        text: `Análisis de Ingresos y Eficiencia (${selectedYear})`,
        align: 'left',
        style: {
          fontSize: '16px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600
        }
      },
      subtitle: {
        text: 'Previstos: pagos pendientes + pagados | Actuales: solo pagos efectuados',
        align: 'left',
        style: {
          fontSize: '12px',
          color: '#666'
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
        size: [4, 4, 3]
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
      yaxis: [
        {
          seriesName: ['Ingresos Actuales', 'Ingresos Previstos'],
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
        {
          seriesName: 'Eficiencia de Cobro',
          opposite: true,
          title: {
            text: 'Eficiencia de Cobro (%)'
          },
          min: 0,
          max: 100,
          labels: {
            formatter: function(val) {
              return val.toFixed(0) + '%';
            }
          }
        }
      ],
      tooltip: {
        shared: true,
        y: [
          {
            formatter: function(val) {
              return 'S/ ' + val.toFixed(2);
            }
          },
          {
            formatter: function(val) {
              return 'S/ ' + val.toFixed(2);
            }
          },
          {
            formatter: function(val) {
              return val.toFixed(1) + '%';
            }
          }
        ]
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetY: -10
      }
    }
  });

  // Función para cargar ingresos previstos y actuales desde pagos
  const cargarDatosPagos = async () => {
    try {
      const todosLosPagos = await pagoService.obtenerPagos();
      
      if (Array.isArray(todosLosPagos)) {
        const ingresosPrevistosCalculados = {};
        const ingresosActualesCalculados = {};
        
        todosLosPagos.forEach(pago => {
          if (pago.fecha_pago) {
            const fechaPago = moment(pago.fecha_pago);
            const mesKey = fechaPago.format('YYYY-MM');
            const año = fechaPago.year();
            const estado = pago.estado?.toLowerCase();
            const monto = parseFloat(pago.monto || 0);
            
            if (año === selectedYear) {
              // Ingresos Previstos: pagos "pendiente" + "pagado"
              if (estado === 'pendiente' || estado === 'pagado') {
                if (!ingresosPrevistosCalculados[mesKey]) {
                  ingresosPrevistosCalculados[mesKey] = 0;
                }
                ingresosPrevistosCalculados[mesKey] += monto;
              }
              
              // Ingresos Actuales: solo pagos "pagado"
              if (estado === 'pagado') {
                if (!ingresosActualesCalculados[mesKey]) {
                  ingresosActualesCalculados[mesKey] = 0;
                }
                ingresosActualesCalculados[mesKey] += monto;
              }
            }
          }
        });
        
        setPagosPrevistosCalculados(ingresosPrevistosCalculados);
        setPagosActualesCalculados(ingresosActualesCalculados);
      }
    } catch (error) {
      console.error('Error al cargar datos de pagos:', error);
    }
  };

  // Función para cargar eficiencia de pagos
  const cargarEficienciaPagos = async () => {
    try {
      const todosLosPagos = await pagoService.obtenerPagos();
      
      if (Array.isArray(todosLosPagos)) {
        const eficienciaPorMes = {};
        
        todosLosPagos.forEach(pago => {
          if (pago.fecha_pago) {
            const fechaPago = moment(pago.fecha_pago);
            const mesKey = fechaPago.format('YYYY-MM');
            const año = fechaPago.year();
            
            if (año === selectedYear) {
              if (!eficienciaPorMes[mesKey]) {
                eficienciaPorMes[mesKey] = { total: 0, pagados: 0 };
              }
              
              eficienciaPorMes[mesKey].total++;
              if (pago.estado?.toLowerCase() === 'pagado') {
                eficienciaPorMes[mesKey].pagados++;
              }
            }
          }
        });
        
        // Calcular porcentajes
        Object.keys(eficienciaPorMes).forEach(mes => {
          const { total, pagados } = eficienciaPorMes[mes];
          eficienciaPorMes[mes].porcentaje = total > 0 ? (pagados / total) * 100 : 0;
        });
        
        setEficienciaPagos(eficienciaPorMes);
      }
    } catch (error) {
      console.error('Error al cargar eficiencia de pagos:', error);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([
        cargarEficienciaPagos(),
        cargarDatosPagos()
      ]);
    };
    
    cargarDatos();
  }, [selectedYear]);

  useEffect(() => {
    // Obtener meses únicos desde los datos calculados de pagos
    const mesesSet = new Set();
    
    // Agregar meses de ingresos actuales calculados
    Object.keys(pagosActualesCalculados).forEach(mes => mesesSet.add(mes));
    
    // Agregar meses de ingresos previstos calculados
    Object.keys(pagosPrevistosCalculados).forEach(mes => mesesSet.add(mes));
    
    // Si no hay datos calculados, generar meses del año seleccionado
    if (mesesSet.size === 0) {
      for (let i = 1; i <= 12; i++) {
        const mes = String(i).padStart(2, '0');
        mesesSet.add(`${selectedYear}-${mes}`);
      }
    }

    // Convertir a array y ordenar cronológicamente (YYYY-MM string)
    const mesesArray = Array.from(mesesSet).sort((a, b) => a.localeCompare(b));

    // Formatear cada "YYYY-MM" a "MMM-YY"
    const categorias = mesesArray.map(m =>
      moment(m, 'YYYY-MM').format('MMM-YY')
    );

    // Construir serie de ingresos actuales (solo pagos "pagado")
    const datosActual = mesesArray.map(m => {
      return pagosActualesCalculados[m] || 0;
    });

    // Construir serie de ingresos previstos (pagos "pendiente" + "pagado")
    const datosPrevisto = mesesArray.map(m => {
      return pagosPrevistosCalculados[m] || 0;
    });

    // Construir serie de eficiencia de pagos
    const datosEficiencia = mesesArray.map(m => {
      return eficienciaPagos[m]?.porcentaje || 0;
    });

    setChartData(prev => ({
      series: [
        {
          name: 'Ingresos Actuales',
          data: datosActual,
          yAxisIndex: 0
        },
        {
          name: 'Ingresos Previstos',
          data: datosPrevisto,
          yAxisIndex: 0
        },
        {
          name: 'Eficiencia de Cobro',
          data: datosEficiencia,
          yAxisIndex: 1
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
  }, [selectedYear, eficienciaPagos, pagosPrevistosCalculados, pagosActualesCalculados]);

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
