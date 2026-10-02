/**
 * Página de Normas — Admin e Pública.
 *
 * CORREÇÃO DO BUG DE DUPLICAÇÃO:
 * O problema era que _bindEvents() era chamado a cada init(), acumulando
 * múltiplos event listeners no elemento #ckn-content (que não é destruído
 * entre navegações). Ao clicar em "Salvar Norma", os N listeners acumulados
 * chamavam _saveForm() N vezes, criando N cópias do registro.
 *
 * Solução: os listeners são registrados uma única vez via _initEvents(),
 * controlado pela flag _eventsRegistered. O init() subsequente apenas
 * atualiza o estado e re-renderiza, sem registrar novos listeners.
 */
const CKN_PageNormas = (() => {

  let _isAdmin = false;
  let _searchTerm = "";
  let _normaForm = {};
  let _editingId = null;
  let _docsTemp = [];
  let _histTemp = [];
  let _onNavigate = null;
  let _eventsRegistered = false; // ← FLAG: garante registro único de listeners

  function init(opts = {}) {
    _isAdmin = opts.isAdmin || false;
    _onNavigate = opts.onNavigate || (() => {});
    render();
    // Registrar listeners apenas na primeira vez
    if (!_eventsRegistered) {
      _bindEvents();
      _eventsRegistered = true;
    }
  }

  // ──────────────────────────────────────────────
  // FONTE DE DADOS
  // ──────────────────────────────────────────────

  function _getNormas() {
    if (_isAdmin) return CKN_STORE.getNormas();
    return CKN_DATA.normas || [];
  }

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  function render() {
    CKN_Layout.setActivePage("normas");
    CKN_Layout.setPageTitle("Normas Aplicáveis");

    const content = document.getElementById("ckn-content");
    if (!content) return;

    content.innerHTML = `
      <div class="ckn-page">
        <div class="ckn-page__header">
          <div>
            <h2 class="ckn-page__title">Normas Aplicáveis</h2>
            <p class="ckn-page__subtitle">Consulte as normas vigentes e suas aplicações.</p>
          </div>
          ${_isAdmin ? `
          <button type="button" class="ckn-btn ckn-btn--primary" id="btn-nova-norma">
            <i class="fa-solid fa-plus"></i> Nova Norma
          </button>` : ""}
        </div>

        <div class="ckn-toolbar">
          <div class="ckn-search">
            <i class="fa-solid fa-magnifying-glass ckn-search__icon"></i>
            <input
              type="text"
              class="ckn-search__input"
              id="normas-search"
              placeholder="Buscar por código, nome ou descrição…"
              value="${CKN_Common.escapeHtml(_searchTerm)}"
              autocomplete="off"
            />
            ${_searchTerm ? `<button type="button" class="ckn-search__clear" id="btn-clear-search"><i class="fa-solid fa-xmark"></i></button>` : ""}
          </div>
        </div>

        <div id="normas-list" class="ckn-card-grid"></div>
      </div>

      ${_isAdmin ? _renderModal() : ""}
    `;

    _renderList();
  }

  function _renderList() {
    const container = document.getElementById("normas-list");
    if (!container) return;

    const allNormas = _getNormas();
    console.log(`[Normas] Renderizando ${allNormas.length} normas da fonte ${_isAdmin ? "CKN_STORE" : "CKN_DATA"}.`);

    const normas = CKN_Common.filterByTerm(allNormas, _searchTerm, ["codigo", "nome", "descricao", "aplicacao"]);

    if (normas.length === 0) {
      container.innerHTML = _searchTerm
        ? CKN_Common.emptyState("fa-file-circle-question", "Nenhuma norma encontrada", `Nenhum resultado para "${_searchTerm}".`)
        : CKN_Common.emptyState("fa-file-lines", "Nenhuma norma cadastrada", _isAdmin ? 'Clique em "Nova Norma" para começar.' : "Não há normas cadastradas no momento.");
      return;
    }

    container.innerHTML = normas.map(n => _renderCard(n)).join("");
  }

  function _renderCard(norma) {
    const docsCount = (norma.documentos || []).length;
    const histCount = (norma.historico || []).length;

    return `
      <div class="ckn-card" data-id="${CKN_Common.escapeHtml(norma.id)}">
        <div class="ckn-card__header">
          <span class="ckn-badge">${CKN_Common.escapeHtml(norma.codigo)}</span>
          ${_isAdmin ? `
          <div class="ckn-card__actions">
            <button type="button" class="ckn-icon-btn" title="Editar" data-action="edit" data-id="${CKN_Common.escapeHtml(norma.id)}">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button type="button" class="ckn-icon-btn ckn-icon-btn--danger" title="Excluir" data-action="delete" data-id="${CKN_Common.escapeHtml(norma.id)}">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>` : ""}
        </div>
        <div class="ckn-card__body">
          <h3 class="ckn-card__title">${CKN_Common.escapeHtml(norma.nome)}</h3>
          ${norma.descricao ? `<p class="ckn-card__desc">${CKN_Common.escapeHtml(CKN_Common.truncate(norma.descricao, 150))}</p>` : ""}
          ${norma.aplicacao ? `<p class="ckn-card__meta"><i class="fa-solid fa-circle-dot"></i> ${CKN_Common.escapeHtml(CKN_Common.truncate(norma.aplicacao, 100))}</p>` : ""}
        </div>
        <div class="ckn-card__footer">
          <div class="ckn-card__stats">
            ${docsCount > 0 ? `<span class="ckn-card__stat"><i class="fa-regular fa-file"></i> ${docsCount} ${docsCount === 1 ? "documento" : "documentos"}</span>` : ""}
            ${histCount > 0 ? `<span class="ckn-card__stat"><i class="fa-regular fa-clock"></i> ${histCount} ${histCount === 1 ? "revisão" : "revisões"}</span>` : ""}
          </div>
          <button type="button" class="ckn-btn ckn-btn--ghost ckn-btn--sm" data-action="detail" data-id="${CKN_Common.escapeHtml(norma.id)}">
            Ver detalhes <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  // ──────────────────────────────────────────────
  // MODAL
  // ──────────────────────────────────────────────

  function _renderModal() {
    return `
      <div class="ckn-modal" id="modal-norma">
        <div class="ckn-modal__backdrop" data-close-modal="modal-norma"></div>
        <div class="ckn-modal__container ckn-modal__container--lg">
          <div class="ckn-modal__header">
            <h3 class="ckn-modal__title" id="modal-norma-title">Nova Norma</h3>
            <button type="button" class="ckn-modal__close" data-close-modal="modal-norma">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form class="ckn-modal__body" id="form-norma" novalidate>
            <div class="ckn-form-row ckn-form-row--2">
              <div class="ckn-form-group">
                <label class="ckn-label" for="field-codigo">Código <span class="required">*</span></label>
                <input type="text" class="ckn-input" id="field-codigo" data-field="codigo" placeholder="Ex: NR-10" autocomplete="off" />
              </div>
              <div class="ckn-form-group">
                <label class="ckn-label" for="field-nome">Nome <span class="required">*</span></label>
                <input type="text" class="ckn-input" id="field-nome" data-field="nome" placeholder="Ex: Segurança em Instalações Elétricas" autocomplete="off" />
              </div>
            </div>
            <div class="ckn-form-group">
              <label class="ckn-label" for="field-descricao">Descrição</label>
              <textarea class="ckn-input ckn-textarea" id="field-descricao" data-field="descricao" placeholder="Do que trata esta norma?" rows="3"></textarea>
            </div>
            <div class="ckn-form-group">
              <label class="ckn-label" for="field-aplicacao">Aplicação</label>
              <textarea class="ckn-input ckn-textarea" id="field-aplicacao" data-field="aplicacao" placeholder="Ex: Aplica-se a todas as unidades operacionais…" rows="2"></textarea>
            </div>

            <!-- Documentos -->
            <div class="ckn-form-section">
              <div class="ckn-form-section__header">
                <span class="ckn-form-section__title"><i class="fa-regular fa-file"></i> Documentos</span>
                <button type="button" class="ckn-btn ckn-btn--ghost ckn-btn--sm" id="btn-add-doc">
                  <i class="fa-solid fa-plus"></i> Adicionar documento
                </button>
              </div>
              <div id="docs-list"></div>
            </div>

            <!-- Histórico -->
            <div class="ckn-form-section">
              <div class="ckn-form-section__header">
                <span class="ckn-form-section__title"><i class="fa-regular fa-clock"></i> Histórico de Alterações</span>
                <button type="button" class="ckn-btn ckn-btn--ghost ckn-btn--sm" id="btn-add-hist">
                  <i class="fa-solid fa-plus"></i> Adicionar registro de histórico
                </button>
              </div>
              <div id="hist-list"></div>
            </div>
          </form>
          <div class="ckn-modal__footer">
            <button type="button" class="ckn-btn ckn-btn--ghost" data-close-modal="modal-norma">Cancelar</button>
            <button type="button" class="ckn-btn ckn-btn--primary" id="btn-salvar-norma">
              <i class="fa-solid fa-floppy-disk"></i> Salvar Norma
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function _renderDocsList() {
    const container = document.getElementById("docs-list");
    if (!container) return;
    if (_docsTemp.length === 0) {
      container.innerHTML = `<p class="ckn-form-empty">Nenhum documento adicionado.</p>`;
      return;
    }
    container.innerHTML = _docsTemp.map((doc, i) => `
      <div class="ckn-subitem" data-doc-index="${i}">
        <div class="ckn-subitem__fields">
          <input type="text" class="ckn-input" placeholder="Nome do documento" value="${CKN_Common.escapeHtml(doc.nome)}" data-doc-field="nome" data-doc-index="${i}" />
          <input type="text" class="ckn-input" placeholder="Link (opcional)" value="${CKN_Common.escapeHtml(doc.link || "")}" data-doc-field="link" data-doc-index="${i}" />
        </div>
        <button type="button" class="ckn-icon-btn ckn-icon-btn--danger" data-doc-remove="${i}" title="Remover">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join("");
  }

  function _renderHistList() {
    const container = document.getElementById("hist-list");
    if (!container) return;
    if (_histTemp.length === 0) {
      container.innerHTML = `<p class="ckn-form-empty">Nenhum registro de histórico adicionado.</p>`;
      return;
    }
    container.innerHTML = _histTemp.map((h, i) => `
      <div class="ckn-subitem" data-hist-index="${i}">
        <div class="ckn-subitem__fields">
          <input type="date" class="ckn-input ckn-input--date" value="${CKN_Common.escapeHtml(h.data || "")}" data-hist-field="data" data-hist-index="${i}" />
          <input type="text" class="ckn-input" placeholder="O que mudou nesta revisão?" value="${CKN_Common.escapeHtml(h.alteracao || "")}" data-hist-field="alteracao" data-hist-index="${i}" />
        </div>
        <button type="button" class="ckn-icon-btn ckn-icon-btn--danger" data-hist-remove="${i}" title="Remover">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join("");
  }

  // ──────────────────────────────────────────────
  // FORM
  // ──────────────────────────────────────────────

  function _openForm(norma = null) {
    _editingId = norma ? norma.id : null;
    _normaForm = norma
      ? { ...norma }
      : { codigo: "", nome: "", descricao: "", aplicacao: "" };

    _docsTemp = norma ? JSON.parse(JSON.stringify(norma.documentos || [])) : [];
    _histTemp = norma ? JSON.parse(JSON.stringify(norma.historico || [])) : [];

    const title = document.getElementById("modal-norma-title");
    if (title) title.textContent = norma ? "Editar Norma" : "Nova Norma";

    const fields = ["codigo", "nome", "descricao", "aplicacao"];
    fields.forEach(f => {
      const el = document.querySelector(`[data-field="${f}"]`);
      if (el) el.value = _normaForm[f] || "";
    });

    _renderDocsList();
    _renderHistList();
    CKN_Common.openModal("modal-norma");
  }

  function _saveForm() {
    // Proteção contra duplo clique: desabilitar botão imediatamente
    const saveBtn = document.getElementById("btn-salvar-norma");
    if (saveBtn) {
      if (saveBtn.disabled) return; // já está processando, ignorar
      saveBtn.disabled = true;
    }

    const reEnableBtn = () => {
      if (saveBtn) saveBtn.disabled = false;
    };

    // Ler campos do form
    const fields = ["codigo", "nome", "descricao", "aplicacao"];
    fields.forEach(f => {
      const el = document.querySelector(`[data-field="${f}"]`);
      if (el) _normaForm[f] = el.value.trim();
    });

    // Validação
    if (!_normaForm.codigo) {
      CKN_Common.showToast("O campo Código é obrigatório.", "error");
      const el = document.getElementById("field-codigo");
      if (el) el.focus();
      reEnableBtn();
      return;
    }
    if (!_normaForm.nome) {
      CKN_Common.showToast("O campo Nome é obrigatório.", "error");
      const el = document.getElementById("field-nome");
      if (el) el.focus();
      reEnableBtn();
      return;
    }

    // Montar objeto final
    const norma = {
      id: _editingId || CKN_Common.generateId("norma"),
      codigo: _normaForm.codigo,
      nome: _normaForm.nome,
      descricao: _normaForm.descricao || "",
      aplicacao: _normaForm.aplicacao || "",
      documentos: _docsTemp.filter(d => d.nome && d.nome.trim()),
      historico: _histTemp.filter(h => h.alteracao && h.alteracao.trim())
    };

    CKN_STORE.saveNorma(norma);
    CKN_Common.closeModal("modal-norma");
    CKN_Common.showToast("Norma salva com sucesso.");
    _renderList();
    // botão será re-renderizado com o modal fechado, mas reabilitar por segurança
    reEnableBtn();
  }

  // ──────────────────────────────────────────────
  // EVENTOS — registrados UMA ÚNICA VEZ
  // ──────────────────────────────────────────────

  function _bindEvents() {
    const content = document.getElementById("ckn-content");
    if (!content) return;

    // Listener de input — delegado no document para sobreviver a re-renders
    document.addEventListener("input", e => {
      // Busca de normas
      if (e.target.id === "normas-search") {
        _searchTerm = e.target.value;
        _renderList();
        const clearBtn = document.getElementById("btn-clear-search");
        if (_searchTerm && !clearBtn) {
          const searchWrapper = e.target.closest(".ckn-search");
          if (searchWrapper) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "ckn-search__clear";
            btn.id = "btn-clear-search";
            btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            searchWrapper.appendChild(btn);
          }
        } else if (!_searchTerm && clearBtn) {
          clearBtn.remove();
        }
        return;
      }

      // Edição de campos de documentos
      const docField = e.target.getAttribute("data-doc-field");
      if (docField !== null) {
        const idx = parseInt(e.target.getAttribute("data-doc-index"));
        if (!isNaN(idx) && _docsTemp[idx]) {
          _docsTemp[idx][docField] = e.target.value;
        }
        return;
      }

      // Edição de campos de histórico
      const histField = e.target.getAttribute("data-hist-field");
      if (histField !== null) {
        const idx = parseInt(e.target.getAttribute("data-hist-index"));
        if (!isNaN(idx) && _histTemp[idx]) {
          _histTemp[idx][histField] = e.target.value;
        }
        return;
      }
    });

    // Listener de click — delegado no document
    document.addEventListener("click", e => {
      // Verificar se estamos na página de normas (modal ou lista presente)
      const onNormasPage = !!document.getElementById("normas-list") || !!document.getElementById("modal-norma");
      if (!onNormasPage) return;

      // Limpar busca
      if (e.target.closest("#btn-clear-search")) {
        _searchTerm = "";
        const searchInput = document.getElementById("normas-search");
        if (searchInput) searchInput.value = "";
        _renderList();
        const clearBtn = document.getElementById("btn-clear-search");
        if (clearBtn) clearBtn.remove();
        return;
      }

      // Nova norma
      if (e.target.closest("#btn-nova-norma")) {
        _openForm();
        return;
      }

      // Fechar modal pelo backdrop ou botão
      const closeTarget = e.target.closest("[data-close-modal='modal-norma']");
      if (closeTarget) {
        CKN_Common.closeModal("modal-norma");
        return;
      }

      // Salvar norma — ÚNICA entrada de execução
      if (e.target.closest("#btn-salvar-norma")) {
        _saveForm();
        return;
      }

      // Ações do card
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn && (document.getElementById("normas-list") || document.getElementById("modal-norma"))) {
        const action = actionBtn.dataset.action;
        const id = actionBtn.dataset.id;

        if (action === "detail") {
          _onNavigate(`#/norma-detail?id=${id}`);
          return;
        }
        if (action === "edit" && _isAdmin) {
          const norma = CKN_STORE.getNormaById(id);
          if (norma) _openForm(norma);
          return;
        }
        if (action === "delete" && _isAdmin) {
          const norma = CKN_STORE.getNormaById(id);
          if (!norma) return;
          CKN_Common.confirm(`Excluir a norma "${norma.nome}"? Esta ação não pode ser desfeita.`).then(ok => {
            if (ok) {
              CKN_STORE.deleteNorma(id);
              CKN_Common.showToast("Norma excluída com sucesso.");
              _renderList();
            }
          });
          return;
        }
      }

      // Adicionar documento
      if (e.target.closest("#btn-add-doc")) {
        _docsTemp.push({ id: CKN_Common.generateId("doc"), nome: "", link: "" });
        _renderDocsList();
        return;
      }

      // Remover documento
      const docRemove = e.target.closest("[data-doc-remove]");
      if (docRemove && document.getElementById("modal-norma")) {
        const idx = parseInt(docRemove.dataset.docRemove);
        _docsTemp.splice(idx, 1);
        _renderDocsList();
        return;
      }

      // Adicionar histórico
      if (e.target.closest("#btn-add-hist")) {
        const today = new Date().toISOString().split("T")[0];
        _histTemp.push({ id: CKN_Common.generateId("hist"), data: today, alteracao: "" });
        _renderHistList();
        return;
      }

      // Remover histórico
      const histRemove = e.target.closest("[data-hist-remove]");
      if (histRemove && document.getElementById("modal-norma")) {
        const idx = parseInt(histRemove.dataset.histRemove);
        _histTemp.splice(idx, 1);
        _renderHistList();
        return;
      }
    });
  }

  return { init, render };
})();
