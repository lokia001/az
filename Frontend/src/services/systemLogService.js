// src/services/systemLogService.js
import api from './api';

const SYSTEM_LOG_ENDPOINTS = {
    LOGS: '/admin/logs',
    LEVELS: '/admin/logs/levels',
    CLEANUP: '/admin/logs/cleanup',
    EXPORT: '/admin/logs/export'
};

class SystemLogService {
    // Lấy danh sách logs với filter và pagination
    async getLogs(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filters.page) params.append('page', filters.page);
            if (filters.pageSize) params.append('pageSize', filters.pageSize);
            if (filters.level) params.append('level', filters.level);
            if (filters.fromDate) params.append('fromDate', filters.fromDate);
            if (filters.toDate) params.append('toDate', filters.toDate);
            
            const response = await api.get(`${SYSTEM_LOG_ENDPOINTS.LOGS}?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching system logs:', error);
            throw error;
        }
    }

    // Lấy danh sách log levels
    async getLogLevels() {
        try {
            const response = await api.get(SYSTEM_LOG_ENDPOINTS.LEVELS);
            return response.data;
        } catch (error) {
            console.error('Error fetching log levels:', error);
            throw error;
        }
    }

    // Cleanup old logs
    async cleanupOldLogs() {
        try {
            const response = await api.post(SYSTEM_LOG_ENDPOINTS.CLEANUP);
            return response.data;
        } catch (error) {
            console.error('Error cleaning up logs:', error);
            throw error;
        }
    }

    // Export logs
    async exportLogs(format = 'json', filters = {}) {
        try {
            const params = new URLSearchParams();
            params.append('format', format);
            
            if (filters.level) params.append('level', filters.level);
            if (filters.fromDate) params.append('fromDate', filters.fromDate);
            if (filters.toDate) params.append('toDate', filters.toDate);
            
            const response = await api.get(`${SYSTEM_LOG_ENDPOINTS.EXPORT}?${params.toString()}`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            console.error('Error exporting logs:', error);
            throw error;
        }
    }
}

export default new SystemLogService();
