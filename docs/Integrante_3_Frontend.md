# DoeFacil — Integrante 3
## Função: Front-end (React) e integração com Ethers.js / MetaMask

Responsável pela interface que o usuário usa para doar, acompanhar campanhas e (para ONGs) sacar. Consome o contrato entregue pela Int. 1 e publicado pela Int. 2.

---

### Sprint 1 — Fundação e Setup
- [x] Montar o projeto React. _(Vite + React em `/frontend`)_
- [x] Instalar e configurar o Ethers.js. _(dependência instalada; `utils/ethers.js` com `getProvider`)_
- [x] Criar a tela inicial com conexão à carteira MetaMask (botão "Conectar carteira"). _(reintroduzido na branch `feat/frontend-metamask-vercel`: `wallet-bar` no `App.jsx` com botão "Conectar carteira" via `connectWallet`/`eth_requestAccounts`; exibe o endereço curto quando conectado)_

**Entrega:** ✅ App React montado e com conexão MetaMask funcionando.

---

### Sprint 2 — Telas de Doação
- [x] Tela de listagem de campanhas (título, meta, arrecadado, prazo). _(`CampaignList.jsx` com `data/campaigns.js`; usa dados mock, sem prazo)_
- [x] Tela de envio de doação em ETH integrada à função `doar` do contrato. _(integrado na branch `feat/frontend-metamask-vercel`: `utils/donations.js#donate` chama `contract.doar(onChainId, { value })` via signer do MetaMask; **validado on-chain** — tx `0x0bbdec…0d45` confirmada na Sepolia)_
- [x] Exibir confirmação da transação ao doador. _(agora exibe o hash real com link para o Etherscan da Sepolia, não mais simulado)_

**Entrega:** ✅ Doação integrada ao contrato e confirmada na testnet.

---

### Sprint 3 — Telas de Saque e Integração com a Testnet
- [x] Tela de autorização de fornecedor (visível para a ONG dona). _(integrado na branch `feat/frontend-metamask-vercel`: `utils/sprint3.js#authorizeSupplier` chama `autorizar_fornecedor(onChainId, fornecedor)`; tela ganhou seletor de campanha)_
- [x] Tela de saque integrada à função `sacar`. _(integrado na mesma branch: `withdrawFunds` chama `sacar(onChainId, valor, fornecedor)`; tela ganhou seletor de campanha e campo de endereço do fornecedor)_
- [x] Conectar o front-end ao contrato publicado na Sepolia (endereço + ABI). _(`utils/ethers.js#getContract` instancia o contrato com endereço+ABI de `src/contracts/sepolia.json`; `ensureSepolia` garante a rede correta antes de assinar)_

**Entrega:** ✅ Todas as telas conectadas ao contrato na Sepolia via MetaMask (PR #9). _(doação validada on-chain; autorização/saque com integração pronta e validação manual em andamento)_

---

### Sprint 4 — Validação Final
- [ ] Polir a interface (layout, responsividade, estados de carregamento).
- [x] Tratar erros de transação (rejeição, saldo insuficiente, etc.). _(na branch `feat/frontend-metamask-vercel`: cada tela captura o erro e exibe `err.shortMessage`/`err.message` — ex.: revert do contrato, rejeição da assinatura no MetaMask)_
- [ ] Exibir o histórico público das campanhas (entradas e saídas).
- [ ] Documentar a sua parte (front-end) para os slides e participar do ensaio.

**Entrega:** Interface polida, com histórico público visível e tratamento de erros.
