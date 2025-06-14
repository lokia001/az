import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchSpaces,
    deleteSpaceAsync,
    selectManageSpaces,
    selectManageSpaceLoading,
    selectManageSpaceError,
} from '../manageSpaceSlice.js';
import {
    fetchAmenities,
    selectAmenities,
} from '../../amenities/amenitySlice.js';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmationModal from './DeleteConfirmationModal';

function SpaceList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const spaces = useSelector(selectManageSpaces) || [];
    const loading = useSelector(selectManageSpaceLoading);
    const error = useSelector(selectManageSpaceError);
    const amenities = useSelector(selectAmenities) || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [spaceToDelete, setSpaceToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const spacesPerPage = 10;

    useEffect(() => {
        dispatch(fetchSpaces());
        dispatch(fetchAmenities()); // fetch amenities để lấy name
    }, [dispatch]);

    const filteredSpaces = spaces.filter(space =>
        space?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastSpace = currentPage * spacesPerPage;
    const indexOfFirstSpace = indexOfLastSpace - spacesPerPage;
    const currentSpaces = filteredSpaces.slice(indexOfFirstSpace, indexOfLastSpace);
    const totalPages = Math.ceil(filteredSpaces.length / spacesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteClick = (space) => {
        setSpaceToDelete(space);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (spaceToDelete) {
            await dispatch(deleteSpaceAsync(spaceToDelete.id));
            setShowDeleteModal(false);
            setSpaceToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSpaceToDelete(null);
    };

    const handleCreateClick = () => {
        navigate('/space/new');
    };

    const getAmenityNames = (ids) => {
        return ids
            .map(id => amenities.find(a => a.id === id)?.name)
            .filter(Boolean)
            .join(', ');
    };

    if (loading === 'pending') return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div>
            <h2>Danh sách các không gian:</h2>
            <button onClick={handleCreateClick}>Tạo mới</button>
            <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc địa chỉ"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Loại</th>
                        <th>Địa chỉ</th>
                        <th>Sức chứa</th>
                        <th>Giá</th>
                        <th>Giờ hoạt động</th>
                        <th>Trạng thái</th>
                        <th>Tiện ích</th>
                        <th>Hình ảnh</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentSpaces.map(space => (
                        <tr key={space.id}>
                            <td>{space.name}</td>
                            <td>{space.type}</td>
                            <td>{space.address}</td>
                            <td>{space.capacity}</td>
                            <td>{space.basePrice.toLocaleString()}₫</td>
                            <td>{space.openTime} - {space.closeTime}</td>
                            <td>{space.status}</td>
                            <td>{getAmenityNames(space.amenities)}</td>
                            <td>
                                {space.imageUrls?.slice(0, 2).map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`img-${index}`}
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '4px' }}
                                    />
                                ))}
                            </td>
                            <td>
                                <button onClick={() => navigate(`/manage-space/${space.id}`)}>Chi tiết</button>
                                <button onClick={() => handleDeleteClick(space)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button key={pageNumber} onClick={() => handlePageChange(pageNumber)}>
                        {pageNumber}
                    </button>
                ))}
            </div>

            {showDeleteModal && (
                <DeleteConfirmationModal
                    space={spaceToDelete}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
}

export default SpaceList;
