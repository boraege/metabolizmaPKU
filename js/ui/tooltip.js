// Custom Tooltip System
function initializeTooltips() {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'custom-tooltip';
    tooltip.className = 'custom-tooltip';
    document.body.appendChild(tooltip);
    
    // Add event listeners to all elements with title attribute in needs section
    const needsSection = document.getElementById('daily-needs');
    if (!needsSection) return;
    
    needsSection.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[title]');
        if (!target) return;
        
        const title = target.getAttribute('title');
        if (!title) return;
        
        // Show tooltip
        tooltip.innerHTML = title.replace(/\n/g, '<br>');
        tooltip.style.display = 'block';
        
        // Position tooltip
        positionTooltip(e, tooltip);
        
        // Prevent default browser tooltip
        target.setAttribute('data-title', title);
        target.removeAttribute('title');
    });
    
    needsSection.addEventListener('mousemove', (e) => {
        const target = e.target.closest('[data-title]');
        if (!target) return;
        
        positionTooltip(e, tooltip);
    });
    
    needsSection.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-title]');
        if (!target) return;
        
        // Hide tooltip
        tooltip.style.display = 'none';
        
        // Restore title attribute
        const title = target.getAttribute('data-title');
        if (title) {
            target.setAttribute('title', title);
            target.removeAttribute('data-title');
        }
    });
}

function positionTooltip(e, tooltip) {
    const x = e.pageX;
    const y = e.pageY;
    
    // Position tooltip near cursor
    tooltip.style.left = (x + 15) + 'px';
    tooltip.style.top = (y + 15) + 'px';
    
    // Check if tooltip goes off screen
    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        tooltip.style.left = (x - rect.width - 15) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        tooltip.style.top = (y - rect.height - 15) + 'px';
    }
}
