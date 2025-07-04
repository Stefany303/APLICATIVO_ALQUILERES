/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { DatePicker, Modal } from "antd";
import { FiChevronRight, FiSearch, FiX, FiRefreshCw, FiPlusCircle, FiDollarSign, FiEdit, FiEye, FiFileText, FiTrash2, FiDownload, FiImage } from "react-icons/fi";
import Select from "react-select";
import { Table } from 'antd';
import { imagesend } from "../../components/imagepath";
import { Link } from 'react-router-dom';
import inmuebleService from '../../services/inmuebleService';
import gastoService from '../../services/gastoService';
import documentoService from '../../services/documentoService';
import moment from 'moment';
import { message } from "antd";

const ContabilidadGastos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    inmuebleId: '',
    concepto: '',
    monto: '',
    fechaGasto: '',
    categoria: '',
  });

  // Estados adicionales para DataTable y manejo de documentos
  const [gastos, setGastos] = useState([]);
  const [todosGastos, setTodosGastos] = useState([]); // Lista completa sin filtrar
  const [gastoSeleccionado, setGastoSeleccionado] = useState(null);
  const [documento, setDocumento] = useState(null);
  const [documentoError, setDocumentoError] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const fileInputRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalViewVisible, setModalViewVisible] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gastoVisualizando, setGastoVisualizando] = useState(null);
  const [eliminandoGasto, setEliminandoGasto] = useState(null);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  const [documentoExistente, setDocumentoExistente] = useState(null);

  // Estados para los filtros
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedInmueble, setSelectedInmueble] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const [inmuebles, setInmuebles] = useState([]);

  const categoriasGasto = [
    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
    { value: 'SERVICIOS', label: 'Servicios Públicos' },
    { value: 'REPARACIONES', label: 'Reparaciones' },
    { value: 'LIMPIEZA', label: 'Limpieza' },
    { value: 'SEGURIDAD', label: 'Seguridad' },
    { value: 'ADMINISTRATIVO', label: 'Gastos Administrativos' },
    { value: 'OTROS', label: 'Otros' }
  ];

  const meses = [
    { value: null, label: 'Todos los meses' },
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' }
  ];

  // Estilos comunes para todos los Select
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#ffffff !important',
      borderColor: state.isFocused ? '#007bff !important' : '#ced4da !important',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25) !important' : 'none !important',
      border: '1px solid #ced4da !important',
      minHeight: '38px !important',
      cursor: 'pointer !important',
      opacity: '1 !important',
      '&:hover': {
        borderColor: '#007bff !important'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      backgroundColor: '#ffffff !important',
      opacity: '1 !important'
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      backgroundColor: '#ffffff !important',
      opacity: '1 !important'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff !important' : state.isFocused ? '#e9ecef !important' : '#ffffff !important',
      color: state.isSelected ? '#ffffff !important' : '#1f2937 !important',
      cursor: 'pointer !important',
      opacity: '1 !important',
      '&:active': {
        backgroundColor: state.isSelected ? '#007bff !important' : '#dee2e6 !important'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1f2937 !important',
      opacity: '1 !important'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6c757d !important',
      opacity: '1 !important'
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#ffffff !important',
      border: '1px solid #ced4da !important',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1) !important',
      opacity: '1 !important',
      zIndex: 9999
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: '#ffffff !important',
      opacity: '1 !important'
    })
  };

  /* Estado de gasto no implementado en la base de datos todavía
  const estadosGasto = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'PAGADO', label: 'Pagado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];
  */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueblesData.map(inmueble => ({
          value: inmueble.id,
          label: inmueble.nombre
        })));

        // Cargar gastos
        await cargarTodosGastos();
      } catch (error) {
        // console.error('Error fetching data:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para aplicar todos los filtros localmente
  const aplicarFiltros = () => {
    let resultados = [...todosGastos];

    // Filtro por mes
    if (selectedMonth !== null) {
      resultados = resultados.filter(gasto => {
        if (!gasto.fecha) return false;
        const fechaGasto = new Date(gasto.fecha);
        return fechaGasto.getMonth() === selectedMonth;
      });
    }

    // Filtro por inmueble
    if (selectedInmueble !== null) {
      resultados = resultados.filter(gasto => {
        return gasto.inmueble_id === selectedInmueble;
      });
    }

    // Filtro por categoría
    if (selectedCategoria !== null) {
      resultados = resultados.filter(gasto => {
        return gasto.tipo_gasto === selectedCategoria;
      });
    }

    // Filtro por búsqueda de texto (concepto o inmueble)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      resultados = resultados.filter(gasto => {
        const concepto = (gasto.descripcion || '').toLowerCase();
        const inmueble = (gasto.inmueble_nombre || '').toLowerCase();
        return concepto.includes(searchLower) || inmueble.includes(searchLower);
      });
    }

    setGastos(resultados);
    return resultados;
  };

  // Función para cargar todos los gastos
  const cargarTodosGastos = async () => {
    try {
      setLoading2(true);
      
      const todosLosGastos = await gastoService.obtenerGastos();
      const gastosArray = Array.isArray(todosLosGastos) ? todosLosGastos : [];
      
      setTodosGastos(gastosArray);
      setGastos(gastosArray);
      
      // Si hay resultados, mostrar mensaje
      if (gastosArray.length > 0) {
        message.success(`Se cargaron ${gastosArray.length} gastos correctamente`);
      } else {
        message.info("No se encontraron gastos en el sistema");
      }
    } catch (error) {
      console.error('Error al cargar todos los gastos:', error);
      message.error('Error al cargar todos los gastos');
      setTodosGastos([]);
      setGastos([]);
    } finally {
      setLoading2(false);
    }
  };

  // Función para aplicar filtros manualmente
  const buscarGastos = () => {
    setLoading2(true);
    try {
      const resultados = aplicarFiltros();
      
      if (resultados.length === 0 && (searchTerm.trim() || selectedMonth !== null || selectedInmueble !== null || selectedCategoria !== null)) {
        message.warning('No se encontraron gastos con los filtros aplicados');
      } else if (resultados.length > 0 && (searchTerm.trim() || selectedMonth !== null || selectedInmueble !== null || selectedCategoria !== null)) {
        message.success(`Se encontraron ${resultados.length} gasto${resultados.length !== 1 ? 's' : ''} con los filtros aplicados`);
      } else if (resultados.length > 0) {
        message.info(`Mostrando todos los gastos (${resultados.length})`);
      }
    } finally {
      setLoading2(false);
    }
  };

  // Función para limpiar filtros y mostrar todos los gastos
  const limpiarFiltros = () => {
    setSearchTerm('');
    setSelectedMonth(null);
    setSelectedInmueble(null);
    setSelectedCategoria(null);
    
    // Mostrar todos los gastos sin filtros
    setGastos(todosGastos);
    
    message.success('Filtros limpiados. Mostrando todos los gastos.');
  };

  // Función para mostrar modal de nuevo gasto
  const mostrarModalNuevoGasto = () => {
    setGastoSeleccionado(null);
    setFormData({
      inmuebleId: '',
      concepto: '',
      monto: '',
      fechaGasto: '',
      categoria: '',
    });
    setDocumento(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setModalVisible(true);
  };

  // Función para cerrar modal
  const handleCancel = () => {
    setModalVisible(false);
    setGastoSeleccionado(null);
    setFormData({
      inmuebleId: '',
      concepto: '',
      monto: '',
      fechaGasto: '',
      categoria: '',
    });
    setDocumento(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para manejar el archivo seleccionado
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumento(file);
    }
  };

  // Función para crear o actualizar un gasto
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        // Validar campos obligatorios
        if (!formData.inmuebleId || !formData.concepto || !formData.monto || !formData.fechaGasto || !formData.categoria) {
            message.error('Por favor, complete todos los campos obligatorios');
            return;
        }

        // Validar que si hay documento, sea un PDF
        if (documento && documento.type !== 'application/pdf') {
            message.error('Solo se permiten archivos PDF como documentos de respaldo');
            return;
        }
        
        // Formatear fecha
        let fechaGastoFormateada = '';
        if (formData.fechaGasto) {
            const partes = formData.fechaGasto.split('/');
            if (partes.length === 3) {
                fechaGastoFormateada = `${partes[2]}-${partes[1]}-${partes[0]}`;
            } else {
                fechaGastoFormateada = formData.fechaGasto;
            }
        }
        
        // Datos del gasto
        const gastoData = {
            inmueble_id: formData.inmuebleId,
            concepto: formData.concepto,
            monto: formData.monto,
            fecha_gasto: fechaGastoFormateada,
            categoria: formData.categoria,
        };
        
        let gastoID;
        
        // Si es un gasto existente, actualizarlo
        if (gastoSeleccionado) {
            await gastoService.actualizarGasto(gastoSeleccionado.id, gastoData);
            gastoID = gastoSeleccionado.id;
            
            setUpdatedData({
                ...gastoData,
                inmueble_nombre: inmuebles.find(i => i.value === formData.inmuebleId)?.label || 'N/A'
            });
            
            setModalVisible(false);
            setShowSuccessModal(true);
        } else {
            // Si es un nuevo gasto, crearlo
            const respuestaGasto = await gastoService.crearGasto(gastoData);
            gastoID = respuestaGasto.id;
            message.success('Gasto registrado correctamente');
            handleCancel();
        }

        // Si hay documento, subirlo
        if (documento) {
            try {
                const respuestaArchivo = await documentoService.subirArchivo(
                    documento,
                    gastoID,
                    'gasto'
                );

                if (!respuestaArchivo || !respuestaArchivo.id) {
                    throw new Error('No se recibió una respuesta válida del servidor al subir el archivo');
                }

                message.success('Documento subido exitosamente');
                
                // Actualizar el documentoExistente con la nueva información
                setDocumentoExistente({
                    id: respuestaArchivo.id,
                    nombre: respuestaArchivo.nombre,
                    url: respuestaArchivo.url,
                    key: respuestaArchivo.key
                });
            } catch (docError) {
                console.error('Error al subir documento:', docError);
                message.error(`El gasto se registró correctamente, pero hubo un error al subir el documento: ${docError.message || ''}`);
            }
        }
        
        // Recargar datos
        await cargarTodosGastos();
        
        // Reaplicar filtros si hay filtros activos
        if (searchTerm || selectedMonth !== null || selectedInmueble !== null || selectedCategoria !== null) {
          setTimeout(() => {
            aplicarFiltros();
          }, 100);
        }
        
    } catch (error) {
        console.error('Error al registrar/actualizar el gasto:', error);
        message.error(`Error al ${gastoSeleccionado ? 'actualizar' : 'registrar'} el gasto`);
    }
};

  // Función para editar un gasto existente
  const editarGasto = async (gasto) => {
    setGastoSeleccionado(gasto);
    
    // Formatear fecha para el DatePicker (DD/MM/YYYY)
    let fechaFormateada = '';
    if (gasto.fecha) {
      const fecha = new Date(gasto.fecha);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      fechaFormateada = `${dia}/${mes}/${anio}`;
    }
    
    setFormData({
      inmuebleId: gasto.inmueble_id,
      concepto: gasto.descripcion || '',
      monto: gasto.monto || '',
      fechaGasto: fechaFormateada,
      categoria: gasto.tipo_gasto || '',
    });

    // Limpiar y preparar para posible cambio de documento
    setDocumento(null);
    setDocumentoExistente(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    
    // Buscar si hay un documento asociado
    try {
        const documentos = await documentoService.obtenerDocumentosPorTipo(gasto.id, 'gasto');
        if (documentos && documentos.length > 0) {
            setDocumentoExistente(documentos[0]);
        }
    } catch (error) {
        console.error("Error al obtener documento existente:", error);
    }
    
    setModalVisible(true);
  };

  // Función para ver documento
  const handleViewDocument = async (rutaDocumento) => {
    try {
        if (!rutaDocumento) {
            message.error('Ruta del documento no disponible');
            return;
        }
        
        // Extraer la key del documento de la ruta
        const key = rutaDocumento.split('/').pop();
        
        const response = await documentoService.verDocumento(key);
        if (response.url) {
            window.open(response.url, '_blank');
        } else {
            throw new Error('URL no disponible en la respuesta');
        }
    } catch (error) {
        console.error('Error al ver el documento:', error);
        message.error('Error al abrir el documento. Por favor, intente descargarlo.');
    }
  };

  // Función para descargar documento
  const handleDownloadDocument = async (rutaDocumento, nombreArchivo) => {
    try {
        if (!rutaDocumento) {
            message.error('Ruta del documento no disponible');
            return;
        }
        
        // Extraer la key del documento de la ruta
        const key = rutaDocumento.split('/').pop();
        
        const response = await documentoService.descargarDocumento(key);
        if (response.url) {
            // Crear un enlace temporal para la descarga
            const link = document.createElement('a');
            link.href = response.url;
            link.setAttribute('download', response.nombre || nombreArchivo || 'documento.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            throw new Error('URL no disponible en la respuesta');
        }
    } catch (error) {
        console.error('Error al descargar el documento:', error);
        message.error('Error al descargar el documento. Por favor, intente más tarde.');
    }
  };

  // Función para verificar si un archivo existe
  const verificarExistenciaArchivo = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error al verificar existencia del archivo:', error);
      return false;
    }
  };

  // Función para ver detalles de un gasto
  const verGasto = async (gasto) => {
    setGastoVisualizando(gasto);
    setDocumentoError(false);
    setLoadingDoc(true);
    
    try {
        const documentos = await documentoService.obtenerDocumentosPorTipo(gasto.id, 'gasto');
        
        if (documentos && documentos.length > 0) {
            const doc = documentos[0];
            
            setDocumento({
                id: doc.id,
                nombre: doc.nombre,
                url: doc.url,
                key: doc.key,
                tipo: doc.tipo || 'application/pdf'
            });
            
            setDocumentoError(false);
        } else {
            setDocumento(null);
        }
    } catch (error) {
        console.error('Error al obtener el documento:', error);
        setDocumento(null);
        setDocumentoError(true);
    } finally {
        setLoadingDoc(false);
    }
    
    setModalViewVisible(true);
  };

  // Función para validar la existencia del documento
  const validarDocumento = async (rutaDocumento) => {
    if (!rutaDocumento) {
      alert('La ruta del documento no está disponible');
      return false;
    }

    try {
      const existeArchivo = await verificarExistenciaArchivo(rutaDocumento);
      if (!existeArchivo) {
        alert('El documento no existe o no está accesible');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error al validar el documento:', error);
      alert('Error al verificar el documento');
      return false;
    }
  };

  // Función para abrir el documento en una nueva ventana pero preservando la sesión
  const abrirDocumentoEnNuevaVentana = (ruta) => {
    try {
      // Crear una nueva ventana y escribir contenido HTML para mostrar el documento
      const nuevaVentana = window.open('', '_blank');
      if (nuevaVentana) {
        nuevaVentana.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Visor de Documento</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
              .documento-container { width: 100%; height: 100%; }
              .pdf-viewer { width: 100%; height: 100%; border: none; }
              .image-viewer { max-width: 100%; max-height: 100%; display: block; margin: 0 auto; }
              .error-message { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100%; 
                font-family: Arial, sans-serif;
                color: #721c24;
                background-color: #f8d7da;
                padding: 20px;
                border-radius: 5px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="documento-container">
              <embed src="${ruta}" type="application/pdf" class="pdf-viewer" />
            </div>
          </body>
          </html>
        `);
        nuevaVentana.document.close();
      } else {
        alert('El navegador ha bloqueado la apertura de una nueva ventana. Por favor, permite las ventanas emergentes para este sitio.');
      }
    } catch (error) {
      console.error('Error al abrir el documento en nueva ventana:', error);
      alert('Ha ocurrido un error al intentar abrir el documento. Intenta descargarlo en su lugar.');
    }
  };

  // Funciones para el manejo de eliminación
  const confirmarEliminarGasto = (gasto) => {
    setEliminandoGasto(gasto);
    setModalDeleteVisible(true);
  };

  const eliminarGasto = async () => {
    if (!eliminandoGasto) return;
    
    try {
      await gastoService.eliminarGasto(eliminandoGasto.id);
      message.success('Gasto eliminado correctamente');
      setModalDeleteVisible(false);
      
      // Recargar datos
      await cargarTodosGastos();
      
      // Reaplicar filtros si hay filtros activos
      if (searchTerm || selectedMonth !== null || selectedInmueble !== null || selectedCategoria !== null) {
        setTimeout(() => {
          aplicarFiltros();
        }, 100);
      }
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      message.error('Error al eliminar el gasto');
    }
  };

  const cancelarEliminarGasto = () => {
    setEliminandoGasto(null);
    setModalDeleteVisible(false);
  };

  const handleCancelView = () => {
    setModalViewVisible(false);
    setGastoVisualizando(null);
    setDocumento(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (selected, action) => {
    setFormData(prev => ({
      ...prev,
      [action.name]: selected.value
    }));
  };

  const handleDateChange = (date, dateString) => {
    setFormData(prev => ({
      ...prev,
      fechaGasto: dateString
    }));
  };



  // Definición de columnas para la tabla
  const columns = [
    {
      title: "Categoría",
      dataIndex: "tipo_gasto",
      sorter: (a, b) => a.tipo_gasto?.localeCompare(b.tipo_gasto || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Inmueble",
      dataIndex: "inmueble_nombre",
      sorter: (a, b) => a.inmueble_nombre?.localeCompare(b.inmueble_nombre || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Concepto",
      dataIndex: "descripcion",
      sorter: (a, b) => a.descripcion?.localeCompare(b.descripcion || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Monto",
      dataIndex: "monto",
      sorter: (a, b) => (parseFloat(a.monto) || 0) - (parseFloat(b.monto) || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A"),
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      sorter: (a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="text-center">
          <button
            type="button"
            className="btn btn-sm btn-primary me-1"
            onClick={() => verGasto(record)}
            title="Ver"
          >
            <FiEye />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-warning me-1"
            onClick={() => editarGasto(record)}
            title="Editar"
          >
            <FiEdit />
          </button>
          
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => confirmarEliminarGasto(record)}
            title="Eliminar"
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const paginationComponentOptions = {
    rowsPerPageText: 'Filas por página:',
    rangeSeparatorText: 'de',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Todos',
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      // Validar campos requeridos
      const camposRequeridos = ['inmuebleId', 'concepto', 'monto', 'fechaGasto', 'categoria'];
      const camposFaltantes = camposRequeridos.filter(campo => !formData[campo]);
      
      if (camposFaltantes.length > 0) {
        message.error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
        return;
      }

      // Formatear fecha
      let fechaGastoFormateada = '';
      if (formData.fechaGasto) {
        const partes = formData.fechaGasto.split('/');
        if (partes.length === 3) {
          fechaGastoFormateada = `${partes[2]}-${partes[1]}-${partes[0]}`;
        } else {
          fechaGastoFormateada = formData.fechaGasto;
        }
      }

      // Preparar datos para actualizar
      const gastoData = {
        inmueble_id: formData.inmuebleId,
        concepto: formData.concepto,
        monto: formData.monto,
        fecha_gasto: fechaGastoFormateada,
        categoria: formData.categoria
      };

      // Actualizar el gasto
      await gastoService.actualizarGasto(gastoSeleccionado.id, gastoData);

      // Si hay un nuevo documento, subirlo para reemplazar el anterior
      if (documento) {
        try {
          const gastoID = gastoSeleccionado.id;
          const respuestaArchivo = await documentoService.subirArchivo(
            documento,
            gastoID,
            'gasto'
          );

          if (!respuestaArchivo || !respuestaArchivo.id) {
            throw new Error('No se recibió una respuesta válida del servidor al subir el archivo');
          }

          message.success('El documento se ha actualizado con éxito.');

        } catch (docError) {
          console.error('Error al subir el nuevo documento:', docError);
          message.error(`El gasto se actualizó, pero hubo un error al subir el nuevo documento.`);
        }
      }

      // Guardar los datos actualizados y mostrar el modal de éxito
      setUpdatedData({
        ...gastoData,
        inmueble_nombre: inmuebles.find(i => i.value === formData.inmuebleId)?.label || 'N/A'
      });
      setModalVisible(false);
      setShowSuccessModal(true);

      // Recargar la lista de gastos
      await cargarTodosGastos();
      
      // Reaplicar filtros si hay filtros activos
      if (searchTerm || selectedMonth !== null || selectedInmueble !== null || selectedCategoria !== null) {
        setTimeout(() => {
          aplicarFiltros();
        }, 100);
      }

    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      Modal.error({
        title: 'Error en la Actualización',
        content: `No se pudo actualizar el gasto: ${error.response?.data?.message || error.message || 'Error desconocido'}`,
        okText: 'Aceptar'
      });
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidebar id='menu-item6' id1='menu-items6' activeClassName='contabilidad-gastos'/>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Contabilidad</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FiChevronRight />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Gestión de Gastos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buscador y botón de nuevo gasto */}
          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3>Gastos registrados</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <span className="text-muted">
                                {loading2 ? 'Cargando...' : 
                                  gastos.length === todosGastos.length ? 
                                  `Mostrando todos los gastos (${todosGastos.length})` :
                                  `Mostrando ${gastos.length} de ${todosGastos.length} gastos filtrados`
                                }
                              </span>
                            </div>
                            <div className="add-group">
                              <button
                                className="btn btn-primary doctor-refresh ms-2"
                                onClick={cargarTodosGastos}
                                title="Actualizar datos"
                                disabled={loading2}
                              >
                                {loading2 ? (
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                  <i className="fas fa-sync-alt"></i>
                                )}
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-primary ms-2"
                                onClick={mostrarModalNuevoGasto}
                              >
                                <FiPlusCircle className="me-2" /> Nuevo Gasto
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección de filtros */}
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="bg-light p-3 rounded">
                        <h5 className="mb-3">
                          <FiSearch className="me-2" />
                          Filtros de Búsqueda
                        </h5>
                        <div className="row">
                          <div className="col-12 col-md-3">
                            <div className="form-group">
                              <label>Mes</label>
                              <Select
                                options={meses}
                                value={meses.find(m => m.value === selectedMonth)}
                                onChange={(selected) => setSelectedMonth(selected.value)}
                                placeholder="Seleccionar mes"
                                isClearable={false}
                                classNamePrefix="custom-select"
                                styles={selectStyles}
                              />
                            </div>
                          </div>
                          
                          <div className="col-12 col-md-3">
                            <div className="form-group">
                              <label>Inmueble</label>
                              <Select
                                options={[
                                  { value: null, label: 'Todos los inmuebles' },
                                  ...inmuebles
                                ]}
                                value={inmuebles.find(i => i.value === selectedInmueble) || { value: null, label: 'Todos los inmuebles' }}
                                onChange={(selected) => setSelectedInmueble(selected.value)}
                                placeholder="Seleccionar inmueble"
                                isClearable={false}
                                classNamePrefix="custom-select"
                                styles={selectStyles}
                              />
                            </div>
                          </div>
                          
                          <div className="col-12 col-md-3">
                            <div className="form-group">
                              <label>Categoría</label>
                              <Select
                                options={[
                                  { value: null, label: 'Todas las categorías' },
                                  ...categoriasGasto
                                ]}
                                value={categoriasGasto.find(c => c.value === selectedCategoria) || { value: null, label: 'Todas las categorías' }}
                                onChange={(selected) => setSelectedCategoria(selected.value)}
                                placeholder="Seleccionar categoría"
                                isClearable={false}
                                classNamePrefix="custom-select"
                                styles={selectStyles}
                              />
                            </div>
                          </div>
                          
                          <div className="col-12 col-md-3">
                            <div className="form-group">
                              <label>Término de búsqueda</label>
                              <input
                                type="text"
                                className="form-control"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    buscarGastos();
                                  }
                                }}
                                placeholder="Buscar por concepto o inmueble"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="d-flex gap-2">
                              <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={buscarGastos}
                                disabled={loading2}
                              >
                                {loading2 ? (
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                ) : (
                                  <FiSearch className="me-1" />
                                )}
                                Aplicar Filtros
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={limpiarFiltros}
                                disabled={!searchTerm && selectedMonth === null && selectedInmueble === null && selectedCategoria === null}
                              >
                                <FiX className="me-1" />
                                Limpiar Filtros
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* DataTable de gastos */}
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="table-responsive doctor-list">
                        <Table
                          columns={columns}
                          dataSource={Array.isArray(gastos) ? gastos : []}
                          rowKey="id"
                          pagination={{
                            total: gastos.length,
                            pageSize: 10,
                            showTotal: (total, range) =>
                              `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
                          }}
                          loading={loading2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar gasto - CORRECCIONES APLICADAS */}
      <Modal
        title={
          <span>
            {gastoSeleccionado ? (
              <><FiEdit className="me-2" /> Editar Gasto</>
            ) : (
              <><FiPlusCircle className="me-2" /> Nuevo Gasto</>
            )}
          </span>
        }
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose={true}
        centered
        maskClosable={false}
        style={{ zIndex: 1000 }}  // Asegurar z-index adecuado
      >
        <form onSubmit={gastoSeleccionado ? handleSubmitEdit : handleSubmit}>
          <div className="row">
            {/* CAMPO INMUEBLE - CORREGIDO */}
            <div className="col-12 col-md-6">
              <div className="form-group local-forms" style={{ position: 'relative', zIndex: 1 }}>
                <label className="form-label-highlight">
                  Inmueble
                  <span className="login-danger">*</span>
                </label>
                <Select
                  name="inmuebleId"
                  options={inmuebles}
                  onChange={handleSelectChange}
                  styles={selectStyles}
                  placeholder="Seleccionar inmueble"
                  value={inmuebles.find(i => i.value === formData.inmuebleId) || null}
                  required
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            </div>
            
            {/* CAMPO CONCEPTO */}
            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label className="form-label-highlight">
                  Concepto
                  <span className="login-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleChange}
                  placeholder="Ingrese el concepto del gasto"
                  required
                />
              </div>
            </div>
            
            {/* CAMPO FECHA */}
            <div className="col-12 col-md-6">
              <div className="form-group local-forms cal-icon">
                <label className="form-label-highlight">
                  Fecha del Gasto
                  <span className="login-danger">*</span>
                </label>
                <DatePicker
                  className="form-control datetimepicker"
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  placeholder="Seleccionar fecha"
                  value={formData.fechaGasto ? moment(formData.fechaGasto, 'DD/MM/YYYY') : null}
                  required
                />
              </div>
            </div>
            
            {/* CAMPO MONTO */}
            <div className="col-12 col-md-6">
              <div className="form-group local-forms">
                <label className="form-label-highlight">
                  Monto
                  <span className="login-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="Ingrese el monto"
                  required
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            {/* CAMPO CATEGORÍA - CORREGIDO */}
            <div className="col-12 col-md-6">
              <div className="form-group local-forms" style={{ position: 'relative', zIndex: 1 }}>
                <label className="form-label-highlight">
                  Categoría
                  <span className="login-danger">*</span>
                </label>
                <Select
                  name="categoria"
                  options={categoriasGasto}
                  onChange={handleSelectChange}
                  styles={selectStyles}
                  placeholder="Seleccionar categoría"
                  value={categoriasGasto.find(c => c.value === formData.categoria) || null}
                  required
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            </div>
            
            {/* CAMPO DOCUMENTO */}
            <div className="col-12">
              <div className="form-group local-forms">
                <label>Documento de Respaldo</label>

                {/* Mostrar documento existente si estamos editando */}
                {gastoSeleccionado && documentoExistente && (
                  <div className="alert alert-info p-2 mt-2">
                    <p className="mb-0">
                      <FiFileText className="me-2" />
                      Documento actual: <strong>{documentoExistente.nombre}</strong>
                    </p>
                    <small>Para reemplazarlo, simplemente seleccione un nuevo archivo.</small>
                  </div>
                )}

                <input
                  type="file"
                  className="form-control mt-2"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept=".pdf"
                />
                <small className="form-text text-muted">
                  Suba un documento de respaldo para este gasto (factura, comprobante, etc.). Solo se admiten archivos PDF.
                </small>
              </div>
            </div>
            
            {/* BOTONES */}
            <div className="col-12">
              <div className="doctor-submit text-end">
                <button
                  type="submit"
                  className="btn btn-primary submit-form me-2"
                >
                  {gastoSeleccionado ? 'Actualizar Gasto' : 'Registrar Gasto'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary cancel-form"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal para ver detalles de gasto */}
      <Modal
        title={<><FiEye className="me-2" /> Detalles del Gasto</>}
        open={modalViewVisible}
        onCancel={handleCancelView}
        footer={[
          <button 
            key="close" 
            type="button"
            className="btn btn-secondary"
            onClick={handleCancelView}
          >
            <FiX className="me-1" /> Cerrar
          </button>
        ]}
        width={800}
        destroyOnClose={true}
        centered
        maskClosable={false}
      >
        {gastoVisualizando && (
          <div className="row">
            <div className="col-12 mb-4">
              <h5 className="text-primary">Información del Gasto</h5>
              <hr />
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Inmueble:</strong> {gastoVisualizando.inmueble_nombre || ''}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Concepto:</strong> {gastoVisualizando.descripcion || ''}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Monto:</strong> S/ {parseFloat(gastoVisualizando.monto).toFixed(2)}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Fecha:</strong> {gastoVisualizando.fecha ? new Date(gastoVisualizando.fecha).toLocaleDateString() : ''}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Categoría:</strong> {gastoVisualizando.tipo_gasto || ''}</p>
                </div>
              </div>
            </div>
            
            {documento && (
              <div className="col-12">
                <h5 className="text-primary">Documento Adjunto</h5>
                <hr />
                {loadingDoc && (
                  <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Buscando documento...</p>
                  </div>
                )}
                
                {!loadingDoc && (
                  <div className="document-container p-3 border rounded">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="document-info d-flex align-items-center">
                        <span className="document-icon me-3">
                          {documento.tipo === 'imagen' ? (
                            <FiImage size={24} className="text-primary" />
                          ) : (
                            <FiFileText size={24} className="text-primary" />
                          )}
                        </span>
                        <span className="document-name">
                          {documento.nombre}
                          {documentoError && (
                            <span className="text-danger ms-2">(No disponible)</span>
                          )}
                        </span>
                      </div>
                      {!documentoError && (
                        <div className="document-actions">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleDownloadDocument(documento.key, documento.nombre)}
                          >
                            <FiDownload className="me-1" /> Descargar
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewDocument(documento.key)}
                          >
                            <FiEye className="me-1" /> Ver documento
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Mensaje de error si el documento no está disponible */}
                    {documentoError && (
                      <div className="alert alert-warning">
                        <p className="mb-0">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          El documento no se encuentra disponible en estos momentos.
                        </p>
                        <p className="small mb-0 mt-2">
                          Esto puede deberse a que:
                        </p>
                        <ul className="small mb-0">
                          <li>El documento fue eliminado o movido</li>
                          <li>No tienes permisos para acceder al documento</li>
                          <li>La ruta del documento es incorrecta</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        title={<><FiTrash2 className="me-2 text-danger" /> Confirmar Eliminación</>}
        open={modalDeleteVisible}
        onCancel={cancelarEliminarGasto}
        footer={[
          <button 
            key="cancel" 
            type="button"
            className="btn btn-secondary me-2"
            onClick={cancelarEliminarGasto}
          >
            Cancelar
          </button>,
          <button 
            key="delete" 
            type="button"
            className="btn btn-danger"
            onClick={eliminarGasto}
          >
            Eliminar
          </button>
        ]}
        width={500}
        destroyOnClose={true}
        centered
        maskClosable={false}
      >
        {eliminandoGasto && (
          <div className="text-center">
            <div className="mb-4">
              <FiTrash2 size={50} className="text-danger" />
            </div>
            <h4>¿Está seguro de eliminar este gasto?</h4>
            <p>Concepto: <strong>{eliminandoGasto.concepto}</strong></p>
            <p>Monto: <strong>S/ {parseFloat(eliminandoGasto.monto).toFixed(2)}</strong></p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
        )}
      </Modal>

      {/* Modal de éxito */}
      <Modal
        title="¡Actualización Exitosa!"
        open={showSuccessModal}
        onOk={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
        okText="Aceptar"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div>
          <p>El gasto se ha actualizado correctamente con los siguientes datos:</p>
          {updatedData && (
            <ul style={{ listStyleType: 'none', padding: '10px' }}>
              <li><strong>Inmueble:</strong> {updatedData.inmueble_nombre}</li>
              <li><strong>Concepto:</strong> {updatedData.concepto}</li>
              <li><strong>Monto:</strong> S/ {parseFloat(updatedData.monto).toFixed(2)}</li>
              <li><strong>Fecha:</strong> {updatedData.fecha_gasto}</li>
              <li><strong>Categoría:</strong> {updatedData.categoria}</li>
            </ul>
          )}
        </div>
      </Modal>

      {/* Estilos adicionales para resolver problemas de superposición */}
      <style>{`
        /* Solución para labels superpuestos */
        .form-label-highlight {
          position: relative;
          z-index: 1;
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        /* Fondo sólido para selects */
        .react-select__control {
          background-color: white !important;
        }
        
        /* Ajuste de z-index para modales */
        .ant-modal-wrap {
          z-index: 1050 !important;
        }
        
        .ant-modal {
          z-index: 1051 !important;
        }
        
        /* Mejoras visuales para selects */
        .react-select__menu {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          border-radius: 8px !important;
          border: 1px solid #e8e8e8 !important;
        }
        
        .react-select__option {
          padding: 8px 12px !important;
        }
      `}</style>
    </>
  );
};

export default ContabilidadGastos;
