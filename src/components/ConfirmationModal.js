import React from 'react';
import useModalClose from '../hooks/useModalClose';

const ConfirmationModal = React.memo(({
    isOpen,
    onClose,
    onConfirm,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
}) => {
    useModalClose(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="rounded-xl p-6 w-full max-w-md mx-4 bg-white">
                <h3 className="text-xl font-medium mb-4 text-gray-900">{message}</h3>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-base rounded-lg bg-gray-100 hover:bg-gray-200 
                            text-gray-700 font-medium"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2.5 text-base text-white rounded-lg bg-red-500 
                            hover:bg-red-600 transition-colors font-medium"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ConfirmationModal;
