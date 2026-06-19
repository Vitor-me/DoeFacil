// Script de deploy do contrato DoeFacil.
// Uso:
//   Local:   npm run deploy:local   (precisa de `npx hardhat node` rodando)
//   Sepolia: npm run deploy:sepolia  (precisa do .env configurado)
//
// OBS: o contrato "DoeFacil" (contracts/DoeFacil.sol) e mantido pela Integrante
// 1. Rode `npm run compile` antes do deploy para gerar os artifacts atualizados.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const NOME_CONTRATO = "DoeFacil";

// Redes em memoria/local nao precisam de .env nem de verify no Etherscan.
const REDES_LOCAIS = ["hardhat", "localhost"];

// Confere, antes de gastar gas, que o ambiente esta pronto para uma rede
// publica (Sepolia). Falha cedo e com mensagem clara em vez de estourar um
// erro cru do provider la na frente.
async function checarPreVoo(deployer) {
  if (REDES_LOCAIS.includes(hre.network.name)) return;

  const faltando = [];
  if (!process.env.SEPOLIA_RPC_URL) faltando.push("SEPOLIA_RPC_URL");
  if (!process.env.PRIVATE_KEY) faltando.push("PRIVATE_KEY");
  if (faltando.length > 0) {
    throw new Error(
      `Variaveis de ambiente faltando para a rede "${hre.network.name}": ` +
        `${faltando.join(", ")}. Copie .env.example para .env e preencha.`,
    );
  }

  const saldo = await hre.ethers.provider.getBalance(deployer.address);
  if (saldo === 0n) {
    throw new Error(
      `A conta ${deployer.address} esta com 0 ETH na rede "${hre.network.name}". ` +
        "Use um faucet de Sepolia para obter ETH de testnet antes do deploy.",
    );
  }
}

// Verifica o codigo-fonte no Etherscan para que o contrato fique legivel no
// explorador. Roda so em rede publica e quando ha ETHERSCAN_API_KEY. O
// DoeFacil nao tem argumentos de construtor, entao nao passamos nada.
async function verificarNoEtherscan(endereco) {
  if (REDES_LOCAIS.includes(hre.network.name)) return;
  if (!process.env.ETHERSCAN_API_KEY) {
    console.log("ETHERSCAN_API_KEY ausente — pulando a verificacao.");
    return;
  }

  try {
    await hre.run("verify:verify", { address: endereco, constructorArguments: [] });
    console.log("Contrato verificado no Etherscan.");
  } catch (erro) {
    const msg = String(erro.message || erro);
    if (msg.toLowerCase().includes("already verified")) {
      console.log("Contrato ja estava verificado no Etherscan.");
    } else {
      console.warn("Falha ao verificar no Etherscan (deploy continua valido):", msg);
    }
  }
}

// Salva endereco + ABI da rede atual em deployments/<rede>.json. E o arquivo
// que o frontend (MetaMask/ethers) usa para saber onde o contrato esta e como
// chamar suas funcoes. Reescrito a cada deploy.
//
// Tambem copia o mesmo JSON para frontend/src/contracts/<rede>.json, para o
// front-end consumir endereco+ABI direto da pasta dele (sem caminho relativo
// pra fora do projeto frontend).
async function salvarDeployment(endereco, deployer) {
  const artifact = await hre.artifacts.readArtifact(NOME_CONTRATO);
  const { chainId } = await hre.ethers.provider.getNetwork();

  const info = {
    contrato: NOME_CONTRATO,
    rede: hre.network.name,
    chainId: Number(chainId),
    endereco,
    deployer: deployer.address,
    publicadoEm: new Date().toISOString(),
    abi: artifact.abi,
  };

  const conteudo = `${JSON.stringify(info, null, 2)}\n`;
  const arquivos = [
    path.join(__dirname, "..", "deployments", `${hre.network.name}.json`),
    path.join(__dirname, "..", "..", "frontend", "src", "contracts", `${hre.network.name}.json`),
  ];

  return arquivos.map((arquivo) => {
    fs.mkdirSync(path.dirname(arquivo), { recursive: true });
    fs.writeFileSync(arquivo, conteudo);
    return path.relative(process.cwd(), arquivo);
  });
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  await checarPreVoo(deployer);

  console.log("Fazendo deploy com a conta:", deployer.address);

  const saldo = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Saldo da conta:", hre.ethers.formatEther(saldo), "ETH");

  const DoeFacil = await hre.ethers.getContractFactory(NOME_CONTRATO);
  const doeFacil = await DoeFacil.deploy();
  await doeFacil.waitForDeployment();

  const endereco = await doeFacil.getAddress();
  console.log("Contrato DoeFacil publicado em:", endereco);
  console.log("Rede:", hre.network.name);

  const arquivos = await salvarDeployment(endereco, deployer);
  console.log("Endereco + ABI salvos em:");
  for (const arquivo of arquivos) {
    console.log("  -", arquivo);
  }

  // Em rede publica, espera algumas confirmacoes para o bloco se propagar
  // antes de pedir a verificacao ao Etherscan.
  if (!REDES_LOCAIS.includes(hre.network.name)) {
    console.log("Aguardando 5 confirmacoes antes de verificar...");
    await doeFacil.deploymentTransaction().wait(5);
    await verificarNoEtherscan(endereco);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
