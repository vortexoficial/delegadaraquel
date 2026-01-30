// --- 1. LOADER LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const progressBar = document.querySelector(".progress-bar");
    const body = document.body;

    setTimeout(() => {
        progressBar.style.width = "100%";
    }, 100);

    setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        body.classList.add("loaded"); 
    }, 1600);
});

// --- 2. MENU MOBILE ---
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

if(burger){
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
        });
    });
}

// --- 3. ACORDEÃO (Accordion - Com Auto-Close) ---
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const currentlyActive = document.querySelector('.accordion-header.active');
        
        if(currentlyActive && currentlyActive !== header) {
            currentlyActive.classList.remove('active');
            currentlyActive.nextElementSibling.style.maxHeight = 0;
        }

        const accordionBody = header.nextElementSibling;
        header.classList.toggle('active');
        
        if (header.classList.contains('active')) {
            accordionBody.style.maxHeight = accordionBody.scrollHeight + "px";
        } else {
            accordionBody.style.maxHeight = 0;
        }
    });
});

// --- 4. ANIMAÇÃO TYPEWRITER ---
const typingText = document.querySelector(".typing-text");
const words = ["saída", "esperança", "ajuda", "vida"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    if (!typingText) return;

    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        typingText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(typeEffect, typeSpeed);
}

document.addEventListener("DOMContentLoaded", typeEffect);

// --- 5. ANIMAÇÃO SCROLL ---
const scrollElements = document.querySelectorAll(".scroll-animate");

const elementInView = (el, dividend = 1) => {
  const elementTop = el.getBoundingClientRect().top;
  return (
    elementTop <=
    (window.innerHeight || document.documentElement.clientHeight) / dividend
  );
};

const displayScrollElement = (element) => {
  element.classList.add("visible");
};

const handleScrollAnimation = () => {
  scrollElements.forEach((el) => {
    if (elementInView(el, 1.2)) {
      displayScrollElement(el);
    }
  });
};

window.addEventListener("scroll", () => {
  handleScrollAnimation();
});

handleScrollAnimation();

// --- 6. ANIMAÇÃO DESTAQUE MOBILE (STATS) ---
if (window.innerWidth < 969) {
    const statsCards = document.querySelectorAll('.card-stat');

    const mobileObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('mobile-highlight');
            } else {
                entry.target.classList.remove('mobile-highlight');
            }
        });
    }, { 
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0 
    });

    statsCards.forEach(card => {
        mobileObserver.observe(card);
    });
}

// --- 7. BOTÃO VOLTAR AO TOPO ---
const btnBackToTop = document.getElementById('btn-back-to-top');

if(btnBackToTop){
    btnBackToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// --- 8. INTEGRAÇÃO E LÓGICA DE POPUP + FORMULÁRIOS ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURAÇÕES (INSIRA SEUS LINKS AQUI) ---
    // Link do AppScript da Planilha Google
    const GOOGLE_SCRIPT_URL = "INSIRA_SUA_NOVA_URL_DO_GOOGLE_SCRIPT_AQUI"; 
    // Link do Grupo do WhatsApp
    const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/SEU_LINK_DO_GRUPO_AQUI"; 

    // --- LÓGICA DO POPUP AUTOMÁTICO ---
    const modal = document.getElementById('vip-modal');
    
    // Abre o modal após 5 segundos
    setTimeout(() => {
        if(modal) modal.style.display = 'flex';
    }, 5000);

    // Função Global para Fechar
    window.closeModal = function() {
        if(modal) modal.style.display = 'none';
    }

    // Fecha ao clicar fora
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // --- MÁSCARA DE TELEFONE (DDD + Número) ---
    const phoneInputs = document.querySelectorAll('input[name="WhatsApp"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);

            if (value.length > 10) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
            } else {
                value = value.replace(/^(\d*)/, '($1');
            }
            e.target.value = value;
        });
    });

    // --- FUNÇÃO DE ENVIO GENÉRICA (Sheets -> WhatsApp) ---
    const handleFormSubmit = async (e, formId) => {
        e.preventDefault();
        const form = document.getElementById(formId);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Bloqueia botão e mostra loading
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';
        submitButton.disabled = true;
        submitButton.style.opacity = "0.7";

        const formData = new FormData(form);

        try {
            // Tenta enviar para a planilha se a URL estiver configurada
            if(GOOGLE_SCRIPT_URL !== "INSIRA_SUA_NOVA_URL_DO_GOOGLE_SCRIPT_AQUI") {
                    await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
            } else {
                // Simula envio (apenas para teste se não houver URL)
                console.warn("URL do Google Script não configurada.");
                await new Promise(r => setTimeout(r, 1000)); 
            }

            // Sucesso: Fecha modal se for o popup e Redireciona
            if(formId === 'lead-form-popup') closeModal();
            form.reset();
            window.location.href = WHATSAPP_GROUP_URL;

        } catch (error) {
            console.error("Erro no envio:", error);
            alert("Erro ao entrar no grupo. Tente novamente.");
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.style.opacity = "1";
        }
    };

    // --- ATIVAR LISTENERS NOS DOIS FORMULÁRIOS ---
    
    // 1. Formulário da Sessão (Página)
    const pageForm = document.getElementById('lead-form-delegada');
    if (pageForm) {
        pageForm.addEventListener('submit', (e) => handleFormSubmit(e, 'lead-form-delegada'));
    }

    // 2. Formulário do Popup
    const popupForm = document.getElementById('lead-form-popup');
    if (popupForm) {
        popupForm.addEventListener('submit', (e) => handleFormSubmit(e, 'lead-form-popup'));
    }
});