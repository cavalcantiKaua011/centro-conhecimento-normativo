/**
 * CKN_STORE — Abstração de armazenamento para a página administrativa.
 *
 * Utiliza localStorage como backend atual.
 * Para trocar por uma API no futuro, basta reimplementar estas funções
 * sem alterar a camada de interface.
 *
 * REGRA: Esta camada é usada EXCLUSIVAMENTE pela página administrativa.
 * A página pública NÃO usa CKN_STORE — ela lê diretamente CKN_DATA.
 */
const CKN_STORE = (() => {
  const STORAGE_KEY = "ckn_admin_data";

  /**
   * Lê o estado atual do armazenamento.
   * Na primeira execução, inicializa a partir do CKN_DATA publicado.
   */
  function _getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("CKN_STORE: erro ao parsear localStorage. Reiniciando com CKN_DATA.", e);
        return _initFromPublished();
      }
    }
    return _initFromPublished();
  }

  /**
   * Inicializa o armazenamento local a partir do CKN_DATA publicado.
   * Faz uma cópia profunda para evitar mutação acidental do objeto original.
   */
  function _initFromPublished() {
    const initialState = {
      version: CKN_DATA.version,
      updatedAt: CKN_DATA.updatedAt,
      updatedBy: CKN_DATA.updatedBy,
      normas: JSON.parse(JSON.stringify(CKN_DATA.normas)),
      processos: JSON.parse(JSON.stringify(CKN_DATA.processos))
    };
    _saveState(initialState);
    console.log("CKN_STORE: inicializado com CKN_DATA publicado.");
    return initialState;
  }

  /**
   * Salva o estado no localStorage.
   */
  function _saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ──────────────────────────────────────────────
  // NORMAS
  // ──────────────────────────────────────────────

  function getNormas() {
    return _getState().normas || [];
  }

  function getNormaById(id) {
    return getNormas().find(n => n.id === id) || null;
  }

  function saveNorma(norma) {
    const state = _getState();
    const idx = state.normas.findIndex(n => n.id === norma.id);
    if (idx >= 0) {
      state.normas[idx] = norma; // atualiza
    } else {
      state.normas.push(norma); // cria
    }
    _saveState(state);
  }

  function deleteNorma(id) {
    const state = _getState();
    state.normas = state.normas.filter(n => n.id !== id);
    // remover referências nos processos
    state.processos = state.processos.map(p => ({
      ...p,
      normasRelacionadas: (p.normasRelacionadas || []).filter(nid => nid !== id)
    }));
    _saveState(state);
  }

  // ──────────────────────────────────────────────
  // PROCESSOS
  // ──────────────────────────────────────────────

  function getProcessos() {
    return _getState().processos || [];
  }

  function getProcessoById(id) {
    return getProcessos().find(p => p.id === id) || null;
  }

  function saveProcesso(processo) {
    const state = _getState();
    const idx = state.processos.findIndex(p => p.id === processo.id);
    if (idx >= 0) {
      state.processos[idx] = processo;
    } else {
      state.processos.push(processo);
    }
    _saveState(state);
  }

  function deleteProcesso(id) {
    const state = _getState();
    state.processos = state.processos.filter(p => p.id !== id);
    _saveState(state);
  }

  // ──────────────────────────────────────────────
  // EXPORTAÇÃO
  // ──────────────────────────────────────────────

  /**
   * Gera o objeto CKN_DATA atualizado para publicação.
   * Reflete exatamente o estado atual do armazenamento administrativo.
   */
  function exportData() {
    const state = _getState();
    const today = new Date();
    const pad = n => String(n).padStart(2, "0");
    const dateStr = `${today.getFullYear()}.${pad(today.getMonth() + 1)}.${pad(today.getDate())}`;
    const dateBR = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;

    return {
      version: dateStr,
      updatedAt: dateBR,
      updatedBy: state.updatedBy || "Equipe de Governança",
      normas: JSON.parse(JSON.stringify(state.normas)),
      processos: JSON.parse(JSON.stringify(state.processos))
    };
  }

  /**
   * Reseta o armazenamento local para o CKN_DATA publicado.
   * Útil para testes e desenvolvimento.
   */
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    _initFromPublished();
    console.log("CKN_STORE: armazenamento resetado para CKN_DATA.");
  }

  return {
    getNormas,
    getNormaById,
    saveNorma,
    deleteNorma,
    getProcessos,
    getProcessoById,
    saveProcesso,
    deleteProcesso,
    exportData,
    reset
  };
})();
