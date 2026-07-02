# Campanhas on-chain, Criar Campanha e Verificar ONG (admin)

**Data:** 2026-07-02
**Escopo:** Frontend (React + ethers, rede Sepolia). Sem alterações no contrato.

## Contexto

O contrato `DoeFacil` (`0xd13F3008F1A59eBb69b897633747749c8db09cb3`) já expõe todas as
funções necessárias: `verificar_ong`, `criar_campanha`, `doar`, `autorizar_fornecedor`,
`sacar`, além das leituras `contadorCampanhas`, `campanhas(id)`, `ongs(addr)` e `owner()`.

Estado atual do frontend:

- A lista de campanhas usa dados **mockados** em `src/data/campaigns.js`. Já existem **3 campanhas
  reais** on-chain (mesmos títulos do mock; só os valores de "arrecadado" eram fictícios).
- As telas de **Autorizar Fornecedor** e **Saque** já existem e estão ligadas ao contrato
  (`utils/sprint3.js`), mas o dropdown delas usa os IDs do mock.
- **Não existem** telas de **Criar Campanha** nem de **Verificar ONG**.
- O `owner` do contrato ativo é a carteira deployer `0x03a0ed6D2B25d150fF6451C8C6666DddeA14242B`
  (NÃO a DAO). `verificar_ong` é `onlyOwner`.
- A página de Governança/DAO chama `verificar_ong` em **outro** DoeFacil (o que a DAO controla),
  não o contrato ativo — portanto não afeta as campanhas reais. Fica fora deste escopo.

## Decisões

1. **Verificar ONG** = página admin direta: se a carteira conectada for o `owner`, ela chama
   `verificar_ong` diretamente. (A rota via DAO fica como está, sem mudanças.)
2. **Sem redeploy** do contrato. Trabalhar com o `0xd13F…` como está, preservando as campanhas
   e o histórico existentes.
3. **Cards de campanha** exibem apenas dados on-chain (título, meta, arrecadado, saldo, prazo,
   progresso). O contrato não guarda "descrição", então ela é omitida.

## Arquitetura

Reutiliza os padrões já presentes no código:

- Leituras via `getReadOnlyContract()` e `getProvider()` (`utils/ethers.js`), com checagem de
  rede igual à de `utils/publicHistory.js`.
- Escritas via `getContract()` (signer), retornando `{ success, hash }` como `utils/sprint3.js`.
- Estado global no `WalletContext`, espelhando o `historyState`/`loadPublicHistory` já existentes.
- Telas com o mesmo layout/feedback (`screen-section`, `donation-form`, `feedback-message`).

### 1. Camada de leitura — `src/utils/campaigns.js`

Funções puras (testáveis) + funções on-chain:

- `normalizeCampaign(raw, id)` → `{ id, onChainId, nome, metaEth, arrecadadoEth, saldoEth, prazo, ativa, ong }`.
  `metaEth`/`arrecadadoEth`/`saldoEth` são `Number` (o `CampaignList` já usa `.toFixed`).
- `toUnixTimestamp(dateString)` → segundos (para o prazo). Pura.
- `validarNovaCampanha({ titulo, metaEth, prazo })` → `{ valido, erro }`. Pura.
- `fetchCampaigns()` → `{ status, items, message }` (igual ao `fetchPublicHistory`): lê
  `contadorCampanhas()` e faz `Promise.all` de `campanhas(1..n)`, mapeando com `normalizeCampaign`.
  Trata "sem MetaMask" e "rede errada".
- `criarCampanha({ titulo, metaEth, prazo })` → `criar_campanha(titulo, parseEther(meta), prazoUnix)`.
- `verificarOng({ carteira })` → `verificar_ong(carteira)`.
- `fetchRoles(account)` → `{ isOwner, isVerifiedOng }` via `owner()` e `ongs(account).verificada`.

`src/data/campaigns.js` é **removido** junto com todos os imports de `mockCampaigns`.

### 2. Estado central — `src/context/WalletContext.jsx`

- `campaignsState = { isLoading, items, message, status }` + `loadCampaigns()`.
- `roles = { isOwner, isVerifiedOng }` + carregamento em `initialize` e no `chainChanged`/`accountsChanged`.
- Handlers novos (envolvem `ensureReadyForTransaction`, chamam o util, dão refresh):
  - `handleCreateCampaign({ titulo, metaEth, prazo })` → refresh campanhas + histórico.
  - `handleVerifyOng({ carteira })` → refresh papéis + histórico.
- Expõe no `value`: `campaignsState`, `loadCampaigns`, `roles`, `createCampaign`, `verifyOng`.
- `campaignsState` é carregado no `initialize` junto de `syncWallet`/`loadPublicHistory`.

### 3. Criar Campanha (ONG verificada)

- `components/CreateCampaignScreen.jsx`: campos **título**, **meta (ETH)**, **prazo (date)**;
  validação com `validarNovaCampanha`; feedback com link da tx.
- `pages/CreateCampaignPage.jsx`: consome `createCampaign`, `roles.isVerifiedOng`, `wallet.account`.
  Se não for ONG verificada → aviso e form desabilitado.
- Rota `campanhas/nova`; link "Criar campanha" na navbar.

### 4. Verificar ONG (admin/owner)

- `components/VerifyOngScreen.jsx`: `WalletAddressInput` para o endereço da ONG + submit + feedback.
- `pages/VerifyOngPage.jsx`: se `roles.isOwner` for falso → aviso e form desabilitado.
- Rota `admin`; link "Admin" na navbar visível apenas quando `roles.isOwner`.

### 5. Ligar telas existentes aos dados reais

- `CampaignsPage`, `DonationPage`, `AuthorizePage`, `WithdrawPage`: trocam `mockCampaigns` por
  `campaignsState.items`. Tratam loading/vazio/erro.
- `DonationPage`: resolve a campanha por `onChainId` dentro de `items`; enquanto carrega, mostra
  loading; se não achar após carregar, redireciona para `/campanhas`.
- `CampaignList`: trata estados de loading/vazio e passa a exibir progresso e prazo.

## Estados e erros

- Sem MetaMask / rede errada: `campaignsState.status` reflete, e a lista mostra a mensagem
  (mesmo tratamento de `publicHistory`).
- `contadorCampanhas` = 0: "Nenhuma campanha ainda."
- Falha de tx: mensagem via `getBlockchainErrorMessage` (padrão atual).
- Gate de papéis é **defesa em profundidade**: a UI desabilita, mas o contrato continua sendo a
  autoridade final (`onlyOwner`, `require(verificada)`, `require(ong == msg.sender)`).

## Testes

- **Vitest** (novo no frontend) cobrindo apenas as funções puras de `utils/campaigns.js`:
  `normalizeCampaign`, `toUnixTimestamp`, `validarNovaCampanha`.
- Fluxos assinados (criar/verificar/autorizar/sacar) → verificação **manual E2E** na Sepolia via
  MetaMask. As funções equivalentes do contrato já têm testes em `contracts/test/`.
- `build` (Vite) e `lint` (ESLint) devem passar.

## Fora de escopo

- Alterar o contrato ou redeployar.
- Corrigir a inconsistência DAO ↔ DoeFacil ativo (documentada, mas não tratada aqui).
- Editar/encerrar campanhas (o contrato não expõe isso).
