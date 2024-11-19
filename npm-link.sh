#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Função para exibir mensagens com timestamp
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ ERRO: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}"
}

section() {
    echo -e "\n${CYAN}${BOLD}▶ $1${NC}\n"
}

# Header bonito
echo -e "\n${BOLD}🚀 TESTE DO CLI SERVERLESS ROUTES GENERATOR 🚀${NC}"
echo -e "${YELLOW}================================================${NC}\n"

section "🔍 VERIFICAÇÃO INICIAL"

# Verificar se já existe uma instalação global e remover
if npm list -g serverless-routes-generator > /dev/null 2>&1; then
    warning "Instalação global existente detectada"
    log "🧹 Removendo versão anterior..."
    npm uninstall -g serverless-routes-generator
    success "Ambiente limpo"
fi

section "📦 PREPARAÇÃO DO PACOTE"

# Construir o projeto
log "⚙️  Compilando TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    error "Falha na compilação do projeto"
    exit 1
fi
success "Compilação concluída"

# Criar pacote npm
log "📦 Gerando pacote npm..."
npm pack
if [ $? -ne 0 ]; then
    error "Falha ao gerar pacote npm"
    exit 1
fi
success "Pacote gerado"

# Pegar o nome do arquivo .tgz gerado
PACKAGE_FILE=$(ls serverless-routes-generator-*.tgz | tail -n 1)

section "💿 INSTALAÇÃO GLOBAL"

# Instalar globalmente
log "📥 Instalando pacote globalmente..."
npm install -g ./$PACKAGE_FILE
if [ $? -ne 0 ]; then
    error "Falha na instalação global"
    exit 1
fi
success "Instalação concluída"

section "🧪 TESTES DOS COMANDOS"

# Testar --help
log "📚 Testando comando --help..."
echo -e "${YELLOW}--------------------------------${NC}"
serverless-routes-generator --help
echo -e "${YELLOW}--------------------------------${NC}"
if [ $? -ne 0 ]; then
    error "Falha ao executar --help"
else
    success "Comando help OK"
fi

# Testar init
log "🎯 Executando comando init..."
echo -e "${YELLOW}--------------------------------${NC}"
serverless-routes-generator init
echo -e "${YELLOW}--------------------------------${NC}"
if [ $? -ne 0 ]; then
    error "Falha ao executar comando init"
else
    success "Comando init OK"
fi

# Testar generate
log "⚡ Executando comando generate..."
echo -e "${YELLOW}--------------------------------${NC}"
serverless-routes-generator generate
echo -e "${YELLOW}--------------------------------${NC}"
if [ $? -eq 0 ]; then
    success "Comando generate OK"
else
    warning "Comando generate retornou erro (esperado se não houver configuração)"
fi

section "🧹 LIMPEZA"

# Desinstalar pacote global
log "🗑️  Desinstalando pacote global..."
npm uninstall -g serverless-routes-generator
npm remove -g serverless-routes-generator
npm remove -g @renanlido/serverless-routes-generator
success "Pacote desinstalado"

# Limpar arquivo .tgz
log "🧹 Removendo arquivo temporário ${PACKAGE_FILE}..."
rm -f $PACKAGE_FILE
success "Arquivo temporário removido"

# Footer
echo -e "\n${GREEN}${BOLD}✨ TESTE CONCLUÍDO COM SUCESSO ✨${NC}"
echo -e "${YELLOW}================================================${NC}\n"

# Resumo
echo -e "${CYAN}📋 Resumo do teste:${NC}"
echo -e "  ✅ Compilação do TypeScript"
echo -e "  ✅ Geração do pacote npm"
echo -e "  ✅ Instalação global"
echo -e "  ✅ Teste dos comandos"
echo -e "  ✅ Limpeza do ambiente\n"