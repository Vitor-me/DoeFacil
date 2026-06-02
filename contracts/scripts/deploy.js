// Script de deploy do contrato DoeFacil.
// Uso:
//   Local:   npm run deploy:local   (precisa de `npx hardhat node` rodando)
//   Sepolia: npm run deploy:sepolia  (precisa do .env configurado)
//
// OBS: o contrato "DoeFacil" e implementado pela Integrante 1. Enquanto ele
// nao existir em contracts/, este script vai falhar ao buscar o factory.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const NOME_CONTRATO = "DoeFacil";

// Salva endereco + ABI da rede atual em deployments/<rede>.json. E o arquivo
// que o frontend (MetaMask/ethers) usa para saber onde o contrato esta e como
// chamar suas funcoes. Reescrito a cada deploy.
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

  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  const arquivo = path.join(dir, `${hre.network.name}.json`);
  fs.writeFileSync(arquivo, `${JSON.stringify(info, null, 2)}\n`);

  return path.relative(process.cwd(), arquivo);
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Fazendo deploy com a conta:", deployer.address);

  const saldo = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Saldo da conta:", hre.ethers.formatEther(saldo), "ETH");

  const DoeFacil = await hre.ethers.getContractFactory(NOME_CONTRATO);
  const doeFacil = await DoeFacil.deploy();
  await doeFacil.waitForDeployment();

  const endereco = await doeFacil.getAddress();
  console.log("Contrato DoeFacil publicado em:", endereco);
  console.log("Rede:", hre.network.name);

  const arquivo = await salvarDeployment(endereco, deployer);
  console.log("Endereco + ABI salvos em:", arquivo);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
