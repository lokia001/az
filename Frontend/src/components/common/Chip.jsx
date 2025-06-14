// src/components/common/Chip.jsx
import React from 'react';
import Badge from 'react-bootstrap/Badge'; // Bootstrap Badge can work as a chip
import CloseButton from 'react-bootstrap/CloseButton';

const Chip = ({ label, onClose, className }) => {
    return (
        <Badge pill bg="light" text="dark" className={`d-inline-flex align-items-center ${className}`}>
            {label}
            {onClose && <CloseButton onClick={onClose} className="ms-2" style={{ fontSize: '0.65rem' }} />}
        </Badge>
    );
};
export default Chip;