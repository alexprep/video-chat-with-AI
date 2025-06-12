// Utility functions
const showError = (element, message) => {
    const errorDiv = element.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.textContent = message;
    } else {
        const newErrorDiv = document.createElement('div');
        newErrorDiv.className = 'error-message';
        newErrorDiv.textContent = message;
        element.parentNode.insertBefore(newErrorDiv, element.nextSibling);
    }
};

const showSuccess = (element, message) => {
    const successDiv = element.nextElementSibling;
    if (successDiv && successDiv.classList.contains('success-message')) {
        successDiv.textContent = message;
    } else {
        const newSuccessDiv = document.createElement('div');
        newSuccessDiv.className = 'success-message';
        newSuccessDiv.textContent = message;
        element.parentNode.insertBefore(newSuccessDiv, element.nextSibling);
    }
};

const clearMessages = (element) => {
    const messages = element.parentNode.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.remove());
};

// Form handling
const handleFormSubmit = async (form, url, options = {}) => {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.textContent = 'Loading...';

        const formData = new FormData(form);
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            ...options
        });

        const data = await response.json();

        if (response.ok) {
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            } else if (data.message) {
                showSuccess(form, data.message);
            }
        } else {
            if (data.error) {
                showError(form, data.error);
            } else if (data.errors) {
                Object.entries(data.errors).forEach(([field, messages]) => {
                    const input = form.querySelector(`[name="${field}"]`);
                    if (input) {
                        showError(input, messages[0]);
                    }
                });
            }
        }
    } catch (error) {
        showError(form, 'An error occurred. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.textContent = originalText;
    }
};

// Modal handling
const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = form.getAttribute('action');
            if (url) {
                handleFormSubmit(form, url);
            }
        });
    });

    // Input validation
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            clearMessages(input);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });

    // Modal background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}); 