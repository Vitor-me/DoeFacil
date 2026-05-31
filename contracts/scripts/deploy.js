// Script de deploy do contrato DoeFacil.
// Uso:
//   Local:   npm run deploy:local   (precisa de `npx hardhat node` rodando)
//   Sepolia: npm run deploy:sepolia  (precisa do .env configurado)
//
// OBS: o contrato "DoeFacil" e implementado pela Integrante 1. Enquanto ele
// nao existir em contracts/, este script vai falhar ao buscar o factory.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Fazendo deploy com a conta:", deployer.address);

  const saldo = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Saldo da conta:", hre.ethers.formatEther(saldo), "ETH");

  const DoeFacil = await hre.ethers.getContractFactory("DoeFacil");
  const doeFacil = await DoeFacil.deploy();
  await doeFacil.waitForDeployment();

  const endereco = await doeFacil.getAddress();
  console.log("Contrato DoeFacil publicado em:", endereco);
  console.log("Rede:", hre.network.name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
