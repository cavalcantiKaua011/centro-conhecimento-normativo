/**
 * Página de Processos — Admin e Pública.
 *
 * CORREÇÃO DO BUG DE DUPLICAÇÃO (mesmo padrão de Normas.js):
 * Listeners registrados uma única vez via flag _eventsRegistered.
 */
const CKN_PageProcessos = (() => {

  let _isAdmin = false;
  let _searchTerm = "";
  let _processoForm = {};
  let _editingId = null;
  let _passosTemp = [];
  let _normasTemp = [];
  let _docsTemp = [];
  let _onNavigate = null;
  let _eventsRegistered = false; // ← FLAG: garante registro único de listeners

  function init(opts = {}) {
    _isAdmin = opts.isAdmin || false;
    _onNavigate = opts.onNavigate || (() => {});
    render();
    if (!_eventsRegistered) {
      _bindEvents();
      _eventsRegistered = true;
    }
  }

  // ──────────────────────────────────────────────
  // FONTES DE DADOS
  // ──────────────────────────────────────────────

  function _getProcessos() {
    if (_isAdmin) return CKN_STORE.getProcessos();
    return CKN_DATA.processos || [];
  }

  function _getAllNormas() {
    if (_isAdmin) return CKN_STORE.getNormas();
    return CKN_DATA.normas || [];
  }

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  function render() {
    CKN_Layout.setActivePage("processos");
    CKN_Layout.setPageTitle("Processos");

    const content = document.getElementById("ckn-content");
    if (!content) return;

    content.innerHTML = `
      <div class="ckn-page">
        <div class="ckn-page__header">
          <div>
            <h2 class="ckn-page__title">Processos</h2>
            <p class="ckn-page__subtitle">Consulte os processos e suas normas associadas.</p>
          </div>
          ${_isAdmin ? `
          <button type="button" class="ckn-btn ckn-btn--primary" id="btn-novo-processo">
            <i class="fa-solid fa-plus"></i> Novo Processo
          </button>` : ""}
        </div>

        <div class="ckn-toolbar">
          <div class="ckn-search">
            <i class="fa-solid fa-magnifying-glass ckn-search__icon"></i>
            <input
              type="text"
              class="ckn-search__input"
              id="processos-search"
              placeholder="Buscar por nome ou objetivo…"
              value="${CKN_Common.escapeHtml(_searchTerm)}"
              autocomplete="off"
            />
            ${_searchTerm ? `<button type="button" class="ckn-search__clear" id="btn-clear-search-proc"><i class="fa-solid fa-xmark"></i></button>` : ""}
          </div>
        </div>

        <div id="processos-list" class="ckn-card-grid"></div>
      </div>

      ${_isAdmin ? _renderModal() : ""}
    `;

    _renderList();
  }

  function _renderList() {
    const container = document.getElementById("processos-list");
    if (!container) return;

    const allProcessos = _getProcessos();
    console.log(`[Processos] Renderizando ${allProcessos.length} processos da fonte ${_isAdmin ? "CKN_STORE" : "CKN_DATA"}.`);

    const processos = CKN_Common.filterByTerm(allProcessos, _searchTerm, ["nome", "objetivo"]);

    if (processos.length === 0) {
      container.innerHTML = _searchTerm
        ? CKN_Common.emptyState("fa-folder-open", "Nenhum processo encontrado", `Nenhum resultado para "${_searchTerm}".`)
        : CKN_Common.emptyState("fa-diagram-project", "Nenhum processo cadastrado", _isAdmin ? 'Clique em "Novo Processo" para começar.' : "Não há processos cadastrados no momento.");
      return;
    }

    const allNormas = _getAllNormas();
    container.innerHTML = processos.map(p => _renderCard(p, allNormas)).join("");
  }

  function _renderCard(processo, allNormas) {
    const normasNomes = (processo.normasRelacionadas || [])
      .map(nid => {
        const n = allNormas.find(x => x.id === nid);
        return n ? n.codigo : null;
      })
      .filter(Boolean);

    const docsCount = (processo.documentosRelacionados || []).length;
    const passosCount = (processo.passos || []).length;

    return `
      <div class="ckn-card" data-id="${CKN_Common.escapeHtml(processo.id)}">
        <div class="ckn-card__header">
          <div class="ckn-card__tags">
            ${normasNomes.map(n => `<span class="ckn-badge ckn-badge--outline">${CKN_Common.escapeHtml(n)}</span>`).join("")}
            ${normasNomes.length === 0 ? `<span class="ckn-badge ckn-badge--neutral">Sem normas</span>` : ""}
          </div>
          ${_isAdmin ? `
          <div class="ckn-card__actions">
            <button type="button" class="ckn-icon-btn" title="Editar" data-action-proc="edit" data-id="${CKN_Common.escapeHtml(processo.id)}">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button type="button" class="ckn-icon-btn ckn-icon-btn--danger" title="Excluir" data-action-proc="delete" data-id="${CKN_Common.escapeHtml(processo.id)}">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>` : ""}
        </div>
        <div class="ckn-card__body">
          <h3 class="ckn-card__title">${CKN_Common.escapeHtml(processo.nome)}</h3>
          ${processo.objetivo ? `<p class="ckn-card__desc">${CKN_Common.escapeHtml(CKN_Common.truncate(processo.objetivo, 150))}</p>` : ""}
        </div>
        <div class="ckn-card__footer">
          <div class="ckn-card__stats">
            ${passosCount > 0 ? `<span class="ckn-card__stat"><i class="fa-solid fa-list-check"></i> ${passosCount} ${passosCount === 1 ? "passo" : "passos"}</span>` : ""}
            ${docsCount > 0 ? `<span class="ckn-card__stat"><i class="fa-regular fa-file"></i> ${docsCount} ${docsCount === 1 ? "documento" : "documentos"}</span>` : ""}
          </div>
          <button type="button" class="ckn-btn ckn-btn--ghost ckn-btn--sm" data-action-proc="detail" data-id="${CKN_Common.escapeHtml(processo.id)}">
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
      <div class="ckn-modal" id="modal-processo">
        <div class="ckn-modal__backdrop" data-close-modal="modal-processo"></div>
        <div class="ckn-modal__container ckn-modal__container--lg">
          <div class="ckn-modal__header">
            <h3 class="ckn-modal__title" id="modal-processo-title">Novo Processo</h3>
            <button type="button" class="ckn-modal__close" data-close-modal="modal-processo">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form class="ckn-modal__body" id="form-processo" novalidate>
            <div class="ckn-form-group">
              <label class="ckn-label" for="pfield-nome">Nome <span class="required">*</span></label>
              <input type="text" class="ckn-input" id="pfield-nome" data-pfield="nome" placeholder="Nome do processo" autocomplete="off" />
            </div>
            <div class="ckn-form-group">
              <label class="ckn-label" for="pfield-objetivo">Objetivo</label>
              <textarea class="ckn-input ckn-textarea" id="pfield-objetivo" data-pfield="objetivo" placeholder="Qual o objetivo deste processo?" rows="3"></textarea>
            </div>

            <!-- Passos -->
            <div class="ckn-form-section">
              <div class="ckn-form-section__header">
                <span class="ckn-form-section__title"><i class="fa-solid fa-list-check"></i> Passos</span>
                <button type="button" class="ckn-btn ckn-btn--ghost ckn-btn--sm" id="btn-add-passo">
                  <i class="fa-solid fa-plus"></i> Adicionar passo
                </button>
              </div>
              <div id="passos-list"></div>
            </div>

            <!-- Normas relacionadas -->
            <div class="ckn-form-section">
              <div class="ckn-form-section__header">
                <span class="ckn-form-section__title"><i class="fa-solid fa-book-bookmark"></i> Normas Relacionadas</span>
              </div>
              <div id="normas-select-list" class="ckn-checkbox-list"></div>
            </div>

            <!-- Documentos -->
            <div class="ckn-form-section">
              <div class="ckn-form-section__header">
                <span class="ckn-form-section__title"><i class="fa-regular fa-file"></i> Documentos Relacionados</span>
                <button type="button" class="ckn-btn ckn-btn--ghost ckn-btn--sm" id="btn-add-pdoc">
                  <i class="fa-solid fa-plus"></i> Adicionar documento
                </button>
              </div>
              <div id="pdocs-list"></div>
            </div>
          </form>
          <div class="ckn-modal__footer">
            <button type="button" class="ckn-btn ckn-btn--ghost" data-close-modal="modal-processo">Cancelar</button>
            <button type="button" class="ckn-btn ckn-btn--primary" id="btn-salvar-processo">
              <i class="fa-solid fa-floppy-disk"></i> Salvar Processo
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function _renderPassosList() {
    const container = document.getElementById("passos-list");
    if (!container) return;
    if (_passosTemp.length === 0) {
      container.innerHTML = `<p class="ckn-form-empty">Nenhum passo adicionado.</p>`;
      return;
    }
    container.innerHTML = _passosTemp.map((passo, i) => `
      <div class="ckn-subitem ckn-subitem--single" data-passo-index="${i}">
        <span class="ckn-subitem__num">${i + 1}</span>
        <input type="text" class="ckn-input" placeholder="Descrição do passo" value="${CKN_Common.escapeHtml(passo)}" data-passo-index="${i}" />
        <button type="button" class="ckn-icon-btn ckn-icon-btn--danger" data-passo-remove="${i}" title="Remover">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join("");
  }

  function _renderNormasSelect() {
    const container = document.getElementById("normas-select-list");
    if (!container) return;
    const normas = _getAllNormas();
    if (normas.length === 0) {
      container.innerHTML = `<p class="ckn-form-empty">Nenhuma norma cadastrada.</p>`;
      return;
    }
    container.innerHTML = normas.map(n => `
      <label class="ckn-checkbox-item">
        <input
          type="checkbox"
          class="ckn-checkbox"
          value="${CKN_Common.escapeHtml(n.id)}"
          ${_normasTemp.includes(n.id) ? "checked" : ""}
          data-norma-check="${CKN_Common.escapeHtml(n.id)}"
        />
        <span class="ckn-checkbox-item__label">
          <span class="ckn-badge">${CKN_Common.escapeHtml(n.codigo)}</span>
          ${CKN_Common.escapeHtml(n.nome)}
        </span>
      </label>
    `).join("");
  }

  function _renderPDocsList() {
    const container = document.getElementById("pdocs-list");
    if (!container) return;
    if (_docsTemp.length === 0) {
      container.innerHTML = `<p class="ckn-form-empty">Nenhum documento adicionado.</p>`;
      return;
    }
    container.innerHTML = _docsTemp.map((doc, i) => `
      <div class="ckn-subitem" data-pdoc-index="${i}">
        <div class="ckn-subitem__fields">
          <input type="text" class="ckn-input" placeholder="Nome do documento" value="${CKN_Common.escapeHtml(doc.nome)}" data-pdoc-field="nome" data-pdoc-index="${i}" />
          <input type="text" class="ckn-input" placeholder="Link (opcional)" value="${CKN_Common.escapeHtml(doc.link || "")}" data-pdoc-field="link" data-pdoc-index="${i}" />
        </div>
        <button type="button" class="ckn-icon-btn ckn-icon-btn--danger" data-pdoc-remove="${i}" title="Remover">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join("");
  }

  // ──────────────────────────────────────────────
  // FORM
  // ──────────────────────────────────────────────

  function _openForm(processo = null) {
    _editingId = processo ? processo.id : null;
    _processoForm = processo ? { ...processo } : { nome: "", objetivo: "" };
    _passosTemp = processo ? [...(processo.passos || [])] : [];
    _normasTemp = processo ? [...(processo.normasRelacionadas || [])] : [];
    _docsTemp = processo ? JSON.parse(JSON.stringify(processo.documentosRelacionados || [])) : [];

    const title = document.getElementById("modal-processo-title");
    if (title) title.textContent = processo ? "Editar Processo" : "Novo Processo";

    const fields = ["nome", "objetivo"];
    fields.forEach(f => {
      const el = document.querySelector(`[data-pfield="${f}"]`);
      if (el) el.value = _processoForm[f] || "";
    });

    _renderPassosList();
    _renderNormasSelect();
    _renderPDocsList();
    CKN_Common.openModal("modal-processo");
  }

  function _saveForm() {
    // Proteção contra duplo clique
    const saveBtn = document.getElementById("btn-salvar-processo");
    if (saveBtn) {
      if (saveBtn.disabled) return;
      saveBtn.disabled = true;
    }
    const reEnableBtn = () => { if (saveBtn) saveBtn.disabled = false; };

    const fields = ["nome", "objetivo"];
    fields.forEach(f => {
      const el = document.querySelector(`[data-pfield="${f}"]`);
      if (el) _processoForm[f] = el.value.trim();
    });

    if (!_processoForm.nome) {
      CKN_Common.showToast("O campo Nome é obrigatório.", "error");
      const el = document.getElementById("pfield-nome");
      if (el) el.focus();
      reEnableBtn();
      return;
    }

    // Ler checkboxes de normas
    _normasTemp = [];
    document.querySelectorAll("[data-norma-check]:checked").forEach(cb => {
      _normasTemp.push(cb.value);
    });

    const processo = {
      id: _editingId || CKN_Common.generateId("processo"),
      nome: _processoForm.nome,
      objetivo: _processoForm.objetivo || "",
      passos: _passosTemp.filter(p => p && p.trim()),
      normasRelacionadas: _normasTemp,
      documentosRelacionados: _docsTemp.filter(d => d.nome && d.nome.trim())
    };

    CKN_STORE.saveProcesso(processo);
    CKN_Common.closeModal("modal-processo");
    CKN_Common.showToast("Processo salvo com sucesso.");
    _renderList();
    reEnableBtn();
  }

  // ──────────────────────────────────────────────
  // EVENTOS — registrados UMA ÚNICA VEZ
  // ──────────────────────────────────────────────

  function _bindEvents() {
    // Inputs — delegado no document
    document.addEventListener("input", e => {
      if (e.target.id === "processos-search") {
        _searchTerm = e.target.value;
        _renderList();
        const clearBtn = document.getElementById("btn-clear-search-proc");
        if (_searchTerm && !clearBtn) {
          const sw = e.target.closest(".ckn-search");
          if (sw) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "ckn-search__clear";
            btn.id = "btn-clear-search-proc";
            btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            sw.appendChild(btn);
          }
        } else if (!_searchTerm && clearBtn) {
          clearBtn.remove();
        }
        return;
      }

      // Edição de passos
      if (e.target.hasAttribute("data-passo-index") && !e.target.hasAttribute("data-passo-remove")) {
        const idx = parseInt(e.target.getAttribute("data-passo-index"));
        if (!isNaN(idx)) _passosTemp[idx] = e.target.value;
        return;
      }

      // Edição de documentos do processo
      const pdocField = e.target.getAttribute("data-pdoc-field");
      if (pdocField !== null) {
        const idx = parseInt(e.target.getAttribute("data-pdoc-index"));
        if (!isNaN(idx) && _docsTemp[idx]) _docsTemp[idx][pdocField] = e.target.value;
        return;
      }
    });

    // Clicks — delegado no document
    document.addEventListener("click", e => {
      const onProcessosPage = !!document.getElementById("processos-list") || !!document.getElementById("modal-processo");
      if (!onProcessosPage) return;

      // Limpar busca
      if (e.target.closest("#btn-clear-search-proc")) {
        _searchTerm = "";
        const si = document.getElementById("processos-search");
        if (si) si.value = "";
        _renderList();
        const cb = document.getElementById("btn-clear-search-proc");
        if (cb) cb.remove();
        return;
      }

      // Novo processo
      if (e.target.closest("#btn-novo-processo")) {
        _openForm();
        return;
      }

      // Fechar modal
      const closeTarget = e.target.closest("[data-close-modal='modal-processo']");
      if (closeTarget) {
        CKN_Common.closeModal("modal-processo");
        return;
      }

      // Salvar processo — ÚNICA entrada de execução
      if (e.target.closest("#btn-salvar-processo")) {
        _saveForm();
        return;
      }

      // Ações do card (usando data-action-proc para não colidir com normas)
      const actionBtn = e.target.closest("[data-action-proc]");
      if (actionBtn) {
        const action = actionBtn.dataset.actionProc;
        const id = actionBtn.dataset.id;

        if (action === "detail") {
          _onNavigate(`#/processo-detail?id=${id}`);
          return;
        }
        if (action === "edit" && _isAdmin) {
          const processo = CKN_STORE.getProcessoById(id);
          if (processo) _openForm(processo);
          return;
        }
        if (action === "delete" && _isAdmin) {
          const processo = CKN_STORE.getProcessoById(id);
          if (!processo) return;
          CKN_Common.confirm(`Excluir o processo "${processo.nome}"?`).then(ok => {
            if (ok) {
              CKN_STORE.deleteProcesso(id);
              CKN_Common.showToast("Processo excluído com sucesso.");
              _renderList();
            }
          });
          return;
        }
      }

      // Adicionar passo
      if (e.target.closest("#btn-add-passo")) {
        _passosTemp.push("");
        _renderPassosList();
        return;
      }

      // Remover passo
      const passoRemove = e.target.closest("[data-passo-remove]");
      if (passoRemove && document.getElementById("modal-processo")) {
        const idx = parseInt(passoRemove.dataset.passoRemove);
        _passosTemp.splice(idx, 1);
        _renderPassosList();
        return;
      }

      // Adicionar doc de processo
      if (e.target.closest("#btn-add-pdoc")) {
        _docsTemp.push({ id: CKN_Common.generateId("doc"), nome: "", link: "" });
        _renderPDocsList();
        return;
      }

      // Remover doc de processo
      const pdocRemove = e.target.closest("[data-pdoc-remove]");
      if (pdocRemove && document.getElementById("modal-processo")) {
        const idx = parseInt(pdocRemove.dataset.pdocRemove);
        _docsTemp.splice(idx, 1);
        _renderPDocsList();
        return;
      }
    });

    // Checkboxes de normas
    document.addEventListener("change", e => {
      if (e.target.hasAttribute("data-norma-check") && document.getElementById("modal-processo")) {
        const id = e.target.value;
        if (e.target.checked) {
          if (!_normasTemp.includes(id)) _normasTemp.push(id);
        } else {
          _normasTemp = _normasTemp.filter(nid => nid !== id);
        }
      }
    });
  }

  return { init, render };
})();
