import React, { useEffect, useState, useRef } from "react";
import '../../assets/styles/table-styles.css';
import '../../assets/styles/select-components.css';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../components/imagepath';
import { FiChevronRight } from "react-icons/fi";
import { onShowSizeChange, itemRender } from '../../components/Pagination';
import { Table, DatePicker, message, Spin, Modal, Button, Form, Input, DatePicker as AntDatePicker } from 'antd';
import Select from 'react-select';
import { useAuth } from "../../utils/AuthContext";
import contratoService from "../../services/contratoService";
import inmuebleService from "../../services/inmuebleService";
import pisoService from "../../services/pisoService";
import documentoService from "../../services/documentoService";
import { API_URL } from "../../services/authService";
import moment from 'moment';
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { TextArea } = Input;
const { RangePicker } = AntDatePicker;

const ContratoRegistros = () => {
  const navigate = useNavigate();
  const { estaAutenticado, getAuthToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  
  // Estados para datos
  const [contratos, setContratos] = useState([]);
  const [filteredContratos, setFilteredContratos] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  
  // Estados para filtros
  const [selectedInmueble, setSelectedInmueble] = useState(null);
  const [selectedPiso, setSelectedPiso] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedEstado, setSelectedEstado] = useState(null);
  
  // Estados para modales
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false); // Modal para subir contrato firmado
  const [generatingPdf, setGeneratingPdf] = useState(false); // Estado para indicar generación de PDF
  const [uploadingDocument, setUploadingDocument] = useState(false); // Estado para carga de documento
  const [contratoFile, setContratoFile] = useState(null); // Archivo de contrato firmado
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Estados para manejo de archivos y carga
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [modalUploadVisible, setModalUploadVisible] = useState(false);
  const fileInputRef = useRef(null);
  
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  // Verificar autenticación
  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
    }
  }, [estaAutenticado, navigate]);

  // Cargar datos iniciales
  useEffect(() => {
    if (!estaAutenticado) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar inmuebles para los filtros
        const inmueblesData = await inmuebleService.obtenerInmuebles();
        setInmuebles(inmueblesData);
        
        // Cargar contratos con detalles
        const contratosData = await contratoService.obtenerContratosDetalles();
        
        if (Array.isArray(contratosData)) {
          // Para cada contrato, obtener su documento si existe
          const contratosConDocumentos = await Promise.all(
            contratosData.map(async (contrato) => {
              try {
                const documentos = await documentoService.obtenerDocumentosPorDocumentable(
                  contrato.id,
                  'contrato'
                );
                return {
                  ...contrato,
                  documento: documentos && documentos.length > 0 ? documentos[0] : null
                };
              } catch (error) {
                console.error(`Error al obtener documento para contrato ${contrato.id}:`, error);
                return contrato;
              }
            })
          );
          
          setContratos(contratosConDocumentos);
          setFilteredContratos(contratosConDocumentos);
        } else {
          console.error('Los datos de contratos no son un array:', contratosData);
          setContratos([]);
          setFilteredContratos([]);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo más tarde.");
        message.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [estaAutenticado]);

  // Cargar pisos cuando se selecciona un inmueble
  useEffect(() => {
    if (!selectedInmueble) {
      setPisos([]);
      return;
    }
    
    const fetchPisos = async () => {
      try {
        const pisosData = await pisoService.obtenerPorInmueble(selectedInmueble);
        setPisos(pisosData);
      } catch (err) {
        console.error("Error al cargar pisos:", err);
        setPisos([]);
        message.error("Error al cargar los pisos");
      }
    };
    
    fetchPisos();
  }, [selectedInmueble]);

  // Aplicar filtros
  useEffect(() => {
    if (!contratos.length) return;
    
    let filtered = [...contratos];
    
    // Filtrar por inmueble
    if (selectedInmueble) {
      filtered = filtered.filter(contrato => 
        contrato.inmueble_id && contrato.inmueble_id.toString() === selectedInmueble.toString()
      );
    }
    
    // Filtrar por piso
    if (selectedPiso) {
      filtered = filtered.filter(contrato => 
        contrato.piso_id && contrato.piso_id.toString() === selectedPiso.toString()
      );
    }
    
    // Filtrar por estado
    if (selectedEstado) {
      filtered = filtered.filter(contrato => 
        contrato.estado && contrato.estado.toLowerCase() === selectedEstado.toLowerCase()
      );
    }
    
    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(contrato => 
        (contrato.inquilino_nombre && contrato.inquilino_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.inquilino_apellido && contrato.inquilino_apellido.toLowerCase().includes(searchLower)) ||
        (contrato.espacio_nombre && contrato.espacio_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.inmueble_nombre && contrato.inmueble_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.descripcion && contrato.descripcion.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredContratos(filtered);
  }, [contratos, selectedInmueble, selectedPiso, selectedEstado, searchText]);

  const handleInmuebleChange = (value) => {
    setSelectedInmueble(value);
    setSelectedPiso(null); // Reiniciar piso al cambiar inmueble
  };

  const handlePisoChange = (value) => {
    setSelectedPiso(value);
  };

  const handleEstadoChange = (value) => {
    setSelectedEstado(value);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const contratosData = await contratoService.obtenerContratosDetalles();
      setContratos(Array.isArray(contratosData) ? contratosData : []);
      message.success("Datos actualizados");
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      message.error("Error al actualizar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      // Obtener el documento actualizado
      documentoService.obtenerDocumentosPorDocumentable(id, 'contrato')
        .then(documentos => {
          if (documentos && documentos.length > 0) {
            setContratoSeleccionado({
              ...contrato,
              documento: documentos[0]
            });
          } else {
            setContratoSeleccionado(contrato);
          }
          setViewModalVisible(true);
        })
        .catch(error => {
          console.error("Error al obtener documento:", error);
          setContratoSeleccionado(contrato);
          setViewModalVisible(true);
        });
    } else {
      message.error("No se encontró el contrato seleccionado");
    }
  };

  const handleEdit = (id) => {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      setContratoSeleccionado(contrato);
      
      // Configurar valores iniciales del formulario
      form.setFieldsValue({
        monto_alquiler: contrato.monto_alquiler,
        monto_garantia: contrato.monto_garantia,
        descripcion: contrato.descripcion,
        estado: contrato.estado,
        fechas: [
          moment(contrato.fecha_inicio),
          moment(contrato.fecha_fin)
        ],
        fecha_pago: moment(contrato.fecha_pago)
      });
      
      setEditModalVisible(true);
    } else {
      message.error("No se encontró el contrato seleccionado");
    }
  };

  const handleSaveEdit = async () => {
    try {
      setLoadingSave(true);
      // Validar formulario
      const values = await form.validateFields();
      
      // Preparar datos para enviar
      // Asegurarnos de que las fechas estén en formato YYYY-MM-DD
      const fechaInicio = values.fechas[0].format('YYYY-MM-DD');
      const fechaFin = values.fechas[1].format('YYYY-MM-DD');
      const fechaPago = values.fecha_pago.format('YYYY-MM-DD');
      
      const contratoData = {
        monto_alquiler: values.monto_alquiler,
        monto_garantia: values.monto_garantia,
        descripcion: values.descripcion,
        estado: values.estado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        fecha_pago: fechaPago
      };
      
      console.log('Actualizando contrato con datos:', contratoData);
      
      // Llamar al servicio para actualizar
      await contratoService.actualizarContrato(contratoSeleccionado.id, contratoData);
      
      // Guardar los datos actualizados para mostrar en el modal de éxito
      setUpdatedData({
        ...contratoData,
        inquilino_nombre: contratoSeleccionado.inquilino_nombre,
        inquilino_apellido: contratoSeleccionado.inquilino_apellido,
        inmueble_nombre: contratoSeleccionado.inmueble_nombre,
        espacio_nombre: contratoSeleccionado.espacio_nombre
      });
      
      // Actualizar la lista
      handleRefresh();
      
      // Cerrar modal de edición y mostrar modal de éxito
      setEditModalVisible(false);
      setShowSuccessModal(true);
      
    } catch (err) {
      console.error("Error al actualizar contrato:", err);
      message.error("Error al guardar cambios: " + (err.message || "Error desconocido"));
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id) => {
    if (!estaAutenticado) {
      message.error("No hay sesión activa");
      return;
    }
    
    try {
      await contratoService.eliminarContrato(id);
      message.success("Contrato eliminado correctamente");
      
      // Actualizar la lista de contratos
      const contratosData = await contratoService.obtenerContratosDetalles();
      setContratos(Array.isArray(contratosData) ? contratosData : []);
    } catch (err) {
      console.error("Error al eliminar contrato:", err);
      message.error("Error al eliminar el contrato");
    }
  };

  const handleLimpiarFiltros = () => {
    setSelectedInmueble(null);
    setSelectedPiso(null);
    setSelectedEstado(null);
    setSearchText("");
  };

  // Función para generar contrato en PDF
  const handleGenerarContratoPDF = async (id) => {
    try {
      setGeneratingPdf(true);
      const contrato = contratos.find(c => c.id === id);
      
      if (!contrato) {
        message.error("No se encontró el contrato seleccionado");
        return;
      }
      
      // Aquí utilizaríamos la biblioteca jsPDF para generar el PDF
      message.info("Generando contrato en PDF...");
      
      // Simulamos un tiempo de generación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear estructura HTML para el contrato (esto es un ejemplo)
      const contenidoContrato = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .subtitle { font-size: 16px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .info-row { display: flex; margin-bottom: 5px; }
              .info-label { font-weight: bold; width: 180px; }
              .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
              .signature { width: 45%; text-align: center; }
              .signature-line { border-top: 1px solid #000; margin-top: 50px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">CONTRATO DE ARRENDAMIENTO</div>
              <div class="subtitle">Folio: ${contrato.id}</div>
            </div>
            
            <div class="section">
              <div class="section-title">DATOS DEL PROPIETARIO</div>
              <div class="info-row"><div class="info-label">Razón Social:</div> EMPRESA DE ALQUILERES S.A.</div>
              <div class="info-row"><div class="info-label">RUC:</div> 20123456789</div>
              <div class="info-row"><div class="info-label">Dirección:</div> Av. Principal 123, Lima</div>
            </div>
            
            <div class="section">
              <div class="section-title">DATOS DEL ARRENDATARIO</div>
              <div class="info-row"><div class="info-label">Nombre:</div> ${contrato.inquilino_nombre} ${contrato.inquilino_apellido}</div>
              <div class="info-row"><div class="info-label">Documento:</div> ${contrato.inquilino_dni || 'No especificado'}</div>
              <div class="info-row"><div class="info-label">Email:</div> ${contrato.inquilino_email || 'No especificado'}</div>
              <div class="info-row"><div class="info-label">Teléfono:</div> ${contrato.inquilino_telefono || 'No especificado'}</div>
            </div>
            
            <div class="section">
              <div class="section-title">DATOS DEL INMUEBLE</div>
              <div class="info-row"><div class="info-label">Inmueble:</div> ${contrato.inmueble_nombre || 'No especificado'}</div>
              <div class="info-row"><div class="info-label">Espacio:</div> ${contrato.espacio_nombre || 'No especificado'}</div>
              <div class="info-row"><div class="info-label">Descripción:</div> ${contrato.espacio_descripcion || 'No especificado'}</div>
            </div>
            
            <div class="section">
              <div class="section-title">CONDICIONES DEL CONTRATO</div>
              <div class="info-row"><div class="info-label">Fecha de inicio:</div> ${new Date(contrato.fecha_inicio).toLocaleDateString()}</div>
              <div class="info-row"><div class="info-label">Fecha de fin:</div> ${new Date(contrato.fecha_fin).toLocaleDateString()}</div>
              <div class="info-row"><div class="info-label">Duración:</div> ${calcularDuracionContrato(contrato.fecha_inicio, contrato.fecha_fin)}</div>
              <div class="info-row"><div class="info-label">Monto de alquiler:</div> S/ ${parseFloat(contrato.monto_alquiler).toFixed(2)} mensuales</div>
              <div class="info-row"><div class="info-label">Monto de garantía:</div> S/ ${parseFloat(contrato.monto_garantia).toFixed(2)}</div>
              <div class="info-row"><div class="info-label">Fecha de pago mensual:</div> ${new Date(contrato.fecha_pago).getDate()} de cada mes</div>
            </div>
            
            <div class="section">
              <div class="section-title">OBSERVACIONES</div>
              <p>${contrato.descripcion || 'Sin observaciones adicionales.'}</p>
            </div>
            
            <div class="section">
              <p>Este contrato de arrendamiento se rige por las leyes vigentes en materia de arrendamiento. Ambas partes declaran estar de acuerdo con todas las cláusulas y condiciones establecidas en el presente documento.</p>
            </div>
            
            <div class="signatures">
              <div class="signature">
                <div class="signature-line"></div>
                <p>EL ARRENDADOR</p>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p>EL ARRENDATARIO</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
      // En una implementación real, aquí usaríamos jsPDF y html2canvas para convertir
      // este HTML a un PDF y descargarlo
      
      // Por ahora, simulamos la descarga
      const blob = new Blob([contenidoContrato], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Contrato_${contrato.id}_${contrato.inquilino_apellido}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success("Contrato generado correctamente");
      
    } catch (error) {
      console.error("Error al generar contrato PDF:", error);
      message.error("Error al generar el contrato en PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Función auxiliar para calcular la duración del contrato
  const calcularDuracionContrato = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferenciaMs = fin - inicio;
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    
    const años = Math.floor(dias / 365);
    const meses = Math.floor((dias % 365) / 30);
    const diasRestantes = dias % 30;
    
    let duracion = '';
    if (años > 0) duracion += `${años} año${años !== 1 ? 's' : ''} `;
    if (meses > 0) duracion += `${meses} mes${meses !== 1 ? 'es' : ''} `;
    if (diasRestantes > 0) duracion += `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`;
    
    return duracion.trim() || 'Indefinido';
  };

  // Función para abrir el modal de subida de contrato firmado
  const handleSubirContratoFirmado = (id) => {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      setContratoSeleccionado(contrato);
      setModalUploadVisible(true);
    } else {
      alert('No se encontró el contrato seleccionado');
    }
  };

  // Función para manejar la selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadAndActivate = async () => {
    try {
      if (!selectedFile) {
        message.error('Por favor, seleccione un archivo PDF para subir');
        return;
      }

      if (!contratoSeleccionado) {
        message.error('No se ha seleccionado ningún contrato');
        return;
      }

      // Verificar que el archivo sea PDF
      if (selectedFile.type !== 'application/pdf') {
        message.error('Solo se permiten archivos PDF');
        return;
      }

      // Verificar que el token esté disponible
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Error de autenticación. Por favor, inicie sesión nuevamente.');
        navigate('/login');
        return;
      }

      setLoadingUpload(true);
      message.loading('Subiendo contrato firmado...', 0);

      try {
        // Subir el documento
        const respuestaArchivo = await documentoService.subirArchivo(
          selectedFile,
          contratoSeleccionado.id,
          'contrato',
          { carpetaDestino: 'documentos/contrato' }
        );

        if (!respuestaArchivo || !respuestaArchivo.ruta) {
          throw new Error('No se recibió una respuesta válida del servidor al subir el archivo');
        }

        // Registrar el documento en la base de datos
        const documentoData = {
          nombre: selectedFile.name,
          ruta: respuestaArchivo.ruta,
          documentable_id: contratoSeleccionado.id,
          documentable_type: 'contrato'
        };

        await documentoService.crearDocumento(documentoData);

        // Actualizar el estado del contrato a activo
        await contratoService.actualizarContrato(contratoSeleccionado.id, {
          estado: 'activo'
        });

        message.destroy(); // Eliminar el mensaje de carga
        message.success('Contrato firmado subido y activado correctamente');
        setModalUploadVisible(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Actualizar la lista de contratos
        const contratosActualizados = await contratoService.obtenerContratosDetalles();
        setContratos(contratosActualizados);
        setFilteredContratos(contratosActualizados);
        
      } catch (uploadError) {
        message.destroy(); // Eliminar el mensaje de carga
        console.error('Error al subir contrato firmado:', uploadError);
        message.error(`Error al subir el contrato: ${uploadError.message}`);
      }
    } catch (error) {
      message.destroy(); // Eliminar el mensaje de carga
      console.error('Error general:', error);
      message.error('Ocurrió un error al procesar la solicitud');
    } finally {
      setLoadingUpload(false);
    }
  };

  // Función para ver documento
  const handleViewDocument = async (rutaDocumento) => {
    try {
        if (!rutaDocumento) {
            throw new Error('Ruta del documento no disponible');
        }
        
        console.log('Intentando abrir documento:', rutaDocumento);
        await documentoService.verDocumento(rutaDocumento);
    } catch (error) {
        console.error('Error al abrir documento:', error);
        message.error('Error al abrir el documento: ' + error.message);
    }
  };

  // Función para descargar documento
  const handleDownloadDocument = async (rutaDocumento, nombreArchivo) => {
    try {
        if (!rutaDocumento) {
            throw new Error('Ruta del documento no disponible');
        }
        
        console.log('Intentando descargar documento:', { ruta: rutaDocumento, nombre: nombreArchivo });
        await documentoService.descargarDocumento(rutaDocumento, nombreArchivo);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        message.error('Error al descargar el documento: ' + error.message);
    }
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    try {
      const dataForExcel = filteredContratos.map(item => ({
        'Inquilino': `${item.inquilino_nombre || ''} ${item.inquilino_apellido || ''}`,
        'Espacio': item.espacio_nombre || '',
        'Inmueble': item.inmueble_nombre || '',
        'Fecha Inicio': item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() : '',
        'Fecha Fin': item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : '',
        'Monto Alquiler': item.monto_alquiler ? `S/ ${parseFloat(item.monto_alquiler).toFixed(2)}` : '',
        'Monto Garantía': item.monto_garantia ? `S/ ${parseFloat(item.monto_garantia).toFixed(2)}` : '',
        'Estado': item.estado || '',
        'Fecha Pago': item.fecha_pago ? new Date(item.fecha_pago).toLocaleDateString() : ''
      }));
      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Contratos");
      // Guardar archivo
      const fecha = new Date().toISOString().slice(0,10);
      const fileName = `Contratos_${fecha}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      message.error('Error al exportar el reporte');
    }
  };

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
      title: "Espacio",
      dataIndex: "espacio_nombre",
      sorter: (a, b) => a.espacio_nombre?.localeCompare(b.espacio_nombre || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Inmueble",
      dataIndex: "inmueble_nombre",
      sorter: (a, b) => a.inmueble_nombre?.localeCompare(b.inmueble_nombre || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Fecha Inicio",
      dataIndex: "fecha_inicio",
      sorter: (a, b) => new Date(a.fecha_inicio || 0) - new Date(b.fecha_inicio || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Fecha Fin",
      dataIndex: "fecha_fin",
      sorter: (a, b) => new Date(a.fecha_fin || 0) - new Date(b.fecha_fin || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Monto Alquiler",
      dataIndex: "monto_alquiler",
      sorter: (a, b) => (parseFloat(a.monto_alquiler) || 0) - (parseFloat(b.monto_alquiler) || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A"),
    },
    {
      title: "Monto Garantía",
      dataIndex: "monto_garantia",
      sorter: (a, b) => (parseFloat(a.monto_garantia) || 0) - (parseFloat(b.monto_garantia) || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A"),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      sorter: (a, b) => a.estado?.localeCompare(b.estado || ''),
      render: (estado) => {
        if (!estado) return "N/A";
        
        const estadoColores = {
          activo: "text-success",
          inactivo: "text-warning",
          finalizado: "text-danger",
        };
        return <span className={estadoColores[estado.toLowerCase()] || ""}>{estado}</span>;
      },
    },
    {
      title: "Fecha Pago",
      dataIndex: "fecha_pago",
      sorter: (a, b) => new Date(a.fecha_pago || 0) - new Date(b.fecha_pago || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="action-buttons d-flex justify-content-center">
          <button
            className="btn btn-sm btn-primary me-1"
            onClick={() => handleView(record.id)}
            title="Ver detalles"
          >
            <EyeOutlined />
          </button>
          <button 
            className="btn btn-sm btn-warning me-1"
            onClick={() => handleEdit(record.id)}
            title="Editar contrato"
          >
            <EditOutlined />
          </button>
          <button
            className="btn btn-sm btn-info me-1"
            onClick={() => handleGenerarContratoPDF(record.id)}
            title="Generar contrato PDF"
            disabled={generatingPdf}
          >
            <i className="fas fa-file-pdf"></i>
            {generatingPdf && <span className="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>}
          </button>
          {record.estado === 'inactivo' && (
            <button
              className="btn btn-sm btn-success me-1"
              onClick={() => handleSubirContratoFirmado(record.id)}
              title="Subir contrato firmado y activar"
            >
              <i className="fas fa-upload"></i>
            </button>
          )}
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(record.id)}
            title="Eliminar contrato"
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <Sidebar id="menu-item5" id1="menu-items5" activeClassName="contrato-registros" />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Contratos</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FiChevronRight />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Lista de Contratos</li>
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
                          <h3>Lista de Contratos</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <form onSubmit={(e) => e.preventDefault()}>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Buscar por inquilino, espacio..."
                                  value={searchText}
                                  onChange={handleSearch}
                                />
                                <button className="btn" type="button">
                                  <SearchOutlined />
                                </button>
                              </form>
                            </div>
                            <div className="add-group">
                              <Link
                                to="/inquilinos-registrar"
                                className="btn btn-primary add-pluss ms-2"
                                title="Generar nuevo contrato"
                              >
                                <PlusOutlined />
                              </Link>
                              <button
                                className="btn btn-primary doctor-refresh ms-2"
                                onClick={handleRefresh}
                                title="Actualizar datos"
                              >
                                <i className="fas fa-sync-alt"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto text-end float-end ms-auto download-grp">
                        <button className="btn btn-outline-primary me-2" title="Exportar a Excel" onClick={exportToExcel}>
                          <i className="fas fa-file-excel"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* /Table Header */}

                  {/* Filtros */}
                  <div className="staff-search-table mb-4">
                    <div className="card">
                      {/*<div className="card-header bg-light">
                        <h5 className="mb-0">
                          <i className="fas fa-filter me-2"></i>
                          Filtros de búsqueda
                        </h5>
                      </div>*/}
                      <div className="card-body">
                        <form>
                          <div className="row">
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Inmueble</label>
                                <Select
                                  placeholder="Seleccionar inmueble"
                                  isClearable
                                  value={selectedInmueble ? { value: selectedInmueble, label: inmuebles.find(i => i.id === selectedInmueble)?.nombre } : null}
                                  onChange={(option) => handleInmuebleChange(option?.value)}
                                  options={inmuebles.map(inmueble => ({
                                    value: inmueble.id,
                                    label: inmueble.nombre
                                  }))}
                                  classNamePrefix="select"
                                />
                              </div>
                            </div>
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Piso</label>
                                <Select
                                  placeholder="Seleccionar piso"
                                  isClearable
                                  value={selectedPiso ? { value: selectedPiso, label: pisos.find(p => p.id === selectedPiso)?.nombre } : null}
                                  onChange={(option) => handlePisoChange(option?.value)}
                                  options={pisos.map(piso => ({
                                    value: piso.id,
                                    label: piso.nombre
                                  }))}
                                  isDisabled={!selectedInmueble}
                                  classNamePrefix="select"
                                />
                              </div>
                            </div>
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Estado del contrato</label>
                                <Select
                                  placeholder="Seleccionar estado"
                                  isClearable
                                  value={selectedEstado ? { value: selectedEstado, label: selectedEstado.charAt(0).toUpperCase() + selectedEstado.slice(1) } : null}
                                  onChange={(option) => handleEstadoChange(option?.value)}
                                  options={[
                                    { value: 'activo', label: 'Activo' },
                                    { value: 'inactivo', label: 'Inactivo' },
                                    { value: 'finalizado', label: 'Finalizado' }
                                  ]}
                                  classNamePrefix="select"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-12 d-flex justify-content-end">
                              <button 
                                type="button" 
                                className="btn btn-secondary me-2"
                                onClick={handleLimpiarFiltros}
                              >
                                <i className="fas fa-undo me-1"></i> Limpiar filtros
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  {/* /Filtros */}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center my-4">
                      <Spin tip="Cargando datos..." />
                    </div>
                  ) : (
                    <div className="table-responsive doctor-list">
                      <Table
                        pagination={{
                          total: filteredContratos.length,
                          showTotal: (total, range) =>
                            `Mostrando ${range[0]} de ${range[1]} de ${total} registros`,
                          pageSize: 10,
                          
                        }}
                        columns={columns}
                        dataSource={filteredContratos}
                        rowKey="id"
                        loading={loading}
                        rowSelection={rowSelection}
                        scroll={{ x: 'max-content' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ver Detalles */}
      <Modal
        title="Detalles del Contrato"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {contratoSeleccionado && (
          <div className="contrato-details">
            <div className="row">
              <div className="col-md-6">
                <h4>Información del Inquilino</h4>
                <p><strong>Nombre:</strong> {contratoSeleccionado.inquilino_nombre} {contratoSeleccionado.inquilino_apellido}</p>
                <p><strong>DNI:</strong> {contratoSeleccionado.inquilino_dni || 'No especificado'}</p>
                <p><strong>Email:</strong> {contratoSeleccionado.inquilino_email || 'No especificado'}</p>
                <p><strong>Teléfono:</strong> {contratoSeleccionado.inquilino_telefono || 'No especificado'}</p>
              </div>
              <div className="col-md-6">
                <h4>Información del Espacio</h4>
                <p><strong>Inmueble:</strong> {contratoSeleccionado.inmueble_nombre}</p>
                <p><strong>Espacio:</strong> {contratoSeleccionado.espacio_nombre}</p>
                <p><strong>Descripción:</strong> {contratoSeleccionado.espacio_descripcion || 'No especificada'}</p>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-md-6">
                <h4>Detalles del Contrato</h4>
                <p><strong>Estado:</strong> <span className={`text-${contratoSeleccionado.estado === 'activo' ? 'success' : contratoSeleccionado.estado === 'inactivo' ? 'warning' : 'danger'}`}>{contratoSeleccionado.estado}</span></p>
                <p><strong>Fecha Inicio:</strong> {new Date(contratoSeleccionado.fecha_inicio).toLocaleDateString()}</p>
                <p><strong>Fecha Fin:</strong> {new Date(contratoSeleccionado.fecha_fin).toLocaleDateString()}</p>
                <p><strong>Fecha Pago:</strong> {new Date(contratoSeleccionado.fecha_pago).toLocaleDateString()}</p>
              </div>
              <div className="col-md-6">
                <h4>Información Financiera</h4>
                <p><strong>Monto Alquiler:</strong> S/ {parseFloat(contratoSeleccionado.monto_alquiler).toFixed(2)}</p>
                <p><strong>Monto Garantía:</strong> S/ {parseFloat(contratoSeleccionado.monto_garantia).toFixed(2)}</p>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12">
                <h4>Documentos</h4>
                {contratoSeleccionado.documento ? (
                  <div className="document-actions">
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDocument(contratoSeleccionado.documento.ruta)}
                      className="me-2"
                    >
                      Ver Documento
                    </Button>
                    <Button
                      type="default"
                      icon={<i className="fas fa-download"></i>}
                      onClick={() => handleDownloadDocument(contratoSeleccionado.documento.ruta, contratoSeleccionado.documento.nombre)}
                    >
                      Descargar
                    </Button>
                  </div>
                ) : (
                  <p>No hay documentos asociados a este contrato.</p>
                )}
              </div>
            </div>
            {contratoSeleccionado.descripcion && (
              <div className="row mt-4">
                <div className="col-12">
                  <h4>Observaciones</h4>
                  <p>{contratoSeleccionado.descripcion}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Contrato"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancelar
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loadingSave}
            onClick={handleSaveEdit}
          >
            Guardar Cambios
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="monto_alquiler"
            label="Monto de Alquiler"
            rules={[{ required: true, message: 'Por favor ingrese el monto de alquiler' }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item
            name="monto_garantia"
            label="Monto de Garantía"
            rules={[{ required: true, message: 'Por favor ingrese el monto de garantía' }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item
            name="fechas"
            label="Período del Contrato"
            rules={[{ required: true, message: 'Por favor seleccione el período del contrato' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="fecha_pago"
            label="Fecha de Pago Mensual"
            rules={[{ required: true, message: 'Por favor seleccione la fecha de pago' }]}
          >
            <AntDatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
          >
            <Select>
              <Select.Option value="activo">Activo</Select.Option>
              <Select.Option value="inactivo">Inactivo</Select.Option>
              <Select.Option value="finalizado">Finalizado</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="descripcion"
            label="Observaciones"
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para subir contrato firmado */}
      <Modal
        title="Subir Contrato Firmado"
        open={modalUploadVisible}
        onCancel={() => {
          setModalUploadVisible(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setModalUploadVisible(false);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Cancelar
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={loadingUpload}
            onClick={handleUploadAndActivate}
          >
            Subir y Activar
          </Button>
        ]}
      >
        <div className="form-group">
          <label>Seleccionar archivo PDF del contrato firmado:</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <small className="form-text text-muted">
            Solo se permiten archivos PDF. El contrato debe estar firmado por todas las partes.
          </small>
        </div>
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
          <p>El contrato se ha actualizado correctamente con los siguientes datos:</p>
          {updatedData && (
            <ul style={{ listStyleType: 'none', padding: '10px' }}>
              <li><strong>Inquilino:</strong> {updatedData.inquilino_nombre} {updatedData.inquilino_apellido}</li>
              <li><strong>Inmueble:</strong> {updatedData.inmueble_nombre}</li>
              <li><strong>Espacio:</strong> {updatedData.espacio_nombre}</li>
              <li><strong>Monto Alquiler:</strong> S/ {parseFloat(updatedData.monto_alquiler).toFixed(2)}</li>
              <li><strong>Monto Garantía:</strong> S/ {parseFloat(updatedData.monto_garantia).toFixed(2)}</li>
              <li><strong>Fecha Inicio:</strong> {updatedData.fecha_inicio}</li>
              <li><strong>Fecha Fin:</strong> {updatedData.fecha_fin}</li>
              <li><strong>Fecha de Pago:</strong> {updatedData.fecha_pago}</li>
              <li><strong>Estado:</strong> {updatedData.estado}</li>
              {updatedData.descripcion && <li><strong>Observaciones:</strong> {updatedData.descripcion}</li>}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ContratoRegistros;