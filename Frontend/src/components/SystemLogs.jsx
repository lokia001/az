// src/components/SystemLogs.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FaSync, FaFileExport, FaTrash } from 'react-icons/fa';
import systemLogService from '../services/systemLogService';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [levels, setLevels] = useState(['DEBUG', 'INFO', 'WARNING', 'ERROR', 'ADMIN_ACTION']);
    const [filters, setFilters] = useState({
        level: '',
        pageSize: 100
    });

    // Load logs on component mount
    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await systemLogService.getLogs(filters);
            setLogs(response.logs || []);
        } catch (error) {
            setError('Không thể tải system logs. Kiểm tra quyền truy cập SysAdmin.');
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadLogs();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        loadLogs();
    };

    const formatLogEntry = (log) => {
        const timestamp = new Date(log.timestamp).toLocaleString('vi-VN');
        const level = log.level.padEnd(12);
        const source = log.source.padEnd(25);
        
        let line = `[${timestamp}] ${level} ${source} ${log.message}`;
        
        if (log.userId) {
            line += ` | User: ${log.userId}`;
        }
        
        if (log.relatedEntityId) {
            line += ` | Entity: ${log.relatedEntityId}`;
        }
        
        if (log.ipAddress) {
            line += ` | IP: ${log.ipAddress}`;
        }
        
        if (log.errorDetails) {
            line += `\n    ↳ Error: ${log.errorDetails}`;
        }
        
        return line;
    };

    const getLogColor = (level) => {
        switch (level) {
            case 'ERROR': return '#ff6b6b';
            case 'WARNING': return '#ffa726';
            case 'INFO': return '#42a5f5';
            case 'DEBUG': return '#78909c';
            case 'ADMIN_ACTION': return '#66bb6a';
            default: return '#ffffff';
        }
    };

    return (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-dark text-white">
                <Row className="align-items-center">
                    <Col>
                        <h5 className="mb-0">
                            <FaSync className="me-2" />
                            System Logs
                        </h5>
                    </Col>
                    <Col xs="auto">
                        <Button 
                            variant="outline-light" 
                            size="sm" 
                            onClick={handleRefresh} 
                            disabled={loading}
                        >
                            <FaSync className={loading ? 'fa-spin' : ''} />
                            {loading ? ' Loading...' : ' Refresh'}
                        </Button>
                    </Col>
                </Row>
            </Card.Header>
            
            <Card.Body>
                {/* Filters */}
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Log Level</Form.Label>
                            <Form.Select 
                                name="level" 
                                value={filters.level} 
                                onChange={handleFilterChange}
                                size="sm"
                            >
                                <option value="">Tất cả levels</option>
                                {levels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Số lượng logs</Form.Label>
                            <Form.Select 
                                name="pageSize" 
                                value={filters.pageSize} 
                                onChange={handleFilterChange}
                                size="sm"
                            >
                                <option value={50}>50 logs</option>
                                <option value={100}>100 logs</option>
                                <option value={200}>200 logs</option>
                                <option value={500}>500 logs</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
                        <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                            Áp dụng filter
                        </Button>
                    </Col>
                </Row>

                {error && (
                    <Alert variant="danger" className="mb-3">
                        <strong>Lỗi:</strong> {error}
                    </Alert>
                )}

                {/* Logs Display Terminal Style */}
                <div 
                    style={{
                        height: '500px',
                        backgroundColor: '#1e1e1e',
                        color: '#ffffff',
                        fontFamily: 'Consolas, "Courier New", monospace',
                        fontSize: '13px',
                        padding: '15px',
                        overflowY: 'auto',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        lineHeight: '1.4'
                    }}
                >
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="light" />
                            <div className="mt-3 text-light">Đang tải system logs...</div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-danger py-5">
                            <div>❌ Không thể tải logs</div>
                            <div className="mt-2">Kiểm tra quyền SysAdmin và backend API</div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <div>📝 Không có logs để hiển thị</div>
                            <div className="mt-2">Hệ thống chưa ghi nhận log nào với filter hiện tại</div>
                        </div>
                    ) : (
                        <>
                            <div style={{ color: '#90caf9', marginBottom: '10px', borderBottom: '1px solid #444', paddingBottom: '5px' }}>
                                📊 Hiển thị {logs.length} logs (mới nhất trước)
                            </div>
                            {logs.map((log, index) => (
                                <div 
                                    key={index}
                                    style={{ 
                                        color: getLogColor(log.level),
                                        marginBottom: '3px',
                                        whiteSpace: 'pre-wrap',
                                        borderLeft: `3px solid ${getLogColor(log.level)}`,
                                        paddingLeft: '8px',
                                        opacity: 0.9
                                    }}
                                >
                                    {formatLogEntry(log)}
                                </div>
                            ))}
                        </>
                    )}
                </div>
                
                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        💡 Logs được tự động làm mới. Chỉ SysAdmin mới có thể xem.
                    </small>
                    <small className="text-muted">
                        {logs.length > 0 && `Logs hiển thị: ${logs.length}`}
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SystemLogs;
