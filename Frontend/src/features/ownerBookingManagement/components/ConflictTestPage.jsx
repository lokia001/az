import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import ConflictAlert from '../components/ConflictAlert';
import { formatVietnameseDateTime } from '../../../utils/timeUtils';

const ConflictTestPage = () => {
    const [testBookings, setTestBookings] = useState([
        {
            id: '1',
            bookingCode: 'BK-TEST01',
            guestName: 'Nguyễn Văn A',
            userFullName: 'Nguyễn Văn A',
            notificationEmail: 'nguyenvana@example.com',
            startTime: '2025-07-03T09:00:00Z',
            endTime: '2025-07-03T11:00:00Z',
            status: 'Conflict',
            spaceId: 'space-1',
            spaceName: 'Văn phòng cao cấp ABC'
        },
        {
            id: '2',
            bookingCode: 'BK-TEST02',
            guestName: 'Trần Thị B',
            userFullName: 'Trần Thị B', 
            notificationEmail: 'tranthib@example.com',
            startTime: '2025-07-03T10:00:00Z',
            endTime: '2025-07-03T12:00:00Z',
            status: 'Conflict',
            spaceId: 'space-1',
            spaceName: 'Văn phòng cao cấp ABC'
        },
        {
            id: '3',
            bookingCode: 'BK-TEST03',
            guestName: 'Lê Văn C',
            userFullName: 'Lê Văn C',
            notificationEmail: 'levanc@example.com',
            startTime: '2025-07-03T08:00:00Z',
            endTime: '2025-07-03T09:30:00Z',
            status: 'Confirmed',
            spaceId: 'space-1',
            spaceName: 'Văn phòng cao cấp ABC'
        },
        {
            id: '4',
            bookingCode: 'BK-TEST04',
            guestName: 'Phạm Thị D',
            userFullName: 'Phạm Thị D',
            notificationEmail: 'phamthid@example.com',
            startTime: '2025-07-03T13:00:00Z',
            endTime: '2025-07-03T15:00:00Z',
            status: 'Pending',
            spaceId: 'space-1',
            spaceName: 'Văn phòng cao cấp ABC'
        }
    ]);

    const handleResolveConflict = async (bookingId, action) => {
        console.log(`Resolving conflict for booking ${bookingId} with action: ${action}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTestBookings(prevBookings => 
            prevBookings.map(booking => {
                if (booking.id === bookingId) {
                    return { ...booking, status: action };
                } else if (booking.status === 'Conflict' && action === 'Confirmed') {
                    // Simulate auto-cancel other conflicts
                    return { ...booking, status: 'Cancelled' };
                }
                return booking;
            })
        );
        
        alert(`Booking ${bookingId} đã được ${action === 'Confirmed' ? 'xác nhận' : 'hủy'}!`);
    };

    const resetTestData = () => {
        setTestBookings(prev => prev.map(booking => ({
            ...booking,
            status: booking.id === '1' || booking.id === '2' ? 'Conflict' :
                   booking.id === '3' ? 'Confirmed' : 'Pending'
        })));
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Conflict': 'danger',
            'Confirmed': 'success', 
            'Pending': 'warning',
            'Cancelled': 'secondary'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">🧪 Test Conflict Management System</h2>
            
            <Alert variant="info" className="mb-4">
                <h5>Hướng dẫn test:</h5>
                <ol>
                    <li>Trang này mô phỏng tình huống có 2 booking xung đột (màu đỏ)</li>
                    <li>Nhấn "Xem chi tiết & Giải quyết" trong cảnh báo để mở popup</li>
                    <li>Xem timeline trực quan và chọn xác nhận hoặc hủy booking</li>
                    <li>Khi xác nhận 1 booking, booking xung đột khác sẽ tự động bị hủy</li>
                </ol>
                <Button variant="outline-primary" size="sm" onClick={resetTestData}>
                    🔄 Reset test data
                </Button>
            </Alert>

            {/* Component chính cần test */}
            <ConflictAlert 
                bookings={testBookings}
                onResolveConflict={handleResolveConflict}
            />

            {/* Hiển thị danh sách booking để theo dõi */}
            <Card className="mt-4">
                <Card.Header>
                    <h5 className="mb-0">📋 Danh sách booking test</h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        {testBookings.map(booking => (
                            <Col md={6} key={booking.id} className="mb-3">
                                <Card className="h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6>{booking.guestName}</h6>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                        <div className="small mb-1">
                                            <strong>Mã:</strong> {booking.bookingCode}
                                        </div>
                                        <div className="small mb-1">
                                            <strong>Thời gian:</strong><br/>
                                            {formatVietnameseDateTime(booking.startTime)}<br/>
                                            đến {formatVietnameseDateTime(booking.endTime)}
                                        </div>
                                        <div className="small">
                                            <strong>Email:</strong> {booking.notificationEmail}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ConflictTestPage;
