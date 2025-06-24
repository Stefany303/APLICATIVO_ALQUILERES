/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { DatePicker, Modal, Button, Table } from "antd";
import { message } from "antd";
import { FiChevronRight, FiSearch, FiX, FiRefreshCw, FiDollarSign, FiEdit, FiEye, FiFileText, FiImage, FiDownload } from "react-icons/fi";
import Select from "react-select";
import { imagesend } from "../../components/imagepath";
import { Link } from 'react-router-dom';
import espacioService from '../../services/espacioService';
import inmuebleService from '../../services/inmuebleService';
import personaService from '../../services/personaService';
import pisoService from '../../services/pisoService';
import pagoService from '../../services/pagoService';
import documentoService from '../../services/documentoService';
import '@fortawesome/fontawesome-free/css/all.min.css';
import moment from 'moment';
import "../../assets/styles/select-components.css";
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../components/imagepath';
import contratoService from '../../services/contratoService';

const ContabilidadPagos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    inmueble_id: '',
    piso_id: '',
    espacioId: '',
    inquilinoId: '',
    monto: '',
    fechaPago: '',
    fechaRealPago: '',
    metodoPago: '',
    estado: '',
    observaciones: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('dni'); // 'dni' o 'nombre'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Obtener fecha actual en horario de Lima/Peru
    const limaTime = new Date().toLocaleString("en-US", { timeZone: "America/Lima" });
    return new Date(limaTime).getMonth(); // 0-11
  });
  const [inmuebles, setInmuebles] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [loading2, setLoading2] = useState(false);
  const [documento, setDocumento] = useState(null);
  const [documentoUrl, setDocumentoUrl] = useState("");
  const [documentoError, setDocumentoError] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const fileInputRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalViewVisible, setModalViewVisible] = useState(false);
  const [pagoVisualizando, setPagoVisualizando] = useState(null);
  const [modalRegistroVisible, setModalRegistroVisible] = useState(false);
  const [pagoARegistrar, setPagoARegistrar] = useState(null);
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [metodoPagoRegistro, setMetodoPagoRegistro] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  const [showInactiveContractModal, setShowInactiveContractModal] = useState(false);
  const [inactiveContractInfo, setInactiveContractInfo] = useState(null);
  
  /*useEffect(() => {
    if (!searchText.trim()) {
      setInmueblesFiltrados(inmuebles);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = inmuebles.filter(inmueble => 
      (inmueble.nombre && inmueble.nombre.toLowerCase().includes(searchLower)) || 
      (inmueble.direccion && inmueble.direccion.toLowerCase().includes(searchLower)) ||
      (inmueble.propietario_nombre && inmueble.propietario_nombre.toLowerCase().includes(searchLower)) ||
      (inmueble.tipo_inmueble && inmueble.tipo_inmueble.toLowerCase().includes(searchLower))
    );
    
    setInmueblesFiltrados(filtered);
  }, [searchText, inmuebles]);*/
  const refreshData = async () => {
    try {
      setLoading(true);
      const pagosData = await pagoService.obtenerPagos();
      setPagos(Array.isArray(pagosData) ? pagosData : []);
      message.success("Datos actualizados correctamente");
    } catch (error) {
     
      message.error("Error al actualizar los datos");
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'paypal', label: 'Paypal' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
    { value: 'yape', label: 'Yape' },
    { value: 'plin', label: 'Plin' },
  ];

  const estadosPago = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'pagado', label: 'Pagado' },
    { value: 'vencido', label: 'Vencido' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const tiposPago = [
    { value: 'alquiler', label: 'Alquiler' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'otros', label: 'Otros' }
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueblesData);
        
        const pagosData = await pagoService.obtenerPagos();
        
        // Filtrar solo si se ha seleccionado un mes específico
        const pagosFiltrados = Array.isArray(pagosData) ? 
          pagosData.filter(pago => {
            if (!pago.fecha_pago) return false;
            if (selectedMonth === null) return true; // Mostrar todos si es null
            const fechaPago = new Date(pago.fecha_pago);
            return fechaPago.getMonth() === selectedMonth;
          }) : [];
        
        setPagos(pagosFiltrados);
        
      } catch (error) {
        console.error('Error en la carga inicial:', error);
        setError('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const buscarInquilino = async () => {
    try {
      setLoading2(true);
      
      // Si el campo de búsqueda está vacío, mostrar pagos filtrados solo por mes
      let resultados;
      if (!searchTerm.trim()) {
        resultados = await pagoService.obtenerPagos();
      } else {
        // Si hay término de búsqueda, realizar la búsqueda específica
        if (searchType === 'dni') {
          resultados = await pagoService.obtenerPagosPorInquilino(searchTerm, null);
        } else {
          resultados = await pagoService.obtenerPagosPorInquilino(null, searchTerm);
        }
      }
      
      // Filtrar por mes seleccionado
      const pagosFiltrados = Array.isArray(resultados) ? resultados.filter(pago => {
        if (!pago.fecha_pago) return false;
        const fechaPago = new Date(pago.fecha_pago);
        return fechaPago.getMonth() === selectedMonth;
      }) : [];
      
      setPagos(pagosFiltrados);
      
      if (pagosFiltrados.length === 0) {
        message.info('No se encontraron pagos para este período');
      }
    } catch (error) {
      console.error('Error al buscar pagos:', error);
      message.error('Error al buscar los pagos');
      setPagos([]);
    } finally {
      setLoading2(false);
    }
  };

  // Función para limpiar filtros y mostrar todos los pagos
  const limpiarFiltros = async () => {
    try {
      setLoading2(true);
      setSearchTerm('');
      
      const todosLosPagos = await pagoService.obtenerPagos();
      setPagos(Array.isArray(todosLosPagos) ? todosLosPagos : []);
    } catch (error) {
      console.error('Error al cargar los pagos:', error);
      alert('Error al cargar los pagos');
      setPagos([]);
    } finally {
      setLoading2(false);
    }
  };

  const seleccionarPago = (pago) => {
    setPagoSeleccionado(pago);
    
    // Para determinar los valores iniciales de los selects
    const metodoPagoSeleccionado = metodosPago.find(m => m.value === pago.metodo_pago) || null;
    const estadoSeleccionado = estadosPago.find(e => e.value === pago.estado) || null;
    
    // Obtener la fecha actual para la fecha real de pago en formato YYYY-MM-DD
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const diaActual = String(fechaActual.getDate()).padStart(2, '0');
    
    // Formato para base de datos: YYYY-MM-DD
    const fechaRealActual = `${anioActual}-${mesActual}-${diaActual}`;
    
    // Convertir fecha_pago de YYYY-MM-DD a DD-MM-YYYY para mostrar
    let fechaPagoFormateada = '';
    
    if (pago.fecha_pago) {
      const fecha = new Date(pago.fecha_pago);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      fechaPagoFormateada = `${dia}-${mes}-${anio}`;
    }
    
    
    setFormData({
      inmueble_id: '',
      espacioId: pago.contrato_id || '',
      inquilinoId: pago.inquilino_id || '',
      monto: pago.monto,
      fechaPago: pago.fecha_pago || '',
      fechaRealPago: fechaRealActual, // Usar la fecha actual del ordenador
      metodoPago: pago.metodo_pago,
      estado: pago.estado,
      observaciones: pago.observacion || ''
    });
    
    // Abrir el modal de pago
    setModalVisible(true);
  };

  const editarPago = (pago) => {
    setPagoSeleccionado(pago);
    
    setFormData({
      inmueble_id: '',
      espacioId: pago.contrato_id || '',
      inquilinoId: pago.inquilino_id || '',
      monto: pago.monto,
      fechaPago: pago.fecha_pago || '',
      fechaRealPago: pago.fecha_real_pago || '',
      metodoPago: pago.metodo_pago,
      estado: pago.estado,
      observaciones: pago.observacion || ''
    });
    
    // Abrir el modal de edición
    setModalEditVisible(true);
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

  // Función para ver detalles de un pago
  const verPago = async (pago) => {
    setPagoVisualizando(pago);
    setDocumentoError(false);
    setLoadingDoc(true);
    
    try {
      const documentos = await documentoService.obtenerDocumentosPorTipo(pago.id, 'pago');
      
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

  // Función para descargar directamente el documento
  const descargarDocumento = async (ruta, nombreArchivo) => {
    try {
      // Verificar que el documento existe
      const existeArchivo = await verificarExistenciaArchivo(ruta);
      
      if (!existeArchivo) {
        alert('No se puede descargar el documento porque no existe o no está accesible.');
        return;
      }
      
      // Obtener el contenido del archivo
      const response = await fetch(ruta);
      const blob = await response.blob();
      
      // Crear URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un enlace oculto y simular clic
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo; // Nombre de archivo sugerido para la descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      alert('Ha ocurrido un error al intentar descargar el documento. Consulta la consola para más detalles.');
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

  const handleCancelEdit = () => {
    setModalEditVisible(false);
    setPagoSeleccionado(null);
    setFormData({
      inmueble_id: '',
      piso_id: '',
      espacioId: '',
      inquilinoId: '',
      monto: '',
      fechaPago: '',
      fechaRealPago: '',
      metodoPago: '',
      estado: '',
      observaciones: ''
    });
  };

  const handleCancelView = () => {
    setModalViewVisible(false);
    setPagoVisualizando(null);
    setDocumentoUrl("");
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
    // Convertir el formato de DD-MM-YYYY a YYYY-MM-DD para MySQL
    if (dateString) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        setFormData(prev => ({
          ...prev,
          fechaPago: formattedDate
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          fechaPago: dateString
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        fechaPago: ''
      }));
    }
  };

  const handleRealDateChange = (date, dateString) => {
    // Convertir el formato de DD-MM-YYYY a YYYY-MM-DD para MySQL
    if (dateString) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        setFormData(prev => ({
          ...prev,
          fechaRealPago: formattedDate
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          fechaRealPago: dateString
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        fechaRealPago: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumento(file);
    }
  };

  const handleCancel = () => {
    // Cerrar el modal y resetear los campos
    setModalVisible(false);
    setFormData({
      inmueble_id: '',
      piso_id: '',
      espacioId: '',
      inquilinoId: '',
      monto: '',
      fechaPago: '',
      fechaRealPago: '',
      metodoPago: '',
      estado: '',
      observaciones: ''
    });
    setDocumento(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPagoSeleccionado(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pagoSeleccionado) {
      alert('Debe seleccionar un pago primero');
      return;
    }

    if (!documento) {
      alert('Debe cargar un documento de respaldo para el pago');
      return;
    }

    // Validar que el archivo sea PDF
    if (documento.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF');
      return;
    }
    
    try {
      // Formatear fechas correctamente (solo YYYY-MM-DD sin zona horaria)
      let fechaPagoFormateada = '';
      let fechaRealFormateada = '';
      
      // Formatear fecha_pago si existe
      if (pagoSeleccionado.fecha_pago) {
        const fecha = new Date(pagoSeleccionado.fecha_pago);
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        fechaPagoFormateada = `${anio}-${mes}-${dia}`;
      }
      
      // Formatear fecha_real_pago (fecha actual)
      const fechaActual = new Date(formData.fechaRealPago);
      const anioActual = fechaActual.getFullYear();
      const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
      const diaActual = String(fechaActual.getDate()).padStart(2, '0');
      fechaRealFormateada = `${anioActual}-${mesActual}-${diaActual}`;
      const horaActual = String(fechaActual.getHours()).padStart(2, '0');
      const minutosActual = String(fechaActual.getMinutes()).padStart(2, '0');
      const segundosActual = String(fechaActual.getSeconds()).padStart(2, '0');
      
      // console.log('Fecha pago formateada:', fechaPagoFormateada);
      // console.log('Fecha real formateada:', fechaRealFormateada);
      
      // Crear objeto con datos del pago
      const pagoData = {
        contrato_id: pagoSeleccionado.contrato_id,
        monto: formData.monto,
        metodo_pago: formData.metodoPago,
        tipo_pago: pagoSeleccionado.tipo_pago || 'alquiler',
        estado: formData.estado,
        fecha_pago: fechaPagoFormateada,
        fecha_real_pago: fechaRealFormateada,
        observacion: formData.observaciones
      };
      
      // console.log('Datos del pago a actualizar:', pagoData);

      // Actualizar primero el pago
      const pagoActualizado = await pagoService.actualizarPago(pagoSeleccionado.id, pagoData);
      
      try {
        // Verificar que el ID del pago sea válido y esté disponible
        if (!pagoSeleccionado.id) {
          throw new Error('El ID del pago no es válido');
        }
        
        // Asegurarse de que el ID sea un entero
        const idPago = parseInt(pagoSeleccionado.id);
        if (isNaN(idPago)) {
          throw new Error('El ID del pago no es un número válido');
        }
        
        // Crear un nombre de archivo cifrado basado en la fecha actual y el ID del pago
        // Formato: pago_YYYYMMDD_HHMMSS_ID.pdf
        const nombreArchivo = `pago_${anioActual}${mesActual}${diaActual}_${horaActual}${minutosActual}${segundosActual}_${idPago}.pdf`;
        
        // Crear un objeto File con el nuevo nombre
        const nuevoArchivo = new File([documento], nombreArchivo, { type: documento.type });
        
       
        
        // Incluir un timeout para evitar problemas de concurrencia
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Pasar un parámetro adicional para indicar que no queremos subcarpeta
        const respuestaArchivo = await documentoService.subirArchivo(
          nuevoArchivo, 
          idPago, 
          'pago',
          { usarCarpetaComun: true }  // Parámetro adicional para indicar que use /pago/ en lugar de /pago/{id}/
        );
     
        
        // Registrar los metadatos del documento con la nueva ruta en /pago/
        const documentoData = {
          nombre: nombreArchivo,
          ruta: respuestaArchivo.ruta || `/pago/${nombreArchivo}`,
          documentable_id: idPago,
          documentable_type: 'pago'
        };

        const respuestaDocumento = await documentoService.crearDocumento(documentoData);
        //console.log('Documento registrado correctamente:', respuestaDocumento);        
        alert('Pago actualizado correctamente y documento subido al servidor.');
        
        // Reset form and search
        setFormData({
          inmueble_id: '',
          piso_id: '',
          espacioId: '',
          inquilinoId: '',
          monto: '',
          fechaPago: '',
          fechaRealPago: '',
          metodoPago: '',
          estado: '',
          observaciones: ''
        });
        setDocumento(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSearchTerm('');
        // Cerrar modal
        setModalVisible(false);
        // Recargar los pagos
        const todosLosPagos = await pagoService.obtenerPagos();
        setPagos(Array.isArray(todosLosPagos) ? todosLosPagos : []);
        setPagoSeleccionado(null);
        
      } catch (docError) {
        console.error('Error al registrar el documento:', docError);
        alert(`Error al registrar el documento: ${docError.message || 'Revise la consola para más detalles'}`);
        throw docError;
      }
      
    } catch (error) {
      console.error('Error detallado:', error);
      if (error.response && error.response.data) {
        alert(`Error: ${error.response.data.mensaje || error.message}`);
      } else {
        alert('Error al actualizar el pago o registrar el documento');
      }
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    if (!pagoSeleccionado) {
      alert('Debe seleccionar un pago primero');
      return;
    }
    
    try {
      // Formatear fechas correctamente (solo YYYY-MM-DD sin zona horaria)
      let fechaPagoFormateada = '';
      let fechaRealFormateada = '';
      
      // Formatear fecha_pago si existe
      if (formData.fechaPago) {
        const fecha = new Date(formData.fechaPago);
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        fechaPagoFormateada = `${anio}-${mes}-${dia}`;
      }
      
      // Formatear fecha_real_pago si existe
      if (formData.fechaRealPago) {
        const fechaActual = new Date(formData.fechaRealPago);
        const anioActual = fechaActual.getFullYear();
        const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const diaActual = String(fechaActual.getDate()).padStart(2, '0');
        fechaRealFormateada = `${anioActual}-${mesActual}-${diaActual}`;
      }
      
      // Crear objeto con datos del pago
      const pagoData = {
        contrato_id: pagoSeleccionado.contrato_id,
        monto: formData.monto,
        metodo_pago: formData.metodoPago,
        tipo_pago: pagoSeleccionado.tipo_pago || 'alquiler',
        estado: formData.estado,
        fecha_pago: fechaPagoFormateada,
        fecha_real_pago: fechaRealFormateada,
        observacion: formData.observaciones
      };
      

      // Actualizar el pago
      const pagoActualizado = await pagoService.actualizarPago(pagoSeleccionado.id, pagoData);
      
      // Guardar los datos actualizados y mostrar el modal de éxito
      setUpdatedData({
        ...pagoData,
        inquilino_nombre: pagoSeleccionado.inquilino_nombre,
        inquilino_apellido: pagoSeleccionado.inquilino_apellido
      });
      
      // Reset form y cerrar modal
      setFormData({
        inmueble_id: '',
        piso_id: '',
        espacioId: '',
        inquilinoId: '',
        monto: '',
        fechaPago: '',
        fechaRealPago: '',
        metodoPago: '',
        estado: '',
        observaciones: ''
      });
      
      setModalEditVisible(false);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      message.error('Error al actualizar el pago');
    }
  };

  // Función para manejar el cierre del modal de éxito
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Recargar los pagos
    cargarTodosPagos();
  };

  // Función para cargar todos los pagos
  const cargarTodosPagos = async () => {
    try {
      setLoading2(true);
      
      const pagosData = await pagoService.obtenerPagos();
      const pagosFiltrados = Array.isArray(pagosData) ? pagosData.filter(pago => {
        if (!pago.fecha_pago) return false;
        const fechaPago = new Date(pago.fecha_pago);
        return fechaPago.getMonth() === selectedMonth;
      }) : [];
      
      setPagos(pagosFiltrados);
      
      if (pagosFiltrados.length === 0) {
        message.info('No se encontraron pagos para este período');
      }
    } catch (error) {
      console.error('Error al cargar todos los pagos:', error);
      message.error('Error al cargar los pagos');
      setPagos([]);
    } finally {
      setLoading2(false);
    }
  };

  // Función para manejar el registro de pago
  const handleRegistrarPago = async (pago) => {
    console.log('=== INICIO DE REGISTRO DE PAGO ===');
    console.log('Datos del pago recibidos:', pago);
    console.log('ID del contrato a verificar:', pago.contrato_id);

    try {
      console.log('Intentando obtener información del contrato...');
      // Verificar si el contrato está activo usando el contrato_id
      const contrato = await contratoService.obtenerContratoPorId(pago.contrato_id);
      
      console.log('Respuesta del servicio de contrato:', contrato);
      
      if (!contrato) {
        console.error('No se encontró el contrato');
        message.error('No se pudo obtener la información del contrato');
        return;
      }

      console.log('Estado del contrato:', contrato.estado);

      if (contrato.estado === 'inactivo' || contrato.estado === 'cancelado') {
        console.log('Contrato inactivo/cancelado detectado - Bloqueando registro de pago');
        setInactiveContractInfo({
          inquilino: `${pago.inquilino_nombre} ${pago.inquilino_apellido}`,
          contratoId: contrato.id,
          fechaInicio: contrato.fecha_inicio,
          fechaFin: contrato.fecha_fin,
          estado: contrato.estado
        });
        setShowInactiveContractModal(true);
        return;
      }

      console.log('Contrato activo - Procediendo con el registro de pago');
      // Si el contrato está activo, proceder con el registro
      setPagoARegistrar(pago);
      setComprobanteFile(null);
      setMetodoPagoRegistro(pago.metodo_pago || null);
      setModalRegistroVisible(true);
      console.log('Modal de registro abierto');
    } catch (error) {
      console.error('Error en el proceso de registro de pago:', error);
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error('Error al verificar el estado del contrato');
    }
    console.log('=== FIN DE REGISTRO DE PAGO ===');
  };

  // Función para manejar el cambio del archivo de comprobante
  const handleComprobanteChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComprobanteFile(file);
    }
  };

  // Función para manejar el envío del registro de pago
  const handleSubmitRegistro = async (e) => {
    e.preventDefault();
    
    try {
      // Validar campos obligatorios
      if (!pagoARegistrar) {
        message.error('No se ha seleccionado ningún pago');
        return;
      }

      if (!comprobanteFile) {
        message.error('Debe subir un comprobante de pago');
        return;
      }

      // Validar que si hay documento, sea un PDF
      if (comprobanteFile.type !== 'application/pdf') {
        message.error('Solo se permiten archivos PDF como documentos de respaldo');
        return;
      }

      if (!metodoPagoRegistro) {
        message.error('Debe seleccionar el método de pago');
        return;
      }

      setLoadingRegistro(true);
      
      // Actualizar el pago primero
      const pagoData = {
        contrato_id: pagoARegistrar.contrato_id,
        monto: pagoARegistrar.monto,
        tipo_pago: pagoARegistrar.tipo_pago || 'alquiler',
        estado: 'pagado',
        metodo_pago: metodoPagoRegistro,
        fecha_pago: pagoARegistrar.fecha_pago,
        fecha_real_pago: new Date().toISOString().split('T')[0],
        observacion: ''
      };

      // Actualizar el pago
      await pagoService.actualizarPago(pagoARegistrar.id, pagoData);
      
      // Si hay documento, subirlo
      if (comprobanteFile) {
        try {
          const respuestaArchivo = await documentoService.subirArchivo(
            comprobanteFile,
            pagoARegistrar.id,
            'pago'
          );

          if (!respuestaArchivo || !respuestaArchivo.id) {
            throw new Error('No se recibió una respuesta válida del servidor al subir el archivo');
          }

          message.success('Documento subido exitosamente');
        } catch (docError) {
          console.error('Error al subir documento:', docError);
          message.error(`El pago se registró correctamente, pero hubo un error al subir el documento: ${docError.message || ''}`);
        }
      }

      message.success('Pago registrado correctamente');
      setModalRegistroVisible(false);
      
      // Limpiar el formulario
      setComprobanteFile(null);
      setMetodoPagoRegistro(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Actualizar los datos
      await refreshData();

    } catch (error) {
      console.error('Error al registrar el pago:', error);
      message.error('Error al registrar el pago');
    } finally {
      setLoadingRegistro(false);
    }
  };

  // Reemplazar la definición de columns con el formato de Table de antd
  const columns = [
    {
      title: "Inquilino",
      key: "inquilino",
      render: (text, record) => `${record.inquilino_nombre || ''} ${record.inquilino_apellido || ''}`,
      sorter: (a, b) => {
        const nombreA = `${a.inquilino_nombre || ''} ${a.inquilino_apellido || ''}`;
        const nombreB = `${b.inquilino_nombre || ''} ${b.inquilino_apellido || ''}`;
        return nombreA.localeCompare(nombreB);
      }
    },
    {
      title: "DNI",
      dataIndex: "inquilino_dni",
      sorter: (a, b) => a.inquilino_dni?.localeCompare(b.inquilino_dni || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Inmueble",
      dataIndex: "nombre_inmueble",
      sorter: (a, b) => a.nombre_inmueble?.localeCompare(b.nombre_inmueble || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Piso",
      dataIndex: "piso",
      sorter: (a, b) => a.piso?.localeCompare(b.piso || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Habitación",
      dataIndex: "nombre_habitacion",
      sorter: (a, b) => a.nombre_habitacion?.localeCompare(b.nombre_habitacion || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Monto",
      dataIndex: "monto",
      sorter: (a, b) => (parseFloat(a.monto) || 0) - (parseFloat(b.monto) || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A"),
    },
    {
      title: "Fecha Programada",
      dataIndex: "fecha_pago",
      sorter: (a, b) => new Date(a.fecha_pago || 0) - new Date(b.fecha_pago || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Fecha Real",
      dataIndex: "fecha_real_pago",
      sorter: (a, b) => new Date(a.fecha_real_pago || 0) - new Date(b.fecha_real_pago || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "-",
    },
    {
      title: "Método de Pago",
      dataIndex: "metodo_pago",
      sorter: (a, b) => a.metodo_pago?.localeCompare(b.metodo_pago || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      sorter: (a, b) => a.estado?.localeCompare(b.estado || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (text, record) => (
        <div className="text-center">
          <button
            type="button"
            className="btn btn-sm btn-success me-1"
            onClick={() => handleRegistrarPago(record)}
            title="Registrar Pago"
            disabled={record.estado === 'pagado'}
          >
            <FiDollarSign />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-warning me-1"
            onClick={() => editarPago(record)}
            title="Editar"
          >
            <FiEdit />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => verPago(record)}
            title="Ver"
          >
            <FiEye />
          </button>
        </div>
      ),
    }
  ];

  const paginationComponentOptions = {
    rowsPerPageText: 'Filas por página:',
    rangeSeparatorText: 'de',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Todos',
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

  // Utilidad para extraer la ruta relativa de un documento
  const getRutaRelativa = (ruta) => {
    if (!ruta) return '';
    // Si la ruta es absoluta, extrae solo la parte después de /documentos/
    const idx = ruta.indexOf('/documentos/');
    if (idx !== -1) {
      return ruta.substring(idx + 1); // sin el primer slash
    }
    // Si ya es relativa, la retorna igual
    return ruta.replace(/^\//, '');
  };

  // Función para ver documento directamente usando el servicio
  const handleViewDocument = async (rutaDocumento) => {
    try {
      if (!rutaDocumento) {
        throw new Error('Ruta del documento no disponible');
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

  // Función para descargar documento directamente usando el servicio
  const handleDownloadDocument = async (rutaDocumento, nombreArchivo) => {
    try {
      if (!rutaDocumento) {
        throw new Error('Ruta del documento no disponible');
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
      <Sidebar id='menu-item6' id1='menu-items6' activeClassName='contabilidad-pagos'/>
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
                  <li className="breadcrumb-item active">Registrar Pago</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  
                <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3>Lista de Pagos</h3>
                          <div className="doctor-search-blk">
                           
                            <div className="add-group">
                             
                              <button
                                className="btn btn-primary doctor-refresh ms-2"
                                onClick={refreshData}
                                title="Actualizar datos"
                                disabled={loading}
                              >
                                {loading ? (
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                  <i className="fas fa-sync-alt"></i>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-12">
                     {/* <div className="form-heading d-flex justify-content-between align-items-center">
                        <h3>Lista de Pagos</h3>
                        <div>
                          <button 
                            type="button" 
                            className="btn btn-info me-2"
                            onClick={cargarTodosPagos}
                            disabled={loading2}
                          >
                            {loading2 ? (
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : (
                              <FiRefreshCw className="me-2" />
                            )}
                            Recargar Todos los Pagos
                          </button>
                         <span className="text-muted">
                            {loading2 ? 'Cargando pagos...' : Array.isArray(pagos) ? 
                              `${pagos.length} ${pagos.length === 1 ? 'pago' : 'pagos'} encontrados` : ''}
                          </span>
                        </div>
                      </div>*/}
                      <div className="row">
                    <div className="col-12">
                      
                    </div>
                    
                    <div className="col-12 col-md-3">
                      <div className="form-group">
                        <label>Mes</label>
                        <Select
                          options={meses}
                          value={meses.find(m => m.value === selectedMonth)}
                          onChange={(selected) => {
                            setSelectedMonth(selected.value);
                            buscarInquilino(); // Actualizar búsqueda al cambiar el mes
                          }}
                          placeholder="Seleccionar mes"
                          classNamePrefix="select"
                        />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-3">
                      <div className="form-group">
                        <label>Buscar por</label>
                        <Select
                          options={[
                            { value: 'dni', label: 'DNI' },
                            { value: 'nombre', label: 'Nombre' }
                          ]}
                          value={{ value: searchType, label: searchType === 'dni' ? 'DNI' : 'Nombre' }}
                          onChange={(selected) => setSearchType(selected.value)}
                          placeholder="Seleccionar tipo de búsqueda"
                          classNamePrefix="select"
                        />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-4">
                      <div className="form-group">
                        <label>Término de búsqueda</label>
                        <input
                          type="text"
                          className="form-control"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={searchType === 'dni' ? "Ingrese DNI del inquilino" : "Ingrese nombre del inquilino"}
                        />
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-2">
                      <div className="form-group">
                        <label>&nbsp;</label>
                        <button 
                          type="button" 
                          className="btn btn-primary w-100"
                          onClick={buscarInquilino}
                          disabled={loading2}
                        >
                          {loading2 ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          ) : (
                            <FiSearch className="me-2" />
                          )}
                          Buscar
                        </button>
                      </div>
                    </div>

                    <div className="col-12 col-md-2">
                      <div className="form-group">
                        <label>&nbsp;</label>
                        <button 
                          type="button" 
                          className="btn btn-secondary w-100"
                          onClick={limpiarFiltros}
                          disabled={loading2}
                        >
                          Limpiar Filtros
                        </button>
                      </div>
                    </div>
                  </div>

                      <div className="table-responsive doctor-list">
                        <Table
                          columns={columns}
                          dataSource={Array.isArray(pagos) ? pagos : []}
                          rowKey="id"
                          pagination={{
                            total: pagos.length,
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
          
          {/* Modal de actualización de pago (Pagar) */}
          <Modal
            title={<><FiDollarSign className="me-2" /> Registrar Pago</>}
            open={modalVisible}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
            centered
            maskClosable={false}
            key={pagoSeleccionado ? `pago-modal-${pagoSeleccionado.id}` : 'pago-modal'}
          >
            {pagoSeleccionado && (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Inquilino (Solo lectura)</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={`${pagoSeleccionado.inquilino_nombre || ''} ${pagoSeleccionado.inquilino_apellido || ''}`}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>DNI (Solo lectura)</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={pagoSeleccionado.inquilino_dni || ''}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Monto <span className="login-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="monto"
                        value={formData.monto}
                        onChange={handleChange}
                        required
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Fecha de Pago (Solo lectura)</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={pagoSeleccionado.fecha_pago ? new Date(pagoSeleccionado.fecha_pago).toLocaleDateString() : ''}
                      />
                      <small className="form-text text-muted">
                        Fecha programada del pago
                      </small>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Fecha Real de Pago (Fecha actual)</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={formData.fechaRealPago ? new Date(formData.fechaRealPago).toLocaleDateString() : new Date().toLocaleDateString()}
                      />
                      <small className="form-text text-muted">
                        Fecha actual del sistema para el registro del pago
                      </small>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Método de Pago <span className="login-danger">*</span></label>
                      <Select
                        name="metodoPago"
                        options={metodosPago}
                        onChange={handleSelectChange}
                        placeholder="Seleccionar método de pago"
                        required
                        value={metodosPago.find(m => m.value === formData.metodoPago) || null}
                        classNamePrefix="select"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Estado <span className="login-danger">*</span></label>
                      <Select
                        name="estado"
                        options={estadosPago}
                        onChange={handleSelectChange}
                        placeholder="Seleccionar estado"
                        required
                        value={estadosPago.find(e => e.value === formData.estado) || null}
                        classNamePrefix="select"
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-group local-forms">
                      <label>Documento de Respaldo <span className="login-danger">*</span></label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        required
                      />
                      <small className="form-text text-muted">
                        Suba un documento de respaldo para este pago (factura, comprobante, etc.)
                      </small>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-group local-forms">
                      <label>Observaciones</label>
                      <textarea
                        className="form-control"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="doctor-submit text-end">
                      <button type="submit" className="btn btn-primary submit-form me-2">
                        Actualizar Pago
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
            )}
          </Modal>
          
          {/* Modal de edición de pago */}
          <Modal
            title={<><FiEdit className="me-2" /> Editar Pago</>}
            open={modalEditVisible}
            onCancel={handleCancelEdit}
            footer={null}
            width={800}
            destroyOnClose={true}
            centered
            maskClosable={false}
            key={pagoSeleccionado ? `pago-edit-modal-${pagoSeleccionado.id}` : 'pago-edit-modal'}
          >
            {pagoSeleccionado && (
              <form onSubmit={handleSubmitEdit}>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Inquilino (Solo lectura)</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={`${pagoSeleccionado.inquilino_nombre || ''} ${pagoSeleccionado.inquilino_apellido || ''}`}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>DNI (Solo lectura)</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={pagoSeleccionado.inquilino_dni || ''}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Monto <span className="login-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="monto"
                        value={formData.monto}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Fecha de Pago <span className="login-danger">*</span></label>
                      <DatePicker
                        className="form-control"
                        format="DD-MM-YYYY"
                        onChange={handleDateChange}
                        value={formData.fechaPago ? moment(formData.fechaPago) : null}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Fecha Real de Pago</label>
                      <DatePicker
                        className="form-control"
                        format="DD-MM-YYYY"
                        onChange={handleRealDateChange}
                        value={formData.fechaRealPago ? moment(formData.fechaRealPago) : null}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Método de Pago <span className="login-danger">*</span></label>
                      <Select
                        name="metodoPago"
                        options={metodosPago}
                        onChange={handleSelectChange}
                        placeholder="Seleccionar método de pago"
                        required
                        value={metodosPago.find(m => m.value === formData.metodoPago) || null}
                        classNamePrefix="select"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="form-group local-forms">
                      <label>Estado <span className="login-danger">*</span></label>
                      <Select
                        name="estado"
                        options={estadosPago}
                        onChange={handleSelectChange}
                        placeholder="Seleccionar estado"
                        required
                        value={estadosPago.find(e => e.value === formData.estado) || null}
                        classNamePrefix="select"
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-group local-forms">
                      <label>Observaciones</label>
                      <textarea
                        className="form-control"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="doctor-submit text-end">
                      <button type="submit" className="btn btn-primary submit-form me-2">
                        <FiEdit className="me-1" /> Actualizar Pago
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary cancel-form"
                        onClick={handleCancelEdit}
                      >
                        <FiX className="me-1" /> Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Modal>
          
          {/* Modal de visualización de pago */}
          <Modal
            title={<><FiEye className="me-2" /> Detalles del Pago</>}
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
            key={pagoVisualizando ? `pago-view-modal-${pagoVisualizando.id}` : 'pago-view-modal'}
          >
            {pagoVisualizando && (
              <div className="row">
                <div className="col-12 mb-4">
                  <h5 className="text-primary">Información del Inquilino</h5>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Nombre:</strong> {`${pagoVisualizando.inquilino_nombre || ''} ${pagoVisualizando.inquilino_apellido || ''}`}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>DNI:</strong> {pagoVisualizando.inquilino_dni || ''}</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-12 mb-4">
                  <h5 className="text-primary">Información del Espacio</h5>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Inmueble:</strong> {pagoVisualizando.nombre_inmueble || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Piso:</strong> {pagoVisualizando.piso || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Habitación:</strong> {pagoVisualizando.nombre_habitacion || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="col-12 mb-4">
                  <h5 className="text-primary">Detalles del Pago</h5>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Monto:</strong> {pagoVisualizando.monto || ''}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Método de Pago:</strong> {pagoVisualizando.metodo_pago || ''}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Fecha Programada:</strong> {pagoVisualizando.fecha_pago ? new Date(pagoVisualizando.fecha_pago).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Fecha Real de Pago:</strong> {pagoVisualizando.fecha_real_pago ? new Date(pagoVisualizando.fecha_real_pago).toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Estado:</strong> {pagoVisualizando.estado || ''}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Tipo de Pago:</strong> {pagoVisualizando.tipo_pago || 'Alquiler'}</p>
                    </div>
                    <div className="col-12">
                      <p><strong>Observaciones:</strong> {pagoVisualizando.observacion || '-'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Sección de documento */}
                {pagoVisualizando.estado !== 'pendiente' && (
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
                    
                    {!loadingDoc && documento && !documentoError ? (
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
                            </span>
                          </div>
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
                        </div>
                      </div>
                    ) : !loadingDoc && documentoError && (
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
          </Modal>

          {/* Modal de Registro de Pago */}
          <Modal
            title={<><FiDollarSign className="me-2" /> Registrar Pago</>}
            open={modalRegistroVisible}
            onCancel={() => {
              setModalRegistroVisible(false);
              setComprobanteFile(null);
              setMetodoPagoRegistro(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            footer={null}
            width={600}
            destroyOnClose={true}
            centered
            maskClosable={false}
          >
            {pagoARegistrar && (
              <form onSubmit={handleSubmitRegistro}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <div className="form-group">
                      <label>Inquilino</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={`${pagoARegistrar.inquilino_nombre || ''} ${pagoARegistrar.inquilino_apellido || ''}`}
                      />
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <div className="form-group">
                      <label>Monto</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={pagoARegistrar.monto}
                      />
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <div className="form-group">
                      <label>Método de Pago <span className="text-danger">*</span></label>
                      <Select
                        name="metodoPago"
                        options={metodosPago}
                        onChange={option => setMetodoPagoRegistro(option.value)}
                        value={metodosPago.find(m => m.value === metodoPagoRegistro) || null}
                        placeholder="Seleccionar método de pago"
                        classNamePrefix="select"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 mb-3">
                    <div className="form-group">
                      <label>Comprobante de Pago <span className="text-danger">*</span></label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={handleComprobanteChange}
                        ref={fileInputRef}
                        accept=".pdf"
                        required
                      />
                      <small className="form-text text-muted">
                        Suba el comprobante de pago en formato PDF
                      </small>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setModalRegistroVisible(false);
                          setComprobanteFile(null);
                          setMetodoPagoRegistro(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loadingRegistro || !comprobanteFile}
                      >
                        {loadingRegistro ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registrando...
                          </>
                        ) : (
                          'Registrar Pago'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Modal>

          {/* Modal de éxito */}
          <Modal
            title="¡Actualización Exitosa!"
            open={showSuccessModal}
            onOk={handleSuccessModalClose}
            onCancel={handleSuccessModalClose}
            okText="Aceptar"
            cancelButtonProps={{ style: { display: 'none' } }}
            centered
          >
            <div>
              <p>El pago se ha actualizado correctamente con los siguientes datos:</p>
              {updatedData && (
                <ul style={{ listStyleType: 'none', padding: '10px' }}>
                  <li><strong>Inquilino:</strong> {`${updatedData.inquilino_nombre} ${updatedData.inquilino_apellido}`}</li>
                  <li><strong>Monto:</strong> S/ {parseFloat(updatedData.monto).toFixed(2)}</li>
                  <li><strong>Método de Pago:</strong> {updatedData.metodo_pago}</li>
                  <li><strong>Estado:</strong> {updatedData.estado}</li>
                  <li><strong>Fecha de Pago:</strong> {updatedData.fecha_pago ? new Date(updatedData.fecha_pago).toLocaleDateString() : 'No especificada'}</li>
                  <li><strong>Fecha Real de Pago:</strong> {updatedData.fecha_real_pago ? new Date(updatedData.fecha_real_pago).toLocaleDateString() : 'No especificada'}</li>
                  <li><strong>Observaciones:</strong> {updatedData.observacion || 'No especificadas'}</li>
                </ul>
              )}
            </div>
          </Modal>

          {/* Modal de Contrato Inactivo */}
          <Modal
            title={<div className="text-danger"><i className="fas fa-exclamation-triangle me-2"></i>Contrato Inactivo</div>}
            open={showInactiveContractModal}
            onOk={() => setShowInactiveContractModal(false)}
            onCancel={() => setShowInactiveContractModal(false)}
            okText="Entendido"
            cancelButtonProps={{ style: { display: 'none' } }}
            centered
          >
            <div className="p-3">
              <div className="alert alert-danger mb-3">
                <i className="fas fa-ban me-2"></i>
                No se puede realizar el pago porque el contrato está inactivo o cancelado.
              </div>
              
              {inactiveContractInfo && (
                <div className="contract-details">
                  <h6 className="mb-3">Detalles del Contrato:</h6>
                  <ul className="list-unstyled">
                    <li><strong>Inquilino:</strong> {inactiveContractInfo.inquilino}</li>
                    <li><strong>ID del Contrato:</strong> {inactiveContractInfo.contratoId}</li>
                    <li><strong>Fecha de Inicio:</strong> {new Date(inactiveContractInfo.fechaInicio).toLocaleDateString()}</li>
                    <li><strong>Fecha de Fin:</strong> {new Date(inactiveContractInfo.fechaFin).toLocaleDateString()}</li>
                    <li><strong>Estado:</strong> {inactiveContractInfo.estado}</li>
                  </ul>
                </div>
              )}
              
              <div className="mt-3 text-muted">
                <small>
                  <i className="fas fa-info-circle me-1"></i>
                  Para realizar el pago, el contrato debe estar activo. Por favor, contacte al administrador si necesita activar el contrato.
                </small>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default ContabilidadPagos;