/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { DatePicker, Modal } from "antd";
import { FiChevronRight, FiSearch, FiX, FiRefreshCw, FiDollarSign, FiEdit, FiEye, FiFileText, FiImage, FiDownload } from "react-icons/fi";
import Select from "react-select";
import DataTable from 'react-data-table-component';
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
    { value: 'vencido', label: 'Vencido' }
  ];


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Iniciando carga de datos...");
        
        // Obtener inmuebles para referencia
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueblesData);
        
        // Cargar TODOS los pagos al iniciar - SIN FILTROS
        await cargarTodosPagos();
        
      } catch (error) {
        console.error('Error en la carga inicial:', error);
        setError('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    // Cargar datos al montar el componente
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const buscarInquilino = async () => {
    try {
      setLoading2(true);
      
      // Si el campo de búsqueda está vacío, mostrar todos los pagos
      if (!searchTerm.trim()) {
        const todosLosPagos = await pagoService.obtenerPagos();
        setPagos(Array.isArray(todosLosPagos) ? todosLosPagos : []);
        setLoading2(false);
        return;
      }
      
      // Si hay término de búsqueda, realizar la búsqueda específica
      let resultados;
      
      if (searchType === 'dni') {
        resultados = await pagoService.obtenerPagosPorInquilino(searchTerm, null);
      } else {
        resultados = await pagoService.obtenerPagosPorInquilino(null, searchTerm);
      }
      
      setPagos(Array.isArray(resultados) ? resultados : []);
      
      if (resultados.length === 0) {
        alert('No se encontraron pagos para este inquilino');
      }
    } catch (error) {
      console.error('Error al buscar pagos del inquilino:', error);
      alert('Error al buscar los pagos del inquilino');
      setPagos([]); // Asegurar que pagos sea un array vacío en caso de error
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
    console.log('Fecha actual para pago real (formato DB):', fechaRealActual);
    
    // Convertir fecha_pago de YYYY-MM-DD a DD-MM-YYYY para mostrar
    let fechaPagoFormateada = '';
    
    if (pago.fecha_pago) {
      const fecha = new Date(pago.fecha_pago);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      fechaPagoFormateada = `${dia}-${mes}-${anio}`;
    }
    
    console.log('Pago seleccionado:', pago);
    console.log('Fecha pago:', pago.fecha_pago, 'formateada:', fechaPagoFormateada);
    
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

  const verPago = async (pago) => {
    setPagoVisualizando(pago);
    setDocumentoError(false);
    setLoadingDoc(true);
    
    // Intentar obtener el documento asociado al pago
    try {
      try {
        // Buscar documentos asociados a este pago
        const documentos = await documentoService.obtenerDocumentosPorTipo(pago.id, 'pago');
        
        if (documentos && documentos.length > 0) {
          console.log('Documentos encontrados:', documentos);
          
          // Determinar el tipo de documento basado en la extensión
          let tipoDocumento = 'pdf'; // valor predeterminado
          const nombreArchivo = documentos[0].nombre || '';
          if (nombreArchivo.toLowerCase().endsWith('.jpg') || 
              nombreArchivo.toLowerCase().endsWith('.jpeg') || 
              nombreArchivo.toLowerCase().endsWith('.png') || 
              nombreArchivo.toLowerCase().endsWith('.gif')) {
            tipoDocumento = 'imagen';
          }
          
          // Construir la URL completa con base en el dominio actual
          let rutaDocumento = documentos[0].ruta;
          
          // Si la ruta no comienza con http/https o //, asumimos que es una ruta relativa
          if (!rutaDocumento.startsWith('http') && !rutaDocumento.startsWith('//')) {
            // Asegurarnos de que comience con /
            if (!rutaDocumento.startsWith('/')) {
              rutaDocumento = '/' + rutaDocumento;
            }
            
            // Obtener la base URL del servidor
            const baseUrl = window.location.origin;
            rutaDocumento = baseUrl + rutaDocumento;
          }
          
          // Verificar si el documento existe
          const existeArchivo = await verificarExistenciaArchivo(rutaDocumento);
          
          if (existeArchivo) {
            setDocumento({ 
              nombre: documentos[0].nombre || `Comprobante-${pago.id}.pdf`,
              ruta: rutaDocumento,
              tipo: tipoDocumento
            });
            setDocumentoError(false);
          } else {
            console.error(`El documento no existe en la ruta: ${rutaDocumento}`);
            
            // NUEVO: Intentar buscar en la carpeta común donde están realmente guardados
            const baseUrl = window.location.origin;
            const rutaComun = `${baseUrl}/PUBLIC/PAGO/1/${documentos[0].nombre}`;
            const rutaComunAlternativa = `${baseUrl}/public/pago/1/${documentos[0].nombre}`;
            
            console.log(`Intentando con ruta común: ${rutaComun}`);
            let existeEnRutaComun = await verificarExistenciaArchivo(rutaComun);
            
            if (existeEnRutaComun) {
              console.log(`¡Documento encontrado en la carpeta común!`);
              setDocumento({ 
                nombre: documentos[0].nombre || `Comprobante-${pago.id}.pdf`,
                ruta: rutaComun,
                tipo: tipoDocumento
              });
              setDocumentoError(false);
            } else {
              // Probar con la ruta alternativa en minúsculas
              console.log(`Intentando con ruta común alternativa: ${rutaComunAlternativa}`);
              existeEnRutaComun = await verificarExistenciaArchivo(rutaComunAlternativa);
              
              if (existeEnRutaComun) {
                console.log(`¡Documento encontrado en la carpeta común alternativa!`);
                setDocumento({ 
                  nombre: documentos[0].nombre || `Comprobante-${pago.id}.pdf`,
                  ruta: rutaComunAlternativa,
                  tipo: tipoDocumento
                });
                setDocumentoError(false);
              } else {
                setDocumento({ 
                  nombre: documentos[0].nombre || `Comprobante-${pago.id}.pdf`,
                  ruta: rutaDocumento,
                  tipo: tipoDocumento
                });
                setDocumentoError(true);
              }
            }
          }
        } else {
          console.log(`No se encontraron documentos en la BD para el pago ${pago.id}`);
          
          // Intentar buscar en la carpeta común donde se guardan realmente los documentos
          const posiblesRutas = [
            `/PUBLIC/PAGO/1/pago_${pago.id}.pdf`, // Ubicación real indicada por el usuario
            `/public/pago/1/pago_${pago.id}.pdf`, // Misma ubicación en minúsculas
            `/PUBLIC/PAGO/1/${pago.id}.pdf`, // Alternativa con solo el ID
            `/public/pago/1/${pago.id}.pdf`, // Alternativa con solo el ID en minúsculas
            `/PUBLIC/PAGO/1/documento_${pago.id}.pdf`, // Otra posible nomenclatura
            `/public/pago/1/documento_${pago.id}.pdf`,
            `/pago/pago_${pago.id}.pdf`, // Ubicaciones anteriores por si acaso
            `/pago/${pago.id}.pdf`,
            `/pago/${pago.id}/documento.pdf`,
          ];
          
          // Obtener la base URL del servidor
          const baseUrl = window.location.origin;
          
          // Verificar cada ruta posible
          let documentoEncontrado = false;
          
          for (const rutaRelativa of posiblesRutas) {
            const rutaCompleta = baseUrl + rutaRelativa;
            console.log(`Verificando ruta: ${rutaCompleta}`);
            
            const existeArchivo = await verificarExistenciaArchivo(rutaCompleta);
            
            if (existeArchivo) {
              console.log(`¡Documento encontrado en: ${rutaCompleta}!`);
              
              // Determinar el tipo basado en la extensión
              let tipo = 'pdf';
              if (rutaRelativa.toLowerCase().endsWith('.jpg') || 
                  rutaRelativa.toLowerCase().endsWith('.jpeg') || 
                  rutaRelativa.toLowerCase().endsWith('.png') || 
                  rutaRelativa.toLowerCase().endsWith('.gif')) {
                tipo = 'imagen';
              }
              
              setDocumento({
                nombre: `Comprobante de pago #${pago.id}`,
                ruta: rutaCompleta,
                tipo: tipo
              });
              setDocumentoError(false);
              documentoEncontrado = true;
              break;
            }
          }
          
          if (!documentoEncontrado) {
            // Como último recurso, buscar cualquier archivo en la carpeta común
            console.log("Intentando buscar cualquier archivo relacionado en la carpeta común...");
            
            try {
              // Esta parte sería mejor con una API del lado del servidor que liste archivos
              // Por ahora, intentamos algunas variantes comunes de formato de nombre
              const formatosFecha = [
                "", // Sin fecha
                "_20", // Años 2020+
                "_202", // Años 2020+
              ];
              
              let encontrado = false;
              
              for (const formatoFecha of formatosFecha) {
                const rutaBusqueda = `${baseUrl}/PUBLIC/PAGO/1/pago${formatoFecha}`;
                const rutaBusquedaMinusculas = `${baseUrl}/public/pago/1/pago${formatoFecha}`;
                
                console.log(`Buscando archivos que coincidan con: ${rutaBusqueda}*`);
                
                // Intentar con algunas posibles combinaciones
                const posiblesArchivos = [
                  `${rutaBusqueda}_${pago.id}.pdf`,
                  `${rutaBusquedaMinusculas}_${pago.id}.pdf`,
                  `${rutaBusqueda}*_${pago.id}.pdf`, // No funcionará directamente, solo es ilustrativo
                  `${rutaBusquedaMinusculas}*_${pago.id}.pdf`
                ];
                
                for (const posibleArchivo of posiblesArchivos) {
                  if (posibleArchivo.includes('*')) continue; // Saltamos los patrones con comodines
                  
                  console.log(`Verificando: ${posibleArchivo}`);
                  const existe = await verificarExistenciaArchivo(posibleArchivo);
                  
                  if (existe) {
                    console.log(`¡Encontrado documento en: ${posibleArchivo}!`);
                    setDocumento({
                      nombre: `Comprobante de pago #${pago.id}.pdf`,
                      ruta: posibleArchivo,
                      tipo: 'pdf'
                    });
                    setDocumentoError(false);
                    encontrado = true;
                    break;
                  }
                }
                
                if (encontrado) break;
              }
              
              if (!encontrado) {
                console.error(`No se pudo encontrar el documento para el pago ${pago.id} en ninguna ubicación`);
                // Establecer información de documento pero marcar como error
                setDocumento({
                  nombre: `Comprobante de pago #${pago.id}.pdf`,
                  ruta: `${baseUrl}/PUBLIC/PAGO/1/pago_${pago.id}.pdf`, // Ruta probable aunque no existe
                  tipo: 'pdf'
                });
                setDocumentoError(true);
              }
            } catch (err) {
              console.error("Error al buscar en carpeta común:", err);
              setDocumento({
                nombre: `Comprobante de pago #${pago.id}.pdf`,
                ruta: `${baseUrl}/PUBLIC/PAGO/1/documento.pdf`, // Ruta probable aunque no existe
                tipo: 'pdf'
              });
              setDocumentoError(true);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener documentos del servicio:', error);
        
        // Como es un error del servicio, intentar directamente en la carpeta común
        const baseUrl = window.location.origin;
        const rutaDirecta = `${baseUrl}/PUBLIC/PAGO/1/pago_${pago.id}.pdf`;
        const rutaDirectaMinusculas = `${baseUrl}/public/pago/1/pago_${pago.id}.pdf`;
        
        console.log(`Intentando ruta directa: ${rutaDirecta}`);
        const existeDirecta = await verificarExistenciaArchivo(rutaDirecta);
        
        if (existeDirecta) {
          console.log(`¡Documento encontrado en ruta directa!`);
          setDocumento({
            nombre: `Comprobante de pago #${pago.id}.pdf`,
            ruta: rutaDirecta,
            tipo: 'pdf'
          });
          setDocumentoError(false);
        } else {
          console.log(`Intentando ruta directa alternativa: ${rutaDirectaMinusculas}`);
          const existeDirectaAlt = await verificarExistenciaArchivo(rutaDirectaMinusculas);
          
          if (existeDirectaAlt) {
            console.log(`¡Documento encontrado en ruta directa alternativa!`);
            setDocumento({
              nombre: `Comprobante de pago #${pago.id}.pdf`,
              ruta: rutaDirectaMinusculas,
              tipo: 'pdf'
            });
            setDocumentoError(false);
          } else {
            setDocumento(null);
            setDocumentoError(true);
          }
        }
      }
    } catch (error) {
      console.error('Error general al obtener el documento:', error);
      setDocumento(null);
      setDocumentoError(true);
    } finally {
      setLoadingDoc(false);
    }
    
    // Abrir el modal de visualización
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
      
      console.log('Fecha pago formateada:', fechaPagoFormateada);
      console.log('Fecha real formateada:', fechaRealFormateada);
      
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
      
      console.log('Datos del pago a actualizar:', pagoData);

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
        
        // Subir el archivo con el nuevo nombre, pero indicando que debe guardarse en /pago/ (sin subcarpeta de ID)
        console.log('Subiendo archivo físico al servidor...');
        console.log('Parámetros para subir archivo:');
        console.log('- Documento:', nuevoArchivo.name);
        console.log('- ID del pago:', idPago);
        console.log('- Tipo de documento: pago');
        console.log('- Directorio destino: /pago/ (sin subcarpeta)');
        
        // Incluir un timeout para evitar problemas de concurrencia
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Pasar un parámetro adicional para indicar que no queremos subcarpeta
        const respuestaArchivo = await documentoService.subirArchivo(
          nuevoArchivo, 
          idPago, 
          'pago',
          { usarCarpetaComun: true }  // Parámetro adicional para indicar que use /pago/ en lugar de /pago/{id}/
        );
        console.log('Archivo subido con éxito:', respuestaArchivo);
        
        // Registrar los metadatos del documento con la nueva ruta en /pago/
        const documentoData = {
          nombre: nombreArchivo,
          ruta: respuestaArchivo.ruta || `/pago/${nombreArchivo}`,
          documentable_id: idPago,
          documentable_type: 'pago'
        };

        console.log('Registrando metadatos del documento:', documentoData);
        const respuestaDocumento = await documentoService.crearDocumento(documentoData);
        console.log('Documento registrado correctamente:', respuestaDocumento);        
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
        console.log('Respuesta del servidor:', error.response.data);
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
      
      console.log('Datos del pago a actualizar:', pagoData);

      // Actualizar el pago
      const pagoActualizado = await pagoService.actualizarPago(pagoSeleccionado.id, pagoData);
      
      alert('Pago actualizado correctamente.');
      
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
      
      // Recargar los pagos
      const todosLosPagos = await pagoService.obtenerPagos();
      setPagos(Array.isArray(todosLosPagos) ? todosLosPagos : []);
      setPagoSeleccionado(null);
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      alert('Error al actualizar el pago');
    }
  };

  // Función para cargar todos los pagos
  const cargarTodosPagos = async () => {
    try {
      setLoading2(true);
      console.log("Cargando todos los pagos...");
      
      const todosLosPagos = await pagoService.obtenerPagos();
      console.log(`Pagos obtenidos: ${todosLosPagos.length}`);
      
      setPagos(Array.isArray(todosLosPagos) ? todosLosPagos : []);
      
      // Si hay resultados, mostrar mensaje
      if (Array.isArray(todosLosPagos) && todosLosPagos.length > 0) {
        console.log(`Se han cargado ${todosLosPagos.length} pagos correctamente`);
      } else {
        console.warn("No se encontraron pagos en el sistema");
      }
    } catch (error) {
      console.error('Error al cargar todos los pagos:', error);
      alert('Error al cargar todos los pagos');
      setPagos([]);
    } finally {
      setLoading2(false);
    }
  };

  // Configuración de columnas para DataTable
  const columns = [
    {
      name: 'Inquilino',
      selector: row => `${row.inquilino_nombre || ''} ${row.inquilino_apellido || ''}`,
      sortable: true,
    },
    {
      name: 'DNI',
      selector: row => row.inquilino_dni || '',
      sortable: true,
    },
    {
      name: 'Monto',
      selector: row => row.monto || '',
      sortable: true,
    },
    {
      name: 'Fecha Programada',
      selector: row => row.fecha_pago,
      format: row => row.fecha_pago ? new Date(row.fecha_pago).toLocaleDateString() : '',
      sortable: true,
    },
    {
      name: 'Fecha Real',
      selector: row => row.fecha_real_pago,
      format: row => row.fecha_real_pago ? new Date(row.fecha_real_pago).toLocaleDateString() : '-',
      sortable: true,
    },
    {
      name: 'Método de Pago',
      selector: row => row.metodo_pago || '',
      sortable: true,
    },
    {
      name: 'Estado',
      selector: row => row.estado || '',
      sortable: true,
    },
    {
      name: 'Acción',
      cell: row => (
        <div className="actions">
          <button
            type="button"
            className="btn btn-sm btn-primary me-1"
            onClick={() => seleccionarPago(row)}
            title="Pagar"
          >
            <FiDollarSign />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-info me-1"
            onClick={() => editarPago(row)}
            title="Editar"
          >
            <FiEdit />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => verPago(row)}
            title="Ver"
          >
            <FiEye />
          </button>
        </div>
      ),
    },
  ];

  // Personalización del DataTable
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

  const paginationComponentOptions = {
    rowsPerPageText: 'Filas por página:',
    rangeSeparatorText: 'de',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Todos',
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
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <div className="form-heading">
                        <h4>Buscar Inquilino</h4>
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-4">
                      <div className="form-group">
                        <label>Buscar por</label>
                        <select 
                          className="form-select"
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value)}
                        >
                          <option value="dni">DNI</option>
                          <option value="nombre">Nombre</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-12 col-md-6">
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
                  
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="form-heading d-flex justify-content-between align-items-center">
                        <h4>Lista de Pagos</h4>
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
                      </div>
                      <div className="table-responsive">
                        <DataTable
                          columns={columns}
                          data={Array.isArray(pagos) ? pagos : []}
                          pagination
                          paginationPerPage={5}
                          paginationComponentOptions={paginationComponentOptions}
                          noDataComponent={loading2 ? 'Cargando...' : 'No hay pagos registrados'}
                          highlightOnHover
                          striped
                          responsive
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
                        styles={customStyles}
                        placeholder="Seleccionar método de pago"
                        required
                        value={metodosPago.find(m => m.value === formData.metodoPago) || null}
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
                        styles={customStyles}
                        placeholder="Seleccionar estado"
                        required
                        value={estadosPago.find(e => e.value === formData.estado) || null}
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
                        styles={customStyles}
                        placeholder="Seleccionar método de pago"
                        required
                        value={metodosPago.find(m => m.value === formData.metodoPago) || null}
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
                        styles={customStyles}
                        placeholder="Seleccionar estado"
                        required
                        value={estadosPago.find(e => e.value === formData.estado) || null}
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
                  
                  {!loadingDoc && documento ? (
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
                        <div className="document-actions">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => descargarDocumento(documento.ruta, documento.nombre)}
                            disabled={documentoError}
                          >
                            <FiDownload className="me-1" /> Descargar
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-primary"
                            onClick={() => abrirDocumentoEnNuevaVentana(documento.ruta)}
                            disabled={documentoError}
                          >
                            <FiEye className="me-1" /> Ver documento
                          </button>
                        </div>
                      </div>
                      
                      {/* Mensaje de error si el documento no está disponible */}
                      {documentoError && (
                        <div className="alert alert-danger">
                          <p className="mb-0"><strong>Error:</strong> El documento no se encuentra disponible o no puede ser accedido.</p>
                          <p className="mb-0 mt-2">Posibles causas:</p>
                          <ul className="mb-0">
                            <li>El documento no ha sido subido correctamente</li>
                            <li>La ruta del documento es incorrecta</li>
                            <li>No tienes permisos para acceder al documento</li>
                          </ul>
                          <p className="mt-2 mb-0">Rutas intentadas:</p>
                          <ul className="mb-0">
                            <li><code>{documento.ruta}</code></li>
                            <li><code>{window.location.origin}/PUBLIC/PAGO/1/pago_{pagoVisualizando.id}.pdf</code></li>
                            <li><code>{window.location.origin}/public/pago/1/pago_{pagoVisualizando.id}.pdf</code></li>
                          </ul>
                        </div>
                      )}
                      
                      {/* Vista previa del documento (solo para imágenes y si no hay error) */}
                      {documento.tipo === 'imagen' && !documentoError && (
                        <div className="document-preview text-center">
                          <img 
                            src={documento.ruta} 
                            alt="Comprobante de pago" 
                            className="img-fluid border rounded" 
                            style={{ maxHeight: '400px' }} 
                            onError={() => setDocumentoError(true)}
                          />
                        </div>
                      )}
                    </div>
                  ) : !loadingDoc && (
                    <div className="alert alert-warning">
                      <FiFileText className="me-2" /> No hay documento adjunto para este pago.
                      <p className="mt-2 mb-0">
                        <small>Ubicaciones intentadas:</small>
                        <ul className="mt-1 mb-0">
                          <li><small>PUBLIC/PAGO/1/pago_{pagoVisualizando.id}.pdf</small></li>
                          <li><small>public/pago/1/pago_{pagoVisualizando.id}.pdf</small></li>
                          <li><small>PUBLIC/PAGO/1/{pagoVisualizando.id}.pdf</small></li>
                          <li><small>public/pago/1/{pagoVisualizando.id}.pdf</small></li>
                          <li><small>PUBLIC/PAGO/{pagoVisualizando.id}</small></li>
                        </ul>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
};

export default ContabilidadPagos;