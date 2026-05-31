# DoeFacil — Contracts (Hardhat)

Ambiente de smart contracts do DoeFacil: Solidity + Hardhat + OpenZeppelin.

## Stack
- **Hardhat** 2.x — framework de desenvolvimento/teste/deploy
- **Solidity** 0.8.28
- **OpenZeppelin Contracts** 5.x (`Ownable`, `ReentrancyGuard`)
- **Ethers.js** v6 (via hardhat-toolbox)
- **Prettier** + **solhint** + **ESLint** — formatação e lint

## Setup
```bash
cd contracts
npm install
cp .env.example .env   # preencha as variáveis (veja abaixo)
```

> No Windows (PowerShell): `Copy-Item .env.example .env`

## Variáveis de ambiente (.env)
Necessárias **apenas** para deploy na testnet. Em local não precisa.
- `SEPOLIA_RPC_URL` — endpoint do Alchemy/Infura
- `PRIVATE_KEY` — chave de uma carteira **só de testnet**
- `ETHERSCAN_API_KEY` — para verificar o contrato

## Comandos
| Comando | O que faz |
|---|---|
| `npm run compile` | Compila os contratos |
| `npm test` | Roda os testes |
| `npm run coverage` | Cobertura de testes |
| `npm run node` | Sobe um node local (porta 8545) |
| `npm run deploy:local` | Deploy no node local |
| `npm run deploy:sepolia` | Deploy na testnet Sepolia |
| `npm run lint` | ESLint + solhint + Prettier (check) |
| `npm run format` | Formata o código com Prettier |

## Estrutura
```
contracts/
├─ contracts/   # arquivos .sol (Integrante 1)
├─ scripts/     # scripts de deploy (Integrante 2)
├─ test/        # testes (Integrante 4)
└─ hardhat.config.js
```
