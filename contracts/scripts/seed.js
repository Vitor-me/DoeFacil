// Semeia campanhas de exemplo no contrato DoeFacil ja deployado.
// Uso: npm run seed:sepolia  (precisa do .env com a carteira owner/deployer)
//
// Idempotente de forma simples: se ja houver campanhas, nao faz nada.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const deploymentPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}.json`,
  );
  const { endereco } = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const [deployer] = await hre.ethers.getSigners();
  const doeFacil = await hre.ethers.getContractAt("DoeFacil", endereco, deployer);

  const total = await doeFacil.contadorCampanhas();
  if (total > 0n) {
    console.log(`Ja existem ${total} campanha(s). Nada a fazer.`);
    return;
  }

  console.log("Verificando a carteira deployer como ONG:", deployer.address);
  const verifTx = await doeFacil.verificar_ong(deployer.address);
  await verifTx.wait();

  const campanhas = [
    { titulo: "Cestas Basicas para Familias", metaEth: "12" },
    { titulo: "Ajuda para Tratamento Infantil", metaEth: "20" },
    { titulo: "Reconstrucao de Moradias", metaEth: "30" },
  ];

  const umAno = 365 * 24 * 60 * 60;
  const bloco = await hre.ethers.provider.getBlock("latest");
  const prazo = bloco.timestamp + umAno;

  for (const c of campanhas) {
    const tx = await doeFacil.criar_campanha(
      c.titulo,
      hre.ethers.parseEther(c.metaEth),
      prazo,
    );
    await tx.wait();
    console.log(`Campanha criada: ${c.titulo} (meta ${c.metaEth} ETH)`);
  }

  const totalFinal = await doeFacil.contadorCampanhas();
  console.log("Total de campanhas agora:", totalFinal.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
