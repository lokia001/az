import React from 'react';

function DeleteConfirmationModal({ space, onConfirm, onCancel }) {
    return (
        <div className="modal">
            <div className="modal-content">
                <p>Bạn có chắc chắn muốn xóa không gian "{space.name}"?</p>
                <button onClick={onConfirm}>Xóa</button>
                <button onClick={onCancel}>Hủy</button>
            </div>
        </div>
    );
}

export default DeleteConfirmationModal;