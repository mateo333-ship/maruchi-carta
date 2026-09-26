/* Maruchi Chat — widget de chatbot para la carta.
   Uso: <script src="/maruchi-chat.js" defer></script>
   Opcional: data-endpoint="/api/chat" (por defecto ya es /api/chat) */
(function () {
  if (window.__maruchiChat) return;
  window.__maruchiChat = true;

  var script = document.currentScript;
  var ENDPOINT = (script && script.getAttribute("data-endpoint")) || "/api/chat";
  var STORE = "maruchi-chat-v1";
  var BIENVENIDA = "¡Hola! Soy Maru ☕ ¿Te ayudo a elegir? Pregúntame por precios, ingredientes o qué me apetece hoy.";
  var SUGERENCIAS = ["¿Qué me recomiendas?", "Algo fresquito 🧊", "Sin cafeína", "Desayuno por menos de 5 €"];

  var css = `
  .mc-root{--mc-dark:#2a1a12;--mc-cream:#f7f0e6;--mc-card:#fffaf3;--mc-caramel:#c8894a;--mc-text:#2a1a12;--mc-muted:#8a7565;
    position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom, 0px));z-index:2147483000;font-family:inherit;font-size:15px;line-height:1.4;color:var(--mc-text)}
  .mc-root *{box-sizing:border-box}
  .mc-fab{width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:var(--mc-caramel);color:#fff;
    box-shadow:0 8px 24px rgba(0,0,0,.35),0 0 0 3px rgba(247,240,230,.25);display:grid;place-items:center;transition:transform .2s ease;position:relative}
  .mc-fab:hover{transform:scale(1.06)}
  .mc-fab:active{transform:scale(.96)}
  .mc-fab svg{width:28px;height:28px}
  .mc-badge{position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#e2553f;border:2px solid var(--mc-cream);animation:mc-pulse 2s infinite}
  @keyframes mc-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
  .mc-hint{position:absolute;right:70px;bottom:12px;white-space:nowrap;background:var(--mc-card);color:var(--mc-dark);padding:8px 12px;border-radius:14px 14px 4px 14px;
    box-shadow:0 6px 18px rgba(42,26,18,.18);font-size:14px;opacity:0;transform:translateY(6px);transition:all .3s ease;pointer-events:none}
  .mc-hint.mc-show{opacity:1;transform:none}
  .mc-panel{position:absolute;right:0;bottom:74px;width:370px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100dvh - 110px);
    background:var(--mc-cream);border-radius:22px;box-shadow:0 20px 50px rgba(42,26,18,.35);display:flex;flex-direction:column;overflow:hidden;
    opacity:0;transform:translateY(12px) scale(.97);transform-origin:bottom right;pointer-events:none;transition:opacity .2s ease,transform .2s ease}
  .mc-root.mc-open .mc-panel{opacity:1;transform:none;pointer-events:auto}
  .mc-root.mc-open .mc-hint{display:none}
  .mc-head{background:var(--mc-dark);color:var(--mc-cream);padding:14px 16px;display:flex;align-items:center;gap:12px}
  .mc-avatar{width:38px;height:38px;border-radius:50%;background:var(--mc-caramel);display:grid;place-items:center;font-size:20px;flex:none}
  .mc-title{font-weight:700;font-size:16px;margin:0}
  .mc-sub{font-size:12px;opacity:.75;display:flex;align-items:center;gap:6px}
  .mc-sub:before{content:"";width:7px;height:7px;border-radius:50%;background:#7fd18b}
  .mc-close{margin-left:auto;background:rgba(255,255,255,.1);border:none;color:inherit;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1}
  .mc-close:hover{background:rgba(255,255,255,.2)}
  .mc-body{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
  .mc-msg{max-width:85%;padding:10px 13px;border-radius:18px;white-space:pre-wrap;word-wrap:break-word;animation:mc-in .2s ease}
  @keyframes mc-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .mc-bot{align-self:flex-start;background:var(--mc-card);border-bottom-left-radius:5px;box-shadow:0 1px 3px rgba(42,26,18,.08)}
  .mc-user{align-self:flex-end;background:var(--mc-dark);color:var(--mc-cream);border-bottom-right-radius:5px}
  .mc-typing{display:flex;gap:4px;padding:14px}
  .mc-typing span{width:7px;height:7px;border-radius:50%;background:var(--mc-muted);animation:mc-dot 1.2s infinite}
  .mc-typing span:nth-child(2){animation-delay:.15s}.mc-typing span:nth-child(3){animation-delay:.3s}
  @keyframes mc-dot{0%,60%,100%{opacity:.3;transform:none}30%{opacity:1;transform:translateY(-3px)}}
  .mc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}
  .mc-chip{border:1px solid rgba(42,26,18,.2);background:transparent;color:var(--mc-dark);border-radius:999px;padding:6px 11px;font:inherit;font-size:13px;cursor:pointer}
  .mc-chip:hover{background:var(--mc-dark);color:var(--mc-cream)}
  .mc-form{display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid rgba(42,26,18,.08);background:var(--mc-cream)}
  .mc-input{flex:1;border:1px solid rgba(42,26,18,.15);background:#fff;border-radius:999px;padding:11px 16px;font:inherit;font-size:16px;color:var(--mc-text);outline:none;min-width:0}
  .mc-input:focus{border-color:var(--mc-caramel)}
  .mc-send{width:44px;height:44px;flex:none;border-radius:50%;border:none;background:var(--mc-caramel);color:#fff;cursor:pointer;display:grid;place-items:center}
  .mc-send:disabled{opacity:.5;cursor:default}
  .mc-send svg{width:20px;height:20px}
  .mc-foot{font-size:11px;color:var(--mc-muted);text-align:center;padding:0 12px 8px}
  @media (max-width:480px){
    .mc-root{right:14px;bottom:calc(14px + env(safe-area-inset-bottom, 0px))}
    .mc-panel{position:fixed;inset:auto 8px 86px 8px;width:auto;max-width:none;height:auto;top:12px;max-height:none}
  }
  /* Integración Maruchi: mientras está abierta la ficha de un producto, el botón del chat se oculta
     para no tapar "Siguiente →" ni la barra inferior de la ficha */
  body:has([data-product-modal]) .mc-root:not(.mc-open){display:none}
  @media (prefers-reduced-motion:reduce){.mc-root *{animation:none!important;transition:none!important}}
  `;

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.className = "mc-root";
  root.innerHTML =
    '<div class="mc-hint">¿Te ayudo a elegir? ☕</div>' +
    '<section class="mc-panel" role="dialog" aria-label="Chat de Maruchi">' +
      '<header class="mc-head"><div class="mc-avatar">☕</div><div><p class="mc-title">Maru · Maruchi</p><div class="mc-sub">Te ayuda con la carta</div></div>' +
      '<button class="mc-close" aria-label="Cerrar chat">✕</button></header>' +
      '<div class="mc-body" aria-live="polite"></div>' +
      '<div class="mc-chips"></div>' +
      '<form class="mc-form"><input class="mc-input" type="text" maxlength="500" placeholder="Escribe tu pregunta..." aria-label="Tu mensaje" autocomplete="off">' +
      '<button class="mc-send" type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
      '<div class="mc-foot">Asistente con IA · Confirma alérgenos en barra</div>' +
    '</section>' +
    '<button class="mc-fab" aria-label="Abrir chat"><span class="mc-badge"></span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg></button>';
  document.body.appendChild(root);

  var fab = root.querySelector(".mc-fab");
  var badge = root.querySelector(".mc-badge");
  var hint = root.querySelector(".mc-hint");
  var body = root.querySelector(".mc-body");
  var chips = root.querySelector(".mc-chips");
  var form = root.querySelector(".mc-form");
  var input = root.querySelector(".mc-input");
  var send = root.querySelector(".mc-send");
  var closeBtn = root.querySelector(".mc-close");

  var historial = [];
  var ocupado = false;
  try { historial = JSON.parse(sessionStorage.getItem(STORE)) || []; } catch (e) { historial = []; }

  function guardar() { try { sessionStorage.setItem(STORE, JSON.stringify(historial.slice(-30))); } catch (e) {} }

  function escapar(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function formatear(t) {
    return escapar(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|\n)\s*[\*\-]\s+/g, "$1• ");
  }

  function pintar(role, text) {
    var d = document.createElement("div");
    d.className = "mc-msg " + (role === "user" ? "mc-user" : "mc-bot");
    d.innerHTML = formatear(text);
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }

  function pintarChips() {
    chips.innerHTML = "";
    if (historial.length > 0) return;
    SUGERENCIAS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "mc-chip"; b.textContent = s;
      b.onclick = function () { enviar(s); };
      chips.appendChild(b);
    });
  }

  function inicio() {
    body.innerHTML = "";
    pintar("bot", BIENVENIDA);
    historial.forEach(function (m) { pintar(m.role, m.text); });
    pintarChips();
  }

  function enviar(texto) {
    texto = (texto || "").trim();
    if (!texto || ocupado) return;
    ocupado = true; send.disabled = true;
    historial.push({ role: "user", text: texto });
    pintar("user", texto);
    chips.innerHTML = "";
    input.value = "";

    var typing = document.createElement("div");
    typing.className = "mc-msg mc-bot mc-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: historial.slice(-12) })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { return d.reply || "Uy, no he podido responder. Pregunta en barra 🙂"; })
      .catch(function () { return "Parece que no hay conexión. Inténtalo de nuevo en un momento."; })
      .then(function (reply) {
        typing.remove();
        historial.push({ role: "bot", text: reply });
        guardar();
        pintar("bot", reply);
        ocupado = false; send.disabled = false;
        input.focus();
      });
  }

  function abrir() {
    root.classList.add("mc-open");
    badge.style.display = "none";
    fab.setAttribute("aria-label", "Cerrar chat");
    setTimeout(function () { if (window.innerWidth > 480) input.focus(); }, 200);
  }
  function cerrar() {
    root.classList.remove("mc-open");
    fab.setAttribute("aria-label", "Abrir chat");
  }

  fab.onclick = function () { root.classList.contains("mc-open") ? cerrar() : abrir(); };
  closeBtn.onclick = cerrar;
  form.onsubmit = function (e) { e.preventDefault(); enviar(input.value); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });

  // Bocadillo de "¿Te ayudo a elegir?" a los 4 segundos, se oculta a los 10
  setTimeout(function () { if (!root.classList.contains("mc-open")) hint.classList.add("mc-show"); }, 4000);
  setTimeout(function () { hint.classList.remove("mc-show"); }, 10000);

  inicio();
})();
