# DoeFacil — Integrante 3
## Função: Front-end (React) e integração com Ethers.js / MetaMask

Responsável pela interface que o usuário usa para doar, acompanhar campanhas e (para ONGs) sacar. Consome o contrato entregue pela Int. 1 e publicado pela Int. 2.

---

### Sprint 1 — Fundação e Setup
- [x] Montar o projeto React. _(Vite + React em `/frontend`)_
- [x] Instalar e configurar o Ethers.js. _(dependência instalada; `utils/ethers.js` com `getProvider`)_
- [ ] Criar a tela inicial com conexão à carteira MetaMask (botão "Conectar carteira"). _(existia, mas o PR #6 removeu a tela de conexão ao trocar para a navegação multi-tela; `getProvider` ficou sem uso)_

**Entrega:** ⚠️ App React montado, mas a tela de conexão MetaMask foi removida na refatoração.

---

### Sprint 2 — Telas de Doação
- [x] Tela de listagem de campanhas (título, meta, arrecadado, prazo). _(`CampaignList.jsx` com `data/campaigns.js`; usa dados mock, sem prazo)_
- [ ] Tela de envio de doação em ETH integrada à função `doar` do contrato. _(UI pronta em `DonationScreen.jsx`, mas `utils/donations.js` é placeholder — só `console.log`, sem chamar o contrato)_
- [x] Exibir confirmação da transação ao doador. _(mensagem de feedback de sucesso, porém simulada)_

**Entrega:** ⚠️ Telas prontas, mas a doação ainda não está integrada ao contrato (mock).

---

### Sprint 3 — Telas de Saque e Integração com a Testnet
- [x] Tela de autorização de fornecedor (visível para a ONG dona). _(`AuthorizeSupplierScreen.jsx`; UI pronta, `utils/sprint3.js` é placeholder)_
- [x] Tela de saque integrada à função `sacar`. _(`WithdrawScreen.jsx`; UI pronta, mas `withdrawFunds` é placeholder — só `console.log`)_
- [ ] Conectar o front-end ao contrato publicado na Sepolia (endereço + ABI). _(falta: nenhum import de ABI/endereço; `utils/{donations,sprint3}.js` não usam Ethers.js nem o `sepolia.json`)_

**Entrega:** ⚠️ Todas as telas existem, mas nenhuma está conectada ao contrato — integração com a testnet é o trabalho restante.

---

### Sprint 4 — Validação Final
- [ ] Polir a interface (layout, responsividade, estados de carregamento).
- [ ] Tratar erros de transação (rejeição, saldo insuficiente, etc.).
- [ ] Exibir o histórico público das campanhas (entradas e saídas).
- [ ] Documentar a sua parte (front-end) para os slides e participar do ensaio.

**Entrega:** Interface polida, com histórico público visível e tratamento de erros.
