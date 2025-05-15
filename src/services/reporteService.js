import api from './api';

// Clase que maneja los servicios de reportes
class ReporteService {
    // Obtener todos los reportes
    async obtenerTodos() {
        try {
            const response = await api.get('/reportes');
            return response.data;
        } catch (error) {
            console.error('Error al obtener reportes:', error);
            throw error;
        }
    }

    // Obtener un reporte por ID
    async obtenerPorId(id) {
        try {
            const response = await api.get(`/reportes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener reporte con ID ${id}:`, error);
            throw error;
        }
    }

    // Crear un reporte
    async crear(reporte) {
        try {
            const response = await api.post('/reportes', reporte);
            return response.data;
        } catch (error) {
            console.error('Error al crear reporte:', error);
            throw error;
        }
    }

    // Actualizar un reporte
    async actualizar(id, reporte) {
        try {
            const response = await api.put(`/reportes/${id}`, reporte);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar reporte con ID ${id}:`, error);
            throw error;
        }
    }

    // Eliminar un reporte
    async eliminar(id) {
        try {
            const response = await api.delete(`/reportes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar reporte con ID ${id}:`, error);
            throw error;
        }
    }

    // Generar reporte de pagos con filtros
    async generarReportePagos(filtros = {}) {
        try {
            // Convertir los filtros a parámetros de URL
            const params = new URLSearchParams();
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await api.get(`/reportes/generar/pagos?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al generar reporte de pagos:', error);
            throw error;
        }
    }

    // Generar reporte de gastos con filtros
    async generarReporteGastos(filtros = {}) {
        try {
            // Convertir los filtros a parámetros de URL
            const params = new URLSearchParams();
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await api.get(`/reportes/generar/gastos?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al generar reporte de gastos:', error);
            throw error;
        }
    }
}

export default new ReporteService(); 