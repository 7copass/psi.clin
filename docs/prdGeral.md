PRD — Plataforma SaaS para Psicólogos
Versão: 1.0
 Data: 06/02/2026
 Autor: Victor Almeida
 

1. Visão Geral do Produto
1.1 Descrição
Plataforma web SaaS voltada para psicólogos e clínicas de psicologia que centraliza a gestão de pacientes, sessões clínicas, prontuários, transcrição de áudio com IA, evolução terapêutica automatizada e controle financeiro — tudo em conformidade com o CFP (Conselho Federal de Psicologia) e LGPD.
1.2 Problema
Psicólogos perdem tempo com tarefas administrativas (anotações manuais, prontuários, controle financeiro, agendamentos) que poderiam ser automatizadas, permitindo mais foco no atendimento clínico.
1.3 Público-Alvo
Psicólogos autônomos (consultório individual)
Clínicas de psicologia (múltiplos profissionais)
Psicólogos que atendem online e presencial
1.4 Proposta de Valor
Redução de tempo administrativo pós-sessão em até 70%
Transcrição e resumo automático de sessões via IA
Geração automática de evolução do prontuário
Gestão financeira integrada com controle por paciente
Conformidade com LGPD e normas do CFP

2. Módulos do Sistema
2.1 Onboarding
Item
Descrição
Tela de boas-vindas
Modal após cadastro com passos guiados
Passo 1
Cadastrar primeiro paciente
Passo 2
Agendar um atendimento
Passo 3
Preencher a primeira sessão
Passo 4
Gerar uma Evolução com IA
Passo 5
Gravar e transcrever uma sessão
CTAs
"Assistir Tutorial" e "Treinamento Gratuito"
Trial
Período de teste gratuito com contador regressivo visível (dias, horas, minutos)


2.2 Gestão de Pacientes
2.2.1 Cadastro de Paciente
Dados obrigatórios (*):
Campo
Tipo
Nome*
Texto
Telefone*
Telefone com DDI (+55 Brasil default)

Dados opcionais:
Campo
Tipo
Criança/Adolescente
Checkbox
CPF
Texto formatado
Data de Nascimento
Data (dd/mm/aaaa)
Email
Email
Nome Contato Emergência 1
Texto
Telefone Contato Emergência 1
Telefone com DDI
Nome Contato Emergência 2
Texto
Telefone Contato Emergência 2
Telefone com DDI
Endereço
Texto livre (CEP/Bairro etc.)
País
Select com busca
Gênero
Select com busca
Profissão
Select com busca
Plano de Saúde
Select com busca
Tratamento
Select com busca
Medicamento
Select com busca + botão "Adicionar Medicamento" (múltiplos)

Dados financeiros do paciente:
Campo
Tipo
Modelo de cobrança
Radio: "Por sessão" ou "Pacote mensal"
Valor da sessão
Moeda (R)—defaultR) — default R )—defaultR 150,00
Meio de pagamento
Select (PIX, Cartão, Dinheiro, etc.)

Funcionalidades da listagem:
Funcionalidade
Descrição
Busca
Campo de busca por nome do paciente
Filtros
Ordenação, cronológico, visualização em lista/grid
Status
Filtro por "Ativos" (dropdown com opções)
Cadastro rápido
Modal com formulário simplificado

2.2.2 Perfil do Paciente
Menu lateral do paciente:
Seção
Descrição
Perfil do Paciente
Dados cadastrais completos, informações gerais, financeiro, contatos de emergência, saúde e tratamento
Prontuário Geral
Visão consolidada de todas as evoluções
Retrospectiva Anual
Resumo anual do paciente (ex: "2025 do paciente")
Lembretes e Alertas
Sistema de lembretes configuráveis por paciente
Arquivo de Sessões
Histórico completo de sessões anteriores
Anamnese
Formulário de anamnese geral editável
Resumo IA
Resumo gerado por IA consolidando todas as sessões
Biblioteca de Documentos
Upload e armazenamento de documentos do paciente

Ações no perfil:
Ação
Descrição
Editar
Botão para editar dados cadastrais
Exportar
Download dos dados do paciente
Excluir
Botão para deletar paciente (com confirmação)
WhatsApp
Link direto para WhatsApp do paciente


2.3 Agendamentos
Funcionalidade
Descrição
Visualizações
Mês, Semana, Dia
Criar agendamento
Vincular paciente, data, horário, tipo (presencial/online)
Notificações
Lembretes automáticos para paciente e profissional
Status
Confirmado, Cancelado, Remarcado, Falta
Recorrência
Agendar sessões recorrentes (semanal, quinzenal, mensal)
Integração
Sincronização com Google Calendar (futuro)


2.4 Gestão da Sessão
2.4.1 Criar/Abrir Sessão
Campo
Descrição
Modo
Toggle: "Abrir Sessão Existente" / "Criar Nova Sessão"
Paciente
Seleção do paciente vinculado
Data da Sessão
Data e hora (ex: 02/02/26 às 22:00)
Tipo
Presencial / Online

2.4.2 Anotações da Sessão
Funcionalidade
Descrição
Editor Rich Text
Toolbar completa: Negrito, Itálico, Sublinhado, Listas ordenadas/não-ordenadas, Alinhamento, Estilos (Normal, Heading), Cor do texto, Destaque, Limpar formatação
Auto-save
Salvamento automático periódico
Botão Salvar
Salvamento manual explícito
Templates
Opção de inserir template de anotação (futuro)
Importar imagem
Upload de imagens nas anotações
Histórico
Botão para ver versões anteriores

2.4.3 Evolução do Prontuário
Funcionalidade
Descrição
Editor Rich Text
Mesmo editor das anotações
Gerar Evolução com IA
Botão que gera automaticamente a Ficha de Evolução baseada nas anotações e áudios
Ficha de Evolução
Documento estruturado gerado automaticamente

Campos da Ficha de Evolução (gerada por IA):
Campo
Descrição
Paciente
Nome completo
Profissional
Nome do profissional + CRP
Data da Sessão
Data e hora
Consulta realizada
Tipo (Presencial/Online)
Intervenção realizada
Resumo da intervenção baseada nas anotações
Avaliação de demanda
Análise da demanda do paciente
Registros de objetivos
Objetivos terapêuticos identificados
Anotações de Antes da Sessão
Notas prévias (se houver)
Evolução
Descrição da evolução do paciente
Observação
Observações complementares
Dever de casa
Tarefas atribuídas ao paciente
Registro de encaminhamento/encerramento/continuidade
Status do acompanhamento

2.4.4 Gravador de Áudio
Funcionalidade
Descrição
Seleção de microfone
Modal para escolher dispositivo de áudio com teste de microfone
Gravação
Iniciar, pausar, retomar e parar gravação
Player de áudio
Reprodução com barra de progresso e tempo (00:00 / 00:35)
Salvar áudio
Modal com nome do áudio (max 40 caracteres) e tamanho do resumo SmartNotes
Áudios gravados
Lista lateral com nome e duração de cada áudio gravado

2.4.5 SmartNotes (IA)
Funcionalidade
Descrição
Tamanhos de resumo
Curto (≈2-3 tópicos), Médio (≈5-7 tópicos), Longo (≥8 tópicos)
Mapa de Tópicos
Lista dos tópicos identificados na sessão
Resumo por tópico
Resumo descritivo de cada tópico identificado
Citações-chave
Trechos literais relevantes do paciente
Transcrição completa
Aba com transcrição integral do áudio
Passar para anotações
Botão para enviar o resumo para o campo de anotações
Gestão do áudio
Modal com player, resumo e transcrição

Exemplo de estrutura do SmartNotes:
Mapa de Tópicos
  • Experiência Geral do Dia do Paciente
  • Rotina Matinal
  • Preparação e Consumo do Almoço
  • Associação à Comida da Casa da Mãe
  • Encerramento e Agendamento da Sessão

Tópico – Experiência Geral do Dia do Paciente
  Resumo: [texto descritivo gerado pela IA]
  Citações-chave: "Meu dia? Foi bom" — Paciente

2.5 Resumo do Paciente (IA)
Funcionalidade
Descrição
Resumo consolidado
Geração automática de resumo de todas as sessões do paciente
Seções do resumo
Observações Iniciais, Evolução Emocional e Comportamental, Pontos-Chave das Sessões, Principais Intervenções
Download PDF
Botão "Baixar PDF" com resumo formatado
Requisito
Precisa de pelo menos 1 sessão registrada para gerar

Estrutura do Resumo:
Seção
Descrição
Observações Iniciais
Pontos de destaque das primeiras observações
Evolução Emocional e Comportamental
Progressão emocional do paciente ao longo das sessões
Pontos-Chave das Sessões
Insights mais relevantes identificados pela IA
Principais Intervenções
Intervenções terapêuticas realizadas


2.6 Anamnese
Funcionalidade
Descrição
Criar Anamnese
Formulário configurável de anamnese
Editar
Botão de edição da anamnese
Visualização
Respostas da anamnese por paciente
Estado vazio
Mensagem orientando o preenchimento quando não houver dados


2.7 Monitoramento
Funcionalidade
Descrição
Dashboard
Visão geral da prática clínica
Métricas
Total de pacientes, sessões realizadas, sessões agendadas
Alertas
Pacientes que faltaram, sessões a confirmar
Evolução
Gráficos de atendimentos ao longo do tempo


2.8 Assistente IA
Funcionalidade
Descrição
Chat IA
Assistente conversacional para apoio ao profissional
Contexto
Acesso ao histórico do paciente selecionado para respostas contextualizadas
Sugestões
Sugestões de intervenções, técnicas terapêuticas, leituras
Geração de conteúdo
Elaboração de relatórios, laudos, documentos


2.9 Financeiro
Funcionalidade
Descrição
Controle por paciente
Valor da sessão, modelo de cobrança, meio de pagamento
Registro de pagamentos
Controle de sessões pagas e pendentes
Relatório mensal
Receita bruta, receita líquida, sessões realizadas
Filtros
Por período, por paciente, por status de pagamento
Exportação
Download de relatórios financeiros (PDF/Excel)
Inadimplência
Alertas de sessões não pagas


2.10 Conta / Configurações
Funcionalidade
Descrição
Dados do profissional
Nome, CRP, email, telefone, foto
Informações da clínica
Nome da clínica, CNPJ, endereço, logo
Configurações de sessão
Duração padrão, valor padrão, horários de atendimento
Assinatura
Gerenciamento do plano (gratuito, básico, premium)
Segurança
Alteração de senha, 2FA
Personalização
Preferências de notificação, tema
LGPD
Termo de consentimento, gestão de dados sensíveis


3. Funcionalidades Transversais
3.1 Autenticação e Segurança
Item
Descrição
Login
Email + senha
Cadastro
Nome, email, telefone, CRP, senha
Recuperação de senha
Via email
2FA
Autenticação em dois fatores (opcional)
Criptografia
Dados sensíveis criptografados em repouso e em trânsito
LGPD
Consentimento explícito, direito ao esquecimento, portabilidade de dados
Sessão
Timeout de sessão por inatividade
Logs de acesso
Registro de acessos para auditoria

3.2 Inteligência Artificial
Item
Descrição
Transcrição de áudio
Speech-to-text em português (Gemini)
Resumo de sessão (SmartNotes)
LLM para gerar mapa de tópicos, resumos e citações-chave
Geração de evolução
LLM para gerar ficha de evolução estruturada
Resumo do paciente
LLM para consolidar múltiplas sessões em um resumo único
Assistente conversacional
Chat com LLM contextualizado ao paciente
Privacidade IA
Nenhum dado é usado para treino de modelos. Dados processados e descartados

3.3 Notificações
Canal
Uso
In-app
Alertas de sessões, lembretes, pagamentos pendentes
Email
Confirmações de agendamento, lembretes
WhatsApp
Lembretes de sessão para pacientes (integração futura)
Push (mobile)
Notificações no app mobile (futuro)

3.4 Responsividade
Dispositivo
Suporte
Desktop
Experiência completa (principal)
Tablet
Layout adaptado
Mobile
Funcionalidades essenciais (consultar agenda, ver pacientes)


