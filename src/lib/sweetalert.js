import Swal from 'sweetalert2';

// Success notification
export const showSuccess = (title, message = '', timer = 3000) => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    background: '#10b981',
    color: '#ffffff',
    iconColor: '#ffffff',
    customClass: {
      popup: 'sweet-popup',
    },
  });
};

// Error notification
export const showError = (title, message = '', timer = 4000) => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    background: '#ef4444',
    color: '#ffffff',
    iconColor: '#ffffff',
    customClass: {
      popup: 'sweet-popup',
    },
  });
};

// Loading notification
export const showLoading = (title, message = '') => {
  return Swal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
    background: 'linear-gradient(135deg, #1f2a38 0%, #1f2a38 100%)',
    color: '#ffffff',
    customClass: {
      popup: 'sweet-popup',
    },
  });
};

// Info notification
export const showInfo = (title, message = '', timer = 3000) => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    background: '#3b82f6',
    color: '#ffffff',
    iconColor: '#ffffff',
    customClass: {
      popup: 'sweet-popup',
    },
  });
};

// Warning notification
export const showWarning = (title, message = '', timer = 3000) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    background: '#f59e0b',
    color: '#ffffff',
    iconColor: '#ffffff',
    customClass: {
      popup: 'sweet-popup',
    },
  });
};

// Close any open sweetalert
export const closeAlert = () => {
  Swal.close();
};

