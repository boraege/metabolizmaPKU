// Modern Modal Dialog System

function showModal(options) {
    return new Promise((resolve, reject) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Create modal dialog
        const dialog = document.createElement('div');
        dialog.className = 'modal-dialog';
        
        // Modal header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.textContent = options.title || 'Bilgi';
        header.appendChild(title);
        
        if (options.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.className = 'modal-subtitle';
            subtitle.textContent = options.subtitle;
            header.appendChild(subtitle);
        }
        
        // Modal body
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (options.type === 'input') {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'modal-input-group';
            
            if (options.label) {
                const label = document.createElement('label');
                label.textContent = options.label;
                inputGroup.appendChild(label);
            }
            
            const input = document.createElement('input');
            input.className = 'modal-input';
            input.type = options.inputType || 'text';
            input.placeholder = options.placeholder || '';
            input.value = options.defaultValue || '';
            input.id = 'modal-input-field';
            
            if (options.inputType === 'number') {
                input.step = options.step || '1';
                input.min = options.min || '0';
            }
            
            inputGroup.appendChild(input);
            body.appendChild(inputGroup);
        } else if (options.message) {
            const message = document.createElement('p');
            message.textContent = options.message;
            body.appendChild(message);
        }
        
        // Modal footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-btn modal-btn-cancel';
        cancelBtn.textContent = options.cancelText || 'İptal';
        cancelBtn.onclick = () => {
            closeModal();
            resolve(null);
        };
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'modal-btn modal-btn-confirm';
        confirmBtn.textContent = options.confirmText || 'Tamam';
        confirmBtn.onclick = () => {
            if (options.type === 'input') {
                const inputValue = document.getElementById('modal-input-field').value;
                if (inputValue) {
                    closeModal();
                    resolve(inputValue);
                } else {
                    // Shake animation for empty input
                    const input = document.getElementById('modal-input-field');
                    input.style.animation = 'shake 0.3s';
                    setTimeout(() => {
                        input.style.animation = '';
                    }, 300);
                }
            } else {
                closeModal();
                resolve(true);
            }
        };
        
        footer.appendChild(cancelBtn);
        footer.appendChild(confirmBtn);
        
        // Assemble modal
        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);
        
        // Add to document
        document.body.appendChild(overlay);
        
        // Show modal with animation
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
        
        // Focus input if exists
        if (options.type === 'input') {
            setTimeout(() => {
                const input = document.getElementById('modal-input-field');
                input.focus();
                input.select();
            }, 100);
        }
        
        // Handle Enter key
        if (options.type === 'input') {
            const input = document.getElementById('modal-input-field');
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            });
        }
        
        // Handle Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                cancelBtn.click();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Close modal on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cancelBtn.click();
            }
        });
        
        function closeModal() {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 200);
        }
    });
}

// Shake animation for invalid input
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
