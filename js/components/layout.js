/**
 * CKN_Layout — Gerencia a estrutura visual (sidebar, topbar, navegação).
 * Compartilhado entre admin e página pública, com variações de modo.
 */
const CKN_Layout = (() => {

  let _currentPage = null;
  let _onNavigate = null;
  let _isAdmin = false;

  /**
   * Inicializa o layout.
   * @param {Object} opts
   * @param {boolean} opts.isAdmin — true na página administrativa
   * @param {Function} opts.onNavigate — callback de navegação (route)
   */
  function init(opts = {}) {
    _isAdmin = opts.isAdmin || false;
    _onNavigate = opts.onNavigate || (() => {});
    _renderSidebar();
    _renderTopbar();
    _bindEvents();
  }

  function _renderSidebar() {
    const sidebar = document.getElementById("ckn-sidebar");
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="ckn-sidebar__brand">
        <div class="ckn-sidebar__brand-icon">
          <i class="fa-solid fa-book-bookmark"></i>
        </div>
        <div class="ckn-sidebar__brand-text">
          <span class="ckn-sidebar__brand-title">Centro de Conhecimento</span>
          <span class="ckn-sidebar__brand-subtitle">${_isAdmin ? "Administração" : "Consulta"}</span>
        </div>
      </div>
      <nav class="ckn-sidebar__nav">
        <ul class="ckn-sidebar__nav-list">
          <li class="ckn-sidebar__nav-item" data-route="normas">
            <a href="#/normas" class="ckn-sidebar__nav-link" data-route="normas">
              <i class="fa-solid fa-book-bookmark ckn-sidebar__nav-icon"></i>
              <span>Normas Aplicáveis</span>
            </a>
          </li>
          <li class="ckn-sidebar__nav-item" data-route="processos">
            <a href="#/processos" class="ckn-sidebar__nav-link" data-route="processos">
              <i class="fa-solid fa-diagram-project ckn-sidebar__nav-icon"></i>
              <span>Processos</span>
            </a>
          </li>
        </ul>
      </nav>
    `;
  }

  function _renderTopbar() {
    const topbar = document.getElementById("ckn-topbar");
    if (!topbar) return;

    const exportBtn = _isAdmin ? `
      <button type="button" class="ckn-btn ckn-btn--primary" id="btn-export-data">
        <i class="fa-solid fa-cloud-arrow-up"></i>
        <span class="hide-mobile">Gerar DATA para publicação</span>
        <span class="show-mobile">DATA</span>
      </button>
    ` : "";

    topbar.innerHTML = `
      <button type="button" class="ckn-topbar__menu-btn" id="btn-toggle-sidebar" aria-label="Menu">
        <i class="fa-solid fa-bars"></i>
      </button>
      <h1 class="ckn-topbar__title" id="ckn-page-title">Centro de Conhecimento Normativo</h1>
      <div class="ckn-topbar__actions">
        ${exportBtn}
      </div>
    `;
  }

  function _bindEvents() {
    // Toggle sidebar mobile
    document.addEventListener("click", e => {
      const btn = e.target.closest("#btn-toggle-sidebar");
      if (btn) {
        document.getElementById("ckn-sidebar").classList.toggle("is-open");
        document.getElementById("ckn-overlay").classList.toggle("is-active");
      }
    });

    // Fechar sidebar ao clicar no overlay
    const overlay = document.getElementById("ckn-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        document.getElementById("ckn-sidebar").classList.remove("is-open");
        overlay.classList.remove("is-active");
      });
    }

    // Navegação sidebar
    document.addEventListener("click", e => {
      const link = e.target.closest(".ckn-sidebar__nav-link");
      if (link) {
        // No mobile, fechar sidebar ao navegar
        document.getElementById("ckn-sidebar").classList.remove("is-open");
        const ov = document.getElementById("ckn-overlay");
        if (ov) ov.classList.remove("is-active");
      }
    });

    // Botão exportar
    document.addEventListener("click", e => {
      if (e.target.closest("#btn-export-data")) {
        _handleExport();
      }
    });

    // Hash routing
    window.addEventListener("hashchange", _handleRoute);
  }

  function _handleRoute() {
    const hash = window.location.hash || "#/normas";
    let route = hash.replace("#/", "").split("?")[0];
    if (!route) route = "normas";

    setActivePage(route);
    if (_onNavigate) _onNavigate(hash);
  }

  function _handleExport() {
    if (typeof CKN_STORE === "undefined") return;

    const data = CKN_STORE.exportData();
    const json = JSON.stringify(data, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // remover aspas das chaves para parecer JS
      .replace(/"/g, '"');

    const content = `/**\n * CKN_DATA — Exportado em ${data.updatedAt}\n * Versão: ${data.version}\n * Gerado pela página administrativa do Centro de Conhecimento Normativo.\n * Substitua o conteúdo do arquivo js/data.js por este conteúdo.\n */\nconst CKN_DATA = ${JSON.stringify(data, null, 2)};`;

    _showExportModal(content, data);
  }

  function _showExportModal(content, data) {
    const existing = document.getElementById("ckn-export-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "ckn-export-modal";
    modal.className = "ckn-modal is-open";
    modal.innerHTML = `
      <div class="ckn-modal__backdrop"></div>
      <div class="ckn-modal__container ckn-modal__container--lg">
        <div class="ckn-modal__header">
          <h3 class="ckn-modal__title">
            <i class="fa-solid fa-cloud-arrow-up"></i> Gerar DATA para publicação
          </h3>
          <button type="button" class="ckn-modal__close" id="btn-close-export">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ckn-modal__body">
          <div class="ckn-export-info">
            <div class="ckn-export-info__item">
              <strong>Versão:</strong> ${CKN_Common.escapeHtml(data.version)}
            </div>
            <div class="ckn-export-info__item">
              <strong>Normas:</strong> ${data.normas.length} registros
            </div>
            <div class="ckn-export-info__item">
              <strong>Processos:</strong> ${data.processos.length} registros
            </div>
          </div>
          <p class="ckn-export-instructions">
            Copie o conteúdo abaixo e substitua o arquivo <code>js/data.js</code> na página do usuário final.
          </p>
          <textarea class="ckn-export-textarea" id="export-content" readonly>${content}</textarea>
        </div>
        <div class="ckn-modal__footer">
          <button type="button" class="ckn-btn ckn-btn--ghost" id="btn-close-export-2">Fechar</button>
          <button type="button" class="ckn-btn ckn-btn--primary" id="btn-copy-export">
            <i class="fa-solid fa-copy"></i> Copiar conteúdo
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.classList.add("modal-open");

    modal.querySelector("#btn-close-export").addEventListener("click", () => {
      modal.remove();
      document.body.classList.remove("modal-open");
    });
    modal.querySelector("#btn-close-export-2").addEventListener("click", () => {
      modal.remove();
      document.body.classList.remove("modal-open");
    });
    modal.querySelector(".ckn-modal__backdrop").addEventListener("click", () => {
      modal.remove();
      document.body.classList.remove("modal-open");
    });
    modal.querySelector("#btn-copy-export").addEventListener("click", () => {
      const ta = modal.querySelector("#export-content");
      ta.select();
      ta.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(ta.value).then(() => {
        CKN_Common.showToast("Conteúdo copiado para a área de transferência!");
      }).catch(() => {
        document.execCommand("copy");
        CKN_Common.showToast("Conteúdo copiado!");
      });
    });
  }

  function setActivePage(route) {
    _currentPage = route;
    // Atualizar nav items
    document.querySelectorAll(".ckn-sidebar__nav-item").forEach(item => {
      const itemRoute = item.getAttribute("data-route");
      item.classList.toggle("is-active", itemRoute === route);
    });
  }

  function setPageTitle(title) {
    const el = document.getElementById("ckn-page-title");
    if (el) el.textContent = title;
  }

  function navigate(route) {
    window.location.hash = `#/${route}`;
  }

  function getCurrentHash() {
    return window.location.hash || "#/normas";
  }

  return {
    init,
    setActivePage,
    setPageTitle,
    navigate,
    getCurrentHash
  };
})();
