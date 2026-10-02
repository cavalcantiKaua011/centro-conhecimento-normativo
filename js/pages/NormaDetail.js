/**
 * Página de Detalhe da Norma — Admin e Pública.
 *
 * Design refinado: wiki corporativa, hierarquia clara, destaque de código/nome,
 * documentos com ícones, histórico em timeline, processos como cards navegáveis.
 */
const CKN_PageNormaDetail = (() => {

  let _isAdmin = false;
  let _normaId = null;
  let _onNavigate = null;

  function init(opts = {}) {
    _isAdmin = opts.isAdmin || false;
    _onNavigate = opts.onNavigate || (() => {});
  }

  // ──────────────────────────────────────────────
  // FONTES DE DADOS
  // ──────────────────────────────────────────────

  function _getNormaById(id) {
    if (_isAdmin) return CKN_STORE.getNormaById(id);
    return (CKN_DATA.normas || []).find(n => n.id === id) || null;
  }

  function _getProcessosByNormaId(normaId) {
    const list = _isAdmin ? CKN_STORE.getProcessos() : (CKN_DATA.processos || []);
    return list.filter(p => (p.normasRelacionadas || []).includes(normaId));
  }

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  function render(normaId) {
    _normaId = normaId;
    CKN_Layout.setActivePage("normas");

    const content = document.getElementById("ckn-content");
    if (!content) return;

    const norma = _getNormaById(normaId);

    if (!norma) {
      content.innerHTML = `
        <div class="ckn-page">
          <div class="nd-nav">
            <button type="button" class="ckn-btn ckn-btn--ghost" id="btn-back">
              <i class="fa-solid fa-arrow-left"></i> Normas Aplicáveis
            </button>
          </div>
          ${CKN_Common.emptyState("fa-file-circle-question", "Norma não encontrada", "A norma solicitada não existe ou foi removida.")}
        </div>
      `;
      content.querySelector("#btn-back").addEventListener("click", () => _onNavigate("#/normas"));
      return;
    }

    CKN_Layout.setPageTitle(`${norma.codigo} — ${norma.nome}`);

    const processos   = _getProcessosByNormaId(normaId);
    const documentos  = norma.documentos || [];
    const historico   = norma.historico  || [];

    content.innerHTML = `
      <div class="ckn-page nd-page">

        <!-- Breadcrumb / Navegação contextual -->
        <div class="nd-nav">
          <button type="button" class="ckn-btn ckn-btn--ghost ckn-btn--sm" id="btn-back">
            <i class="fa-solid fa-arrow-left"></i> Normas Aplicáveis
          </button>
          <span class="nd-nav__sep"><i class="fa-solid fa-chevron-right"></i></span>
          <span class="nd-nav__current">${CKN_Common.escapeHtml(norma.codigo)}</span>
        </div>

        <!-- Hero da norma -->
        <div class="nd-hero">
          <div class="nd-hero__left">
            <div class="nd-hero__code-wrapper">
              <span class="nd-hero__icon"><i class="fa-solid fa-book-bookmark"></i></span>
              <span class="nd-hero__code">${CKN_Common.escapeHtml(norma.codigo)}</span>
            </div>
            <h1 class="nd-hero__title">${CKN_Common.escapeHtml(norma.nome)}</h1>
            ${norma.descricao ? `<p class="nd-hero__summary">${CKN_Common.escapeHtml(norma.descricao)}</p>` : ""}
          </div>
          ${_isAdmin ? `
          <div class="nd-hero__actions">
            <button type="button" class="ckn-btn ckn-btn--secondary" id="btn-edit-norma">
              <i class="fa-regular fa-pen-to-square"></i> Editar
            </button>
            <button type="button" class="ckn-btn ckn-btn--danger-outline" id="btn-delete-norma">
              <i class="fa-regular fa-trash-can"></i> Excluir
            </button>
          </div>` : ""}
        </div>

        <!-- Corpo principal em grid -->
        <div class="nd-body">

          <!-- Coluna principal -->
          <div class="nd-main">

            ${norma.aplicacao ? `
            <div class="nd-section">
              <div class="nd-section__title">
                <i class="fa-solid fa-circle-dot"></i> Aplicação
              </div>
              <p class="nd-section__text">${CKN_Common.escapeHtml(norma.aplicacao)}</p>
            </div>` : ""}

            <!-- Documentos -->
            <div class="nd-section">
              <div class="nd-section__title">
                <i class="fa-regular fa-file-lines"></i> Documentos Relacionados
              </div>
              ${documentos.length === 0
                ? `<p class="nd-empty">Nenhum documento cadastrado.</p>`
                : `<div class="nd-docs">
                    ${documentos.map(d => `
                      <div class="nd-doc-card">
                        <div class="nd-doc-card__icon"><i class="fa-regular fa-file-pdf"></i></div>
                        <div class="nd-doc-card__info">
                          <span class="nd-doc-card__name">${CKN_Common.escapeHtml(d.nome)}</span>
                          ${d.link
                            ? `<a href="${CKN_Common.escapeHtml(d.link)}" target="_blank" rel="noopener noreferrer" class="nd-doc-card__link">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar documento
                               </a>`
                            : `<span class="nd-doc-card__no-link">Link não disponível</span>`
                          }
                        </div>
                      </div>
                    `).join("")}
                   </div>`
              }
            </div>

            <!-- Processos relacionados -->
            <div class="nd-section">
              <div class="nd-section__title">
                <i class="fa-solid fa-diagram-project"></i> Processos Relacionados
              </div>
              ${processos.length === 0
                ? `<p class="nd-empty">Nenhum processo relacionado a esta norma.</p>`
                : `<div class="nd-process-list">
                    ${processos.map(p => `
                      <button type="button" class="nd-process-card" data-navigate-proc="${CKN_Common.escapeHtml(p.id)}">
                        <div class="nd-process-card__icon"><i class="fa-solid fa-diagram-project"></i></div>
                        <div class="nd-process-card__info">
                          <span class="nd-process-card__name">${CKN_Common.escapeHtml(p.nome)}</span>
                          ${p.objetivo ? `<span class="nd-process-card__obj">${CKN_Common.escapeHtml(CKN_Common.truncate(p.objetivo, 100))}</span>` : ""}
                        </div>
                        <i class="fa-solid fa-chevron-right nd-process-card__arrow"></i>
                      </button>
                    `).join("")}
                   </div>`
              }
            </div>

          </div>

          <!-- Sidebar direita -->
          <aside class="nd-aside">

            <!-- Ficha técnica -->
            <div class="nd-aside-card">
              <div class="nd-aside-card__title">
                <i class="fa-solid fa-circle-info"></i> Ficha Técnica
              </div>
              <dl class="nd-meta-list">
                <dt>Código</dt>
                <dd><span class="ckn-badge">${CKN_Common.escapeHtml(norma.codigo)}</span></dd>
                <dt>Documentos</dt>
                <dd>${documentos.length} ${documentos.length === 1 ? "arquivo" : "arquivos"}</dd>
                <dt>Revisões</dt>
                <dd>${historico.length} ${historico.length === 1 ? "registro" : "registros"}</dd>
                <dt>Processos</dt>
                <dd>${processos.length} ${processos.length === 1 ? "processo" : "processos"}</dd>
              </dl>
            </div>

            <!-- Histórico em timeline -->
            <div class="nd-aside-card">
              <div class="nd-aside-card__title">
                <i class="fa-regular fa-clock"></i> Histórico de Revisões
              </div>
              ${historico.length === 0
                ? `<p class="nd-empty">Nenhum registro de histórico.</p>`
                : `<ul class="nd-timeline">
                    ${historico.slice().reverse().map((h, i) => `
                      <li class="nd-timeline__item ${i === 0 ? "nd-timeline__item--latest" : ""}">
                        <div class="nd-timeline__dot"></div>
                        <div class="nd-timeline__content">
                          <span class="nd-timeline__date">${CKN_Common.formatDate(h.data)}</span>
                          <span class="nd-timeline__desc">${CKN_Common.escapeHtml(h.alteracao)}</span>
                        </div>
                      </li>
                    `).join("")}
                   </ul>`
              }
            </div>

          </aside>
        </div>
      </div>
    `;

    _bindEvents(norma);
  }

  function _bindEvents(norma) {
    const content = document.getElementById("ckn-content");
    if (!content) return;

    content.querySelector("#btn-back").addEventListener("click", () => _onNavigate("#/normas"));

    if (_isAdmin) {
      const editBtn = content.querySelector("#btn-edit-norma");
      if (editBtn) {
        editBtn.addEventListener("click", () => _onNavigate(`#/normas?edit=${norma.id}`));
      }

      const deleteBtn = content.querySelector("#btn-delete-norma");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          CKN_Common.confirm(`Excluir a norma "${norma.nome}"? Esta ação não pode ser desfeita.`).then(ok => {
            if (ok) {
              CKN_STORE.deleteNorma(norma.id);
              CKN_Common.showToast("Norma excluída com sucesso.");
              _onNavigate("#/normas");
            }
          });
        });
      }
    }

    // Navegar para processo
    content.querySelectorAll("[data-navigate-proc]").forEach(btn => {
      btn.addEventListener("click", () => {
        _onNavigate(`#/processo-detail?id=${btn.dataset.navigateProc}`);
      });
    });
  }

  return { init, render };
})();
