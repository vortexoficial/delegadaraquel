// --- 1. Menu Mobile (Burger) ---
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });
    
    // Fechar menu ao clicar em um link
    navLinks.forEach(link => link.addEventListener('click', () => {
        if(nav.classList.contains('nav-active')){
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
            navLinks.forEach(link => link.style.animation = '');
        }
    }));
}

navSlide();


// --- 2. Carrossel de Texto Animado (Hero Section) ---
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

function nextSlide() {
    // Remove a classe active do slide atual
    slides[currentSlide].classList.remove('active');
    
    // Calcula o próximo slide (loop)
    currentSlide = (currentSlide + 1) % totalSlides;
    
    // Adiciona a classe active ao próximo slide
    slides[currentSlide].classList.add('active');
}

// Muda o slide a cada 4 segundos
setInterval(nextSlide, 4000);


// --- 3. Animações ao Rolar (Scroll) ---
// Usa Intersection Observer API para detectar quando elementos entram na tela

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
    if (elementInView(el, 1.15)) { // 1.15 define o quão cedo a animação começa
      displayScrollElement(el);
    }
  });
};

// Adiciona o listener de scroll
window.addEventListener("scroll", () => {
  handleScrollAnimation();
});

// Dispara uma vez ao carregar para pegar elementos que já estão visíveis
handleScrollAnimation();


// --- 4. Navbar Sutil na Rolagem ---
// Adiciona uma sombra na navbar quando a página é rolada para baixo
const navbar = document.getElementById('navbar');
window.onscroll = function() {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = "0 2px 15px rgba(0,0,0,0.4)";
        navbar.style.padding = "0.7rem 0"; // Leve redução no tamanho
        navbar.style.transition = "all 0.3s ease";
    } else {
        navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
        navbar.style.padding = "1rem 0";
    }
    // Chama a função de animação de scroll também
    handleScrollAnimation();
};