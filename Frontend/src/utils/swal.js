import Swal from 'sweetalert2';

/**
 * Zenmeter Custom SweetAlert2 Utility
 * Brand Primary Color: #E66239 (Zenmeter Orange)
 */

const primaryColor = '#E66239';
const secondaryColor = '#6c757d';

/**
 * Success Alert Popup (Auto-closes in 5 seconds)
 */
export const showSuccessAlert = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 5000,
    timerProgressBar: true,
    confirmButtonColor: primaryColor,
    confirmButtonText: 'OK',
    customClass: {
      popup: 'rounded-4 shadow-lg border-0',
      confirmButton: 'px-4 py-2 fw-semibold rounded-3'
    }
  });
};

/**
 * Error Alert Popup (Auto-closes in 5 seconds)
 */
export const showErrorAlert = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    timer: 5000,
    timerProgressBar: true,
    confirmButtonColor: primaryColor,
    confirmButtonText: 'Close',
    customClass: {
      popup: 'rounded-4 shadow-lg border-0',
      confirmButton: 'px-4 py-2 fw-semibold rounded-3'
    }
  });
};

/**
 * Warning Alert Popup (Auto-closes in 5 seconds)
 */
export const showWarningAlert = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    timer: 5000,
    timerProgressBar: true,
    confirmButtonColor: primaryColor,
    confirmButtonText: 'Understand',
    customClass: {
      popup: 'rounded-4 shadow-lg border-0',
      confirmButton: 'px-4 py-2 fw-semibold rounded-3'
    }
  });
};

/**
 * Info Alert Popup (Auto-closes in 5 seconds)
 */
export const showInfoAlert = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    timer: 5000,
    timerProgressBar: true,
    confirmButtonColor: primaryColor,
    confirmButtonText: 'OK',
    customClass: {
      popup: 'rounded-4 shadow-lg border-0',
      confirmButton: 'px-4 py-2 fw-semibold rounded-3'
    }
  });
};

/**
 * Interactive Confirmation Dialog (returns true if confirmed, false if cancelled)
 */
export const showConfirmAlert = ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  icon = 'warning',
  confirmButtonText = 'Yes, Proceed',
  cancelButtonText = 'Cancel',
  confirmButtonColor = primaryColor
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor: secondaryColor,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: 'rounded-4 shadow-lg border-0',
      confirmButton: 'px-4 py-2 fw-semibold rounded-3',
      cancelButton: 'px-4 py-2 fw-semibold rounded-3'
    }
  }).then((result) => result.isConfirmed);
};

export default {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmAlert
};
