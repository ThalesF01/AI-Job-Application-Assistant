export const resumePrompt = (resume, jobDescription) => `
Otimize este currículo para a vaga abaixo:
Vaga: ${jobDescription}
Currículo: ${JSON.stringify(resume, null, 2)}
`;

export const coverLetterPrompt = (resume, jobDescription) => `
Gere uma carta de apresentação para a vaga abaixo baseada neste currículo:
Vaga: ${jobDescription}
Currículo: ${JSON.stringify(resume, null, 2)}
`;

export const interviewPrompt = (resume, jobDescription) => `
Baseado neste currículo e vaga, crie 5 perguntas e respostas de entrevista:
Vaga: ${jobDescription}
Currículo: ${JSON.stringify(resume, null, 2)}
`;

export const matchPrompt = (resume, jobDescription) => `
Compare este currículo com a vaga e informe score de match:
Currículo: ${JSON.stringify(resume, null, 2)}
Vaga: ${jobDescription}
`;
