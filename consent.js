// =============================================================
// CONSENTIMENTO DE COOKIES (LGPD) + META PIXEL
// -------------------------------------------------------------
// CONFIGURAÇÃO: insira abaixo o ID do Pixel do Meta (Gerenciador
// de Eventos > Fontes de Dados). Enquanto estiver com o valor
// placeholder, o Pixel NÃO é carregado.
// =============================================================
const META_PIXEL_ID = "COLOQUE_SEU_PIXEL_ID_AQUI";

(function () {
    const CONSENT_KEY = "raquel_cookie_consent"; // "accepted" | "rejected"

    function getConsent() {
        try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
    }

    function setConsent(value) {
        try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* modo privado */ }
    }

    // --- Carrega o Meta Pixel (apenas após consentimento) ---
    function loadMetaPixel() {
        if (!META_PIXEL_ID || META_PIXEL_ID === "COLOQUE_SEU_PIXEL_ID_AQUI") {
            console.warn("[Pixel] META_PIXEL_ID não configurado em consent.js — Pixel não carregado.");
            return;
        }
        if (window.fbq) return; // já carregado

        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', META_PIXEL_ID);
        fbq('track', 'PageView');

        // Página pode declarar um evento extra via <body data-pixel-event="Lead">
        // (usado na obrigada.html para registrar a conversão com segurança)
        const pageEvent = document.body && document.body.dataset ? document.body.dataset.pixelEvent : null;
        if (pageEvent) {
            fbq('track', pageEvent);
        }
    }

    // Wrapper seguro para eventos: só dispara se o Pixel estiver
    // carregado (ou seja, se a visitante consentiu).
    window.trackPixelEvent = function (eventName, params) {
        if (typeof window.fbq === "function") {
            window.fbq("track", eventName, params || {});
        }
    };

    // --- Banner ---
    function initBanner() {
        const banner = document.getElementById("cookie-banner");
        const consent = getConsent();

        if (consent === "accepted") {
            loadMetaPixel();
            return;
        }
        if (consent === "rejected") return;
        if (!banner) return;

        banner.hidden = false;

        const btnAccept = document.getElementById("cookie-accept");
        const btnReject = document.getElementById("cookie-reject");

        if (btnAccept) {
            btnAccept.addEventListener("click", () => {
                setConsent("accepted");
                banner.hidden = true;
                loadMetaPixel();
            });
        }

        if (btnReject) {
            btnReject.addEventListener("click", () => {
                setConsent("rejected");
                banner.hidden = true;
            });
        }
    }

    // --- Redefinir preferências (link na Política de Privacidade) ---
    function initConsentReset() {
        const resetLink = document.getElementById("cookie-reset");
        if (!resetLink) return;
        resetLink.addEventListener("click", (e) => {
            e.preventDefault();
            try { localStorage.removeItem(CONSENT_KEY); } catch (err) { /* ignora */ }
            const banner = document.getElementById("cookie-banner");
            if (banner) banner.hidden = false;
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        });
    }

    // --- Evento "Contact" nos cliques de canais oficiais ---
    function initContactTracking() {
        document.querySelectorAll("[data-pixel-contact]").forEach((el) => {
            el.addEventListener("click", () => {
                window.trackPixelEvent("Contact");
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            initBanner();
            initConsentReset();
            initContactTracking();
        });
    } else {
        initBanner();
        initContactTracking();
    }
})();
