/* ==========================================================================
   Propostas — carrossel 3D de vídeos verticais, expansão do vídeo e balão
   com a proposta completa. Animação 100% GSAP (core, sem plugins).

   Conteúdo: vem do painel (data-api → GET /api/propostas). Os cards que já
   estão no HTML servem de fallback caso a API não responda.
   ========================================================================== */
(function () {
    'use strict';

    var section = document.getElementById('propostas');
    var stage = document.getElementById('propostasStage');
    if (!section || !stage || typeof window.gsap === 'undefined') return;

    var deck = document.getElementById('propostas3d');
    var dotsWrap = document.getElementById('propostasDots');
    var prevBtn = stage.querySelector('.propostas-nav.prev');
    var nextBtn = stage.querySelector('.propostas-nav.next');

    var modal = document.getElementById('propostaModal');
    var modalBackdrop = modal.querySelector('.proposta-modal-backdrop');
    var modalInner = modal.querySelector('.proposta-modal-inner');
    var modalVideoBox = document.getElementById('propostaModalVideo');
    var lerBtn = document.getElementById('propostaLer');
    var balao = document.getElementById('propostaBalao');
    var balaoInner = balao.querySelector('.proposta-balao-inner');
    var closeBtn = document.getElementById('propostaClose');
    var muteBtn = document.getElementById('propostaMute');
    var apoioBar = document.getElementById('propostaApoioBar');

    function marcarSom(ligado) {
        if (!muteBtn) return;
        muteBtn.innerHTML = ligado
            ? '<i class="fa-solid fa-volume-high"></i>'
            : '<i class="fa-solid fa-volume-xmark"></i>';
        muteBtn.setAttribute('aria-label', ligado ? 'Desativar o som' : 'Ativar o som');
    }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.classList.add('anim-ready');

    var slides = [];
    var index = 0;
    var slideW = 0;
    var open = false;
    var openIndex = -1;
    var homeSlot = null;
    var lastFocus = null;
    var revealed = false;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* ---------------------------------------------------------------- vídeo */
    function playOnly(i) {
        slides.forEach(function (slide, k) {
            var v = slide.querySelector('.proposta-video');
            if (!v) return;
            if (k === i) {
                v.muted = true;                     // no carrossel é sempre sem áudio
                var p = v.play();
                if (p && p.catch) p.catch(function () {});
            } else if (!v.paused) {
                v.pause();
            }
        });
    }

    function pauseAll() {
        slides.forEach(function (s) {
            var v = s.querySelector('.proposta-video');
            if (v && !v.paused) v.pause();
        });
    }

    /* --------------------------------------------------------- posicionamento */
    function measure() {
        slideW = slides.length ? (slides[0].getBoundingClientRect().width || 280) : 280;
    }

    function place(animate) {
        var dur = animate && !reduce ? 0.72 : 0;
        slides.forEach(function (slide, i) {
            var o = i - index;
            var abs = Math.abs(o);
            var visible = abs <= 2;

            gsap.to(slide, {
                xPercent: -50,
                yPercent: -50,
                x: o * slideW * 0.6,
                z: -abs * 190,
                rotationY: o * -26,
                scale: 1 - abs * 0.06,
                opacity: visible ? (abs === 0 ? 1 : abs === 1 ? 0.72 : 0.32) : 0,
                duration: dur,
                ease: 'power3.out',
                overwrite: 'auto',
                zIndex: 100 - abs,
                pointerEvents: visible ? 'auto' : 'none'
            });
            slide.classList.toggle('is-active', o === 0);
            slide.setAttribute('aria-hidden', visible ? 'false' : 'true');
        });

        var dots = dotsWrap.children;
        for (var d = 0; d < dots.length; d++) {
            dots[d].classList.toggle('is-active', d === index);
        }
        prevBtn.disabled = index <= 0;
        nextBtn.disabled = index >= slides.length - 1;
    }

    function goTo(i, animate) {
        index = Math.max(0, Math.min(i, slides.length - 1));
        place(animate !== false);
        if (!open) playOnly(index);
    }

    /* ------------------------------------------------------------ montagem */
    function slideHtml(p, i) {
        var video = p.video
            ? '<video class="proposta-video" src="' + esc(p.video) + '"' +
              (p.poster ? ' poster="' + esc(p.poster) + '"' : '') +
              ' muted loop playsinline preload="none" disablepictureinpicture></video>'
            : '<div class="proposta-video proposta-video-vazio"></div>';

        return '<article class="proposta-slide"' +
            ' data-tag="' + esc(p.tag) + '"' +
            ' data-titulo="' + esc(p.titulo) + '"' +
            ' data-resumo="' + esc(p.resumo) + '"' +
            ' data-texto="' + esc(p.texto) + '">' +
            '<div class="proposta-card3d">' + video +
            '<div class="proposta-veil"></div>' +
            (p.tag ? '<span class="proposta-tag">' + esc(p.tag) + '</span>' : '') +
            '<div class="proposta-teaser">' +
            '<h3>' + esc(p.titulo) + '</h3>' +
            '<p>' + esc(p.resumo) + '</p>' +
            '<span class="proposta-expand"><i class="fa-solid fa-up-right-and-down-left-from-center"></i> Ver proposta</span>' +
            '</div></div></article>';
    }

    function collect() {
        slides = Array.prototype.slice.call(deck.querySelectorAll('.proposta-slide'));
    }

    function buildDots() {
        dotsWrap.innerHTML = '';
        slides.forEach(function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'propostas-dot';
            dot.setAttribute('aria-label', 'Ver proposta ' + (i + 1));
            dot.addEventListener('click', function () { goTo(i, true); });
            dotsWrap.appendChild(dot);
        });
    }


    function mount(animateIn) {
        collect();
        /* GSAP passa a ser o unico dono do transform destes cards */
        gsap.set(slides, { xPercent: -50, yPercent: -50, x: 0, y: 0, z: 0, rotationY: 0 });
        buildDots();
        measure();
        index = Math.min(index, Math.max(0, slides.length - 1));
        place(false);
        if (revealed) playOnly(index);
        if (animateIn && revealed && !reduce) {
            gsap.from(slides, { opacity: 0, y: 40, duration: 0.7, stagger: 0.07, ease: 'power3.out' });
        }
    }

    /* --------------------------------------------------------------- gesto
       Regras: parado = clique (expande) · horizontal = troca de card ·
       vertical = a pagina rola (nunca sequestramos a rolagem do celular). */
    var pressing = false, dragging = false;
    var startX = 0, startY = 0, moved = 0, alvoDoGesto = null, pointerId = null;

    function soltarCaptura() {
        if (pointerId !== null && deck.releasePointerCapture) {
            try { deck.releasePointerCapture(pointerId); } catch (err) {}
        }
        pointerId = null;
    }

    deck.addEventListener('pointerdown', function (e) {
        if (open) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        pressing = true; dragging = false;
        startX = e.clientX; startY = e.clientY; moved = 0;
        pointerId = e.pointerId;
        alvoDoGesto = e.target.closest ? e.target.closest('.proposta-slide') : null;
    });

    deck.addEventListener('pointermove', function (e) {
        if (!pressing) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;

        if (!dragging) {
            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
                /* o dedo esta descendo: solta tudo e deixa a pagina rolar */
                pressing = false; alvoDoGesto = null; soltarCaptura();
                return;
            }
            if (Math.abs(dx) < 7) return;
            dragging = true;
            deck.classList.add('is-dragging');
            if (deck.setPointerCapture) {
                try { deck.setPointerCapture(e.pointerId); } catch (err) {}
            }
        }

        moved = dx;
        gsap.to(deck, { x: moved * 0.35, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    });

    function fimDoGesto() {
        if (!pressing && !dragging) { alvoDoGesto = null; return; }

        if (dragging) {
            deck.classList.remove('is-dragging');
            gsap.to(deck, { x: 0, duration: 0.5, ease: 'power3.out' });
            if (Math.abs(moved) > 46) goTo(index + (moved < 0 ? 1 : -1), true);
        } else if (alvoDoGesto) {
            var i = slides.indexOf(alvoDoGesto);          // parado = clique
            if (i > -1) {
                if (i !== index) goTo(i, true);
                else if (alvoDoGesto.querySelector('video')) expand(i);
            }
        }

        pressing = false; dragging = false; alvoDoGesto = null;
        soltarCaptura();
    }

    deck.addEventListener('pointerup', fimDoGesto);
    deck.addEventListener('pointercancel', function () {
        if (dragging) {
            deck.classList.remove('is-dragging');
            gsap.to(deck, { x: 0, duration: 0.5, ease: 'power3.out' });
        }
        pressing = false; dragging = false; alvoDoGesto = null; soltarCaptura();
    });

    /* ================================================================ EXPANDIR */
    function expand(i) {
        if (open) return;
        open = true;
        openIndex = i;
        lastFocus = document.activeElement;

        var slide = slides[i];
        var video = slide.querySelector('.proposta-video');

        var tituloProposta = slide.dataset.titulo || '';

        balaoInner.innerHTML = '';
        if (tituloProposta) {
            var h = document.createElement('h4');
            h.textContent = tituloProposta;
            balaoInner.appendChild(h);
        }
        String(slide.dataset.texto || '').split(/\n{2,}|\|\|/).forEach(function (par) {
            var t = par.trim();
            if (!t) return;
            var p = document.createElement('p');
            p.textContent = t;
            balaoInner.appendChild(p);
        });
        balao.style.overflowY = 'hidden';
        gsap.set(balao, { height: 0, opacity: 0 });
        lerBtn.hidden = !balaoInner.children.length;
        lerBtn.dataset.aberto = 'nao';
        lerBtn.innerHTML = 'Ler proposta <i class="fa-solid fa-arrow-down"></i>';

        /* FLIP: o mesmo elemento de vídeo migra do card para o modal */
        var from = video.getBoundingClientRect();
        homeSlot = video.parentNode;
        modalVideoBox.appendChild(video);

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('proposta-modal-open');
        document.documentElement.classList.add('proposta-modal-open');

        var to = modalVideoBox.getBoundingClientRect();
        var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        var ds = from.width / to.width;

        if (video.play) {
            try { video.currentTime = 0; } catch (err) {}   // sempre do começo
            video.muted = false;                            // e com som
            marcarSom(true);
            var pr = video.play();
            if (pr && pr.catch) pr.catch(function () {
                video.muted = true; marcarSom(false); video.play().catch(function () {});
            });
        }

        if (reduce) {
            gsap.set(modalBackdrop, { opacity: 1 });
            gsap.set([modalVideoBox, closeBtn, apoioBar], { opacity: 1, clearProps: 'transform' });
            modalInner.setAttribute('tabindex', '-1'); modalInner.focus();
            return;
        }

        gsap.timeline({ defaults: { ease: 'power3.out' } })
            .fromTo(modalBackdrop, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
            .fromTo(modalVideoBox,
                { x: dx, y: dy, scale: ds },
                { x: 0, y: 0, scale: 1, duration: 0.66 }, 0)
            .fromTo(lerBtn, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, 0.3)
            .fromTo(closeBtn, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4 }, 0.3)
            .fromTo(apoioBar, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5 }, 0.34)
            .add(function () { modalInner.setAttribute('tabindex', '-1'); modalInner.focus(); });
    }

    /* -------------------------------------------------------------- BALÃO */
    lerBtn.addEventListener('click', function () {
        if (lerBtn.dataset.aberto === 'sim') {
            balao.style.overflowY = 'hidden';
            gsap.to(balao, { height: 0, opacity: 0, duration: reduce ? 0 : 0.45, ease: 'power3.inOut' });
            lerBtn.dataset.aberto = 'nao';
            modal.classList.remove('is-lendo');
            lerBtn.innerHTML = 'Ler proposta <i class="fa-solid fa-arrow-down"></i>';
            return;
        }
        var medido = balaoInner.getBoundingClientRect().height || balaoInner.scrollHeight;
        var teto = window.innerWidth >= 861 ? Math.min(window.innerHeight * 0.62, 580) : Infinity;
        var alvo = Math.min(medido, teto);
        gsap.to(balao, {
            height: alvo, opacity: 1,
            duration: reduce ? 0 : 0.6, ease: 'power3.out',
            onComplete: function () {
                if (medido <= teto) gsap.set(balao, { height: 'auto' });
                // no desktop o balao rola por dentro; no celular quem rola e o modal
                balao.style.overflowY = window.innerWidth >= 861 ? 'auto' : 'visible';
            }
        });
        if (!reduce) {
            gsap.fromTo(balaoInner.children,
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.12, ease: 'power2.out' });
        }
        modal.classList.add('is-lendo');
        lerBtn.dataset.aberto = 'sim';
        lerBtn.innerHTML = 'Fechar proposta <i class="fa-solid fa-arrow-up"></i>';
    });

    /* -------------------------------------------------------------- FECHAR */
    function close() {
        if (!open) return;
        var video = modalVideoBox.querySelector('.proposta-video');

        function restore() {
            if (video && homeSlot) {
                homeSlot.insertBefore(video, homeSlot.firstChild);
                if (video.pause) video.muted = true;
                gsap.set(video, { clearProps: 'all' });
            }
            gsap.set(modalVideoBox, { clearProps: 'transform' });
            gsap.set([apoioBar, lerBtn, closeBtn], { clearProps: 'opacity,transform' });
            gsap.set(balaoInner.children, { clearProps: 'opacity,transform' });
            modal.classList.remove('is-open');
            modal.classList.remove('is-lendo');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('proposta-modal-open');
            document.documentElement.classList.remove('proposta-modal-open');
            open = false;
            openIndex = -1;
            playOnly(index);
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        if (reduce) { restore(); return; }

        var slide = slides[openIndex];
        var alvo = slide ? slide.querySelector('.proposta-card3d').getBoundingClientRect() : null;
        var box = modalVideoBox.getBoundingClientRect();
        var dx = alvo ? (alvo.left + alvo.width / 2) - (box.left + box.width / 2) : 0;
        var dy = alvo ? (alvo.top + alvo.height / 2) - (box.top + box.height / 2) : 40;
        var ds = alvo ? alvo.width / box.width : 0.7;

        /* Ordem da saída: o texto some, a barra desce, o vídeo volta para o card
           (com a mesma curva da entrada) e só então o fundo se dissolve. */
        var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: restore });

        if (lerBtn.dataset.aberto === 'sim') {
            /* so dissolve: mexer na altura aqui faria o layout saltar no celular */
            tl.to(balaoInner.children, { opacity: 0, y: -10, duration: 0.22, stagger: 0.04 }, 0)
              .to(balao, { opacity: 0, duration: 0.3 }, 0.08);
        }

        tl.to(apoioBar, { opacity: 0, y: 26, duration: 0.28 }, 0)
          .to(lerBtn, { opacity: 0, y: 12, duration: 0.26 }, 0.04)
          .to(closeBtn, { opacity: 0, scale: 0.7, duration: 0.26 }, 0)
          .to(modalVideoBox, {
              x: dx, y: dy, scale: ds,
              duration: 0.62, ease: 'power3.inOut',
          }, 0.14)
          .to(modalBackdrop, { opacity: 0, duration: 0.42 }, 0.32)
          /* o card recebe o vídeo de volta com um respiro */
          .fromTo(slide || {}, { scale: 0.97 }, { scale: 1, duration: 0.4, ease: 'power2.out' }, 0.5);
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var v = modalVideoBox.querySelector('.proposta-video');
            if (!v) return;
            v.muted = !v.muted;
            marcarSom(!v.muted);
            if (!v.muted) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        });
    }

    closeBtn.addEventListener('click', close);
    modalBackdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && open) { close(); return; }
        if (open) return;
        if (e.key === 'ArrowRight') goTo(index + 1, true);
        if (e.key === 'ArrowLeft') goTo(index - 1, true);
    });

    prevBtn.addEventListener('click', function () { goTo(index - 1, true); });
    nextBtn.addEventListener('click', function () { goTo(index + 1, true); });

    var rid = null;
    window.addEventListener('resize', function () {
        window.clearTimeout(rid);
        rid = window.setTimeout(function () { measure(); place(false); }, 160);
    });

    /* -------------------------------------------------------------- entrada */
    function reveal() {
        if (revealed) return;
        revealed = true;
        measure();
        place(false);
        playOnly(index);

        if (reduce) {
            gsap.set(section.querySelectorAll('.propostas-head > *'), { opacity: 1 });
            gsap.set(dotsWrap, { opacity: 1 });
            return;
        }
        gsap.timeline({ defaults: { ease: 'power3.out' } })
            .fromTo(section.querySelectorAll('.propostas-head > *'),
                { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 })
            .from(slides, { opacity: 0, y: 60, duration: 0.8, stagger: 0.08 }, '-=0.4')
            .fromTo(dotsWrap, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.5')
            .add(function () { place(true); });
    }

    mount(false);

    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) { if (entry.isIntersecting) { reveal(); io.disconnect(); } });
        }, { threshold: 0.2 });
        io.observe(section);

        /* pausa os vídeos quando a seção sai da tela (bateria e dados) */
        var io2 = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { if (!open && revealed) playOnly(index); }
                else pauseAll();
            });
        }, { threshold: 0.05 });
        io2.observe(section);
    } else {
        reveal();
    }

    /* ------------------------------------------------- conteúdo vindo do painel */
    var api = section.dataset.api;
    if (api && window.fetch) {
        fetch(api, { headers: { Accept: 'application/json' } })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !Array.isArray(data.items) || !data.items.length) return;
                if (open) return;
                deck.innerHTML = data.items.map(slideHtml).join('');
                mount(true);
            })
            .catch(function () { /* mantém os cards do HTML */ });
    }
})();
