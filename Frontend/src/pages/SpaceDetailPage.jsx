// src/pages/SpaceDetailPage.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
// Import Bootstrap Icons CSS
import 'bootstrap-icons/font/bootstrap-icons.css';

import {
    fetchSpaceDetail,
    selectCurrentSpaceDetail,
    selectSpaceDetailStatus,
    selectSpaceDetailError,
    clearCurrentSpace,
} from '../features/spaceDetail/slices/spaceDetailSlice';

import { selectCreateStatus } from '../features/booking/slices/bookingSlice';

import InteractiveMap from '../features/spaceSearch/components/InteractiveMap';
import { geocodeAddress } from '../utils/geocoding';
import StarRatingDisplay from '../components/common/StarRatingDisplay';
import ReviewList from '../features/reviews/components/ReviewList';
import BookingFormModal from '../features/booking/components/BookingFormModal';
import { getPublicOwnerProfile } from '../services/api';
import FavoriteButton from '../features/favoriteSpaces/components/FavoriteButton';

// Helper function to get image URLs from space object
const getImageUrl = (space, index = 0, placeholderSize = "800x500") => {
    if (space && space.spaceImages && space.spaceImages.length > index && space.spaceImages[index].imageUrl) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const imgUrl = space.spaceImages[index].imageUrl;

        // Check if imgUrl is already a full URL
        if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
            return imgUrl;
        }
        // Ensure no double slashes
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanImgUrl = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;

        return `${cleanBaseUrl}${cleanImgUrl}`;
    }
    const spaceNameForPlaceholder = space && space.name ? space.name : 'Space Image';
    return `https://via.placeholder.com/${placeholderSize}?text=${encodeURIComponent(spaceNameForPlaceholder + ' ' + (index + 1))}`;
};

// Placeholder for AmenitiesList if not imported from a separate file
const AmenitiesList = ({ space }) => {
    if (!space || (!space.systemAmenities?.length && !space.customAmenities?.length)) {
        return <p>Không có thông tin tiện ích đặc biệt.</p>;
    }
    const amenitiesToDisplay = [];
    if (space.systemAmenities) space.systemAmenities.forEach(am => amenitiesToDisplay.push(am.name.replace('systemAmenityId_', '')));
    if (space.customAmenities) space.customAmenities.forEach(am => amenitiesToDisplay.push(am.name));

    return (
        <>
            <h4 className="h5 mt-0 mb-3">Tiện ích không gian</h4>
            <ul className="list-unstyled row row-cols-1 row-cols-sm-2">
                {amenitiesToDisplay.map((amenity, index) => (
                    <li key={index} className="col mb-1">✓ {amenity}</li>
                ))}
            </ul>
        </>
    );
};

const SECTIONS = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'amenities', label: 'Tiện ích' },
    { id: 'map-location', label: 'Bản đồ Vị trí' },
    { id: 'pricing', label: 'Giá' }, // Enabled pricing section
    { id: 'reviews', label: 'Đánh giá' },
];

const MAIN_NAVBAR_HEIGHT = 70; // CRITICAL: Adjust to your actual main navbar height in pixels

function SpaceDetailPage() {
    const { spaceIdOrSlug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const space = useSelector(selectCurrentSpaceDetail);
    const status = useSelector(selectSpaceDetailStatus);
    const error = useSelector(selectSpaceDetailError);
    const bookingCreateStatus = useSelector(selectCreateStatus);
    
    // Get current user
    const currentUser = useSelector(state => state.auth.user);
    const isOwner = currentUser?.roles?.includes('Owner') || currentUser?.roles?.includes('SysAdmin');
    const isOwnerOfThisSpace = isOwner && space && currentUser && space.ownerId === currentUser.id;
    
    // Check if user can book - exclude Owner, SysAdmin, and Guest roles
    const canBook = currentUser && 
        !currentUser.roles?.includes('Owner') && 
        !currentUser.roles?.includes('SysAdmin') && 
        !currentUser.roles?.includes('Guest');

    const [mainImage, setMainImage] = useState(null);
    const [activeTabKey, setActiveTabKey] = useState(SECTIONS[0].id);
    const [isTabsBarSticky, setIsTabsBarSticky] = useState(false);
    const [stickyTabsBarHeight, setStickyTabsBarHeight] = useState(0);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showBookingSuccess, setShowBookingSuccess] = useState(false);
    const [ownerInfo, setOwnerInfo] = useState(null);

    // Map State
    const [detailMapCenter, setDetailMapCenter] = useState(null);
    const [detailMapZoom, setDetailMapZoom] = useState(15);
    const [detailMapMarker, setDetailMapMarker] = useState(null);
    const [isDetailMapLoading, setIsDetailMapLoading] = useState(false);

    // Refs
    const sectionRefs = useRef({});
    SECTIONS.forEach(section => { sectionRefs.current[section.id] = React.createRef(); });
    const contentStartMarkerRef = useRef(null); // Marks the element after which scrolling makes tabs sticky
    const stickyTabsNavRef = useRef(null);      // Ref for the <Nav> component that becomes sticky

    // Effect 1: Fetch space details
    useEffect(() => {
        console.log(`[DetailPage] Effect 1: spaceIdOrSlug is "${spaceIdOrSlug}". Current status: "${status}"`);
        if (spaceIdOrSlug) {
            // If the current space is different or status is idle (initial load/cleared), then fetch
            if (!space || space.id !== spaceIdOrSlug || space.slug !== spaceIdOrSlug) {
                if (status !== 'loading') { // Avoid dispatching if already loading this exact space
                    console.log(`[DetailPage] Dispatching clearCurrentSpace and fetchSpaceDetail for "${spaceIdOrSlug}"`);
                    dispatch(clearCurrentSpace()); // Reset status to 'idle' for the new fetch
                    dispatch(fetchSpaceDetail(spaceIdOrSlug));
                }
            } else if (status === 'idle' && (!space || (space.id !== spaceIdOrSlug && space.slug !== spaceIdOrSlug))) {
                // This handles initial load if space is null and status is idle
                console.log(`[DetailPage] Initial load or cleared state, dispatching fetchSpaceDetail for "${spaceIdOrSlug}"`);
                dispatch(fetchSpaceDetail(spaceIdOrSlug));
            }
        }
        return () => {
            // Optional: Clear current space when navigating away from this detail page
            // dispatch(clearCurrentSpace());
        };
    }, [dispatch, spaceIdOrSlug]); // Only re-run if spaceIdOrSlug changes

    // Effect 1.5: Reset component state when spaceIdOrSlug changes (after fetch is initiated)
    useEffect(() => {
        console.log("[DetailPage] Effect 1.5: Resetting local component state due to spaceIdOrSlug change.");
        setMainImage(null);
        setActiveTabKey(SECTIONS[0].id);
        setIsTabsBarSticky(false);
        setStickyTabsBarHeight(0);
        setDetailMapCenter(null);
        setDetailMapMarker(null);
        setIsDetailMapLoading(false);
        setShowBookingModal(false);
    }, [spaceIdOrSlug]);

    // Effect 2: Set main image
    useEffect(() => {
        if (space?.spaceImages?.length > 0) {
            const coverImage = space.spaceImages.find(img => img.isCoverImage) || space.spaceImages[0];
            setMainImage(getImageUrl(space, space.spaceImages.indexOf(coverImage)));
        } else if (space) {
            setMainImage(getImageUrl(space));
        } else {
            setMainImage(null);
        }
    }, [space]);

    // Effect 3: Setup map for the current space
    useEffect(() => {
        const setupMapForSpace = async () => {
            if (space && status === 'succeeded') { // Only run if space data is successfully loaded
                setIsDetailMapLoading(true);
                if (space.latitude != null && space.longitude != null) {
                    const coords = { lat: space.latitude, lng: space.longitude };
                    setDetailMapCenter(coords);
                    setDetailMapMarker({ ...coords, title: space.name, id: space.id, isGeocodedLocation: true }); // Mark as primary
                    setDetailMapZoom(16);
                } else if (space.address) {
                    const coords = await geocodeAddress(space.address);
                    if (coords) {
                        setDetailMapCenter(coords);
                        setDetailMapMarker({ ...coords, title: space.name, id: space.id, isGeocodedLocation: true });
                        setDetailMapZoom(16);
                    } else {
                        setDetailMapCenter(null); setDetailMapMarker(null);
                    }
                } else {
                    setDetailMapCenter(null); setDetailMapMarker(null);
                }
                setIsDetailMapLoading(false);
            } else if (!space) {
                setDetailMapCenter(null); setDetailMapMarker(null);
            }
        };
        setupMapForSpace();
    }, [space, status]);

    // Effect 4: Handle scroll for sticky tabs and active tab highlighting
    useEffect(() => {
        const handleScroll = () => {
            if (!contentStartMarkerRef.current) {
                // If contentStartMarkerRef isn't rendered yet (e.g. space is null), don't do scroll logic
                if (isTabsBarSticky) setIsTabsBarSticky(false); // Ensure tabs are not sticky if content isn't there
                return;
            }

            const contentStartTop = contentStartMarkerRef.current.getBoundingClientRect().top;
            const shouldTabsBeSticky = contentStartTop <= MAIN_NAVBAR_HEIGHT;

            if (shouldTabsBeSticky !== isTabsBarSticky) {
                setIsTabsBarSticky(shouldTabsBeSticky);
            }

            // Determine active tab
            let newActiveSectionId = activeTabKey; // Default to current
            const currentStickyNavHeight = stickyTabsNavRef.current?.offsetHeight || 0;
            const scrollThreshold = MAIN_NAVBAR_HEIGHT + (shouldTabsBeSticky ? currentStickyNavHeight : 0) + 20; // Add a small buffer

            for (let i = SECTIONS.length - 1; i >= 0; i--) {
                const section = SECTIONS[i];
                if (section.disabled) continue;
                const element = sectionRefs.current[section.id]?.current;
                if (element) {
                    if (element.getBoundingClientRect().top <= scrollThreshold) {
                        newActiveSectionId = section.id;
                        break;
                    }
                }
            }
            // Check if near bottom of page for last section activation
            const lastEnabledSection = SECTIONS.filter(s => !s.disabled).slice(-1)[0];
            if (lastEnabledSection) {
                const lastSectionEl = sectionRefs.current[lastEnabledSection.id]?.current;
                if (lastSectionEl && (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100)) { // 100px buffer from bottom
                    newActiveSectionId = lastEnabledSection.id;
                }
            }

            if (activeTabKey !== newActiveSectionId) {
                setActiveTabKey(newActiveSectionId);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check on mount/update
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isTabsBarSticky, activeTabKey]); // Only re-bind scroll listener if these key states change

    // Effect 5: Update stickyTabsBarHeight when isTabsBarSticky changes AND the ref is available
    useEffect(() => {
        if (isTabsBarSticky && stickyTabsNavRef.current) {
            setStickyTabsBarHeight(stickyTabsNavRef.current.offsetHeight);
        } else if (!isTabsBarSticky) {
            setStickyTabsBarHeight(0); // Reset when not sticky
        }
    }, [isTabsBarSticky]); // Only depends on isTabsBarSticky

    const handleTabSelect = useCallback((selectedKey) => {
        const element = sectionRefs.current[selectedKey]?.current;
        if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offset = MAIN_NAVBAR_HEIGHT + stickyTabsBarHeight + 15; // 15px extra padding
            const targetScrollPosition = elementPosition - offset;

            window.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth',
            });
        }
    }, [stickyTabsBarHeight]); // Depends on stickyTabsBarHeight

    // If user is the owner of this space, redirect to owner detail page
    useEffect(() => {
        if (isOwnerOfThisSpace && space && space.id) {
            console.log(`[SpaceDetailPage] Redirecting owner to owner detail page for space ID: ${space.id}`);
            navigate(`/owner/manage-spaces/${space.id}`);
        }
    }, [isOwnerOfThisSpace, space, navigate]);
    
    // Monitor booking status for success notification
    useEffect(() => {
        if (bookingCreateStatus === 'succeeded') {
            setShowBookingSuccess(true);
            setTimeout(() => {
                setShowBookingSuccess(false);
            }, 5000); // Hide after 5 seconds
        }
    }, [bookingCreateStatus]);
    
    // Effect 6: Fetch owner information when space is loaded
    useEffect(() => {
        if (space && space.ownerId) {
            const fetchOwnerInfo = async () => {
                try {
                    console.log(`[SpaceDetailPage] Fetching owner info for ownerId: ${space.ownerId}`);
                    const ownerData = await getPublicOwnerProfile(space.ownerId);
                    setOwnerInfo(ownerData);
                    console.log('[SpaceDetailPage] Owner info fetched successfully:', ownerData);
                } catch (error) {
                    console.error('[SpaceDetailPage] Error fetching owner info:', error);
                    // On error, show a fallback display without company info
                    setOwnerInfo(null);
                }
            };

            fetchOwnerInfo();
        } else {
            setOwnerInfo(null);
        }
    }, [space]);
    
    // --- Loading and Error States ---
    if (status === 'loading' && !space) { 
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3">Đang tải chi tiết không gian...</p>
            </Container>
        ); 
    }
    
    if (status === 'failed' && error) { 
        return (
            <Container className="text-center py-5">
                <Alert variant="danger">
                    <h4>Lỗi tải dữ liệu</h4>
                    <p>{String(error)}</p>
                    <Button variant="outline-primary" onClick={() => navigate(-1)}>Quay lại</Button>
                </Alert>
            </Container>
        ); 
    }
    
    if (space?.isNotFound) {
        // Xử lý trường hợp đặc biệt khi không gian không tìm thấy nhưng chúng ta trả về đối tượng giả lập
        return (
            <Container className="text-center py-5">
                <Alert variant="warning">
                    <h4>Không tìm thấy không gian</h4>
                    <p>Không gian với ID '{spaceIdOrSlug}' không tồn tại hoặc đã bị xóa.</p>
                    <Button variant="outline-primary" onClick={() => navigate(-1)}>Quay lại</Button>
                </Alert>
            </Container>
        );
    }
    
    if (status !== 'loading' && !space) { 
        return (
            <Container className="text-center py-5">
                <Alert variant="warning">Không tìm thấy thông tin không gian.</Alert>
                <Button variant="outline-primary" onClick={() => navigate(-1)}>Quay lại</Button>
            </Container>
        ); 
    }
    
    if (!space) return null; // Should be caught by above

    const breadcrumbItems = [
        { path: '/', label: 'Trang chủ' },
        { path: `/spaces/${spaceIdOrSlug}`, label: space.name },
    ];
    
    const handleOpenBookingModal = () => {
        if (!currentUser) {
            // Redirect to login if not authenticated
            navigate('/login', { 
                state: { 
                    from: `/spaces/${spaceIdOrSlug}`,
                    message: 'Vui lòng đăng nhập để đặt phòng.' 
                } 
            });
            return;
        }
        setShowBookingModal(true);
    };
    
    const handleCloseBookingModal = () => setShowBookingModal(false);

    return (
        <>
            <Container fluid className="py-3 px-md-4">
                {/* Success alert after booking */}
                {showBookingSuccess && (
                    <Alert variant="success" className="mb-3 d-flex align-items-center" dismissible onClose={() => setShowBookingSuccess(false)}>
                        <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                        <div>
                            <strong>Đặt phòng thành công!</strong>
                            <p className="mb-0">Cảm ơn bạn đã đặt phòng tại không gian này. Chủ không gian sẽ xác nhận đặt phòng của bạn sớm.</p>
                        </div>
                    </Alert>
                )}
                
                {/* Header & Image Gallery */}
                <Row className="mb-3 align-items-center">
                    <Col xs="auto">
                        <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
                            ← BACK TO LISTING
                        </Button>
                    </Col>
                    <Col>
                        <Breadcrumb listProps={{ className: "mb-0 bg-transparent p-0" }}>
                            {breadcrumbItems.map((item, index) => (
                                <Breadcrumb.Item 
                                    key={index} 
                                    linkAs={Link} 
                                    linkProps={{ to: item.path }} 
                                    active={index === breadcrumbItems.length - 1}
                                >
                                    {item.label}
                                </Breadcrumb.Item>
                            ))}
                        </Breadcrumb>
                    </Col>
                </Row>
                
                <Row className="mb-4">
                    <Col md={8} className="mb-3 mb-md-0">
                        {mainImage && (
                            <div style={{ 
                                height: '400px', 
                                width: '100%', 
                                overflow: 'hidden', 
                                borderRadius: '0.375rem',
                                cursor: 'pointer'
                            }}>
                                <Image 
                                    src={mainImage} 
                                    alt={`Hình ảnh chính của ${space.name}`} 
                                    style={{ 
                                        height: '100%', 
                                        width: '100%', 
                                        objectFit: 'cover',
                                        objectPosition: 'center'
                                    }} 
                                />
                            </div>
                        )}
                    </Col>
                    <Col md={4}>
                        <Row xs={2} className="g-2">
                            {space.spaceImages?.slice(0, 4).map((img, index) => (
                                <Col key={img.id || index}>
                                    <div style={{ 
                                        height: '190px', 
                                        width: '100%', 
                                        overflow: 'hidden', 
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer'
                                    }}>
                                        <Image 
                                            src={getImageUrl(space, space.spaceImages.indexOf(img), "200x190")} 
                                            alt={`Thumbnail ${index + 1}`} 
                                            onClick={() => setMainImage(getImageUrl(space, space.spaceImages.indexOf(img)))} 
                                            style={{ 
                                                height: '100%', 
                                                width: '100%', 
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                transition: 'transform 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        />
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>

                <Row>
                    {/* Left Column */}
                    <Col lg={8} className="mb-4 mb-lg-0">
                        {/* This div is the reference point for when sticky tabs should appear */}
                        <div ref={contentStartMarkerRef}>
                            <h1 className="h2 mb-1">{space.name}</h1>
                            <StarRatingDisplay rating={space.averageRating || 0} reviewCount={space.reviewCount || 0} />
                        </div>

                        {/* Sticky Tabs Navigation - Conditionally Rendered */}
                        {isTabsBarSticky && (
                            <Nav
                                variant="tabs"
                                activeKey={activeTabKey}
                                onSelect={handleTabSelect}
                                ref={stickyTabsNavRef}
                                className="mb-3"
                                style={{
                                    position: 'sticky',
                                    top: `${MAIN_NAVBAR_HEIGHT}px`, // Stick exactly below main navbar
                                    backgroundColor: 'var(--bs-body-bg, white)',
                                    zIndex: 1020,
                                    boxShadow: '0 2px 4px rgba(0,0,0,.075)',
                                }}
                            >
                                {SECTIONS.map(section => (
                                    <Nav.Item key={section.id}>
                                        <Nav.Link eventKey={section.id} disabled={section.disabled}>
                                            {section.label}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        )}

                        {/* Content Sections Wrapper - Apply paddingTop when tabs are sticky */}
                        <div style={isTabsBarSticky ? { paddingTop: `${stickyTabsBarHeight}px` } : {}}>
                            <div id="overview" ref={sectionRefs.current.overview} className="space-detail-section">
                                <h3 className="h4 mb-3 pt-2">Tổng quan</h3>
                                <p style={{ whiteSpace: 'pre-line' }}>{space.description || 'Không có mô tả chi tiết.'}</p>
                                
                                {/* Owner Information - Simple line format above address */}
                                {space.ownerId && (
                                    <p>
                                        <strong>Chủ không gian:</strong>{' '}
                                        {ownerInfo ? (
                                            <Link 
                                                to={`/owner/${space.ownerId}`}
                                                className="text-decoration-none text-primary"
                                            >
                                                {ownerInfo.CompanyName || ownerInfo.companyName}
                                            </Link>
                                        ) : (
                                            <Link 
                                                to={`/owner/${space.ownerId}`}
                                                className="text-decoration-none text-primary"
                                            >
                                                Xem thông tin chủ không gian
                                            </Link>
                                        )}
                                        {ownerInfo && (ownerInfo.IsVerified || ownerInfo.isVerified) && (
                                            <span className="badge bg-success ms-2 small">
                                                <i className="bi bi-patch-check me-1"></i>
                                                Đã xác minh
                                            </span>
                                        )}
                                    </p>
                                )}
                                
                                <p><strong>Địa chỉ:</strong> {space.address}</p>
                                <p><strong>Loại không gian:</strong> {space.type}</p>
                                <p><strong>Sức chứa:</strong> {space.capacity} người</p>
                            </div>
                            <hr className="my-4" />
                            <div id="amenities" ref={sectionRefs.current.amenities} className="space-detail-section">
                                <AmenitiesList space={space} />
                            </div>
                            <hr className="my-4" />
                            <div id="map-location" ref={sectionRefs.current['map-location']} className="space-detail-section">
                                <h3 className="h4 mb-3 pt-2">Vị trí trên bản đồ</h3>
                                <p className="mb-2">{space.address}</p>
                                {isDetailMapLoading ? (
                                    <div className="text-center">
                                        <Spinner animation="border" size="sm" /> Đang tải bản đồ...
                                    </div>
                                ) : detailMapCenter && detailMapMarker ? (
                                    <div>
                                        <div style={{ height: '400px', width: '100%', border: '1px solid #ccc', borderRadius: '0.25rem' }}>
                                            <InteractiveMap 
                                                center={detailMapCenter} 
                                                zoom={detailMapZoom} 
                                                markers={[detailMapMarker]} 
                                                disableScrollZoom={true}
                                            />
                                        </div>
                                        <small className="text-muted mt-2 d-block">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Bản đồ chỉ để xem vị trí, không thể phong to/thu nhỏ
                                        </small>
                                    </div>
                                ) : (
                                    <Alert variant="info" className="mt-2">Thông tin bản đồ không có sẵn.</Alert>
                                )}
                            </div>
                            <hr className="my-4" />
                            <div id="pricing" ref={sectionRefs.current.pricing} className="space-detail-section">
                                <h3 className="h4 mb-3 pt-2">Thông Tin Giá Thuê</h3>
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <Row>
                                            <Col md={12}>
                                                <h5 className="mb-3">Các loại giá thuê</h5>
                                            </Col>
                                        </Row>
                                        
                                        {/* Hourly Rate */}
                                        <Row className="mb-3 align-items-center">
                                            <Col xs={6}>
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-clock me-2 text-primary" style={{ fontSize: "1.5rem" }}></i>
                                                    <div>
                                                        <h6 className="mb-0">Giá theo giờ</h6>
                                                        <small className="text-muted">Phù hợp cho thuê ngắn hạn</small>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={6} className="text-end">
                                                <h5 className="fw-bold text-primary mb-0">
                                                    {space.pricePerHour.toLocaleString('vi-VN')} <span className="fs-6 fw-normal text-muted">VND/giờ</span>
                                                </h5>
                                            </Col>
                                        </Row>

                                        {/* Daily Rate */}
                                        {space.pricePerDay != null && (
                                            <Row className="mb-3 align-items-center">
                                                <Col xs={6}>
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-calendar-day me-2 text-success" style={{ fontSize: "1.5rem" }}></i>
                                                        <div>
                                                            <h6 className="mb-0">Giá theo ngày</h6>
                                                            <small className="text-muted">Phù hợp cho thuê cả ngày</small>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={6} className="text-end">
                                                    <h5 className="fw-bold text-success mb-0">
                                                        {space.pricePerDay.toLocaleString('vi-VN')} <span className="fs-6 fw-normal text-muted">VND/ngày</span>
                                                    </h5>
                                                </Col>
                                            </Row>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Booking Constraints */}
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <h5 className="mb-3">Điều kiện đặt chỗ</h5>
                                        
                                        <Row className="mb-2">
                                            <Col xs={6}>
                                                <p className="mb-0"><strong>Thời gian đặt tối thiểu:</strong></p>
                                            </Col>
                                            <Col xs={6} className="text-end">
                                                <p className="mb-0">{space.minBookingDurationMinutes} phút</p>
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-2">
                                            <Col xs={6}>
                                                <p className="mb-0"><strong>Thời gian đặt tối đa:</strong></p>
                                            </Col>
                                            <Col xs={6} className="text-end">
                                                <p className="mb-0">{Math.floor(space.maxBookingDurationMinutes / 60)} giờ {space.maxBookingDurationMinutes % 60 !== 0 ? `${space.maxBookingDurationMinutes % 60} phút` : ''}</p>
                                            </Col>
                                        </Row>
                                        
                                        <Row>
                                            <Col xs={6}>
                                                <p className="mb-0"><strong>Báo trước khi hủy:</strong></p>
                                            </Col>
                                            <Col xs={6} className="text-end">
                                                <p className="mb-0">{space.cancellationNoticeHours} giờ</p>
                                            </Col>
                                        </Row>
                                        
                                        {/* Operating Hours */}
                                        {space.openTime && space.closeTime && (
                                            <Row>
                                                <Col xs={6}>
                                                    <p className="mb-0"><strong>Giờ hoạt động:</strong></p>
                                                </Col>
                                                <Col xs={6} className="text-end">
                                                    <p className="mb-0">
                                                        {(() => {
                                                            const openParts = space.openTime.split(':');
                                                            const closeParts = space.closeTime.split(':');
                                                            const openHour = openParts[0] || '00';
                                                            const openMinute = openParts[1] || '00';
                                                            const closeHour = closeParts[0] || '23';
                                                            const closeMinute = closeParts[1] || '59';
                                                            const openDisplay = `${openHour.padStart(2, '0')}:${openMinute.padStart(2, '0')}`;
                                                            const closeDisplay = `${closeHour.padStart(2, '0')}:${closeMinute.padStart(2, '0')}`;
                                                            
                                                            // Check if operates across midnight
                                                            const operatesAcrossMidnight = parseInt(closeHour) < parseInt(openHour) || 
                                                                (parseInt(closeHour) === parseInt(openHour) && parseInt(closeMinute) < parseInt(openMinute));
                                                                
                                                            return operatesAcrossMidnight 
                                                                ? `${openDisplay} - ${closeDisplay} (qua đêm)`
                                                                : `${openDisplay} - ${closeDisplay}`;
                                                        })()}
                                                    </p>
                                                </Col>
                                            </Row>
                                        )}
                                    </div>
                                </div>
                                
                                <Alert variant="info">
                                    <i className="bi bi-info-circle-fill me-2"></i>
                                    Liên hệ với chủ không gian để biết thêm chi tiết về chính sách giá và đặt chỗ.
                                </Alert>
                            </div>
                            <hr className="my-4" />
                            <div id="reviews" ref={sectionRefs.current.reviews} className="space-detail-section">
                                <h3 className="h4 mb-3 pt-2">Đánh giá Khách hàng</h3>
                                <ReviewList spaceId={space.id} />
                            </div>
                        </div>
                    </Col>

                    {/* Right Column (Sticky Booking Sidebar) */}
                    <Col lg={4}>
                        <div style={{
                            position: 'sticky',
                            top: `${MAIN_NAVBAR_HEIGHT + (isTabsBarSticky ? stickyTabsBarHeight : 0) + 15}px`,
                            transition: 'top 0.1s linear'
                        }}>
                            <Card border="primary">
                                <Card.Header as="h5" className="bg-primary text-white">Đặt chỗ / Yêu cầu</Card.Header>
                                <Card.Body>
                                    {space.pricePerHour != null && (
                                        <p className="fs-4 fw-bold text-primary">
                                            {space.pricePerHour.toLocaleString('vi-VN')} 
                                            <span className="fs-6 fw-normal text-muted">VND/giờ</span>
                                        </p>
                                    )}
                                    {space.pricePerDay != null && (
                                        <p className="fs-5 fw-bold">
                                            {space.pricePerDay.toLocaleString('vi-VN')} 
                                            <span className="fs-6 fw-normal text-muted">VND/ngày</span>
                                        </p>
                                    )}
                                    <p className="small text-muted">Sức chứa: {space.capacity} người</p>
                                    
                                    {/* Favorite button */}
                                    <div className="mb-3">
                                        <FavoriteButton 
                                            spaceId={space.id} 
                                            variant="outline-danger"
                                            size="sm"
                                            showCount={true}
                                            className="w-100"
                                        />
                                    </div>
                                    
                                    {/* Conditional rendering of booking buttons based on user role */}
                                    {canBook ? (
                                        <div className="d-grid gap-2 mt-4">
                                            <Button 
                                                variant="warning" 
                                                size="lg" 
                                                onClick={handleOpenBookingModal}
                                                className="d-flex align-items-center justify-content-center"
                                            >
                                                <i className="bi bi-calendar-check me-2"></i>
                                                ĐẶT NGAY / KIỂM TRA LỊCH
                                            </Button>
                                            <Button 
                                                variant="outline-primary" 
                                                size="lg"
                                                className="d-flex align-items-center justify-content-center"
                                                onClick={() => navigate(`/spaces/${spaceIdOrSlug}/calendar`)}
                                            >
                                                <i className="bi bi-calendar-week me-2"></i>
                                                XEM LỊCH ĐẶT CHỖ
                                            </Button>
                                            <Button 
                                                variant="outline-secondary" 
                                                size="lg"
                                                className="d-flex align-items-center justify-content-center"
                                                onClick={() => {
                                                    if (!currentUser) {
                                                        navigate('/login', { 
                                                            state: { 
                                                                from: `/spaces/${spaceIdOrSlug}`,
                                                                message: 'Vui lòng đăng nhập để liên hệ với chủ không gian.' 
                                                            } 
                                                        });
                                                        return;
                                                    }
                                                    // If user is logged in, show contact form or redirect to message page
                                                    navigate(`/messages/new?recipient=${space.ownerId}&spaceName=${encodeURIComponent(space.name)}`);
                                                }}
                                            >
                                                <i className="bi bi-chat-dots me-2"></i>
                                                LIÊN HỆ CHỦ KHÔNG GIAN
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            <Alert variant="info" className="text-center">
                                                <i className="bi bi-info-circle me-2"></i>
                                                Chức năng đặt chỗ không khả dụng cho vai trò của bạn.
                                            </Alert>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>

            {space && (
                <BookingFormModal
                    show={showBookingModal}
                    onHide={handleCloseBookingModal}
                    space={space}
                />
            )}
        </>
    );
}

export default SpaceDetailPage;
