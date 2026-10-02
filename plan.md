# Centro de Conhecimento Normativo — Documentação

## Visão Geral

Wiki corporativa para consulta e administração de Normas Aplicáveis e Processos.

## Estrutura de Arquivos

```
/
├── admin.html              ← Página administrativa (criar/editar/excluir/exportar)
├── user.html               ← Página pública (somente leitura)
├── css/
│   └── style.css           ← Estilos globais (Fluent Design)
└── js/
    ├── data.js             ← CKN_DATA — fonte de verdade publicada
    ├── store.js            ← CKN_STORE — armazenamento admin (localStorage)
    ├── app.js              ← Roteador central
    ├── components/
    │   ├── common.js       ← Utilitários (toast, modal, etc.)
    │   └── layout.js       ← Sidebar, topbar, exportação
    └── pages/
        ├── Normas.js       ← Lista de normas + formulário
        ├── NormaDetail.js  ← Detalhe de norma
        ├── Processos.js    ← Lista de processos + formulário
        └── ProcessoDetail.js ← Detalhe de processo
```

## Princípio Fundamental de Dados

```
Página Pública:   CKN_DATA (js/data.js)     →  interface
Página Admin:     CKN_DATA → localStorage   →  interface
Exportação:       CKN_STORE.exportData()    →  novo CKN_DATA
```

**Não existe nenhuma lista hardcoded fora do CKN_DATA.**

## Fluxo de Publicação

1. Abrir `admin.html` e fazer as alterações necessárias.
2. Clicar em **"Gerar DATA para publicação"** na barra superior.
3. Copiar o conteúdo gerado.
4. Substituir o conteúdo de `js/data.js` pelo conteúdo copiado.
5. A `user.html` passa a refletir os novos dados imediatamente.

## Rotas (Hash Routing)

| Hash                         | Página                       |
|------------------------------|------------------------------|
| `#/normas`                   | Lista de normas              |
| `#/norma-detail?id=<id>`     | Detalhe de norma             |
| `#/processos`                | Lista de processos           |
| `#/processo-detail?id=<id>`  | Detalhe de processo          |

## Modelos de Dados

### Norma
```js
{
  id: "norma-...",
  codigo: "NR-10",
  nome: "Segurança em Instalações Elétricas",
  descricao: "...",
  aplicacao: "...",
  documentos: [{ id, nome, link }],
  historico: [{ id, data, alteracao }]
}
```

### Processo
```js
{
  id: "processo-...",
  nome: "Nome do processo",
  objetivo: "...",
  passos: ["Passo 1", "Passo 2"],
  normasRelacionadas: ["norma-id"],
  documentosRelacionados: [{ id, nome, link }]
}
```

## Checklist de Validação (Testes Obrigatórios)

- [ ] TESTE 1: Abrir admin — normas iniciais aparecem
- [ ] TESTE 2: Criar TESTE-01 — aparece na lista
- [ ] TESTE 3: Recarregar admin — TESTE-01 persiste
- [ ] TESTE 4: Editar TESTE-01 — alteração persiste após reload
- [ ] TESTE 5: Excluir TESTE-01 — desaparece
- [ ] TESTE 6: Criar TESTE-01, Gerar DATA — DATA contém TESTE-01
- [ ] TESTE 7: Copiar DATA para user.html — TESTE-01 aparece na página pública
- [ ] TESTE 8: Remover norma do CKN_DATA — some da interface pública
