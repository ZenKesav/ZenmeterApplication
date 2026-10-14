import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';

export function ConfirmationDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?' }) {
  if (!isOpen) return null;
  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmationDialog;
