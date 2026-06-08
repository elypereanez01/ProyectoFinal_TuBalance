"use strict";

// =========================================================================
// 1. COMPONENTE: NAVBAR ENCAPSULADO
// =========================================================================
(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const toggleBtn = document.getElementById("tbNavbarToggle");
        const navMenu = document.getElementById("tbNavbarMenu");

        if (!toggleBtn || !navMenu) return;

        const toggleMenu = () => {
            const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
            toggleBtn.setAttribute("aria-expanded", !isExpanded);
            navMenu.classList.toggle("tb-navbar-menu--open");
        };

        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        navMenu.addEventListener("click", (e) => {
            if (e.target.classList.contains("tb-navbar-link") || e.target.classList.contains("tb-navbar-btn")) {
                if (toggleBtn.getAttribute("aria-expanded") === "true") toggleMenu();
            }
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".tb-navbar") && toggleBtn.getAttribute("aria-expanded") === "true") {
                toggleMenu();
            }
        });
    });
})();

// =========================================================================
// 2. COMPONENTE: COUNTDOWN TIMER ENCAPSULADO
// =========================================================================
(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const daysEl = document.getElementById("tb-days");
        const hoursEl = document.getElementById("tb-hours");
        const minutesEl = document.getElementById("tb-minutes");
        const secondsEl = document.getElementById("tb-seconds");
        const timerContainer = document.getElementById("tbCountdownTimer");
        const messageContainer = document.getElementById("tbCountdownMessage");

        const TIMER_DURATION_MS = (10 * 24 * 60 * 60 * 1000) + (5 * 60 * 60 * 1000) + (30 * 60 * 1000); 

        const getTargetDate = () => {
            let targetDate = localStorage.getItem("tb_countdown_target");
            const now = new Date().getTime();
            if (!targetDate || now > parseInt(targetDate, 10)) {
                targetDate = now + TIMER_DURATION_MS;
                localStorage.setItem("tb_countdown_target", targetDate.toString());
            }
            return parseInt(targetDate, 10);
        };

        let targetDate = getTargetDate();

        const updateTimer = () => {
            const now = new Date().getTime();
            let timeRemaining = targetDate - now;

            if (timeRemaining <= 0) {
                if (timerContainer && messageContainer) {
                    timerContainer.style.display = "none";
                    messageContainer.textContent = "¡El tiempo es ahora!";
                    messageContainer.style.display = "block";
                }
                setTimeout(() => {
                    localStorage.removeItem("tb_countdown_target");
                    targetDate = getTargetDate();
                    if (timerContainer && messageContainer) {
                        messageContainer.style.display = "none";
                        timerContainer.style.display = "flex";
                    }
                }, 4000);
                return;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        window.addEventListener("pagehide", () => clearInterval(intervalId));
    });
})();

// =========================================================================
// 3. LÓGICA DE REGISTRO, VALIDACIÓN, PERSISTENCIA Y ACORDEÓN
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    
    const STORAGE_KEYS = {
        nombre: 'lp_tubalance_nombre',
        email: 'lp_tubalance_email',
        objetivo: 'lp_tubalance_objetivo',
        convertido: 'lp_tubalance_convertido'
    };

    // Redirigir al dashboard automáticamente si ya se registró con éxito en el pasado
    const checkUserLoggedStatus = () => {
        const yaConvertido = localStorage.getItem(STORAGE_KEYS.convertido);
        if (yaConvertido === 'true') {
            window.location.href = "dashboard.html";
        }
    };

    // Restaurar los datos si el usuario refresca por error la landing
    const restoreSavedInputs = () => {
        ['nombre', 'email', 'objetivo'].forEach(id => {
            const inputElement = document.getElementById(id);
            const savedValue = localStorage.getItem(STORAGE_KEYS[id]);
            if (inputElement && savedValue) {
                inputElement.value = savedValue;
            }
        });
    };

    checkUserLoggedStatus();
    restoreSavedInputs();

    const form = document.getElementById("tuBalanceForm");
    
    if (form) {
        // Función de validación adaptada EXACTAMENTE a las clases de tu index.html
        const validateField = (input, isValid) => {
            const group = input.closest(".form-group");
            if (!group) return isValid;
            
            const errorDisplay = group.querySelector(".error-msg");

            if (!isValid) {
                input.style.borderColor = "#ffb3b3"; // Borde rojo sutil
                if (errorDisplay) errorDisplay.style.display = "block";
                input.setAttribute("aria-invalid", "true");
                return false;
            } else {
                input.style.borderColor = "rgba(0, 0, 0, 0.1)"; // Reset de borde
                if (errorDisplay) errorDisplay.style.display = "none";
                input.removeAttribute("aria-invalid");
                return true;
            }
        };

        // Guardar en LocalStorage mientras el usuario escribe
        form.addEventListener("input", (e) => {
            const fieldId = e.target.id;
            if (STORAGE_KEYS[fieldId]) {
                localStorage.setItem(STORAGE_KEYS[fieldId], e.target.value);
            }
            
            if (fieldId === "nombre") validateField(e.target, e.target.value.trim().length >= 3);
            if (fieldId === "email") validateField(e.target, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value));
        });

        form.addEventListener("change", (e) => {
            const fieldId = e.target.id;
            if (STORAGE_KEYS[fieldId]) {
                localStorage.setItem(STORAGE_KEYS[fieldId], e.target.value);
            }
            if (fieldId === "objetivo") validateField(e.target, e.target.value !== "");
        });

        // Evento de Envío del Formulario
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById("nombre");
            const email = document.getElementById("email");
            const objetivo = document.getElementById("objetivo");
            const terminos = document.getElementById("terminos");

            // Validaciones rigurosas
            const isNombreValid = validateField(nombre, nombre.value.trim().length >= 3);
            const isEmailValid = validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
            const isObjetivoValid = validateField(objetivo, objetivo.value !== "");
            const isTerminosValid = terminos.checked;

            if (!isTerminosValid) {
                alert("Para continuar, es necesario que aceptes los términos y condiciones.");
                return;
            }

            if (!isNombreValid || !isEmailValid || !isObjetivoValid) {
                const firstError = form.querySelector("[aria-invalid='true']");
                if (firstError) firstError.focus();
                return; 
            }

            // SELECCIÓN COINCIDENTE: Busca el botón por su ID exacto de tu index.html
            const submitBtn = form.querySelector(".tb-register-submit");
            const originalBtnText = submitBtn.textContent;
            
           submitBtn.disabled = true;
            submitBtn.textContent = "Procesando ingreso...";

            // Asegurar el guardado de los datos antes de lanzar la petición de red
            localStorage.setItem(STORAGE_KEYS.nombre, nombre.value.trim());
            localStorage.setItem(STORAGE_KEYS.objetivo, objetivo.value);

            const formData = new FormData(form);

            try {
                // Petición hacia Formspree
                const response = await fetch("https://formspree.io/f/mwvzvwar", {
                    method: "POST",
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    localStorage.setItem(STORAGE_KEYS.convertido, "true");
                    // Redirección directa hacia el dashboard
                    window.location.href = "dashboard.html";
                } else {
                    throw new Error("Respuesta de servidor fallida");
                }

            } catch (error) {
                alert("Ocurrió un inconveniente al enviar tus datos. Por favor, vuelve a intentarlo.");
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // =========================================================================
    // 4. COMPONENTE: ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
    // =========================================================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const content = accordionItem.querySelector('.accordion-content');
            const isActive = accordionItem.classList.contains('active');

            // Cerrar los demás acordeones abiertos
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                const itemContent = item.querySelector('.accordion-content');
                if (itemContent) itemContent.style.maxHeight = null;
            });

            // Abrir el acordeón seleccionado
            if (!isActive && content) {
                accordionItem.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});
