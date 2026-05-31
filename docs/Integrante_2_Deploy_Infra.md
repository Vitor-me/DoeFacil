# DoeFacil — Integrante 2
## Função: Deploy na testnet, infraestrutura (Alchemy/Infura) e scripts

Responsável por configurar o ambiente Hardhat, os scripts de deploy e publicar o contrato na testnet Sepolia. Faz a ponte entre o contrato (Int. 1) e a rede.

---

### Sprint 1 — Fundação e Setup
- [x] Inicializar o projeto Hardhat. _(Hardhat 2.28 em `/contracts`)_
- [x] Configurar dependências (Hardhat, Ethers, OpenZeppelin, dotenv). _(via hardhat-toolbox + OpenZeppelin 5)_
- [x] Configurar ESLint/Prettier e definir a estrutura de pastas do projeto. _(ESLint + Prettier + solhint; monorepo `/contracts` e `/frontend`)_

**Entrega:** ✅ Ambiente local de desenvolvimento funcionando. `npx hardhat compile` rodando, `.gitignore` e `.env.example` prontos.
    
---

### Sprint 2 — Lógica Central do Contrato
- [ ] Escrever o script de deploy local (rede Hardhat).
- [ ] Criar fixtures de teste: contas de admin, ONG, doador e fornecedor.
- [ ] Montar cenários de exemplo para a equipe testar manualmente.

**Entrega:** Script de deploy local e dados de teste prontos.

---

### Sprint 3 — Deploy na Testnet
- [ ] Criar conta e API key no Alchemy ou Infura.
- [x] Configurar a rede Sepolia no `hardhat.config`. _(rede + verify Etherscan já configurados; falta só preencher o `.env`)_
- [ ] Obter ETH de testnet via faucet.
- [ ] Fazer o deploy do contrato na Sepolia e registrar o endereço publicado.

**Entrega:** Contrato publicado e verificado na testnet Sepolia.

---

### Sprint 4 — Validação Final
- [ ] Preparar o roteiro técnico da demo prática (passo a passo das transações).
- [ ] Validar as transações reais no Etherscan da Sepolia.
- [ ] Documentar a sua parte (deploy e infraestrutura) para os slides.
- [ ] Participar do ensaio da apresentação e da divisão das perguntas.

**Entrega:** Roteiro da demonstração pronto e transações verificáveis no explorador.
