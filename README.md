# AI Job Assistant

O **AI Job Assistant** é uma ferramenta completa para candidatos que desejam **otimizar seus currículos**, gerar cartas de apresentação personalizadas e se preparar para entrevistas com inteligência artificial. O projeto combina **processamento de documentos, NLP e LLMs** para entregar resultados precisos, profissionais e adaptados à vaga desejada.

---

## 📝 Funcionalidades Principais

### 1. Upload e Processamento de Currículo
- Aceita arquivos em **PDF ou DOCX**
- Extrai automaticamente o texto do currículo, mesmo em documentos complexos
- Analisa habilidades, experiências e realiza um resumo inicial utilizando IA
- Interface amigável que mostra **pré-visualização do currículo** e resumo

### 2. Otimização de Currículo
- Funcionalidade **destaque do projeto**
- Reescreve trechos do currículo de acordo com a **descrição da vaga**
- Destaca:
  - Skills relevantes para a vaga
  - Resultados e conquistas profissionais
  - Palavras-chave específicas da descrição do trabalho
- Gera **Markdown formatado** com seções claras:
  - **Resumo Profissional**
  - **Skills Principais**
  - **Experiências Relevantes**
  - **Formação Acadêmica**
- Mantém a **veracidade do currículo**, sem inventar experiências ou dados

### 3. Geração de Carta de Apresentação
- Cria cartas personalizadas com base no currículo e na vaga
- Estrutura clara e objetiva, destacando pontos fortes e alinhamento com a vaga
- Saída em **Markdown**, pronta para enviar ou adaptar

### 4. Simulação de Entrevista
- Cria perguntas e respostas de entrevista com base no currículo e descrição da vaga
- Permite revisar respostas e se preparar para **interações reais**
- Normaliza dados mesmo que a API retorne estruturas diferentes, garantindo confiabilidade

### 5. Avaliação de Aderência à Vaga
- Analisa a **compatibilidade do candidato com a vaga** usando embeddings e NLP
- Mostra um score percentual estimado da aderência
- Ajuda o usuário a priorizar ajustes no currículo ou destacar habilidades específicas

---

## ⚡ Tecnologias Utilizadas

- **Frontend**: Next.js, React, Tailwind CSS, Lucide Icons  
- **Backend**: Node.js, TypeScript, FastAPI (opcional)  
- **IA / NLP**:
  - Groq (ou outro LLM)
  - Modelos para resumo, otimização de currículo e geração de carta
- **Armazenamento e Cloud**: AWS (S3, EC2)  
- **Outros**: Markdown rendering, UI Components (Radix/Custom), animações e transições suaves

---

## 💡 Diferenciais do Projeto

- **Otimização Inteligente**: não apenas reescreve o currículo, mas foca nas **palavras-chave da vaga** e evidencia conquistas
- **Experiência completa para o candidato**: do upload ao preparo de entrevista, tudo em uma interface fluida
- **Flexível e extensível**: permite adicionar novos modelos de IA, ajustar prompts e integrar novas APIs
- **Design moderno e responsivo**, com animações e abas para melhorar a experiência do usuário

---

## 🖥 Demonstração de Fluxo

1. **Upload do Currículo**
   - Seleção de arquivo PDF/DOCX
   - Extração de texto e pré-visualização

2. **Colar descrição da vaga**
   - Texto livre da vaga desejada

3. **Otimização de Currículo**
   - Reescrita inteligente destacando skills e resultados

4. **Gerar Carta de Apresentação**
   - Texto personalizado pronto para envio

5. **Simulação de Entrevista**
   - Lista de perguntas e respostas baseadas na vaga

6. **Avaliação de Match**
   - Score estimado de aderência à vaga

---

## 📂 Estrutura do Frontend

```
/ai-job-frontend          # Frontend em Next.js
  /components             # Componentes UI (Input, Button, ResultBlock)
  /lib                    # Funções de integração com APIs
  /pages                  # Páginas Next.js

/ai-service              # Serviços AI (otimização, carta, entrevista)
  aiService.ts           # Funções principais de interação com LLMs
```

## 📁 Estrutura do Backend e AI Service

O backend está organizado para separar rotas, serviços e integração com a IA de forma clara e escalável:

```
backend/
├─ src/
│  ├─ controllers/
│  │  ├─ AIController.ts          # Endpoints para IA (resumo, otimização, carta, entrevista)
│  │  └─ ResumeController.ts      # Upload e parsing de currículos
│  ├─ routes/
│  │  ├─ AIRoutes.ts
│  │  └─ ResumeRoutes.ts
│  ├─ services/
│  │  ├─ aiService/
│  │  │  ├─ generateOptimizedResume.ts
│  │  │  ├─ generateCoverLetter.ts
│  │  │  ├─ simulateInterview.ts
│  │  │  └─ summarizeResume.ts
│  │  └─ resumeService.ts
│  ├─ models/
│  │  └─ ResumeModels.ts
│  ├─ utils/
│  │  └─ fileHelpers.ts
│  └─ main.ts                     # Entry point do FastAPI / Express
├─ tests/
│  └─ aiService.test.ts
└─ package.json
```

### Detalhes:
- **controllers/** → Recebem requisições HTTP e chamam os serviços
- **routes/** → Define endpoints e mapeamento de URLs
- **services/aiService/** → Contém toda a lógica de IA (otimização, carta, entrevista, resumo)
- **models/** → Tipos e interfaces para dados de currículo e resposta da IA
- **utils/** → Funções auxiliares, como parsing de arquivos
- **tests/** → Testes unitários e de integração
- **main.ts** → Inicializa o servidor e conecta tudo

---

## 🚀 Como Usar

1. Clone o repositório:
```bash
git clone https://github.com/SEU-USUARIO/ai-job-assistant.git
cd ai-job-assistant
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
GROQ_API_KEY=SEU_TOKEN
AWS_S3_BUCKET=nome-do-bucket
```

4. Execute o projeto:
```bash
npm run dev
```

5. Acesse no navegador: `http://localhost:3000`

