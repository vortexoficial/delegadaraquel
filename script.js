// --- 1. LOADER LOGIC ---
// O loader só aparece na primeira visita da sessão: um script inline no <head>
// adiciona a classe "no-loader" ao <html> quando a flag abaixo já existe.
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const progressBar = document.querySelector(".progress-bar");
    const loaderFill = document.querySelector(".loader-logo-fill");
    const body = document.body;
    const loaderFallbackDuration = 2800;
    let loaderHidden = false;

    try { sessionStorage.setItem("rq_visited", "1"); } catch (e) { /* modo privado */ }

    if (document.documentElement.classList.contains("no-loader")) {
        loaderHidden = true;
        if (loader) {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        }
        body.classList.add("loaded");
        return;
    }

    setTimeout(() => {
        if (progressBar) progressBar.style.width = "100%";
    }, 100);

    const hideLoader = () => {
        if (!loader || loaderHidden) return;
        loaderHidden = true;
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        body.classList.add("loaded"); 
    };

    if (loaderFill) {
        loaderFill.addEventListener("animationend", hideLoader, { once: true });
    }

    setTimeout(hideLoader, loaderFallbackDuration);
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
// IntersectionObserver com o mesmo ponto de disparo do código anterior
// (top <= 83% da viewport), sem custo de CPU a cada scroll.
const scrollElements = document.querySelectorAll(".scroll-animate");

if ("IntersectionObserver" in window) {
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -17% 0px" });

    scrollElements.forEach((el) => scrollObserver.observe(el));
} else {
    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <=
            (window.innerHeight || document.documentElement.clientHeight) / dividend
        );
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.2)) {
                el.classList.add("visible");
            }
        });
    };

    window.addEventListener("scroll", handleScrollAnimation);
    handleScrollAnimation();
}

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

// --- 8. CTA DIRETO DE APOIO ---
// A seção "Apoiar Causa" usa link direto para o WhatsApp oficial.
// O rastreamento de clique fica em consent.js via [data-pixel-contact].
