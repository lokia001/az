// src/features/spaceSearch/components/SelectedFiltersDisplay.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Chip from '../../../components/common/Chip'; // Adjusted path
import { removeFilterTag, clearAllSelectedTags, selectSelectedFilterTags } from '../slices/spaceSearchSlice';

const SelectedFiltersDisplay = () => {
    const dispatch = useDispatch();
    const activeTags = useSelector(selectSelectedFilterTags);

    if (!activeTags || activeTags.length === 0) {
        return null;
    }

    const handleRemoveTag = (tag) => {
        // tag object: { id, type, label, value }
        dispatch(removeFilterTag({ type: tag.type, value: tag.value }));
    };

    const handleClearAll = () => {
        dispatch(clearAllSelectedTags());
    };

    return (
        <div className="mb-3 d-flex align-items-center flex-wrap">
            {activeTags.map(tag => (
                <Chip
                    key={tag.id}
                    label={tag.label}
                    onRemove={() => handleRemoveTag(tag)}
                    variant="primary" // Using primary variant for selected tags
                    textColor="white"
                />
            ))}
            {activeTags.length > 0 && (
                <Button variant="danger" size="sm" onClick={handleClearAll} className="ms-2 mb-2 align-self-center">
                    Xóa tất cả ({activeTags.length})
                </Button>
            )}
        </div>
    );
};

export default SelectedFiltersDisplay;