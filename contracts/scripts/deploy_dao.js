// Deploy da DoeFacil DAO: publica GovToken + um DoeFacil novo + DoeFacilDAO,
// transfere a posse do DoeFacil para a DAO e grava endereco+ABI dos contratos
// (DAO e GovToken) em deployments/ e em frontend/src/contracts/.
//
// Uso:
//   Local:   npx hardhat run scripts/deploy_dao.js --network localhost
//   Sepolia: npm run deploy:dao:sepolia   (precisa do .env configurado)
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const REDES_LOCAIS = ["hardhat", "localhost"];

// Parametros de governanca. votingPeriod curto na testnet para a demo ao vivo.
const VOTING_PERIOD = 300; // 5 min
const QUORUM_PERCENT = 20;
const PROPOSAL_THRESHOLD = hre.ethers.parseEther("1");

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
      `A conta ${deployer.address} esta com 0 ETH na rede "${hre.network.name}".`,
    );
  }
}

// Grava endereco+ABI de um contrato em deployments/<arquivo> e em
// frontend/src/contracts/<arquivo>.
async function salvar(nomeContrato, endereco, deployer, nomeArquivo) {
  const artifact = await hre.artifacts.readArtifact(nomeContrato);
  const { chainId } = await hre.ethers.provider.getNetwork();
  const info = {
    contrato: nomeContrato,
    rede: hre.network.name,
    chainId: Number(chainId),
    endereco,
    deployer: deployer.address,
    publicadoEm: new Date().toISOString(),
    abi: artifact.abi,
  };
  const conteudo = `${JSON.stringify(info, null, 2)}\n`;
  const arquivos = [
    path.join(__dirname, "..", "deployments", nomeArquivo),
    path.join(__dirname, "..", "..", "frontend", "src", "contracts", nomeArquivo),
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
  console.log("Deploy da DAO com a conta:", deployer.address);

  const GovToken = await hre.ethers.getContractFactory("GovToken");
  const token = await GovToken.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("GovToken:", tokenAddr);

  const DoeFacil = await hre.ethers.getContractFactory("DoeFacil");
  const doeFacil = await DoeFacil.deploy();
  await doeFacil.waitForDeployment();
  const doeFacilAddr = await doeFacil.getAddress();
  console.log("DoeFacil (novo):", doeFacilAddr);

  const DAO = await hre.ethers.getContractFactory("DoeFacilDAO");
  const dao = await DAO.deploy(
    tokenAddr,
    doeFacilAddr,
    VOTING_PERIOD,
    QUORUM_PERCENT,
    PROPOSAL_THRESHOLD,
  );
  await dao.waitForDeployment();
  const daoAddr = await dao.getAddress();
  console.log("DoeFacilDAO:", daoAddr);

  const tx = await doeFacil.transferOwnership(daoAddr);
  await tx.wait();
  console.log("Posse do DoeFacil transferida para a DAO.");

  const salvos = [
    ...(await salvar("DoeFacilDAO", daoAddr, deployer, "sepoliaDAO.json")),
    ...(await salvar("GovToken", tokenAddr, deployer, "sepoliaGovToken.json")),
  ];
  console.log("Enderecos + ABI salvos em:");
  for (const arquivo of salvos) console.log("  -", arquivo);

  console.log(
    "\nProximo passo: minte tokens aos membros e cada membro chama delegate().",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
