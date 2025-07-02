// Frontend/src/features/nearbySpaces/pages/NearbySpacesPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Alert, Spinner, Button, Form, Badge } from 'react-bootstrap';
import { 
    fetchNearbySpaces,
    selectNearbySpaces,
    selectNearbySpacesStatus,
    selectNearbySpacesError,
    selectUserLocation,
    selectSearchRadius,
    setUserLocation,
    setSearchRadius,
    clearError
} from '../slices/nearbySpacesSlice';
import NearbySpaceCard from '../components/NearbySpaceCard';

const NearbySpacesPage = () => {
    const dispatch = useDispatch();
    const spaces = useSelector(selectNearbySpaces);
    const status = useSelector(selectNearbySpacesStatus);
    const error = useSelector(selectNearbySpacesError);
    const userLocation = useSelector(selectUserLocation);
    const searchRadius = useSelector(selectSearchRadius);

    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Trình duyệt không hỗ trợ định vị.');
            return;
        }

        setIsGettingLocation(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                dispatch(setUserLocation(location));
                setIsGettingLocation(false);
            },
            (error) => {
                let errorMessage = 'Không thể lấy vị trí hiện tại.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Bạn đã từ chối quyền truy cập vị trí.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Thông tin vị trí không khả dụng.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Timeout khi lấy vị trí.';
                        break;
                }
                setLocationError(errorMessage);
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    };

    const handleSearch = () => {
        if (userLocation) {
            dispatch(fetchNearbySpaces({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                maxDistanceKm: searchRadius,
                maxResults: 20
            }));
        }
    };

    const handleRadiusChange = (e) => {
        const newRadius = parseFloat(e.target.value);
        dispatch(setSearchRadius(newRadius));
    };

    // Auto-search when location is available
    useEffect(() => {
        if (userLocation && status === 'idle') {
            handleSearch();
        }
    }, [userLocation]);

    // Get location on component mount
    useEffect(() => {
        if (!userLocation) {
            getCurrentLocation();
        }
    }, []);

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-3">
                        Không gian gần bạn
                        {spaces.length > 0 && (
                            <Badge bg="secondary" className="ms-2">{spaces.length}</Badge>
                        )}
                    </h2>
                    <p className="text-muted">
                        Tìm kiếm các không gian làm việc gần vị trí hiện tại của bạn.
                    </p>
                </Col>
            </Row>

            {/* Controls */}
            <Row className="mb-4">
                <Col md={6}>
                    <div className="d-flex gap-2 align-items-center mb-3">
                        <Button 
                            variant="outline-primary" 
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                        >
                            {isGettingLocation ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang lấy vị trí...
                                </>
                            ) : (
                                '📍 Lấy vị trí hiện tại'
                            )}
                        </Button>
                        
                        {userLocation && (
                            <Button 
                                variant="primary" 
                                onClick={handleSearch}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Đang tìm...
                                    </>
                                ) : (
                                    '🔍 Tìm kiếm'
                                )}
                            </Button>
                        )}
                    </div>

                    {userLocation && (
                        <Form.Group className="mb-3">
                            <Form.Label>Bán kính tìm kiếm: {searchRadius} km</Form.Label>
                            <Form.Range
                                min="1"
                                max="20"
                                step="1"
                                value={searchRadius}
                                onChange={handleRadiusChange}
                            />
                            <Form.Text className="text-muted">
                                Kéo để thay đổi bán kính tìm kiếm (1-20 km)
                            </Form.Text>
                        </Form.Group>
                    )}
                </Col>
            </Row>

            {/* Location Error */}
            {locationError && (
                <Alert variant="warning" dismissible onClose={() => setLocationError(null)}>
                    <Alert.Heading>Lỗi vị trí</Alert.Heading>
                    <p>{locationError}</p>
                    <hr />
                    <p className="mb-0">
                        Vui lòng cho phép truy cập vị trí hoặc thử lại sau.
                    </p>
                </Alert>
            )}

            {/* API Error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
                    <Alert.Heading>Lỗi tìm kiếm</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {/* Current Location Info */}
            {userLocation && (
                <Alert variant="info" className="mb-4">
                    <strong>📍 Vị trí hiện tại:</strong> {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                    <br />
                    <strong>🔍 Bán kính tìm kiếm:</strong> {searchRadius} km
                </Alert>
            )}

            {/* Loading State */}
            {status === 'loading' && (
                <div className="text-center py-4">
                    <Spinner animation="border" />
                    <p className="mt-2">Đang tìm kiếm không gian gần bạn...</p>
                </div>
            )}

            {/* No Location */}
            {!userLocation && !isGettingLocation && !locationError && (
                <Alert variant="warning" className="text-center">
                    <h5>Cần quyền truy cập vị trí</h5>
                    <p>
                        Để tìm các không gian gần bạn, chúng tôi cần quyền truy cập vị trí hiện tại.
                    </p>
                    <Button variant="primary" onClick={getCurrentLocation}>
                        📍 Cho phép truy cập vị trí
                    </Button>
                </Alert>
            )}

            {/* Results */}
            {status === 'succeeded' && userLocation && (
                <>
                    {spaces.length === 0 ? (
                        <Alert variant="info" className="text-center">
                            <h5>Không tìm thấy không gian nào</h5>
                            <p>
                                Không có không gian làm việc nào trong bán kính {searchRadius} km từ vị trí của bạn.
                                Hãy thử tăng bán kính tìm kiếm.
                            </p>
                        </Alert>
                    ) : (
                        <Row>
                            {spaces.map((space) => (
                                <Col key={space.id} xs={12} sm={6} lg={4} className="mb-4">
                                    <NearbySpaceCard space={space} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
};

export default NearbySpacesPage;
