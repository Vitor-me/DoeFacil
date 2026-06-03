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

## Deploy na Sepolia (passo a passo)
Os passos 1–3 são manuais (contas externas); o passo 4 é um comando.

1. **API key de RPC** — crie uma conta no [Alchemy](https://alchemy.com) (ou Infura),
   crie um app na rede **Ethereum → Sepolia** e copie a URL HTTPS para `SEPOLIA_RPC_URL`.
2. **Carteira de testnet** — no MetaMask, crie uma conta **nova** (não use carteira com
   fundos reais), exporte a chave privada e coloque em `PRIVATE_KEY`.
3. **ETH de faucet** — pegue Sepolia ETH em um faucet (ex.: [Google Cloud](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
   ou o faucet do Alchemy) para o endereço dessa carteira.
4. **Deploy + verify**:
   ```bash
   npm run deploy:sepolia
   ```
   O script faz o pré-voo (confere `.env` e saldo), publica o contrato, salva
   `deployments/sepolia.json` (endereço + ABI, versionado para o frontend) e
   verifica o código no Etherscan automaticamente (se `ETHERSCAN_API_KEY` estiver setada).

Após o deploy, confirme o endereço no [Sepolia Etherscan](https://sepolia.etherscan.io)
e faça commit do `deployments/sepolia.json`.

## Estrutura
```
contracts/
├─ contracts/   # arquivos .sol (Integrante 1)
├─ scripts/     # scripts de deploy (Integrante 2)
├─ test/        # testes (Integrante 4)
└─ hardhat.config.js
```
