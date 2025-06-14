import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSpaces,
    updateSpaceAsync,
    selectManageSpaces,
    selectManageSpaceLoading,
    selectManageSpaceError
} from '../manageSpaceSlice';
import {
    fetchAmenities,
    selectAmenities
} from '../../amenities/amenitySlice';
import SpaceForm from './SpaceForm';

function EditSpacePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const spaces = useSelector(selectManageSpaces);
    const loading = useSelector(selectManageSpaceLoading);
    const error = useSelector(selectManageSpaceError);
    const amenities = useSelector(selectAmenities);

    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (spaces.length === 0) dispatch(fetchSpaces());
        if (amenities.length === 0) dispatch(fetchAmenities());
    }, [dispatch]);

    useEffect(() => {
        const existingSpace = spaces.find(s => s.id === id);
        if (existingSpace) {
            setInitialData({
                name: existingSpace.name || '',
                description: existingSpace.description || '',
                address: existingSpace.address || '',
                latitude: existingSpace.latitude?.toString() || '',
                longitude: existingSpace.longitude?.toString() || '',
                type: existingSpace.type || 'Individual',
                capacity: existingSpace.capacity?.toString() || '',
                price: existingSpace.basePrice?.toString() || '',
                status: existingSpace.status || 'Available',
                cleaningDuration: existingSpace.cleaningDurationMinutes?.toString() || '',
                openTime: existingSpace.openTime || '',
                closeTime: existingSpace.closeTime || '',
                minBooking: existingSpace.minBookingDurationMinutes?.toString() || '',
                maxBooking: existingSpace.maxBookingDurationMinutes?.toString() || '',
                cancellationNotice: existingSpace.cancellationNoticeHours?.toString() || '',
                accessInstructions: existingSpace.accessInstructions || '',
                houseRules: existingSpace.houseRules || '',
                paymentMethods: existingSpace.paymentMethodsSupported || '',
                selectedAmenities: existingSpace.amenities || [],
                imageUrls: existingSpace.imageUrls || []
            });
        }
    }, [spaces, id]);

    const handleSubmit = async (updatedData) => {
        try {
            await dispatch(updateSpaceAsync({ id, updatedSpace: updatedData }));
            navigate('/manage-space');
        } catch (err) {
            alert('Lỗi khi cập nhật không gian. Vui lòng thử lại.');
        }
    };

    if (loading === 'pending') return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>Lỗi: {error}</div>;
    if (!initialData) return <div>Không tìm thấy không gian hoặc đang tải dữ liệu...</div>;

    return (
        <div>
            <h2>Chỉnh sửa không gian</h2>
            <SpaceForm
                initialData={initialData}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default EditSpacePage;
