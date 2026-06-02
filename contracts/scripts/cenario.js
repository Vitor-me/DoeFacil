// Cenario de exemplo do DoeFacil (para teste manual da equipe).
//
// Faz o deploy local e percorre o fluxo tipico de uso, passo a passo, imprimindo
// contas, hashes de transacao e saldos. Serve para a equipe ver o caminho feliz
// rodando de ponta a ponta.
//
// Uso:
//   Rede em memoria:  npm run cenario        (rapido, nao precisa de node)
//   Node local:       npm run cenario:local  (precisa de `npx hardhat node`)
//
// OBS: as funcoes do contrato ainda sao stubs (a logica e dos Sprints 2/3 da
// Integrante 1). As transacoes executam sem reverter, mas ainda nao alteram o
// estado nem emitem eventos. Os passos marcados com [STUB] passam a ter efeito
// real quando a logica for implementada.
const hre = require("hardhat");

const ethers = hre.ethers;

// Imprime um cabecalho de passo para facilitar a leitura no terminal.
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

async function saldoContrato(endereco) {
  const saldo = await ethers.provider.getBalance(endereco);
  return ethers.formatEther(saldo);
}

async function main() {
  const [admin, ong, doador, fornecedor] = await ethers.getSigners();

  console.log("Rede:", hre.network.name);
  console.log("Contas do cenario:");
  console.log("  admin (owner):", admin.address);
  console.log("  ong:          ", ong.address);
  console.log("  doador:       ", doador.address);
  console.log("  fornecedor:   ", fornecedor.address);

  // --- Deploy ---
  passo(0, "Deploy do contrato");
  const DoeFacil = await ethers.getContractFactory("DoeFacil");
  const doeFacil = await DoeFacil.deploy();
  await doeFacil.waitForDeployment();
  const endereco = await doeFacil.getAddress();
  console.log("  DoeFacil publicado em:", endereco);
  console.log("  owner:", await doeFacil.owner());

  // --- Passo 1: admin verifica a ONG ---
  passo(1, "Admin verifica a ONG [STUB]");
  await enviar(`verificar_ong(${ong.address})`, doeFacil.connect(admin).verificar_ong(ong.address));

  // --- Passo 2: ONG cria uma campanha ---
  passo(2, "ONG cria uma campanha [STUB]");
  const meta = ethers.parseEther("10"); // meta de 10 ETH
  const umaSemana = 7 * 24 * 60 * 60;
  const prazo = (await ethers.provider.getBlock("latest")).timestamp + umaSemana;
  await enviar(
    `criar_campanha("Agua potavel", ${ethers.formatEther(meta)} ETH, prazo +7d)`,
    doeFacil.connect(ong).criar_campanha("Agua potavel", meta, prazo),
  );

  // --- Passo 3: doador faz uma doacao ---
  passo(3, "Doador doa para a campanha 0");
  const valorDoacao = ethers.parseEther("1");
  console.log("  saldo do contrato antes:", await saldoContrato(endereco), "ETH");
  await enviar(
    `doar(0) enviando ${ethers.formatEther(valorDoacao)} ETH`,
    doeFacil.connect(doador).doar(0, { value: valorDoacao }),
  );
  console.log("  saldo do contrato depois:", await saldoContrato(endereco), "ETH");

  // --- Passo 4: admin autoriza um fornecedor ---
  passo(4, "Admin autoriza um fornecedor para a campanha 0 [STUB]");
  await enviar(
    `autorizar_fornecedor(0, ${fornecedor.address})`,
    doeFacil.connect(admin).autorizar_fornecedor(0, fornecedor.address),
  );

  console.log("\nCenario concluido. (sacar() fica para o Sprint 3)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
