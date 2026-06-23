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
- [x] Escrever o script de deploy local (rede Hardhat). _(`scripts/deploy.js`, roda em memória e em `localhost`; grava endereço+ABI em `contracts/deployments/` e `frontend/src/contracts/`)_
- [x] Criar fixtures de teste: contas de admin, ONG, doador e fornecedor. _(`test/fixtures.js` via `loadFixture` + smoke test em `test/fixtures.test.js`)_
- [x] Montar cenários de exemplo para a equipe testar manualmente. _(`scripts/cenario.js`; `npm run cenario` / `cenario:local`)_

**Entrega:** ✅ Script de deploy local e dados de teste prontos. _(a lógica do contrato — Int. 1 — já foi implementada, então o cenário roda sobre as funções reais)_

---

### Sprint 3 — Deploy na Testnet
- [x] Criar conta e API key no Alchemy ou Infura. _(app criado no Alchemy; API key ativa)_
- [x] Configurar a rede Sepolia no `hardhat.config`. _(rede + verify Etherscan + pré-voo e verify automático no `deploy.js`)_
- [x] Obter ETH de testnet via faucet. _(via Google Cloud Faucet)_
- [x] Fazer o deploy do contrato na Sepolia e registrar o endereço publicado. _(re-deploy com a lógica atual em 19/06: `0xf6Ca4554C95a31F58dEB3307e74511D3b48927AD`, verificado no Etherscan; endereço + ABI em `contracts/deployments/sepolia.json` e `frontend/src/contracts/sepolia.json`)_

**Entrega:** ✅ Contrato publicado e verificado na testnet Sepolia. _(endereço atual `0xf6Ca…27AD`; substituiu o deploy de 03/06 que era do contrato stub)_

---

### Sprint 4 — Validação Final
- [ ] Preparar o roteiro técnico da demo prática (passo a passo das transações).
- [ ] Validar as transações reais no Etherscan da Sepolia. _(deploy + verificação já confirmados no Etherscan; falta validar doação/saque, que dependem da integração do frontend)_
- [ ] Documentar a sua parte (deploy e infraestrutura) para os slides.

**Entrega:** Roteiro da demonstração pronto e transações verificáveis no explorador.

## Deploy do frontend no Vercel

O frontend é um app Vite estático; o endereço e a ABI do contrato já vão
embutidos no build (de `src/contracts/sepolia.json`), então não há variáveis de
ambiente a configurar.

### Pré-requisito: semear campanhas

Para que a doação funcione, o contrato precisa ter campanhas. Rode uma vez:

    cd contracts
    npm run seed:sepolia

(É idempotente: se já houver campanhas, não faz nada.)

### Opção A — Dashboard

1. Importe o repositório em vercel.com.
2. Em **Root Directory**, selecione `frontend`.
3. Framework: Vite (detectado). Build: `npm run build`. Output: `dist`.
4. Deploy.

### Opção B — CLI

    npm i -g vercel
    cd frontend
    vercel        # primeiro deploy (responda Root Directory = ./ a partir de frontend)
    vercel --prod # publica em produção
