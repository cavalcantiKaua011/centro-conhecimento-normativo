/**
 * CKN_DATA — Fonte única de verdade.
 * Este objeto é a base de dados publicada do Centro de Conhecimento Normativo.
 *
 * REGRA: Este objeto é a ÚNICA fonte de dados da página do usuário final.
 * Toda a interface da página pública deve derivar exclusivamente de CKN_DATA.
 *
 * Na página administrativa, este objeto é carregado para o localStorage
 * na primeira execução e, depois disso, o localStorage prevalece.
 *
 * Para publicar atualizações, use o botão "Gerar DATA para publicação"
 * na página administrativa e substitua este arquivo.
 */
const CKN_DATA = {
  version: "2026.09.25",
  updatedAt: "25/09/2026",
  updatedBy: "Equipe de Governança",
  normas: [
    {
      id: "norma-lgpd",
      codigo: "LGPD",
      nome: "Lei Geral de Proteção de Dados",
      descricao: "Regulamenta o tratamento de dados pessoais por pessoas naturais ou jurídicas, com o objetivo de proteger os direitos fundamentais de liberdade e privacidade.",
      aplicacao: "Aplica-se a todas as áreas que tratam dados pessoais de clientes, colaboradores, fornecedores e demais titulares.",
      documentos: [
        { id: "doc-lgpd-1", nome: "Lei nº 13.709/2018", link: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" }
      ],
      historico: [
        { id: "hist-lgpd-1", data: "2026-09-25", alteracao: "Inclusão inicial na base de conhecimento normativo." }
      ]
    },
    {
      id: "norma-nr10",
      codigo: "NR-10",
      nome: "Segurança em Instalações e Serviços em Eletricidade",
      descricao: "Estabelece os requisitos mínimos para garantir a segurança e a saúde dos trabalhadores em instalações e serviços elétricos.",
      aplicacao: "Aplica-se a todas as fases de geração, transmissão, distribuição e consumo de energia elétrica.",
      documentos: [
        { id: "doc-nr10-1", nome: "Texto da NR-10", link: "" }
      ],
      historico: [
        { id: "hist-nr10-1", data: "2026-09-25", alteracao: "Inclusão inicial na base de conhecimento normativo." }
      ]
    },
    {
      id: "norma-nr35",
      codigo: "NR-35",
      nome: "Trabalho em Altura",
      descricao: "Estabelece os requisitos mínimos e as medidas de proteção para o trabalho em altura, envolvendo o planejamento, a organização e a execução.",
      aplicacao: "Aplica-se a trabalhos realizados acima de 2 metros do nível inferior, onde haja risco de queda.",
      documentos: [
        { id: "doc-nr35-1", nome: "Texto da NR-35", link: "" }
      ],
      historico: [
        { id: "hist-nr35-1", data: "2026-09-25", alteracao: "Inclusão inicial na base de conhecimento normativo." }
      ]
    },
    {
      id: "norma-iso9001",
      codigo: "ISO 9001",
      nome: "Sistema de Gestão da Qualidade",
      descricao: "Especifica os requisitos para um sistema de gestão da qualidade quando uma organização precisa demonstrar sua capacidade de fornecer produtos e serviços que atendam aos requisitos do cliente.",
      aplicacao: "Aplica-se a todos os processos e áreas que afetam a qualidade dos produtos e serviços entregues.",
      documentos: [
        { id: "doc-iso9001-1", nome: "Norma ABNT NBR ISO 9001:2015", link: "" }
      ],
      historico: [
        { id: "hist-iso9001-1", data: "2026-09-25", alteracao: "Inclusão inicial na base de conhecimento normativo." }
      ]
    },
    {
      id: "norma-codigo-conduta",
      codigo: "COD-CONDUTA",
      nome: "Código de Conduta",
      descricao: "Define os princípios éticos e comportamentais esperados de todos os colaboradores, fornecedores e parceiros da organização.",
      aplicacao: "Aplica-se a todos os colaboradores, prestadores de serviço e representantes da empresa.",
      documentos: [
        { id: "doc-conduta-1", nome: "Código de Conduta Corporativo", link: "" }
      ],
      historico: [
        { id: "hist-conduta-1", data: "2026-09-25", alteracao: "Inclusão inicial na base de conhecimento normativo." }
      ]
    }
  ],
  processos: [
    {
      id: "processo-integracao",
      nome: "Integração de Novos Colaboradores",
      objetivo: "Garantir que todos os novos colaboradores conheçam as normas, políticas e procedimentos aplicáveis à sua função antes de iniciar as atividades.",
      passos: [
        "Receber documentação de boas-vindas e agendar treinamentos.",
        "Participar do treinamento de normas obrigatórias (LGPD, NR-10, Código de Conduta).",
        "Assinar o termo de ciência das normas aplicáveis.",
        "Concluir o processo no sistema de gestão de RH."
      ],
      normasRelacionadas: ["norma-lgpd", "norma-nr10", "norma-codigo-conduta"],
      documentosRelacionados: [
        { id: "doc-integ-1", nome: "Checklist de Integração", link: "" }
      ]
    },
    {
      id: "processo-trabalho-altura",
      nome: "Autorização para Trabalho em Altura",
      objetivo: "Controlar e autorizar formalmente a execução de atividades em altura, garantindo que todos os requisitos de segurança estejam cumpridos.",
      passos: [
        "Identificar a necessidade do trabalho em altura.",
        "Verificar certificações e treinamentos NR-35 da equipe.",
        "Emitir a Permissão de Trabalho (PT) com análise de risco.",
        "Separar e inspecionar os EPIs necessários.",
        "Executar o trabalho conforme PT aprovada.",
        "Encerrar a PT ao final da atividade."
      ],
      normasRelacionadas: ["norma-nr35"],
      documentosRelacionados: [
        { id: "doc-pt-1", nome: "Formulário de Permissão de Trabalho", link: "" },
        { id: "doc-pt-2", nome: "Checklist de EPIs para Altura", link: "" }
      ]
    }
  ]
};

// Debug: confirmar carregamento
console.log("CKN_DATA carregado:", CKN_DATA);
console.log("Normas carregadas:", CKN_DATA.normas.length, "normas");
console.log("Processos carregados:", CKN_DATA.processos.length, "processos");
