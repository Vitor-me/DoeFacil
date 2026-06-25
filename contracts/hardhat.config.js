require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Le as variaveis de ambiente do arquivo .env (copie de .env.example).
// Em desenvolvimento local nenhuma delas e obrigatoria.
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    // Rede em memoria usada nos testes (padrao).
    hardhat: {},
    // Node local: `npx hardhat node` (usado pelo deploy:local).
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Testnet publica. So e usada se SEPOLIA_RPC_URL e PRIVATE_KEY existirem.
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    // Usado por `npx hardhat verify` para verificar o contrato na Sepolia.
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || undefined,
  },
};
