/**
 * CKN_App — Roteador e inicializador central da aplicação.
 *
 * Gerencia a navegação client-side via hash routing.
 * Funciona tanto na página administrativa quanto na pública.
 */
const CKN_App = (() => {

  let _isAdmin = false;

  /**
   * Inicializa a aplicação.
   * @param {boolean} isAdmin — true para página administrativa
   */
  function init(isAdmin = false) {
    _isAdmin = isAdmin;

    // Inicializar layout
    CKN_Layout.init({
      isAdmin: _isAdmin,
      onNavigate: _handleRoute
    });

    // Inicializar páginas
    CKN_PageNormaDetail.init({ isAdmin: _isAdmin, onNavigate: _navigate });
    CKN_PageProcessoDetail.init({ isAdmin: _isAdmin, onNavigate: _navigate });

    // Rota inicial
    const hash = window.location.hash;
    if (!hash || hash === "#" || hash === "#/") {
      window.location.hash = "#/normas";
    } else {
      _handleRoute(hash);
    }

    // Escutar mudanças de hash
    window.addEventListener("hashchange", () => {
      _handleRoute(window.location.hash);
    });

    console.log(`[CKN_App] Inicializado. Modo: ${_isAdmin ? "Administrativo" : "Público"}.`);
    if (!_isAdmin) {
      console.log(`[CKN_App] Fonte de dados pública:`);
      console.log(`  - CKN_DATA.normas.length = ${CKN_DATA.normas.length}`);
      console.log(`  - CKN_DATA.processos.length = ${CKN_DATA.processos.length}`);
    }
  }

  function _navigate(hash) {
    window.location.hash = hash;
  }

  function _handleRoute(hash) {
    if (!hash) hash = "#/normas";

    const [pathPart, queryPart] = hash.replace("#/", "").split("?");
    const route = pathPart || "normas";
    const params = _parseQuery(queryPart || "");

    const content = document.getElementById("ckn-content");
    if (content) {
      content.scrollTop = 0;
    }

    switch (route) {
      case "normas":
        CKN_PageNormas.init({ isAdmin: _isAdmin, onNavigate: _navigate });
        // Abrir edição direto se vindo do detalhe
        if (params.edit && _isAdmin) {
          setTimeout(() => {
            const norma = CKN_STORE.getNormaById(params.edit);
            if (norma) {
              const editBtn = document.querySelector(`[data-action="edit"][data-id="${norma.id}"]`);
              if (editBtn) editBtn.click();
            }
          }, 100);
        }
        break;

      case "norma-detail":
        if (params.id) {
          CKN_PageNormaDetail.render(params.id);
        } else {
          _navigate("#/normas");
        }
        break;

      case "processos":
        CKN_PageProcessos.init({ isAdmin: _isAdmin, onNavigate: _navigate });
        if (params.edit && _isAdmin) {
          setTimeout(() => {
            const processo = CKN_STORE.getProcessoById(params.edit);
            if (processo) {
              const editBtn = document.querySelector(`[data-action="edit"][data-id="${processo.id}"]`);
              if (editBtn) editBtn.click();
            }
          }, 100);
        }
        break;

      case "processo-detail":
        if (params.id) {
          CKN_PageProcessoDetail.render(params.id);
        } else {
          _navigate("#/processos");
        }
        break;

      default:
        _navigate("#/normas");
        break;
    }
  }

  function _parseQuery(queryStr) {
    if (!queryStr) return {};
    return queryStr.split("&").reduce((acc, pair) => {
      const [key, value] = pair.split("=");
      if (key) acc[decodeURIComponent(key)] = decodeURIComponent(value || "");
      return acc;
    }, {});
  }

  return { init };
})();
