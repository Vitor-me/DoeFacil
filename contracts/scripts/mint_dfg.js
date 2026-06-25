// Minta tokens de governanca DFG para um endereco. Apenas o owner do GovToken
// (a conta deployer em .env) pode mintar. Use para dar poder de voto aos membros
// antes da demo. Depois, cada membro precisa chamar delegate(self) na carteira
// dele (ha um botao "Delegar poder de voto" na tela de Governanca).
//
// Uso (PowerShell):
//   $env:DFG_PARA="0xSEU_ENDERECO"; $env:DFG_QTD="10"; npm run mint:dfg:sepolia
//
// DFG_QTD e opcional (padrao 10).
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const para = process.env.DFG_PARA;
  const qtd = process.env.DFG_QTD || "10";
  if (!para) {
    throw new Error(
      'Defina DFG_PARA com o endereco que recebe os tokens. Ex.: $env:DFG_PARA="0x..."',
    );
  }

  const arquivo = path.join(__dirname, "..", "deployments", "sepoliaGovToken.json");
  if (!fs.existsSync(arquivo)) {
    throw new Error(
      "deployments/sepoliaGovToken.json nao encontrado. Rode o deploy da DAO antes (npm run deploy:dao:sepolia).",
    );
  }
  const info = JSON.parse(fs.readFileSync(arquivo, "utf8"));

  const [owner] = await hre.ethers.getSigners();
  console.log("Mintando com a conta owner:", owner.address);
  console.log("GovToken:", info.endereco);

  const token = await hre.ethers.getContractAt("GovToken", info.endereco);
  const tx = await token.mint(para, hre.ethers.parseEther(qtd));
  await tx.wait();

  const saldo = await token.balanceOf(para);
  console.log(`Mintado ${qtd} DFG para ${para}.`);
  console.log("  tx:", tx.hash);
  console.log("  saldo do destinatario:", hre.ethers.formatEther(saldo), "DFG");
  console.log(
    "\nProximo passo: o dono dessa carteira deve clicar 'Delegar poder de voto' na tela de Governanca.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
