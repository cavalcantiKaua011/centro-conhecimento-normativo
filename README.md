Centro de Conhecimento Normativo (CKN)
Aplicação web administrativa para gestão estruturada de Normas Aplicáveis e Processos, desenvolvida para utilização no ambiente Cornerstone OnDemand.
O projeto nasceu de uma necessidade operacional de transformar informações normativas, documentos e processos dispersos em uma base de conhecimento estruturada, navegável e administrável, reduzindo a dependência de manutenção manual de páginas e tornando a atualização do conteúdo mais controlada.
---
Sumário
Sobre o projeto
Contexto e problema
Objetivos
Solução desenvolvida
Principais funcionalidades
Arquitetura
Fluxo de dados e publicação
Modelo de dados
Tecnologias e ferramentas
Compatibilidade com Cornerstone
Decisões técnicas
Evolução do projeto
Limitações atuais
Próximas evoluções
Execução local
Publicação
Segurança e dados
Status
---
Sobre o projeto
O Centro de Conhecimento Normativo (CKN) é uma aplicação web criada para centralizar e organizar informações relacionadas a normas aplicáveis e processos corporativos.
A solução possui duas perspectivas:
Administração
Ambiente destinado à manutenção do conteúdo, permitindo:
cadastrar normas;
editar normas;
excluir normas;
cadastrar processos;
editar processos;
excluir processos;
relacionar processos e normas;
manter documentos associados;
registrar histórico de alterações;
pesquisar e navegar pelos registros;
gerar uma estrutura de dados pronta para publicação.
Consulta
Interface destinada ao usuário final, com acesso somente à informação publicada.
A separação entre Administração e Consulta foi adotada para permitir que o conteúdo seja mantido em um ambiente controlado sem expor as ferramentas administrativas ao usuário final.
---
Contexto e problema
O projeto surgiu a partir de uma necessidade de gestão do conhecimento normativo.
Informações relacionadas a normas, requisitos, documentos e processos precisavam ser organizadas de forma que pudessem ser consultadas sem depender de uma pessoa específica para localizar ou explicar determinada informação.
Entre os principais problemas identificados estavam:
1. Informação dispersa
Conteúdos normativos e operacionais poderiam estar distribuídos entre diferentes documentos, páginas e referências.
Isso dificultava encontrar rapidamente:
qual norma se aplica;
qual é o objetivo da norma;
onde consultar o documento;
qual processo está relacionado àquela norma;
qual é o fluxo necessário para executar determinado processo.
2. Dependência de conhecimento individual
Quando uma informação está concentrada em pessoas específicas, existe risco de perda de conhecimento e dificuldade de continuidade durante ausências, movimentações ou mudanças de responsabilidade.
O projeto buscou transformar conhecimento individual em conhecimento estruturado e acessível.
3. Manutenção manual
Uma página estática pode funcionar para consulta, mas se torna pouco eficiente quando o conteúdo precisa ser atualizado constantemente.
Cada alteração poderia exigir intervenção diretamente no código ou na estrutura da página.
4. Ausência de uma camada administrativa
Era necessário ter uma interface capaz de tratar o conteúdo como dados, e não somente como HTML.
Isso levou à criação de um ambiente administrativo com operações de cadastro, edição, exclusão, documentos e histórico.
5. Restrições do ambiente Cornerstone
A aplicação precisava funcionar dentro de uma plataforma corporativa que não foi projetada como um ambiente tradicional de hospedagem de uma aplicação web completa.
Por isso, algumas decisões técnicas foram orientadas por compatibilidade, simplicidade e baixo acoplamento.
---
Objetivos
O projeto foi estruturado com os seguintes objetivos:
centralizar conhecimento normativo;
facilitar a consulta de normas aplicáveis;
relacionar normas e processos;
reduzir dependência de conhecimento individual;
permitir manutenção do conteúdo sem editar manualmente toda a interface;
criar uma camada administrativa para gestão dos registros;
manter histórico das alterações;
separar dados de apresentação;
permitir publicação controlada dos dados;
garantir compatibilidade com páginas personalizadas do Cornerstone;
manter uma arquitetura simples o suficiente para ser sustentada no ambiente disponível.
---
Solução desenvolvida
A solução foi construída como uma aplicação web client-side utilizando HTML, CSS e JavaScript, com foco em compatibilidade com o Cornerstone OnDemand.
O núcleo da solução é a separação entre:
```text
ADMIN
  │
  ├── Cadastro
  ├── Edição
  ├── Exclusão
  ├── Documentos
  ├── Histórico
  └── Pesquisa
       │
       ▼
  CKN_DATA
       │
       ▼
 PUBLICAÇÃO
       │
       ▼
 PÁGINA DE CONSULTA
```
O administrador trabalha com os dados em seu ambiente local. Ao concluir uma alteração, a aplicação gera uma estrutura `CKN_DATA`, que pode ser utilizada para atualizar a versão publicada.
Essa abordagem evita que a interface pública dependa diretamente do `localStorage` do navegador do administrador.
---
Principais funcionalidades
Gestão de Normas
Cada norma pode conter informações como:
identificador;
código;
nome;
descrição;
aplicação;
documentos relacionados;
histórico de alterações.
Exemplo conceitual:
```javascript
{
  id: "norma-exemplo",
  codigo: "NR-XX",
  nome: "Nome da Norma",
  descricao: "Descrição da norma.",
  aplicacao: "Contexto de aplicação.",
  documentos: [],
  historico: []
}
```
Gestão de Processos
Os processos podem conter:
identificador;
nome;
objetivo;
passos de execução;
normas relacionadas;
documentos relacionados.
Exemplo:
```javascript
{
  id: "processo-exemplo",
  nome: "Processo de Exemplo",
  objetivo: "Objetivo do processo.",
  passos: [
    "Etapa 1",
    "Etapa 2",
    "Etapa 3"
  ],
  normasRelacionadas: [],
  documentosRelacionados: []
}
```
Pesquisa
A área de normas possui mecanismo de busca para facilitar a localização dos registros.
Detalhamento
Normas e processos possuem páginas de detalhe próprias, permitindo consultar as informações sem sobrecarregar a tela de listagem.
Documentos
Os registros podem possuir documentos associados com nome e link.
Histórico
As normas possuem estrutura de histórico para registrar alterações relevantes.
CRUD
A camada administrativa contempla operações de:
Create — criação;
Read — consulta;
Update — atualização;
Delete — exclusão.
Exportação de dados
O Admin possui uma ação de geração de `CKN_DATA` para publicação.
A aplicação apresenta:
versão;
data de atualização;
quantidade de normas;
quantidade de processos;
conteúdo estruturado para publicação.
---
Arquitetura
A arquitetura atual é baseada em módulos JavaScript independentes, organizados conceitualmente em camadas.
```text
┌──────────────────────────────────────────┐
│                  UI                      │
│      HTML + CSS + componentes visuais    │
└───────────────────┬──────────────────────┘
                    │
┌───────────────────▼──────────────────────┐
│              CKN_App                     │
│       Inicialização + roteamento         │
└───────────────────┬──────────────────────┘
                    │
       ┌────────────┼─────────────┐
       ▼            ▼             ▼
 CKN_PageNormas  CKN_PageProcessos  Details
       │            │             │
       └────────────┼─────────────┘
                    ▼
              CKN_STORE
                    │
                    ▼
              localStorage
                    │
                    ▼
              CKN_DATA
                    │
                    ▼
              Publicação
```
Entre os principais módulos presentes na implementação estão:
`CKN_App` — inicialização e roteamento;
`CKN_Layout` — estrutura visual, sidebar e topbar;
`CKN_PageNormas` — listagem e gestão de normas;
`CKN_PageNormaDetail` — detalhe de uma norma;
`CKN_PageProcessos` — listagem e gestão de processos;
`CKN_PageProcessoDetail` — detalhe de um processo;
`CKN_STORE` — camada de persistência e manipulação dos dados;
`CKN_Common` — funções utilitárias e componentes compartilhados;
`CKN_DATA` — estrutura de dados utilizada na publicação.
---
Fluxo de dados e publicação
Um dos pontos mais importantes da arquitetura é a definição de uma fonte de verdade para o conteúdo publicado.
Ambiente administrativo
No Admin, o `localStorage` é utilizado como armazenamento de trabalho.
```text
Admin
  │
  ▼
CKN_STORE
  │
  ▼
localStorage
```
O `localStorage` foi adotado deliberadamente como uma solução simples para persistência local, sem introduzir backend, banco de dados ou API.
Geração da publicação
Quando o administrador solicita a publicação:
```text
localStorage
     │
     ▼
CKN_STORE.exportData()
     │
     ▼
CKN_DATA
```
A aplicação gera uma estrutura semelhante a:
```javascript
const CKN_DATA = {
  version: "2026.09.25",
  updatedAt: "25/09/2026",
  updatedBy: "Equipe de Governança",
  normas: [],
  processos: []
};
```
Página pública
A página de consulta utiliza o `CKN_DATA` publicado.
```text
CKN_DATA
   │
   ├── normas
   │
   └── processos
        │
        ▼
     Interface
```
Dessa forma, a página pública não depende do `localStorage` existente no computador do administrador.
---
Modelo de dados
A estrutura principal do projeto é composta por duas coleções:
```text
CKN_DATA
├── version
├── updatedAt
├── updatedBy
├── normas[]
└── processos[]
```
Norma
```text
Norma
├── id
├── codigo
├── nome
├── descricao
├── aplicacao
├── documentos[]
└── historico[]
```
Documento
```text
Documento
├── id
├── nome
└── link
```
Histórico
```text
Histórico
├── id
├── data
└── alteracao
```
Processo
```text
Processo
├── id
├── nome
├── objetivo
├── passos[]
├── normasRelacionadas[]
└── documentosRelacionados[]
```
---
Tecnologias e ferramentas
Linguagens
HTML5
Utilizado para a estrutura das páginas e componentes da aplicação.
CSS3
Utilizado para:
layout;
responsividade;
componentes;
estados visuais;
modais;
navegação;
adaptação ao ambiente de execução.
JavaScript
Utilizado como linguagem principal da aplicação, responsável por:
lógica de negócio;
CRUD;
manipulação do DOM;
roteamento;
persistência;
eventos;
geração de dados;
renderização das páginas.
A implementação foi mantida em JavaScript vanilla, sem dependência de frameworks de aplicação.
---
Bibliotecas e recursos
Font Awesome
Utilizado para ícones da interface.
Google Fonts
Utilizado como fonte tipográfica durante a construção da interface.
Tailwind CSS
Durante a evolução inicial do projeto, foi utilizado Tailwind via CDN para acelerar a prototipação da interface.
A implementação posterior evoluiu para uma estrutura com classes e estilos próprios, buscando maior controle e previsibilidade no ambiente Cornerstone.
---
Ferramentas de desenvolvimento
Kiro
Utilizado como ferramenta de apoio à construção, refatoração e evolução da aplicação.
GitHub
Planejado como repositório para versionamento, documentação e histórico do código-fonte.
Cornerstone OnDemand
Ambiente corporativo de execução da aplicação.
---
Compatibilidade com Cornerstone
A aplicação foi construída considerando as restrições de páginas personalizadas do Cornerstone OnDemand.
Algumas decisões foram tomadas especificamente para aumentar a compatibilidade:
utilização de JavaScript vanilla;
ausência de backend próprio;
ausência de banco de dados externo;
navegação client-side;
uso de hash routing;
baixo acoplamento com APIs externas;
componentes renderizados no DOM;
utilização de `localStorage` somente como persistência administrativa local;
estrutura que pode ser consolidada em um único `index.html` para publicação.
A navegação utiliza rotas baseadas em hash, por exemplo:
```text
#/normas
#/processos
#/norma-detail?id=...
#/processo-detail?id=...
```
Isso permite navegar entre as páginas sem depender de rotas de servidor.
---
Decisões técnicas
Por que JavaScript vanilla?
A escolha foi influenciada principalmente pelo ambiente de execução.
Uma aplicação React tradicional exigiria uma etapa adicional de build e poderia introduzir dependências desnecessárias para uma página personalizada do Cornerstone.
O JavaScript vanilla permitiu:
reduzir dependências;
controlar diretamente o DOM;
simplificar a publicação;
facilitar a consolidação em um único HTML;
aumentar a previsibilidade dentro do ambiente corporativo.
---
Por que localStorage?
O `localStorage` atende ao objetivo do Admin de manter um rascunho de trabalho local sem exigir:
API;
servidor;
banco de dados;
infraestrutura adicional.
Porém, ele não é tratado como mecanismo de sincronização entre usuários.
Essa distinção é fundamental:
> `localStorage` é armazenamento de trabalho do Admin, não banco de dados corporativo.
---
Por que separar Admin e Consulta?
A separação evita que a página pública precise carregar toda a lógica de manutenção.
O Admin possui:
```text
CRUD
Persistência
Formulários
Histórico
Documentos
Exportação
```
Enquanto a página pública possui:
```text
Consulta
Navegação
Detalhamento
Relacionamentos
```
Isso reduz a superfície de interação do usuário final e facilita a manutenção do conteúdo.
---
Por que utilizar CKN_DATA?
O `CKN_DATA` funciona como uma camada intermediária entre administração e publicação.
Isso permite:
```text
Editar
  ↓
Validar
  ↓
Gerar DATA
  ↓
Publicar
```
Em vez de:
```text
Editar diretamente o HTML publicado
```
Essa mudança é importante porque transforma a manutenção de conteúdo em uma operação sobre dados.
---
Evolução do projeto
O projeto passou por várias etapas de evolução.
Etapa 1 — Página estática
A primeira abordagem utilizava conteúdo estruturado diretamente na página.
Funcionava para consulta, mas apresentava limitações de manutenção.
---
Etapa 2 — Estrutura administrativa
Foi criada uma interface específica para manutenção das informações.
Entraram:
cadastro;
edição;
exclusão;
modais;
documentos;
histórico;
processos.
---
Etapa 3 — Persistência
Foi introduzido o `localStorage` para manter as alterações realizadas pelo administrador.
Isso eliminou a necessidade de alterar manualmente o código a cada operação durante o uso do Admin.
---
Etapa 4 — Separação entre dados e apresentação
Foi estabelecido o conceito de:
```text
CKN_STORE
      ↓
CKN_DATA
      ↓
Interface pública
```
Essa etapa foi importante para evitar múltiplas versões dos mesmos dados dentro da aplicação.
---
Etapa 5 — Fonte única de verdade
Um problema identificado durante a evolução foi a existência de estruturas duplicadas de dados.
Por exemplo, uma lista poderia ser atualizada em uma parte da aplicação enquanto outra parte continuava utilizando uma lista estática diferente.
A arquitetura foi então direcionada para que a interface pública derive diretamente de:
```javascript
CKN_DATA.normas
CKN_DATA.processos
```
e o Admin utilize o armazenamento administrado pelo `CKN_STORE`.
---
Etapa 6 — Compatibilidade com Cornerstone
A aplicação foi adaptada para lidar com particularidades do ambiente de execução, incluindo:
navegação via hash;
ausência de backend;
publicação em página personalizada;
consolidação de código;
isolamento de componentes;
redução de dependências.
---
Problemas técnicos encontrados durante o desenvolvimento
O desenvolvimento também revelou alguns problemas relevantes de engenharia.
Persistência local
O `localStorage` resolveu a persistência do Admin, mas revelou uma limitação importante: alterações realizadas em um navegador não são automaticamente compartilhadas com outros administradores.
Isso reforçou a separação entre:
armazenamento local;
publicação corporativa.
---
Duplicação de dados
A existência de mais de uma estrutura contendo as mesmas normas provocou inconsistências entre dados atualizados e dados exibidos.
A solução arquitetural foi estabelecer uma fonte única de dados para a camada de consulta.
---
Roteamento
O ambiente utiliza hash routing para evitar recarregamentos.
Durante a implementação foram identificados pontos de atenção envolvendo:
inicialização da rota;
`hashchange`;
normalização de `#/normas`;
múltiplos listeners de navegação;
inicialização da página.
Esses problemas demonstraram a necessidade de manter o roteamento centralizado no `CKN_App`.
---
Compatibilidade com o host
Elementos genéricos do HTML e seletores globais podem sofrer interferência quando uma aplicação é executada dentro de uma plataforma corporativa.
Por isso, a aplicação passou a utilizar uma nomenclatura própria baseada no namespace:
```text
ckn-
```
Exemplos:
```text
ckn-sidebar
ckn-topbar
ckn-content
ckn-modal
ckn-btn
```
Isso reduz o risco de colisões com estilos ou componentes externos.
---
Limitações atuais
A arquitetura atual foi deliberadamente mantida simples, mas possui limitações conhecidas.
Persistência
O `localStorage` não é um mecanismo multiusuário.
Se dois administradores trabalharem em navegadores diferentes, suas alterações não serão sincronizadas automaticamente.
---
Publicação manual
A geração do `CKN_DATA` ainda depende de uma etapa de publicação.
Fluxo atual:
```text
Admin
  ↓
Gerar DATA
  ↓
Copiar conteúdo
  ↓
Atualizar publicação
```
Não existe ainda pipeline automatizado entre Admin e página pública.
---
Ausência de backend
O projeto não possui:
API própria;
banco de dados;
autenticação própria;
controle de permissões próprio;
auditoria server-side.
Essas características foram mantidas fora do escopo da primeira versão.
---
Versionamento do conteúdo
Embora exista versionamento dentro do `CKN_DATA`, o histórico atual é baseado na estrutura de dados da aplicação.
Ele não substitui um sistema completo de auditoria de alterações.
---
Próximas evoluções
A arquitetura permite evoluções futuras sem necessariamente alterar a experiência do usuário.
Possíveis evoluções:
Backend
Substituir o `localStorage` por uma API.
```text
Admin
  ↓
API
  ↓
Banco de dados
  ↓
Publicação
```
Controle de acesso
Implementar autenticação e autorização por perfil.
Auditoria
Registrar:
usuário;
data/hora;
alteração realizada;
valor anterior;
valor novo.
Publicação automatizada
Criar pipeline:
```text
Alteração
   ↓
Validação
   ↓
Commit
   ↓
Publicação
```
Git como controle de conteúdo
Versionar também as alterações de dados, permitindo recuperar versões anteriores.
Busca avançada
Adicionar filtros por:
código;
categoria;
área;
processo;
status;
documento;
palavra-chave.
Governança
Evoluir o CKN para uma estrutura mais ampla de governança do conhecimento, mantendo a separação entre:
```text
Conteúdo
Governança
Processos
Documentos
Histórico
Publicação
```
---
Execução local
Como a aplicação é client-side, o projeto pode ser utilizado localmente para desenvolvimento e testes.
A estrutura mínima pode ser:
```text
centro-conhecimento-normativo/
│
├── index.html
├── css/
├── js/
└── README.md
```
Para testes simples, o arquivo HTML pode ser aberto diretamente no navegador.
Para uma experiência mais próxima de um ambiente web tradicional, recomenda-se utilizar um servidor HTTP local.
---
Publicação
O projeto foi pensado para permitir uma versão de desenvolvimento organizada e uma versão consolidada para o Cornerstone.
Durante o desenvolvimento:
```text
HTML
CSS
JavaScript
Arquivos separados
```
Na publicação:
```text
index.html
├── CSS incorporado
├── JavaScript incorporado
└── CKN_DATA
```
Isso permite manter o código organizado durante o desenvolvimento sem abrir mão da necessidade de uma publicação autocontida.
---
Segurança e dados
Este repositório deve ser tratado com atenção caso contenha informações corporativas.
Não devem ser publicados em um repositório público:
credenciais;
tokens;
senhas;
dados pessoais;
informações confidenciais;
URLs internas sensíveis;
identificadores de usuários;
documentos corporativos restritos;
dados reais que não tenham autorização para divulgação.
Para um repositório público, recomenda-se utilizar dados fictícios ou anonimizados.
Também é recomendado manter configurações sensíveis fora do código-fonte.
---
Estrutura recomendada do repositório
Uma estrutura possível para evolução do projeto:
```text
centro-conhecimento-normativo/
│
├── admin/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── public/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── docs/
│   ├── architecture.md
│   └── publication.md
│
├── README.md
└── .gitignore
```
Durante a fase inicial, entretanto, uma estrutura mais simples também é suficiente.
---
Status
Em desenvolvimento / evolução contínua.
O núcleo funcional da aplicação administrativa foi desenvolvido com:
gestão de normas;
gestão de processos;
documentos;
histórico;
pesquisa;
navegação por hash;
persistência local;
geração de `CKN_DATA`;
interface adaptada ao ambiente Cornerstone.
A próxima etapa natural é consolidar a estrutura do código, revisar a publicação final e estabelecer o repositório Git como fonte de versionamento do projeto.
---
Conceito central
O projeto pode ser resumido pela seguinte arquitetura:
```text
                    CENTRO DE CONHECIMENTO NORMATIVO
                                 │
             ┌───────────────────┴───────────────────┐
             │                                       │
             ▼                                       ▼
       ADMINISTRAÇÃO                              CONSULTA
             │                                       │
       ┌─────┴─────┐                                 │
       │           │                                 │
    Normas      Processos                            │
       │           │                                 │
       └─────┬─────┘                                 │
             ▼                                       │
         CKN_STORE                                    │
             │                                       │
             ▼                                       │
        localStorage                                 │
             │                                       │
             ▼                                       │
       Geração DATA                                  │
             │                                       │
             ▼                                       │
         CKN_DATA ──────────────────────────────────►│
                                                     ▼
                                             Interface publicada
```
A principal mudança proporcionada pelo projeto não é apenas visual.
O CKN transforma uma necessidade de manutenção manual de informação em um fluxo estruturado de:
> **gestão → organização → versionamento → publicação → consulta.**
---
Licença
Definir conforme a política de propriedade intelectual e compartilhamento aplicável ao projeto.
Para projetos corporativos, recomenda-se validar a política da organização antes de disponibilizar o código publicamente.
