/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true, // ajuda o Amplify a servir index.html em subpastas
  // se você usar imagens externas, adicione domains: [...]
  // Caso precise de outras configs, coloque aqui
};

module.exports = nextConfig;
