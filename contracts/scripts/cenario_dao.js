// Cenario de exemplo da DoeFacil DAO (para teste manual / ensaio da demo).
//
// Faz o deploy local de GovToken + DoeFacil + DoeFacilDAO, transfere a posse do
// DoeFacil para a DAO e percorre o ciclo completo de votacao, passo a passo:
// mint -> delegate -> criar proposta -> votar -> avancar o tempo -> executar ->
// conferir que a ONG ficou verificada on-chain. Imprime contas, hashes e estado.
//
// Uso:
//   Rede em memoria:  npm run cenario:dao        (rapido, nao precisa de node)
//   Node local:       npm run cenario:dao:local  (precisa de `npx hardhat node`)
const hre = require("hardhat");

const ethers = hre.ethers;

const ESTADO_LABEL = ["Ativa", "Aprovada", "Rejeitada", "Executada"];

// Parametros de governanca do cenario (votingPeriod curto para a demo local).
const VOTING_PERIOD = 60; // 60 s
const QUORUM_PERCENT = 20;
const PROPOSAL_THRESHOLD = ethers.parseEther("1");

function passo(n, titulo) {
  console.log(`\n=== Passo ${n}: ${titulo} ===`);
}

// Executa uma transacao, espera a confirmacao e imprime hash + gas usado.
async function enviar(descricao, txPromise) {
  const tx = await txPromise;
  const recibo = await tx.wait();
  console.log(`  ${descricao}`);
  console.log(`    tx:  ${tx.hash}`);
  console.log(`    gas: ${recibo.gasUsed.toString()}`);
  return recibo;
}

// Avanca o relogio da rede local (so funciona em hardhat/localhost).
async function avancarTempo(segundos) {
  await hre.network.provider.send("evm_increaseTime", [segundos]);
  await hre.network.provider.send("evm_mine");
}

async function main() {
  const [deployer, membroA, membroB, membroC, ongAlvo] = await ethers.getSigners();

  console.log("Rede:", hre.network.name);
  console.log("Contas do cenario:");
  console.log("  deployer (owner do token):", deployer.address);
  console.log("  membroA:                  ", membroA.address);
  console.log("  membroB:                  ", membroB.address);
  console.log("  membroC:                  ", membroC.address);
  console.log("  ongAlvo (a ser verificada):", ongAlvo.address);

  // --- Deploy ---
  passo(0, "Deploy de GovToken + DoeFacil + DAO");
  const GovToken = await ethers.getContractFactory("GovToken");
  const token = await GovToken.deploy();
  await token.waitForDeployment();
  console.log("  GovToken:", await token.getAddress());

  const DoeFacil = await ethers.getContractFactory("DoeFacil");
  const doeFacil = await DoeFacil.deploy();
  await doeFacil.waitForDeployment();
  console.log("  DoeFacil:", await doeFacil.getAddress());

  const DAO = await ethers.getContractFactory("DoeFacilDAO");
  const dao = await DAO.deploy(
    await token.getAddress(),
    await doeFacil.getAddress(),
    VOTING_PERIOD,
    QUORUM_PERCENT,
    PROPOSAL_THRESHOLD,
  );
  await dao.waitForDeployment();
  console.log("  DoeFacilDAO:", await dao.getAddress());

  await enviar(
    "Transfere a posse do DoeFacil para a DAO",
    doeFacil.transferOwnership(await dao.getAddress()),
  );

  // --- Passo 1: distribui tokens e delega ---
  passo(1, "Mint de 10 DFG para cada membro + delegate");
  for (const [nome, membro] of [
    ["membroA", membroA],
    ["membroB", membroB],
    ["membroC", membroC],
  ]) {
    await enviar(`mint(${nome}, 10 DFG)`, token.mint(membro.address, ethers.parseEther("10")));
    await enviar(`${nome}.delegate(self)`, token.connect(membro).delegate(membro.address));
  }
  console.log("  supply total:", ethers.formatEther(await token.totalSupply()), "DFG");

  // --- Passo 2: membroA cria a proposta ---
  passo(2, "membroA cria proposta para verificar a ongAlvo");
  await enviar(
    `criarProposta(${ongAlvo.address}, "Verificar ONG Agua Viva")`,
    dao.connect(membroA).criarProposta(ongAlvo.address, "Verificar ONG Agua Viva"),
  );
  console.log("  quorum necessario:", ethers.formatEther(await dao.quorumNecessario(1)), "DFG");
  console.log("  estado:", ESTADO_LABEL[Number(await dao.estado(1))]);

  // --- Passo 3: votacao (A e B a favor, C contra) ---
  passo(3, "Membros votam (A e B a favor, C contra)");
  await enviar("membroA.votar(1, a favor)", dao.connect(membroA).votar(1, true));
  await enviar("membroB.votar(1, a favor)", dao.connect(membroB).votar(1, true));
  await enviar("membroC.votar(1, contra)", dao.connect(membroC).votar(1, false));
  const pVotos = await dao.propostas(1);
  console.log("  votosFavor:", ethers.formatEther(pVotos.votosFavor), "DFG");
  console.log("  votosContra:", ethers.formatEther(pVotos.votosContra), "DFG");

  // --- Passo 4: encerra o prazo e executa ---
  passo(4, "Avanca o tempo e executa a proposta aprovada");
  await avancarTempo(VOTING_PERIOD + 1);
  console.log("  estado apos o prazo:", ESTADO_LABEL[Number(await dao.estado(1))]);
  await enviar("executar(1)", dao.executar(1));

  // --- Resultado ---
  passo(5, "Resultado on-chain");
  const ong = await doeFacil.ongs(ongAlvo.address);
  console.log("  estado da proposta:", ESTADO_LABEL[Number(await dao.estado(1))]);
  console.log("  ongAlvo verificada?", ong.verificada);

  if (!ong.verificada) {
    throw new Error("Falha: a ONG deveria estar verificada apos a execucao.");
  }
  console.log("\nCenario da DAO concluido com sucesso: a votacao verificou a ONG.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
