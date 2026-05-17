"use strict";

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. VALIDACIÓN DE FORMULARIO (Estilo Imagen)
    const form = document.getElementById("tuBalanceForm");
    
    const validateField = (input, condition) => {
        const group = input.parentElement;
        const errorDisplay = group.querySelector(".error-msg");

        if (!condition) {
            input.style.borderColor = "#ffb3b3"; // Rojo suave para el fondo verde
            if (errorDisplay) errorDisplay.style.display = "block";
            return false;
        } else {
            input.style.borderColor = "rgba(255, 255, 255, 0.3)"; // Reset al borde original
            if (errorDisplay) errorDisplay.style.display = "none";
            return true;
        }
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.querySelector("#nombre");
        const email = document.querySelector("#email");
        const objetivo = document.querySelector("#objetivo");
        const terminos = document.querySelector("#terminos");

        const isNombreValid = validateField(nombre, nombre.value.trim().length > 3);
        const isEmailValid = validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
        const isObjetivoValid = validateField(objetivo, objetivo.value !== "");
        const isTerminosValid = validateField(terminos, terminos.checked);

        if (isNombreValid && isEmailValid && isObjetivoValid && isTerminosValid) {
            alert("¡Registro exitoso! Bienvenido a TuBalance.");
            form.reset();
        }
    });

    // 2. ANIMACIÓN DE ENTRADA (Intersection Observer)
    const fadeInOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    // Aplicar a las tarjetas de beneficios y la imagen del hero
    document.querySelectorAll(".card, .hero-img").forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.8s ease-out";
        fadeInOnScroll.observe(el);
    });

    // 3. ACORDEÓN INTERACTIVO (FAQ)
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const content = accordionItem.querySelector('.accordion-content');
            const isActive = accordionItem.classList.contains('active');

            // Cerrar todos los demás
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-content').style.maxHeight = null;
            });

            // Abrir el actual si no estaba activo
            if (!isActive) {
                accordionItem.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});