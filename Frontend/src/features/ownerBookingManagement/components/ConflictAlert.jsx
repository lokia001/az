import React, { useState, useEffect } from 'react';
import { Alert, Button, Modal, Row, Col, Badge, Card } from 'react-bootstrap';
import { ExclamationTriangle, Clock, Calendar } from 'react-bootstrap-icons';
import { formatVietnameseDateTime } from '../../../utils/timeUtils';
import ConflictTimelineModal from './ConflictTimelineModal';

const ConflictAlert = ({ bookings, onResolveConflict, loading = false }) => {
    const [showModal, setShowModal] = useState(false);
    const [conflictBookings, setConflictBookings] = useState([]);
    const [currentSpaceConflicts, setCurrentSpaceConflicts] = useState([]);
    const [currentSpaceName, setCurrentSpaceName] = useState('');

    useEffect(() => {
        // Kiểm tra nếu bookings không tồn tại hoặc rỗng
        if (!bookings || bookings.length === 0) {
            setConflictBookings([]);
            setCurrentSpaceConflicts([]);
            setCurrentSpaceName('');
            return;
        }

        // Tìm tất cả booking có status Conflict
        const conflicts = bookings.filter(booking => booking.status === 'Conflict');
        setConflictBookings(conflicts);

        if (conflicts.length > 0) {
            // Nhóm conflicts theo spaceId
            const conflictsBySpace = conflicts.reduce((acc, booking) => {
                const spaceId = booking.spaceId;
                if (!acc[spaceId]) {
                    acc[spaceId] = [];
                }
                acc[spaceId].push(booking);
                return acc;
            }, {});

            // Lấy space đầu tiên có conflict để hiển thị
            const firstSpaceId = Object.keys(conflictsBySpace)[0];
            const firstSpaceConflicts = conflictsBySpace[firstSpaceId] || [];
            
            setCurrentSpaceConflicts(firstSpaceConflicts);
            
            // Lấy tên space từ booking đầu tiên
            if (firstSpaceConflicts.length > 0) {
                setCurrentSpaceName(firstSpaceConflicts[0].spaceName || 'Không gian');
            }
        } else {
            setCurrentSpaceConflicts([]);
            setCurrentSpaceName('');
        }
    }, [bookings, loading]);

    if (currentSpaceConflicts.length === 0) {
        return null; // Không hiển thị gì nếu không có xung đột
    }

    const handleShowDetails = () => {
        setShowModal(true);
    };

    const handleResolveConflict = async (bookingId, action) => {
        try {
            await onResolveConflict(bookingId, action);
            setShowModal(false);
            // Sau khi resolve, useEffect sẽ tự động cập nhật để hiển thị conflict tiếp theo
        } catch (error) {
            console.error('Failed to resolve conflict:', error);
        }
    };

    // Đếm tổng số space có conflicts
    const conflictsBySpace = conflictBookings.reduce((acc, booking) => {
        const spaceId = booking.spaceId;
        if (!acc[spaceId]) {
            acc[spaceId] = 0;
        }
        acc[spaceId]++;
        return acc;
    }, {});
    const totalConflictSpaces = Object.keys(conflictsBySpace).length;

    return (
        <>
            {/* Cảnh báo cố định hiển thị liên tục */}
            <Alert variant="danger" className="mb-3 shadow-sm border-0" style={{ 
                position: 'sticky', 
                top: '20px', 
                zIndex: 1020,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)'
            }}>
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <ExclamationTriangle className="text-danger me-2" size={24} />
                        <div>
                            <strong className="text-danger">🚨 Phát hiện xung đột booking!</strong>
                            <div className="mt-1 text-dark">
                                Space: <strong>{currentSpaceName}</strong> - 
                                Có <strong>{currentSpaceConflicts.length}</strong> booking đang xung đột thời gian
                                {totalConflictSpaces > 1 && (
                                    <div className="small text-muted mt-1">
                                        (Còn {totalConflictSpaces - 1} space khác cần giải quyết)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={handleShowDetails}
                        className="btn-sm px-3"
                        style={{ borderRadius: '20px' }}
                    >
                        Xem chi tiết & Giải quyết
                    </Button>
                </div>
            </Alert>

            {/* Modal hiển thị chi tiết xung đột */}
            <ConflictTimelineModal 
                show={showModal}
                onHide={() => setShowModal(false)}
                conflictBookings={currentSpaceConflicts}
                spaceName={currentSpaceName}
                onResolveConflict={handleResolveConflict}
            />
        </>
    );
};

export default ConflictAlert;
