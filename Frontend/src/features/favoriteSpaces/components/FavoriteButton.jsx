// Frontend/src/features/favoriteSpaces/components/FavoriteButton.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Spinner } from 'react-bootstrap';
import { Heart, HeartFill } from 'react-bootstrap-icons';
import { 
    addToFavorites, 
    removeFromFavorites, 
    fetchFavoriteStatus,
    selectIsSpaceFavorited,
    selectSpaceFavoriteCount,
    selectFavoriteSpacesOperationStatus,
    updateFavoriteStatusOptimistically
} from '../slices/favoriteSpacesSlice';
import { selectIsAuthenticated } from '../../auth/slices/authSlice';

const FavoriteButton = ({ 
    spaceId, 
    variant = 'outline-danger',
    size = 'sm',
    showCount = true,
    className = '',
    style = {} 
}) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isFavorited = useSelector(selectIsSpaceFavorited(spaceId));
    const favoriteCount = useSelector(selectSpaceFavoriteCount(spaceId));
    const operationStatus = useSelector(selectFavoriteSpacesOperationStatus);

    const isLoading = operationStatus === 'loading';

    useEffect(() => {
        // Fetch favorite status when component mounts
        if (isAuthenticated && spaceId) {
            dispatch(fetchFavoriteStatus(spaceId));
        }
    }, [dispatch, spaceId, isAuthenticated]);

    const handleToggleFavorite = async (e) => {
        // Prevent event bubbling to parent elements
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        if (!isAuthenticated) {
            // Could show login modal or redirect to login
            alert('Vui lòng đăng nhập để sử dụng tính năng này.');
            return;
        }

        if (isLoading) return;

        try {
            // Optimistic update
            dispatch(updateFavoriteStatusOptimistically({ 
                spaceId, 
                isFavorited: !isFavorited 
            }));

            if (isFavorited) {
                await dispatch(removeFromFavorites(spaceId)).unwrap();
            } else {
                await dispatch(addToFavorites(spaceId)).unwrap();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // The slice will handle reverting the optimistic update on failure
        }
    };

    if (!isAuthenticated) {
        // Show disabled button for non-authenticated users
        return (
            <Button
                variant="outline-secondary"
                size={size}
                disabled
                className={className}
                style={style}
                title="Đăng nhập để sử dụng tính năng này"
            >
                <Heart size={16} />
                {showCount && favoriteCount > 0 && (
                    <span className="ms-1">{favoriteCount}</span>
                )}
            </Button>
        );
    }

    return (
        <Button
            variant={isFavorited ? 'danger' : variant}
            size={size}
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`favorite-button ${className}`}
            style={style}
            title={isFavorited ? 'Bỏ lưu' : 'Lưu không gian'}
            data-favorite-button="true"
        >
            {isLoading ? (
                <Spinner size="sm" animation="border" />
            ) : isFavorited ? (
                <HeartFill size={16} />
            ) : (
                <Heart size={16} />
            )}
            {showCount && favoriteCount > 0 && (
                <span className="ms-1">{favoriteCount}</span>
            )}
        </Button>
    );
};

export default FavoriteButton;
