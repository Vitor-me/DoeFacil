# DoeFacil

Plataforma de doações transparentes para ONGs utilizando Ethereum e Solidity.

## Objetivo

Permitir que ONGs verificadas recebam doações em ETH com total transparência
através da blockchain. Os recursos só saem da campanha para **fornecedores
autorizados** pela própria ONG, e a verificação de novas ONGs pode ser decidida
por uma **DAO de governança** (votação com tokens DFG).

## Tecnologias

- Solidity + OpenZeppelin (`Ownable`, `ReentrancyGuard`, `ERC20Votes`)
- Hardhat
- React + Vite
- Ethers.js
- MetaMask
- Sepolia Testnet
- Deploy do frontend na Vercel

## Aplicação no ar

- **Frontend (produção):** https://doe-facil-theta.vercel.app/
  (conecte a MetaMask na rede **Sepolia**)

## Contratos publicados (Sepolia)

| Contrato         | Endereço                                     |
| ---------------- | -------------------------------------------- |
| `DoeFacil`       | `0xf6Ca4554C95a31F58dEB3307e74511D3b48927AD` |
| `DoeFacilDAO`    | `0xe1C5675951B75B184bf97033E72E622d7EC0a7C0` |
| `GovToken` (DFG) | `0xB0963cDdFaF4E39fe5fFf76212ac32D53814Cd99` |

Endereços e ABIs ficam versionados em `contracts/deployments/` e
`frontend/src/contracts/`.

## Estrutura do repositório

```
contracts/   # Smart contracts (Solidity), testes e scripts Hardhat
frontend/    # Aplicação React + Vite integrada via Ethers.js/MetaMask
docs/        # Documentação por integrante e da DAO
```

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- MetaMask no navegador

### Contratos

```bash
cd contracts
npm install
npm run compile       # compila os contratos
npm test              # roda a suíte de testes (unidade + segurança + DAO)
npm run cenario:local # cenário de exemplo numa rede Hardhat local
```

### Frontend

```bash
cd frontend
npm install
npm run dev           # ambiente de desenvolvimento (http://localhost:5173)
npm run build         # build de produção (gera dist/)
```

O frontend lê o endereço e a ABI do contrato de `src/contracts/sepolia.json`,
então **não há variáveis de ambiente a configurar** no app.

## Deploy

### Contratos na Sepolia

Configure `contracts/.env` a partir de `.env.example` (RPC do Alchemy/Infura e
chave privada do deployer) e rode:

```bash
cd contracts
npm run deploy:sepolia      # DoeFacil
npm run deploy:dao:sepolia  # GovToken + DoeFacilDAO
npm run seed:sepolia        # cria 3 campanhas de exemplo (idempotente)
```

### Frontend na Vercel

App Vite estático (Root Directory = `frontend`). Detalhes em
`docs/Integrante_2_Deploy_Infra.md`.

## Testes

A suíte cobre as regras de negócio e a segurança do contrato `DoeFacil`:

- `verificar_ong` — só o owner verifica ONGs.
- `criar_campanha` — só ONG verificada, meta > 0 e prazo futuro.
- `doar` — registra ETH, atualiza arrecadado/saldo e respeita o prazo.
- `autorizar_fornecedor` / `sacar` — restritos à ONG dona e a fornecedores
  autorizados, com padrão Checks-Effects-Interactions.
- **Segurança:** teste de ataque de reentrância no `sacar` (contrato malicioso
  `AtacanteReentrancia`) provando que o saque é seguro.
- DAO: `GovToken`, criação/votação/execução de propostas com quorum e snapshot.

```bash
cd contracts && npm test
```

## Equipe

- **João Gabriel Miranda Loiola Araújo**
- **Fabricyo Silva Veras dos Santos**
- **Pedro Afonso Cavalcante Paz**
- **Antonio Victor Carvalho**
