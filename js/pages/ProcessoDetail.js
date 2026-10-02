/**
 * Página de Detalhe do Processo — Admin e Pública.
 */
const CKN_PageProcessoDetail = (() => {

  let _isAdmin = false;
  let _processoId = null;
  let _onNavigate = null;

  function init(opts = {}) {
    _isAdmin = opts.isAdmin || false;
    _onNavigate = opts.onNavigate || (() => {});
  }

  // ──────────────────────────────────────────────
  // FONTES DE DADOS
  // ──────────────────────────────────────────────

  function _getProcessoById(id) {
    if (_isAdmin) return CKN_STORE.getProcessoById(id);
    return (CKN_DATA.processos || []).find(p => p.id === id) || null;
  }

  function _getNormaById(id) {
    if (_isAdmin) return CKN_STORE.getNormaById(id);
    return (CKN_DATA.normas || []).find(n => n.id === id) || null;
  }

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  function render(processoId) {
    _processoId = processoId;
    CKN_Layout.setActivePage("processos");

    const content = document.getElementById("ckn-content");
    if (!content) return;

    const processo = _getProcessoById(processoId);

    if (!processo) {
      content.innerHTML = `
        <div class="ckn-page">
          <div class="ckn-page__back">
            <button type="button" class="ckn-btn ckn-btn--ghost" id="btn-back">
              <i class="fa-solid fa-arrow-left"></i> Voltar
            </button>
          </div>
          ${CKN_Common.emptyState("fa-folder-open", "Processo não encontrado", "O processo solicitado não existe ou foi removido.")}
        </div>
      `;
      content.querySelector("#btn-back").addEventListener("click", () => {
        _onNavigate("#/processos");
      });
      return;
    }

    CKN_Layout.setPageTitle(processo.nome);

    const normasRelacionadas = (processo.normasRelacionadas || [])
      .map(id => _getNormaById(id))
      .filter(Boolean);

    const documentos = processo.documentosRelacionados || [];
    const passos = processo.passos || [];

    content.innerHTML = `
      <div class="ckn-page ckn-detail-page">
        <div class="ckn-detail-page__nav">
          <button type="button" class="ckn-btn ckn-btn--ghost" id="btn-back">
            <i class="fa-solid fa-arrow-left"></i> Processos
          </button>
          ${_isAdmin ? `
          <div class="ckn-detail-page__admin-actions">
            <button type="button" class="ckn-btn ckn-btn--secondary" id="btn-edit-processo" data-id="${CKN_Common.escapeHtml(processo.id)}">
              <i class="fa-regular fa-pen-to-square"></i> Editar
            </button>
            <button type="button" class="ckn-btn ckn-btn--danger" id="btn-delete-processo" data-id="${CKN_Common.escapeHtml(processo.id)}">
              <i class="fa-regular fa-trash-can"></i> Excluir
            </button>
          </div>` : ""}
        </div>

        <div class="ckn-detail-header">
          <span class="ckn-badge ckn-badge--lg ckn-badge--process">
            <i class="fa-solid fa-diagram-project"></i> Processo
          </span>
          <h2 class="ckn-detail-header__title">${CKN_Common.escapeHtml(processo.nome)}</h2>
        </div>

        <div class="ckn-detail-grid">
          <div class="ckn-detail-main">

            ${processo.objetivo ? `
            <div class="ckn-detail-section">
              <h4 class="ckn-detail-section__title"><i class="fa-solid fa-bullseye"></i> Objetivo</h4>
              <p class="ckn-detail-section__text">${CKN_Common.escapeHtml(processo.objetivo)}</p>
            </div>` : ""}

            ${passos.length > 0 ? `
            <div class="ckn-detail-section">
              <h4 class="ckn-detail-section__title"><i class="fa-solid fa-list-check"></i> Passos</h4>
              <ol class="ckn-steps-list">
                ${passos.map((passo, i) => `
                  <li class="ckn-steps-list__item">
                    <span class="ckn-steps-list__num">${i + 1}</span>
                    <span class="ckn-steps-list__text">${CKN_Common.escapeHtml(passo)}</span>
                  </li>
                `).join("")}
              </ol>
            </div>` : ""}

            ${documentos.length > 0 ? `
            <div class="ckn-detail-section">
              <h4 class="ckn-detail-section__title"><i class="fa-regular fa-file"></i> Documentos Relacionados</h4>
              <ul class="ckn-doc-list">
                ${documentos.map(d => `
                  <li class="ckn-doc-list__item">
                    <i class="fa-regular fa-file-lines"></i>
                    ${d.link
                      ? `<a href="${CKN_Common.escapeHtml(d.link)}" target="_blank" rel="noopener noreferrer" class="ckn-link">${CKN_Common.escapeHtml(d.nome)}</a>`
                      : `<span>${CKN_Common.escapeHtml(d.nome)}</span>`
                    }
                  </li>
                `).join("")}
              </ul>
            </div>` : ""}

          </div>

          <div class="ckn-detail-aside">
            <div class="ckn-detail-section">
              <h4 class="ckn-detail-section__title"><i class="fa-solid fa-book-bookmark"></i> Normas Relacionadas</h4>
              ${normasRelacionadas.length === 0
                ? `<p class="ckn-detail-section__empty">Nenhuma norma relacionada.</p>`
                : `<div class="ckn-relation-list">
                    ${normasRelacionadas.map(n => `
                      <button type="button" class="ckn-relation-card" data-navigate="norma-detail" data-id="${CKN_Common.escapeHtml(n.id)}">
                        <span class="ckn-badge">${CKN_Common.escapeHtml(n.codigo)}</span>
                        <span>${CKN_Common.escapeHtml(n.nome)}</span>
                        <i class="fa-solid fa-arrow-right ckn-relation-card__arrow"></i>
                      </button>
                    `).join("")}
                   </div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    _bindEvents(processo);
  }

  function _bindEvents(processo) {
    const content = document.getElementById("ckn-content");
    if (!content) return;

    content.querySelector("#btn-back").addEventListener("click", () => {
      _onNavigate("#/processos");
    });

    if (_isAdmin) {
      const editBtn = content.querySelector("#btn-edit-processo");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          _onNavigate(`#/processos?edit=${processo.id}`);
        });
      }
      const deleteBtn = content.querySelector("#btn-delete-processo");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          CKN_Common.confirm(`Excluir o processo "${processo.nome}"?`).then(ok => {
            if (ok) {
              CKN_STORE.deleteProcesso(processo.id);
              CKN_Common.showToast("Processo excluído com sucesso.");
              _onNavigate("#/processos");
            }
          });
        });
      }
    }

    // Navegar para norma
    content.querySelectorAll("[data-navigate='norma-detail']").forEach(btn => {
      btn.addEventListener("click", () => {
        _onNavigate(`#/norma-detail?id=${btn.dataset.id}`);
      });
    });
  }

  return { init, render };
})();
