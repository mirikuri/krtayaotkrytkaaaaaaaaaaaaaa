document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector('.page-wrapper');
    const controlButtons = document.querySelectorAll('.window-controls .win-btn');

    if (!wrapper || controlButtons.length < 3) {
        return;
    }

    const [minimizeBtn, expandBtn, closeBtn] = controlButtons;

    closeBtn.addEventListener('click', () => {
        if (confirm("Вы уверены, что хотите закрыть терминал profile.exe?")) {
            wrapper.style.transition = "all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)";
            wrapper.style.opacity = "0";
            wrapper.style.transform = "scale(0.7) rotate(-3deg)";
            
            setTimeout(() => {
                wrapper.innerHTML = `
                    <div style="text-align: center; padding: 50px 0; font-family: 'JetBrains+Mono', monospace;">
                        <h1 style="color: #ff52cc; margin-bottom: 10px;">🔴 TERMINAL CLOSED</h1>
                        <p style="color: #a39cb0; font-size: 14px;">Обнови страницу (F5), чтобы перезапустить систему.</p>
                    </div>
                `;
                wrapper.style.opacity = "1";
                wrapper.style.transform = "scale(1) rotate(0deg)";
            }, 400);
        }
    });

    let isExpanded = false;
    expandBtn.addEventListener('click', () => {
        wrapper.style.transition = "max-width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        
        if (!isExpanded) {
            wrapper.style.maxWidth = "100%"; 
            expandBtn.textContent = "⧉";       
            isExpanded = true;
        } else {
            wrapper.style.maxWidth = "800px"; 
            expandBtn.textContent = "▢";       
            isExpanded = false;
        }
    });

    minimizeBtn.addEventListener('click', () => {
        wrapper.style.transition = "all 0.15s ease-in-out";
        wrapper.style.opacity = "0.1";
        wrapper.style.transform = "scaleY(0.05)"; 
        
        setTimeout(() => {
            wrapper.style.transform = "scaleY(1)";
            wrapper.style.opacity = "1";
        }, 250);
    });
});