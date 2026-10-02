/**
 * Utilitários e componentes comuns reutilizáveis.
 */
const CKN_Common = (() => {

  /**
   * Gera um ID único com prefixo.
   * Ex: generateId("norma") → "norma-a3f8b2c1"
   */
  function generateId(prefix) {
    return `${prefix}-${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Formata data ISO para exibição.
   * "2026-09-25" → "25/09/2026"
   */
  function formatDate(isoDate) {
    if (!isoDate) return "";
    const parts = isoDate.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return isoDate;
  }

  /**
   * Trunca texto com reticências.
   */
  function truncate(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "…";
  }

  /**
   * Escapa HTML para evitar XSS em renderizações dinâmicas.
   */
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Exibe um toast/notification temporário.
   * type: "success" | "error" | "info"
   */
  function showToast(message, type = "success") {
    const existing = document.getElementById("ckn-toast");
    if (existing) existing.remove();

    const icons = {
      success: "fa-circle-check",
      error: "fa-circle-xmark",
      info: "fa-circle-info"
    };

    const toast = document.createElement("div");
    toast.id = "ckn-toast";
    toast.className = `ckn-toast ckn-toast--${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    // Forçar reflow para animação
    requestAnimationFrame(() => toast.classList.add("ckn-toast--visible"));

    setTimeout(() => {
      toast.classList.remove("ckn-toast--visible");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Abre um modal pelo ID.
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("is-open");
      document.body.classList.add("modal-open");
      // foco no primeiro campo
      setTimeout(() => {
        const firstInput = modal.querySelector("input, textarea, select");
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }

  /**
   * Fecha um modal pelo ID.
   */
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("is-open");
      document.body.classList.remove("modal-open");
    }
  }

  /**
   * Fecha todos os modais abertos.
   */
  function closeAllModals() {
    document.querySelectorAll(".ckn-modal.is-open").forEach(m => {
      m.classList.remove("is-open");
    });
    document.body.classList.remove("modal-open");
  }

  /**
   * Modal de confirmação simples.
   * Retorna Promise<boolean>.
   */
  function confirm(message) {
    return new Promise(resolve => {
      const existing = document.getElementById("ckn-confirm-modal");
      if (existing) existing.remove();

      const modal = document.createElement("div");
      modal.id = "ckn-confirm-modal";
      modal.className = "ckn-modal is-open";
      modal.innerHTML = `
        <div class="ckn-modal__backdrop"></div>
        <div class="ckn-modal__container ckn-modal__container--sm">
          <div class="ckn-modal__header">
            <h3 class="ckn-modal__title"><i class="fa-solid fa-triangle-exclamation"></i> Confirmar ação</h3>
          </div>
          <div class="ckn-modal__body">
            <p>${escapeHtml(message)}</p>
          </div>
          <div class="ckn-modal__footer">
            <button type="button" class="ckn-btn ckn-btn--ghost" id="ckn-confirm-cancel">Cancelar</button>
            <button type="button" class="ckn-btn ckn-btn--danger" id="ckn-confirm-ok">Excluir</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.body.classList.add("modal-open");

      modal.querySelector("#ckn-confirm-cancel").addEventListener("click", () => {
        modal.remove();
        document.body.classList.remove("modal-open");
        resolve(false);
      });
      modal.querySelector("#ckn-confirm-ok").addEventListener("click", () => {
        modal.remove();
        document.body.classList.remove("modal-open");
        resolve(true);
      });
      modal.querySelector(".ckn-modal__backdrop").addEventListener("click", () => {
        modal.remove();
        document.body.classList.remove("modal-open");
        resolve(false);
      });
    });
  }

  /**
   * Renderiza estado vazio padronizado.
   */
  function emptyState(icon, title, subtitle) {
    return `
      <div class="ckn-empty-state">
        <div class="ckn-empty-state__icon"><i class="fa-regular ${icon}"></i></div>
        <div class="ckn-empty-state__title">${escapeHtml(title)}</div>
        ${subtitle ? `<div class="ckn-empty-state__subtitle">${escapeHtml(subtitle)}</div>` : ""}
      </div>
    `;
  }

  /**
   * Filtra lista por termo de busca nos campos especificados.
   */
  function filterByTerm(list, term, fields) {
    if (!term || !term.trim()) return list;
    const t = term.trim().toLowerCase();
    return list.filter(item =>
      fields.some(f => {
        const val = item[f];
        return val && String(val).toLowerCase().includes(t);
      })
    );
  }

  return {
    generateId,
    formatDate,
    truncate,
    escapeHtml,
    showToast,
    openModal,
    closeModal,
    closeAllModals,
    confirm,
    emptyState,
    filterByTerm
  };
})();
