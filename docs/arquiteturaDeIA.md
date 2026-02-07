Arquitetura de IA — Integração com Gemini API
Versão: 1.0
 Data: 06/02/2026
 Relacionado ao: PRD Plataforma SaaS para Psicólogos

1. Visão Geral
A plataforma utiliza a Gemini API do Google como engine de IA para todas as funcionalidades inteligentes do sistema. A estratégia é baseada em dois modelos com papéis distintos, otimizando custo e qualidade.
Modelo
Papel
Uso
Gemini 2.5 Flash
Modelo principal
Tarefas frequentes, alta velocidade, baixo custo
Gemini 2.5 Pro
Modelo avançado
Tarefas complexas que exigem raciocínio profundo


2. Mapeamento de Funcionalidades por Modelo
2.1 Gemini 2.5 Flash (uso principal)
Funcionalidade
Descrição
Input Estimado
Output Estimado
Transcrição de áudio
Envio do áudio nativo para transcrição em português
Áudio (até 60min)
~8.000 tokens
SmartNotes — Curto
Resumo com 2-3 tópicos
~10.000 tokens (transcrição)
~500 tokens
SmartNotes — Médio
Resumo com 5-7 tópicos
~10.000 tokens (transcrição)
~1.200 tokens
SmartNotes — Longo
Resumo com 8+ tópicos
~10.000 tokens (transcrição)
~2.500 tokens
Ficha de Evolução
Geração da evolução do prontuário
~12.000 tokens (transcrição + anotações)
~1.500 tokens
Extração de citações-chave
Identificar trechos relevantes do paciente
~10.000 tokens (transcrição)
~300 tokens

2.2 Gemini 2.5 Pro (uso pontual)
Funcionalidade
Descrição
Input Estimado
Output Estimado
Resumo consolidado do paciente
Cruzamento de múltiplas sessões para gerar resumo geral
~50.000-200.000 tokens (histórico)
~3.000 tokens
Assistente IA conversacional
Chat contextualizado com histórico do paciente
~20.000-50.000 tokens (contexto + histórico)
~500-1.000 tokens por resposta
Geração de laudos/relatórios
Documentos clínicos elaborados
~30.000 tokens (dados do paciente)
~3.000-5.000 tokens
Análise de padrões entre sessões
Identificar padrões emocionais e comportamentais ao longo do tempo
~100.000 tokens (múltiplas sessões)
~2.000 tokens


3. Fluxos de IA Detalhados
3.1 Fluxo de Transcrição de Áudio
[Gravação finalizada]
      ↓
[Upload do áudio para Storage (S3/Supabase)]
      ↓
[Envio do áudio via Gemini 2.5 Flash — input nativo de áudio]
      ↓
[Retorno da transcrição em texto]
      ↓
[Salvamento da transcrição no banco de dados vinculada à sessão]
      ↓
[Exibição na aba "Transcrição" da Gestão do Áudio]
Configuração da chamada:
Modelo: gemini-2.5-flash
Input: arquivo de áudio (mp3/webm/wav)
System prompt: instruções para transcrição em pt-BR, com pontuação e identificação de falantes (quando possível)
Fallback: se a qualidade do áudio for baixa, sinalizar ao usuário

3.2 Fluxo de SmartNotes
[Transcrição concluída]
      ↓
[Usuário clica "Salvar áudio" e escolhe tamanho: Curto / Médio / Longo]
      ↓
[Envio da transcrição + parâmetro de tamanho para Gemini 2.5 Flash]
      ↓
[Retorno estruturado: Mapa de Tópicos + Resumo por Tópico + Citações-chave]
      ↓
[Salvamento no banco vinculado ao áudio da sessão]
      ↓
[Exibição no modal "Gestão do Áudio"]
      ↓
[Botão "Passar para anotações" → copia o conteúdo para o editor de Anotações da Sessão]
System prompt base (SmartNotes):
Você é um assistente clínico especializado em psicologia.
Analise a transcrição de sessão terapêutica a seguir e gere um resumo estruturado.

REGRAS:
- Nunca faça julgamentos clínicos ou diagnósticos
- Mantenha linguagem neutra e profissional
- Preserve a confidencialidade (não repita dados pessoais desnecessários)
- Citações-chave devem ser trechos literais do paciente entre aspas
- Use terceira pessoa ("O paciente relatou...")

FORMATO DE SAÍDA:
1. Mapa de Tópicos: lista dos tópicos principais identificados
2. Para cada tópico:
   - Título do tópico
   - Resumo descritivo (3-5 frases)
   - Citações-chave relevantes com identificação do falante

PARÂMETRO DE TAMANHO: {tamanho}
- Curto: 2-3 tópicos principais
- Médio: 5-7 tópicos
- Longo: 8+ tópicos com maior profundidade
Formato de resposta esperado (JSON):
json
{
  "mapa_topicos": ["Tópico 1", "Tópico 2"],
  "topicos": [
    {
      "titulo": "Experiência Geral do Dia do Paciente",
      "resumo": "O paciente relatou que o seu dia foi bom...",
      "citacoes": [
        {
          "texto": "Meu dia? Foi bom",
          "falante": "Paciente"
        }
      ]
    }
  ]
}

3.3 Fluxo de Geração de Evolução
[Usuário clica "Gerar Evolução" na tela de Gestão da Sessão]
      ↓
[Coleta de dados: anotações da sessão + transcrição + SmartNotes (se existir) + dados do paciente]
      ↓
[Envio para Gemini 2.5 Flash com template da Ficha de Evolução]
      ↓
[Retorno estruturado com todos os campos preenchidos]
      ↓
[Renderização no editor "Evolução do Prontuário" (editável pelo profissional)]
      ↓
[Profissional revisa, edita se necessário e salva]
System prompt base (Evolução):
Você é um assistente clínico que gera Fichas de Evolução para prontuários psicológicos.

DADOS DO CONTEXTO:
- Paciente: {nome}
- Profissional: {nome_profissional} — CRP: {crp}
- Data da Sessão: {data_sessao}
- Tipo de consulta: {tipo}

FONTES DE INFORMAÇÃO:
- Anotações da sessão: {anotacoes}
- Transcrição da sessão: {transcricao}
- Resumo SmartNotes: {smartnotes}

REGRAS:
- Preencha cada campo com base nas informações disponíveis
- Se não houver informação suficiente para um campo, escreva "Não há dados suficientes nas anotações para este tópico"
- Linguagem profissional clínica, em terceira pessoa
- Nunca invente informações que não estejam nas fontes
- Não faça diagnósticos

CAMPOS DA FICHA:
1. Intervenção realizada
2. Avaliação de demanda
3. Registros de objetivos
4. Anotações de Antes da Sessão
5. Evolução
6. Observação
7. Dever de casa
8. Registro de encaminhamento/encerramento/continuidade

3.4 Fluxo de Resumo Consolidado do Paciente
[Usuário acessa "Resumo Sintropia" no perfil do paciente]
      ↓
[Sistema coleta todas as sessões do paciente (transcrições + evoluções + SmartNotes)]
      ↓
[Envio para Gemini 2.5 Pro (contexto longo necessário)]
      ↓
[Retorno estruturado com seções do resumo]
      ↓
[Exibição no modal com opção "Baixar PDF"]
System prompt base (Resumo Consolidado):
Você é um assistente clínico especializado em psicologia.
Analise o histórico completo de sessões do paciente e gere um resumo consolidado.

DADOS:
- Paciente: {nome}
- Total de sessões: {total_sessoes}
- Período: {data_primeira_sessao} a {data_ultima_sessao}
- Histórico de sessões: {historico_completo}

FORMATO DE SAÍDA:
1. Observações Iniciais
   - Pontos de destaque das primeiras observações
2. Evolução Emocional e Comportamental
   - Progressão emocional ao longo das sessões
3. Pontos-Chave das Sessões
   - Insights mais relevantes identificados
4. Principais Intervenções
   - Intervenções terapêuticas realizadas e seus resultados

REGRAS:
- Baseie-se exclusivamente nos dados fornecidos
- Identifique padrões e progressões ao longo do tempo
- Linguagem profissional clínica
- Não faça diagnósticos
- Inclua citações relevantes do paciente quando pertinente

3.5 Fluxo do Assistente IA
[Usuário acessa "Assistente IA" no menu principal]
      ↓
[Seleciona paciente para contextualizar (opcional)]
      ↓
[Digita mensagem no chat]
      ↓
[Sistema monta o contexto: dados do paciente + últimas sessões + histórico do chat]
      ↓
[Envio para Gemini 2.5 Pro]
      ↓
[Resposta exibida no chat em tempo real (streaming)]
      ↓
[Histórico do chat salvo no banco]
System prompt base (Assistente):
Você é um assistente clínico de apoio para psicólogos.

SEU PAPEL:
- Auxiliar o profissional com sugestões de intervenções e técnicas terapêuticas
- Ajudar na elaboração de relatórios e documentos clínicos
- Responder dúvidas sobre abordagens terapêuticas
- Sugerir leituras e materiais relevantes

REGRAS:
- Você NÃO é o terapeuta. Você auxilia o profissional
- Nunca faça diagnósticos definitivos
- Sempre sugira, nunca imponha condutas
- Mantenha sigilo e confidencialidade
- Baseie sugestões em evidências científicas quando possível
- Responda em português brasileiro

CONTEXTO DO PACIENTE (se selecionado):
{dados_paciente}
{ultimas_sessoes}

4. Gestão de Prompts
4.1 Armazenamento
Item
Descrição
Local
System prompts armazenados no banco de dados (tabela ai_prompts)
Versionamento
Cada prompt tem versão numérica para rollback
Variáveis
Placeholders {variavel} substituídos em runtime
A/B Testing
Suporte a múltiplas versões ativas para teste de qualidade

4.2 Estrutura da Tabela de Prompts
Campo
Tipo
Descrição
id
UUID
Identificador único
tipo
ENUM
smartnotes, evolucao, resumo, assistente, transcricao
versao
INT
Número da versão
system_prompt
TEXT
Conteúdo do prompt
modelo
VARCHAR
Modelo alvo (gemini-2.5-flash, gemini-2.5-pro)
ativo
BOOLEAN
Se é a versão ativa
created_at
TIMESTAMP
Data de criação


5. Formato de Resposta da IA
5.1 Padrão de Resposta
Todas as chamadas à API utilizam response_mime_type: "application/json" com schema definido para garantir respostas estruturadas e parseáveis.
5.2 Tratamento de Erros
Cenário
Ação
Timeout da API (>30s)
Retry com backoff exponencial (máx 3 tentativas)
Resposta mal formatada
Retry com prompt reforçado + log do erro
Rate limit (429)
Fila de processamento com delay progressivo
Conteúdo inapropriado filtrado
Notificar o profissional e solicitar revisão manual
API indisponível
Mensagem ao usuário: "Processamento temporariamente indisponível. Tente novamente em alguns minutos."
Áudio com qualidade baixa
Notificar o profissional sobre possível imprecisão na transcrição


6. Segurança e Privacidade dos Dados na IA
Item
Implementação
Tier pago obrigatório
Usar Gemini API no tier pago para garantir que dados NÃO são usados para treino do Google
Sem dados permanentes
Nenhuma informação do paciente é armazenada nos servidores do Google
Anonimização parcial
Quando possível, substituir nomes reais por identificadores nas chamadas
Logs de chamadas
Registrar todas as chamadas à API (sem conteúdo sensível) para auditoria
Consentimento
Paciente deve consentir com o uso de IA no tratamento (LGPD)
Criptografia
Todas as chamadas via HTTPS/TLS
Retenção
Transcrições e resumos armazenados criptografados no banco do sistema


7. Estimativa de Custos
7.1 Custo por Operação (Gemini 2.5 Flash)
Operação
Input (tokens)
Output (tokens)
Custo Estimado (USD)
Transcrição (áudio 50min)
~áudio nativo
~8.000
~$0.003
SmartNotes Curto
~10.000
~500
~$0.001
SmartNotes Longo
~10.000
~2.500
~$0.002
Ficha de Evolução
~12.000
~1.500
~$0.001

7.2 Custo por Operação (Gemini 2.5 Pro)
Operação
Input (tokens)
Output (tokens)
Custo Estimado (USD)
Resumo Consolidado (20 sessões)
~100.000
~3.000
~$0.155
Chat Assistente (1 mensagem)
~30.000
~800
~$0.046
Laudo/Relatório
~30.000
~4.000
~$0.078

7.3 Projeção Mensal por Cenário
Cenário
Profissionais
Sessões/mês
Custo IA Estimado (USD)
Custo IA (BRL ~R$5,80)
MVP inicial
10
150
~$2.50
~R$ 14,50
Crescimento
100
1.500
~$25
~R$ 145
Escala
500
7.500
~$125
~R$ 725
Escala alta
1.000
15.000
~$250
~R$ 1.450

Considera: 1 transcrição + 1 SmartNotes + 1 evolução por sessão + 1 resumo consolidado por paciente/mês + 5 mensagens do assistente por profissional/mês.

8. Implementação Técnica
8.1 SDK e Integração
Item
Detalhe
SDK
@google/generative-ai (Node.js)
Autenticação
API Key armazenada em variável de ambiente (nunca no frontend)
Chamadas
Sempre server-side (API Route do Next.js ou Edge Function)
Streaming
Utilizar streaming para o Assistente IA (melhor UX)
Fila
Implementar fila (BullMQ ou similar) para transcrições de áudio (processamento assíncrono)

8.2 Exemplo de Chamada Base (Node.js)
javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chamada para SmartNotes
async function gerarSmartNotes(transcricao, tamanho) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  });

  const prompt = montarPromptSmartNotes(transcricao, tamanho);
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// Chamada para Transcrição de Áudio
async function transcreverAudio(audioBuffer, mimeType) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mimeType,
        data: audioBuffer.toString("base64"),
      },
    },
    "Transcreva este áudio em português brasileiro com pontuação correta. Identifique os diferentes falantes quando possível.",
  ]);

  return result.response.text();
}

// Chamada para Assistente IA (com streaming)
async function chatAssistente(mensagem, contexto) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    systemInstruction: montarPromptAssistente(contexto),
  });

  const chat = model.startChat({ history: contexto.historico_chat });
  const result = await chat.sendMessageStream(mensagem);

  return result.stream;
}
8.3 Configuração de Temperature por Funcionalidade
Funcionalidade
Temperature
Justificativa
Transcrição
0.1
Máxima fidelidade ao áudio
SmartNotes
0.3
Resumo fiel com leve organização criativa
Ficha de Evolução
0.2
Alta fidelidade às anotações
Resumo Consolidado
0.4
Permite identificar padrões e conexões
Assistente IA
0.6
Mais flexível para diálogo natural


9. Monitoramento e Observabilidade
Métrica
O que monitorar
Latência
Tempo de resposta por tipo de chamada
Custo
Tokens consumidos por chamada, por funcionalidade, por profissional
Erros
Taxa de erro por modelo e tipo de operação
Qualidade
Feedback do profissional (thumbs up/down) nas respostas da IA
Uso
Chamadas por profissional/mês (para limitar por plano)

9.1 Limites por Plano
Plano
Transcrições/mês
SmartNotes/mês
Resumos consolidados
Assistente IA
Free/Trial
3
3
0
0
Essencial
40 (≈10h)
Ilimitado
5
0
Profissional
120 (≈30h)
Ilimitado
Ilimitado
100 mensagens
Clínica
Ilimitado
Ilimitado
Ilimitado
Ilimitado


