# AI Job Assistant

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazon-aws)
![Groq LLM](https://img.shields.io/badge/Groq-FF6F61?style=flat)

O **AI Job Assistant** é uma plataforma completa para candidatos que desejam **otimizar seus currículos**, gerar cartas de apresentação personalizadas e se preparar para entrevistas usando **Inteligência Artificial**.  
O projeto combina **processamento de documentos, NLP e LLMs** para entregar resultados precisos, profissionais e adaptados à vaga desejada.

<img width="1891" height="899" alt="image" src="https://github.com/user-attachments/assets/0cc1f51e-c8f7-489c-b3d5-ae9bb93cbabb" />

A aplicação está separada em duas pastas principais:

- **Frontend**: desenvolvido em **Next.js com TypeScript**  
- **Backend**: desenvolvido em **Node.js com JavaScript**, integrado à **AWS (S3 e DynamoDB)** e com suporte a **LLM Groq** para IA

---

## 📝 Funcionalidades Principais

Abaixo está um resumo visual das principais funcionalidades do AI Job Assistant:

| Funcionalidade | Descrição Detalhada | Resultado Esperado |
|----------------|------------------|-----------------|
| 📄 **Upload de Currículo** | Aceita PDF/DOCX, extrai texto automaticamente | Mostra currículo original e resumo inicial com **pontos fortes, pontos fracos e sugestões de melhoria** |
| ✨ **Otimização Baseada no Currículo** | Reescreve e reorganiza o currículo | Mostra o que foi **adicionado/destacado**, **removido/simplificado** e **reorganizado** mantendo veracidade |
| 🎯 **Otimização Baseada na Vaga** | Recebe descrição da vaga e otimiza o currículo | Gera **score de compatibilidade (0-100)**, mostra currículo otimizado, pontos fortes, lacunas e análise comportamental |
| 📝 **Geração de Carta de Apresentação** | Cria carta personalizada com base no currículo e vaga | Saída em **Markdown**, destacando pontos fortes e alinhamento com a vaga |
| 💬 **Simulação de Entrevista** | Gera perguntas e respostas para entrevista | 4 perguntas principais + 3 perguntas para a empresa, com respostas sugeridas e confiáveis |
| 📊 **Avaliação de Aderência à Vaga** | Analisa compatibilidade do candidato com a vaga | Mostra **score percentual** e recomendações para ajustes no currículo |

---

## ⚡ Tecnologias Utilizadas

- **Frontend**: Next.js, TypeScript, React, Tailwind CSS, Lucide Icons  
- **Backend**: Node.js, JavaScript, FastAPI (opcional)  
- **IA / NLP**:
  - **Groq LLM**: para resumo, otimização e análise de currículo
  - Modelos para geração de carta e simulação de entrevistas
- **Armazenamento e Cloud**: AWS S3 (upload de arquivos), DynamoDB (armazenamento de dados)
- **Outros**: Markdown rendering, UI Components (Radix/Custom), animações e transições suaves

---

## 💡 Diferenciais do Projeto

- **Otimização Inteligente**: não apenas reescreve o currículo, mas evidencia conquistas, skills e palavras-chave da vaga  
- **Experiência completa para o candidato**: do upload ao preparo para entrevista, tudo em uma interface fluida  
- **Flexível e extensível**: permite adicionar novos modelos de IA, ajustar prompts e integrar novas APIs  
- **Design moderno e responsivo**, com abas, animações, pré-visualização de currículos e interface amigável  

---

## 🖥 Demonstração de Fluxo

1. **📄 Upload do Currículo**
   - Selecione arquivo PDF/DOCX  
   - Extração de texto e pré-visualização  

2. **📌 Inserir descrição da vaga**
   - Cole o texto da vaga desejada  

3. **✨ Otimização de Currículo**
   - Escolha entre **baseada no currículo** ou **baseada na vaga**  
   - Visualização das mudanças:
     - 🟢 Adicionado / Destacado  
     - 🔴 Removido / Simplificado  
     - 🔄 Reorganizado  
   - Score de compatibilidade (para otimização baseada na vaga)  
   - Pontos fortes, gaps e análise comportamental  

4. **📝 Gerar Carta de Apresentação**
   - Texto personalizado pronto para envio  

5. **💬 Simulação de Entrevista**
   - Perguntas e respostas baseadas na vaga  
   - Sugestões de perguntas para a empresa  

6. **📊 Avaliação de Match**
   - Score percentual de compatibilidade com a vaga  
   - Recomendações para ajustes e destaque de habilidades

---

## 🚀 Como Usar

1. Clone o repositório:
```bash
git clone https://github.com/ThalesF01/AI-Job-Application-Assistant
cd ai-job-assistant
npm install
GROQ_API_KEY=SEU_TOKEN
AWS_S3_BUCKET=nome-do-bucket
npm run dev
Acesse no navegador: http://localhost:3000
