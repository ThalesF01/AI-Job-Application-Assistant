# services.py - Versão Corrigida para Problemas de Token
from dotenv import load_dotenv
import os
import json
import re
from typing import List, Dict, Optional
from transformers import pipeline, AutoTokenizer

# -------------------------
# Config / ambiente
# -------------------------
load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")
if HF_API_KEY:
    os.environ["HUGGINGFACE_HUB_TOKEN"] = HF_API_KEY
else:
    print("Aviso: HF_API_KEY não encontrado no .env — modelos privados/gated podem falhar.")

# -------------------------
# Modelos e pipelines otimizados para evitar problemas de token
# -------------------------
LED_MODEL = os.getenv("LED_MODEL", "allenai/led-base-16384")
SUM_MODEL_FALLBACK = os.getenv("SUM_MODEL_FALLBACK", "facebook/bart-large-cnn")
FLAN_MODEL = os.getenv("FLAN_MODEL", "google/flan-t5-large")

def safe_pipeline(task: str, model_name: str, device: int = -1, **kwargs):
    try:
        # Configurações para evitar problemas de token
        if task == "summarization":
            kwargs.update({
                "max_length": 150,
                "min_length": 50,
                "do_sample": False,
                "truncation": True
            })
        elif task == "text2text-generation":
            kwargs.update({
                "max_length": 512,
                "do_sample": True,
                "temperature": 0.7,
                "truncation": True
            })
        
        return pipeline(task, model=model_name, device=device, **kwargs)
    except Exception as e:
        print(f"[safe_pipeline] Falha ao carregar {model_name}: {e}")
        return None

def safe_tokenizer(model_name: str):
    """Carrega tokenizer com configurações seguras"""
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
        return tokenizer
    except Exception as e:
        print(f"[safe_tokenizer] Falha ao carregar tokenizer {model_name}: {e}")
        return None

def truncate_text(text: str, tokenizer, max_tokens: int = 400) -> str:
    """Trunca texto para não exceder limite de tokens"""
    if not tokenizer:
        # Fallback: truncar por caracteres (aproximadamente 4 chars = 1 token)
        max_chars = max_tokens * 4
        return text[:max_chars] if len(text) > max_chars else text
    
    try:
        # Tokenizar e truncar
        tokens = tokenizer.encode(text, truncation=True, max_length=max_tokens)
        return tokenizer.decode(tokens, skip_special_tokens=True)
    except Exception as e:
        print(f"[truncate_text] Erro: {e}")
        # Fallback por caracteres
        max_chars = max_tokens * 4
        return text[:max_chars] if len(text) > max_chars else text

# Carregamento seguro de modelos
print("[INFO] Carregando modelos com configurações seguras...")

# Modelo para sumarização com fallback
summarizer_long = safe_pipeline("summarization", LED_MODEL)
if not summarizer_long:
    print("[INFO] LED model falhou, tentando BART...")
    summarizer_long = safe_pipeline("summarization", SUM_MODEL_FALLBACK)

# Tokenizer para sumarização
summ_tokenizer = safe_tokenizer(LED_MODEL)
if not summ_tokenizer:
    summ_tokenizer = safe_tokenizer(SUM_MODEL_FALLBACK)

# Modelos T5/FLAN com configuração segura
resume_generator = safe_pipeline("text2text-generation", FLAN_MODEL)
resume_tokenizer = safe_tokenizer(FLAN_MODEL) if resume_generator else None

cover_letter_generator = resume_generator  # Reutilizar o mesmo modelo
generation_tokenizer = resume_tokenizer

print(f"[INFO] Modelos carregados:")
print(f"  - Summarizer: {'✓' if summarizer_long else '✗'}")
print(f"  - Resume Generator: {'✓' if resume_generator else '✗'}")
print(f"  - Tokenizers: {'✓' if summ_tokenizer else '✗'}")

# -------------------------
# Helpers de NLP (mantidos)
# -------------------------
KNOWN_TECH = [
    "Python", "JavaScript", "TypeScript", "C#", "Node.js", "React", "Next.js", "Vue.js",
    "TensorFlow", "PyTorch", "LangChain", "Hugging Face", "AWS", "S3", "DynamoDB", "Docker",
    "Kubernetes", "SQL", "Postgres", "MongoDB", "Redis", "GraphQL", "FastAPI", "Django",
    "Flask", "Angular", "Vue", "Svelte", "Go", "Rust", "Java", "Kotlin", "Swift"
]

def _sentences(text: str) -> List[str]:
    s = re.split(r'(?<=[\.\?\!])\s+', text)
    return [seg.strip() for seg in s if seg.strip()]

def _extract_techs(text: str) -> List[str]:
    txt = text.lower()
    found_techs = []
    for tech in KNOWN_TECH:
        if tech.lower() in txt:
            found_techs.append(tech)
    return found_techs

def _extract_roles(text: str) -> List[str]:
    patterns = ["desenvolvedor", "desenvolvedora", "analista", "engenheiro", "cientista", "gerente", "coordenador"]
    return [p for p in patterns if re.search(r'\b' + re.escape(p) + r'\b', text, flags=re.IGNORECASE)]

def _extract_projects(text: str) -> List[str]:
    projects = []
    lines = text.split('\n')
    
    in_projects_section = False
    for line in lines:
        line = line.strip()
        if 'projeto' in line.lower() and 'relevante' in line.lower():
            in_projects_section = True
            continue
        elif in_projects_section and line.startswith('- ') and ':' in line:
            projects.append(line[2:])
        elif in_projects_section and (line.startswith('Formação') or line.startswith('Habilidades')):
            in_projects_section = False
    
    return projects[:3]

def _extract_years_experience(text: str) -> Optional[str]:
    m = re.search(r'(\d+)\s*(anos|anos de|year|years)', text, flags=re.IGNORECASE)
    return f"{m.group(1)} anos" if m else None

def _extract_experience_lines(text: str) -> List[str]:
    lines = text.split('\n')
    experiences = []
    
    for line in lines:
        line = line.strip()
        if re.search(r'20\d{2}[–\-−]\s*(presente|20\d{2})\s*:', line):
            experiences.append(line)
    
    return experiences

def _extract_education(text: str) -> Optional[str]:
    match = re.search(r'(bacharel|graduação|universidade|faculdade)[^0-9]*(\d{4})', text, re.IGNORECASE)
    if match:
        return match.group(0).strip()
    
    lines = text.split('\n')
    for line in lines:
        if any(word in line.lower() for word in ['universidade', 'faculdade', 'bacharel', 'graduação']):
            return line.strip()
    
    return None

def _extract_certifications(text: str) -> List[str]:
    lines = text.split('\n')
    certs = []
    
    in_cert_section = False
    for line in lines:
        line = line.strip()
        if 'certificaç' in line.lower():
            in_cert_section = True
            continue
        elif in_cert_section and line.startswith('- '):
            certs.append(line[2:])
        elif in_cert_section and line and not line.startswith('- '):
            in_cert_section = False
    
    return certs

# -------------------------
# Gerador programático (mantido e melhorado)
# -------------------------
def _generate_resume_markdown_programmatic(resume_text: str, job_description: str) -> str:
    """Gerador programático otimizado"""
    
    print("[DEBUG] Iniciando geração programática de currículo")
    
    lines = [line.strip() for line in resume_text.strip().split('\n') if line.strip()]
    
    # Extrair informações básicas
    name = lines[0] if lines else "Profissional"
    
    # Extrair tecnologias priorizando as da vaga
    all_techs = _extract_techs(resume_text + " " + (job_description or ""))
    job_techs = _extract_techs(job_description or "")
    priority_techs = [t for t in all_techs if t in job_techs] + [t for t in all_techs if t not in job_techs]
    
    # Extrair outras informações
    years_exp = _extract_years_experience(resume_text) or "3+ anos"
    experiences = _extract_experience_lines(resume_text)
    projects = _extract_projects(resume_text)
    education = _extract_education(resume_text)
    certifications = _extract_certifications(resume_text)
    
    # Determinar título baseado na vaga
    title = "Desenvolvedor/Engenheiro de IA"
    if job_description:
        job_lower = job_description.lower()
        if "fullstack" in job_lower:
            title = "Desenvolvedor Full Stack"
        elif "backend" in job_lower:
            title = "Desenvolvedor Backend"
        elif "frontend" in job_lower:
            title = "Desenvolvedor Frontend"
        elif "data scientist" in job_lower:
            title = "Cientista de Dados"
        elif "devops" in job_lower:
            title = "Engenheiro DevOps"
    
    # Construir currículo
    markdown = []
    
    # Header
    markdown.extend([
        f"# {name}",
        f"## {title}",
        "",
        "---",
        ""
    ])
    
    # Resumo Profissional
    markdown.extend([
        "## 💼 Resumo Profissional",
        ""
    ])
    
    summary_parts = []
    summary_parts.append(f"Profissional com {years_exp} de experiência em desenvolvimento e tecnologia.")
    
    if "nlp" in resume_text.lower():
        summary_parts.append("Especialista em NLP e processamento de linguagem natural.")
    
    if "pipeline" in resume_text.lower():
        summary_parts.append("Experiência comprovada em construção de pipelines de ML e integração de modelos.")
    
    if priority_techs:
        main_techs = priority_techs[:4]
        if len(main_techs) > 1:
            summary_parts.append(f"Domínio técnico em {', '.join(main_techs[:-1])} e {main_techs[-1]}.")
        else:
            summary_parts.append(f"Domínio técnico em {main_techs[0]}.")
    
    for part in summary_parts:
        markdown.append(part)
        markdown.append("")
    
    # Experiência Profissional
    markdown.extend([
        "## 🚀 Experiência Profissional",
        ""
    ])
    
    if experiences:
        for exp in experiences[:3]:
            clean_exp = exp.replace('—', '-').replace('–', '-').replace(':', '')
            company_role = clean_exp.split('@')[0].strip() if '@' in clean_exp else clean_exp
            company = clean_exp.split('@')[1].split('—')[0].strip() if '@' in clean_exp else "Empresa"
            
            markdown.append(f"### {company_role}")
            markdown.append(f"**{company}** | {clean_exp.split()[0]} - {clean_exp.split()[1] if len(clean_exp.split()) > 1 else 'Presente'}")
            markdown.append("")
            
            # Adicionar bullets baseados no contexto
            bullets = []
            if "pipeline" in resume_text.lower():
                bullets.append("- Desenvolvimento e otimização de pipelines de Machine Learning")
            if "api" in resume_text.lower():
                bullets.append("- Construção de APIs escaláveis e integração de sistemas")
            if "aws" in resume_text.lower():
                bullets.append("- Deploy e gerenciamento de soluções em cloud (AWS)")
            if not bullets:
                bullets = [
                    "- Desenvolvimento de soluções tecnológicas inovadoras",
                    "- Colaboração em projetos multidisciplinares"
                ]
            
            for bullet in bullets:
                markdown.append(bullet)
            markdown.append("")
    else:
        markdown.extend([
            "### Engenheiro de Machine Learning",
            "**TechCompany** | 2023 - Presente",
            "",
            "- Desenvolvimento de soluções de IA e machine learning",
            "- Construção de pipelines de dados e modelos preditivos",
            "- Integração de LLMs em produtos e sistemas",
            "",
            "### Desenvolvedor Full Stack", 
            "**StartupTech** | 2021 - 2023",
            "",
            "- Desenvolvimento de aplicações web e APIs",
            "- Implementação de soluções de backend e frontend",
            "- Integração com serviços de nuvem e databases",
            ""
        ])
    
    # Projetos Relevantes
    markdown.extend([
        "## 🔧 Projetos Relevantes",
        ""
    ])
    
    if projects:
        for i, project in enumerate(projects, 1):
            project_parts = project.split(':')
            project_name = project_parts[0].strip()
            project_desc = project_parts[1].strip() if len(project_parts) > 1 else "Projeto de tecnologia"
            
            markdown.append(f"### {i}. {project_name}")
            markdown.append(f"{project_desc}")
            markdown.append("")
    else:
        default_projects = [
            ("Sistema de Automação com IA", "Pipeline completo de processamento de dados com modelos de machine learning para classificação e predição."),
            ("API de Machine Learning", "Desenvolvimento de API REST escalável para servir modelos ML em produção com monitoramento."),
            ("Plataforma de NLP", "Sistema de processamento de linguagem natural para análise de sentimentos e extração de entidades.")
        ]
        
        for i, (name, desc) in enumerate(default_projects, 1):
            markdown.append(f"### {i}. {name}")
            markdown.append(f"{desc}")
            if priority_techs:
                relevant_techs = [t for t in priority_techs[:3]]
                if relevant_techs:
                    markdown.append(f"**Tecnologias:** {', '.join(relevant_techs)}")
            markdown.append("")
    
    # Habilidades Técnicas
    markdown.extend([
        "## 🛠️ Habilidades Técnicas",
        ""
    ])
    
    if priority_techs:
        # Categorizar tecnologias
        languages = [t for t in priority_techs if t in ['Python', 'JavaScript', 'TypeScript', 'C#', 'Java', 'Go', 'Rust']]
        frameworks = [t for t in priority_techs if t in ['React', 'Next.js', 'Vue.js', 'Node.js', 'FastAPI', 'Django', 'Flask']]
        ml_ai = [t for t in priority_techs if t in ['TensorFlow', 'PyTorch', 'LangChain', 'Hugging Face']]
        cloud_infra = [t for t in priority_techs if t in ['AWS', 'S3', 'DynamoDB', 'Docker', 'Kubernetes']]
        databases = [t for t in priority_techs if t in ['SQL', 'MongoDB', 'Postgres', 'Redis']]
        
        if languages:
            markdown.append(f"**Linguagens:** {', '.join(languages)}")
        if frameworks:
            markdown.append(f"**Frameworks:** {', '.join(frameworks)}")
        if ml_ai:
            markdown.append(f"**IA & ML:** {', '.join(ml_ai)}")
        if cloud_infra:
            markdown.append(f"**Cloud:** {', '.join(cloud_infra)}")
        if databases:
            markdown.append(f"**Databases:** {', '.join(databases)}")
    else:
        markdown.extend([
            "**Linguagens:** Python, JavaScript, TypeScript",
            "**IA & ML:** TensorFlow, PyTorch, LangChain",
            "**Cloud:** AWS, Docker, Kubernetes",
            "**Databases:** SQL, MongoDB, PostgreSQL"
        ])
    
    markdown.append("")
    
    # Formação
    if education:
        markdown.extend([
            "## 🎓 Formação",
            "",
            f"**{education}**",
            ""
        ])
    
    # Certificações
    if certifications:
        markdown.extend([
            "## 📜 Certificações",
            ""
        ])
        for cert in certifications:
            markdown.append(f"- {cert}")
        markdown.append("")
    
    # Diferenciais competitivos
    if job_description:
        markdown.extend([
            "## ⭐ Diferenciais Competitivos",
            ""
        ])
        
        job_lower = job_description.lower()
        differentials = []
        
        # Mapear tecnologias encontradas para diferenciais
        tech_differentials = {
            "python": "✓ **Expertise em Python** - linguagem principal para desenvolvimento",
            "javascript": "✓ **JavaScript Avançado** - desenvolvimento web moderno",
            "react": "✓ **React Specialist** - interfaces de usuário avançadas",
            "aws": "✓ **Cloud Computing** - experiência AWS para sistemas escaláveis",
            "docker": "✓ **Containerização** - deploy e orquestração com Docker/Kubernetes",
            "api": "✓ **APIs Escaláveis** - desenvolvimento de serviços robustos"
        }
        
        for tech_key, differential in tech_differentials.items():
            if tech_key in job_lower and any(tech.lower() in tech_key for tech in priority_techs):
                differentials.append(differential)
        
        # Adicionar diferenciais genéricos se não encontrar específicos
        if not differentials:
            differentials = [
                "✓ **Experiência técnica alinhada** com os requisitos da posição",
                "✓ **Capacidade comprovada** de entrega em projetos complexos"
            ]
        
        for diff in differentials[:4]:  # Máximo 4 diferenciais
            markdown.append(diff)
            markdown.append("")
    
    result = "\n".join(markdown)
    print(f"[DEBUG] Currículo gerado com {len(result)} caracteres")
    return result

# -------------------------
# Funções principais com proteção contra problemas de token
# -------------------------
def summarize_resume(text: str) -> str:
    """Resumo com proteção contra limite de tokens"""
    if not text.strip():
        return ""
    
    # Primeiro, tentar método simples
    sentences = _sentences(text)
    if len(sentences) <= 3:
        return text
    
    # Se temos o modelo de sumarização, usar com truncamento
    if summarizer_long and summ_tokenizer:
        try:
            # Truncar o texto para evitar problemas de token
            truncated_text = truncate_text(text, summ_tokenizer, max_tokens=400)
            print(f"[DEBUG] Texto truncado para {len(truncated_text)} caracteres")
            
            summary = summarizer_long(truncated_text)[0]['summary_text']
            print(f"[DEBUG] Resumo gerado: {len(summary)} caracteres")
            return summary
            
        except Exception as e:
            print(f"[ERROR] Erro na sumarização com modelo: {e}")
    
    # Fallback: método programático
    key_sentences = []
    for sentence in sentences:
        if any(keyword in sentence.lower() for keyword in 
               ['experiência', 'desenvolvedor', 'engenheiro', 'analista', 'especialista', 'foco']):
            key_sentences.append(sentence)
        if len(key_sentences) >= 3:
            break
    
    if not key_sentences:
        key_sentences = sentences[:3]
    
    return " ".join(key_sentences)

def generate_optimized_resume(resume_text: str, job_description: Optional[str] = "") -> str:
    """Função principal com fallbacks robustos"""
    print("[INFO] Gerando currículo otimizado")
    
    # Sempre tentar o gerador programático primeiro (mais confiável)
    try:
        return _generate_resume_markdown_programmatic(resume_text, job_description or "")
    except Exception as e:
        print(f"[ERROR] Erro no gerador programático: {e}")
    
    # Se temos modelos carregados, tentar com eles
    if resume_generator and generation_tokenizer:
        try:
            # Criar prompt otimizado e truncado
            job_context = f"\n\nVaga: {job_description}" if job_description else ""
            prompt = f"Otimize este currículo:{job_context}\n\nCurrículo:\n{resume_text}"
            
            # Truncar prompt para evitar problemas
            truncated_prompt = truncate_text(prompt, generation_tokenizer, max_tokens=350)
            print(f"[DEBUG] Prompt truncado para {len(truncated_prompt)} caracteres")
            
            result = resume_generator(truncated_prompt)[0]['generated_text']
            if result and len(result) > 100:
                print(f"[DEBUG] Currículo gerado via modelo: {len(result)} caracteres")
                return result
        except Exception as e:
            print(f"[ERROR] Erro na geração com modelo: {e}")
    
    # Fallback final: versão básica
    return f"""# Currículo Otimizado

## Resumo Profissional
{summarize_resume(resume_text)}

## Habilidades Principais
{', '.join(_extract_techs(resume_text + ' ' + (job_description or ''))[:8])}

## Experiência
Profissional com sólida experiência em desenvolvimento de software e tecnologia.

---
*Currículo gerado automaticamente*"""

def generate_cover_letter(resume_text: str, job_description: Optional[str] = "") -> str:
    """Carta de apresentação com proteção de token"""
    
    name_match = re.search(r'^([A-Za-z\sÀ-ÿ]+)', resume_text.strip())
    name = name_match.group(1).strip() if name_match else "Candidato"
    
    techs = _extract_techs(resume_text + " " + (job_description or ""))
    years = _extract_years_experience(resume_text) or "vários anos"
    
    # Se temos o modelo, tentar usar
    if cover_letter_generator and generation_tokenizer:
        try:
            prompt = f"Escreva uma carta de apresentação profissional para {name} com {years} de experiência em {', '.join(techs[:3])}."
            truncated_prompt = truncate_text(prompt, generation_tokenizer, max_tokens=200)
            
            result = cover_letter_generator(truncated_prompt)[0]['generated_text']
            if result and len(result) > 50:
                return result
        except Exception as e:
            print(f"[ERROR] Erro na geração de carta: {e}")
    
    # Fallback programático
    tech_list = ', '.join(techs[:4]) if techs else 'Python, Machine Learning, APIs'
    
    return f"""# Carta de Apresentação

**{name}**

---

Prezados senhores,

Tenho grande interesse na vaga anunciada e acredito que minha experiência de {years} na área de desenvolvimento e tecnologia pode agregar valor significativo à sua equipe.

Minha experiência técnica inclui trabalho com {tech_list}, além de sólido background em desenvolvimento de soluções escaláveis e inovadoras.

Estou entusiasmado com a oportunidade de contribuir para os objetivos da empresa e aplicar meus conhecimentos em projetos desafiadores.

Agradeço a consideração e fico à disposição para maiores esclarecimentos.

Atenciosamente,  
**{name}**
"""

def simulate_interview(resume_text: str, job_description: Optional[str] = "", max_retries: int = 1) -> List[Dict]:
    """Simulador de entrevista otimizado"""
    
    techs = _extract_techs(resume_text + " " + (job_description or ""))
    projects = _extract_projects(resume_text)
    years = _extract_years_experience(resume_text)
    
    qa = []
    
    # 1) Pergunta técnica principal
    if techs:
        main_tech = techs[0]
        qa.append({
            "question": f"Descreva sua experiência prática com {main_tech}.",
            "answer": f"Tenho experiência sólida com {main_tech}, desenvolvendo soluções robustas e escaláveis. Trabalho com essa tecnologia há {years or 'alguns anos'}, aplicando-a em projetos diversos."
        })
    
    # 2) Projetos específicos
    if projects:
        qa.append({
            "question": "Conte sobre um projeto relevante que você desenvolveu.",
            "answer": projects[0]
        })
    else:
        qa.append({
            "question": "Descreva um projeto técnico que você considera seu maior desafio.",
            "answer": "Desenvolvi um sistema completo de automação que resultou em melhoria significativa na eficiência dos processos, utilizando tecnologias modernas e boas práticas de desenvolvimento."
        })
    
    # 3) Arquitetura e boas práticas
    qa.append({
        "question": "Como você garante a qualidade e escalabilidade dos seus sistemas?",
        "answer": "Aplico princípios de arquitetura limpa, uso de testes automatizados, containerização com Docker, e implemento monitoramento contínuo. Sempre considero performance e manutenibilidade."
    })
    
    # 4) Trabalho em equipe
    qa.append({
        "question": "Como você trabalha em equipe multidisciplinar?",
        "answer": "Utilizo metodologias ágeis, mantenho comunicação clara sobre progresso e desafios, documento bem o código para facilitar a colaboração, e estou sempre disponível para apoiar colegas."
    })
    
    # 5) Motivação e fit cultural
    qa.append({
        "question": "Por que você tem interesse nesta posição?",
        "answer": "Estou motivado em aplicar minhas habilidades técnicas para resolver problemas reais e contribuir com uma equipe que valoriza inovação, crescimento profissional e excelência técnica."
    })
    
    return qa