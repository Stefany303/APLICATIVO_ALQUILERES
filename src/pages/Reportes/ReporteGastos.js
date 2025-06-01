/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react'
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { Table } from 'antd';
import { blogimg10, blogimg12, blogimg2, blogimg6, blogimg8, imagesend, pdficon, pdficon2, pdficon3, pdficon4, plusicon, refreshicon, searchnormal } from '../../components/imagepath';
import { DatePicker, Space } from 'antd';
import { FiChevronRight } from "react-icons/fi";
import {onShowSizeChange,itemRender}from  '../../components/Pagination'
import Select from "react-select";
import reporteService from '../../services/reporteService';
import inmuebleService from '../../services/inmuebleService';
import moment from 'moment';
import { message } from 'antd';
import * as XLSX from 'xlsx';
import { FileExcelOutlined } from '@ant-design/icons';
const ReporteGastos = () => {
    const [inmuebles, setInmuebles] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filtros, setFiltros] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        inmueble_id: '',
        tipo_gasto: ''
    });

    // Tipos de gastos
    const [tipoGastos, setTipoGastos] = useState([
        { value: '', label: "Todos los tipos" },
        { value: "Mantenimiento", label: "Mantenimiento" },
        { value: "Servicios", label: "Servicios" },
        { value: "Impuestos", label: "Impuestos" },
        { value: "Otros", label: "Otros" }
    ]);

    // Cargar inmuebles al iniciar
    useEffect(() => {
        const cargarInmuebles = async () => {
            try {
                const data = await inmuebleService.obtenerInmuebles();
                const opcionesInmuebles = data.map(inmueble => ({
                    value: inmueble.id,
                    label: inmueble.nombre
                }));
                
                // Agregar opción "Todos los inmuebles"
                opcionesInmuebles.unshift({ value: '', label: "Todos los inmuebles" });
                
                setInmuebles(opcionesInmuebles);
            } catch (error) {
                console.error('Error al cargar inmuebles:', error);
            }
        };

        cargarInmuebles();
    }, []);

    // Función para generar el reporte
    const generarReporte = async () => {
        setLoading(true);
        try {
            // Añadir incluir_estadisticas=true para obtener estadísticas
            const filtrosConEstadisticas = { ...filtros, incluir_estadisticas: 'true' };
            
            let response = null;
            try {
                response = await reporteService.generarReporteGastos(filtrosConEstadisticas);
            } catch (apiError) {
                console.error('Error en la llamada a la API:', apiError);
                setGastos([]);
                setEstadisticas(null);
                message.error('Error al obtener datos del servidor');
                setLoading(false);
                return;
            }
            
            // Validar la respuesta
            if (!response) {
                console.warn('La respuesta está vacía');
                setGastos([]);
                setEstadisticas(null);
                message.warning('No se encontraron datos');
                setLoading(false);
                return;
            }
            
            console.log('Datos recibidos del servidor:', response);
            
            // Extraer los datos según la estructura de la respuesta
            let datosGastos = [];
            let datosEstadisticas = null;
            
            if (response.datos && Array.isArray(response.datos)) {
                datosGastos = response.datos;
                datosEstadisticas = response.estadisticas || null;
                message.success('Datos actualizados correctamente');
            } else if (Array.isArray(response)) {
                datosGastos = response;
                message.success('Datos actualizados correctamente');
            } else if (typeof response === 'object') {
                // Intentar buscar un array en cualquier propiedad del objeto
                const posiblesArrays = Object.values(response).filter(val => Array.isArray(val));
                if (posiblesArrays.length > 0) {
                    // Usar el primer array encontrado
                    datosGastos = posiblesArrays[0];
                    // Buscar posibles estadísticas
                    const posibleEstadisticas = Object.values(response).find(val => 
                        val && typeof val === 'object' && !Array.isArray(val) && 'total_registros' in val
                    );
                    datosEstadisticas = posibleEstadisticas || null;
                    message.success('Datos actualizados correctamente');
                }
            }
            
            // Actualizar el estado
            setGastos(datosGastos);
            setEstadisticas(datosEstadisticas);
            
        } catch (error) {
            console.error('Error general al generar reporte de gastos:', error);
            setGastos([]);
            setEstadisticas(null);
            message.error('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    // Generar reporte al cargar el componente
    useEffect(() => {
        generarReporte();
    }, []);

    // Handler para cambios en las fechas
    const handleFechaInicio = (date) => {
        setFiltros({
            ...filtros,
            fecha_inicio: date ? date.format('YYYY-MM-DD') : ''
        });
    };

    const handleFechaFin = (date) => {
        setFiltros({
            ...filtros,
            fecha_fin: date ? date.format('YYYY-MM-DD') : ''
        });
    };

    // Handler para cambios en el inmueble seleccionado
    const handleInmuebleChange = (selectedOption) => {
        setFiltros({
            ...filtros,
            inmueble_id: selectedOption ? selectedOption.value : ''
        });
    };

    // Handler para cambios en el tipo de gasto
    const handleTipoGastoChange = (selectedOption) => {
        setFiltros({
            ...filtros,
            tipo_gasto: selectedOption ? selectedOption.value : ''
        });
    };

    // Handler para el botón de búsqueda
    const handleSearch = () => {
        generarReporte();
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    };

    const columns = [
        {
            title: "Nombre Inmueble",
            dataIndex: "nombre",
            sorter: (a, b) => a.nombre?.localeCompare(b.nombre),
        },
        {
            title: "Monto",
            dataIndex: "monto",
            sorter: (a, b) => parseFloat(a.monto || 0) - parseFloat(b.monto || 0),
            render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A")
        },
        // {
        //     title: "Metodo de Pago",
        //     dataIndex: "metodo_pago",
        //     sorter: (a, b) => a.metodo_pago?.localeCompare(b.metodo_pago)
        // },
        {
            title: "Tipo de Gasto",
            dataIndex: "tipo_gasto",
            sorter: (a, b) => a.tipo_gasto?.localeCompare(b.tipo_gasto)
        },
        {
            title: "Descripción",
            dataIndex: "descripcion",
            sorter: (a, b) => a.descripcion?.localeCompare(b.descripcion)
        },
        {
            title: "Fecha",
            dataIndex: "creado_en",
            sorter: (a, b) => new Date(a.creado_en) - new Date(b.creado_en),
            render: (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-PE") : "N/A"
        },
       { /*{
            title: "",
            dataIndex: "FIELD8",
            render: (text, record) => (
              <>
                <div className="text-end">
                  <div className="dropdown dropdown-action">
                    <Link
                      to="#"
                      className="action-icon dropdown-toggle"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fas fa-ellipsis-v" />
                    </Link>
                    <div className="dropdown-menu dropdown-menu-end">
                      <Link className="dropdown-item" to={`/edit-gasto/${record.id}`}>
                        <i className="far fa-edit me-2" />
                        Editar
                      </Link>
                      <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#delete_patient">
                       <i className="fa fa-trash-alt m-r-5"></i> Eliminar</Link>
                    </div>
                  </div>
                </div>
              </>
            ),
          },*/}
    ];

    const customStyles = {
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "#2e37a4" : "rgba(46, 55, 164, 0.1)",
          boxShadow: state.isFocused ? "0 0 0 1px #2e37a4" : "none",
          "&:hover": {
            borderColor: "#2e37a4",
          },
          borderRadius: "10px",
          fontSize: "14px",
          minHeight: "45px",
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          transform: state.selectProps.menuIsOpen ? "rotate(-180deg)" : "rotate(0)",
          transition: "250ms",
          width: "35px",
          height: "35px",
        }),
      };
      
    // Usar useMemo para garantizar que la propiedad dataSource siempre reciba un array válido
    const datosTabla = useMemo(() => {
        if (!gastos || !Array.isArray(gastos)) {
            console.warn('gastos no es un array:', gastos);
            return [];
        }
        
        return gastos.map(item => ({
            key: item.id || `gasto-${Math.random().toString(36).substring(2, 9)}`,
            ...item
        }));
    }, [gastos]);

    // Función para exportar a Excel
    const exportToExcel = () => {
        try {
            // Preparar los datos para Excel
            const dataForExcel = gastos.map(item => ({
                'Nombre Inmueble': item.nombre || '',
                'Monto': item.monto ? `S/ ${parseFloat(item.monto).toFixed(2)}` : 'N/A',
                'Tipo de Gasto': item.tipo_gasto || '',
                'Descripción': item.descripcion || '',
                'Fecha': item.creado_en ? new Date(item.creado_en).toLocaleDateString("es-PE") : 'N/A'
            }));

            // Agregar estadísticas si están disponibles
            if (estadisticas) {
                dataForExcel.push(
                    {},  // Fila vacía para separación
                    { 'Nombre Inmueble': 'RESUMEN ESTADÍSTICO' },
                    { 'Nombre Inmueble': 'Total Registros', 'Monto': estadisticas.total_registros },
                    { 'Nombre Inmueble': 'Monto Total', 'Monto': `S/ ${parseFloat(estadisticas.total_monto || 0).toFixed(2)}` }
                );

                // Agregar distribución por tipo
                if (estadisticas.gastos_por_tipo) {
                    dataForExcel.push(
                        {},  // Fila vacía
                        { 'Nombre Inmueble': 'DISTRIBUCIÓN POR TIPO' }
                    );
                    Object.entries(estadisticas.gastos_por_tipo).forEach(([tipo, data]) => {
                        if (data && typeof data === 'object') {
                            dataForExcel.push({
                                'Nombre Inmueble': tipo,
                                'Monto': `S/ ${parseFloat(data.monto_total || 0).toFixed(2)}`,
                                'Tipo de Gasto': `Cantidad: ${data.cantidad || 0}`
                            });
                        }
                    });
                }
            }

            // Crear libro de Excel
            const ws = XLSX.utils.json_to_sheet(dataForExcel);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Reporte de Gastos");

            // Generar nombre del archivo con fecha
            const fecha = moment().format('YYYY-MM-DD');
            const fileName = `Reporte_Gastos_${fecha}.xlsx`;

            // Guardar archivo
            XLSX.writeFile(wb, fileName);
            message.success('Reporte exportado exitosamente');
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            message.error('Error al exportar el reporte');
        }
    };

    return (
        <>
            <Header />
            <Sidebar id='menu-item6' id1='menu-items6' activeClassName='reporte-gastos' />
            <>
                <div>
                    <div className="page-wrapper">
                        <div className="content">
                            {/* Page Header */}
                            <div className="page-header">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <ul className="breadcrumb">
                                            <li className="breadcrumb-item">
                                               <Link to="#">Reporte
                                                </Link>
                                            </li>
                                            <li className="breadcrumb-item">
                                                <i className="feather-chevron-right" >
                                                    <FiChevronRight icon="chevron-right"/>
                                                    </i>

                                                </li>
                                            <li className="breadcrumb-item active">Gastos
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* /Page Header */}
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="card card-table show-entire">
                                        <div className="card-body">
                                            {/* Table Header */}
                                            <div className="page-table-header mb-2">
                                                <div className="row align-items-center">
                                                    <div className="col">
                                                        <div className="doctor-table-blk">
                                                            <h3>Lista de Gastos</h3>
                                                            <div className="doctor-search-blk">
                                                                
                                                                <div className="add-group">
                                                                    <Link to="/contabilidad-gastos" className="btn btn-primary add-pluss ms-2"><img src={plusicon} alt="#" /></Link>
                                                                   <Link to="#" className="btn btn-primary doctor-refresh ms-2" onClick={generarReporte}><img src={refreshicon} alt="#" /></Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-auto text-end float-end ms-auto download-grp">
                                                        <button
                                                            className="btn btn-outline-success ms-2"
                                                            onClick={exportToExcel}
                                                            title="Exportar a Excel"
                                                        >
                                                        <FileExcelOutlined />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* /Table Header */}
                                            <div className="staff-search-table">
                                                <form>
                                                    <div className="row">
                                                        <div className="col-12 col-md-6 col-xl-3">
                                                            <div className="form-group local-forms">
                                                                <label>Seleccionar Inmueble </label>
                                                                <Select
                                                                    options={inmuebles}
                                                                    onChange={handleInmuebleChange}
                                                                    menuPortalTarget={document.body}
                                                                    styles={customStyles}
                                                                    placeholder="Seleccionar inmueble"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6 col-xl-3">
                                                            <div className="form-group local-forms cal-icon">
                                                                <label>Desde</label>
                                                                <DatePicker 
                                                                    className="form-control datetimepicker" 
                                                                    onChange={handleFechaInicio}
                                                                    suffixIcon={null}
                                                                    format="DD/MM/YYYY"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6 col-xl-3">
                                                            <div className="form-group local-forms cal-icon">
                                                                <label>Hasta</label>
                                                                <DatePicker 
                                                                    className="form-control datetimepicker" 
                                                                    onChange={handleFechaFin}
                                                                    suffixIcon={null}
                                                                    format="DD/MM/YYYY"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6 col-xl-3">
                                                            <div className="form-group local-forms">
                                                                <label>Tipo de Gasto</label>
                                                                <Select
                                                                    options={tipoGastos}
                                                                    onChange={handleTipoGastoChange}
                                                                    menuPortalTarget={document.body}
                                                                    styles={customStyles}
                                                                    placeholder="Seleccionar tipo"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-12 col-md-6 col-xl-3 ms-auto">
                                                            <div className="doctor-submit">
                                                                <button type="button" className="btn btn-primary submit-form me-2" onClick={handleSearch}>
                                                                    Buscar
                                                                </button>
                                                                <button type="button" className="btn btn-primary filter-form" onClick={() => {
                                                                    setFiltros({
                                                                        fecha_inicio: '',
                                                                        fecha_fin: '',
                                                                        inmueble_id: '',
                                                                        tipo_gasto: ''
                                                                    });
                                                                    generarReporte();
                                                                }}>
                                                                    Limpiar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            
                                            {/* Estadísticas */}
                                            {estadisticas && (
                                                <div className="row mb-4">
                                                    <div className="col-md-4">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Total Registros</h5>
                                                                <p className="card-text h4">{estadisticas.total_registros || 0}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Monto Total</h5>
                                                                <p className="card-text h4">S/ {parseFloat(estadisticas.total_monto || 0).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="col-md-4">
                                                        <div className="card bg-light">
                                                            <div className="card-body">
                                                                <h5 className="card-title">Distribución por Tipo</h5>
                                                                <div style={{maxHeight: '100px', overflowY: 'auto'}}>
                                                                    {estadisticas.gastos_por_tipo && Object.entries(estadisticas.gastos_por_tipo).map(([tipo, data]) => {
                                                                        if (!data || typeof data !== 'object') return null;
                                                                        const monto = parseFloat(data.monto_total || 0);
                                                                        const cantidad = data.cantidad || 0;
                                                                        return (
                                                                            <div key={tipo} className="d-flex justify-content-between">
                                                                                <span>{tipo}:</span>
                                                                                <span>S/ {monto.toFixed(2)} ({cantidad})</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="table-responsive">
                                                <Table
                                                    pagination={{
                                                        total: datosTabla.length,
                                                        showTotal: (total, range) => `Mostrando ${range[0]} de ${range[1]} de ${total} entradas`,
                                                    }}
                                                    style={{ overflowX: 'auto' }}
                                                    columns={columns}
                                                    dataSource={datosTabla}
                                                    rowKey={record => record.key}
                                                    rowSelection={rowSelection}
                                                    loading={loading}
                                                    locale={{ emptyText: 'No hay datos disponibles' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </>
    )
}

export default ReporteGastos;
