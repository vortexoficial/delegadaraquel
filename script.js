// --- 1. LOADER LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const progressBar = document.querySelector(".progress-bar");
    const body = document.body;

    // Inicia a barra de progresso
    setTimeout(() => {
        progressBar.style.width = "100%";
    }, 100);

    // Fade Out após 1.5s
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

// --- 3. ACORDEÃO (Accordion) ---
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const accordionBody = header.nextElementSibling;
        header.classList.toggle('active');
        if (header.classList.contains('active')) {
            accordionBody.style.maxHeight = accordionBody.scrollHeight + "px";
        } else {
            accordionBody.style.maxHeight = 0;
        }
    });
});

// --- 4. ANIMAÇÃO TYPEWRITER (Teclando e Apagando) ---
const typingText = document.querySelector(".typing-text");
const words = ["saída", "esperança", "ajuda", "vida"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    if (!typingText) return;

    const currentWord = words[wordIndex];
    
    // Controla o que está escrito no span
    if (isDeleting) {
        typingText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    // Velocidade de digitação
    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
        // Palavra completa: espera um pouco antes de apagar
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        // Apagou tudo: passa para a próxima palavra
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(typeEffect, typeSpeed);
}

// Inicia a digitação
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