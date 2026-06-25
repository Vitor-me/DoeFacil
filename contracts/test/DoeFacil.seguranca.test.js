// Teste de seguranca: prova que `sacar` resiste a um ataque de reentrancia.
//
// O AtacanteReentrancia e autorizado como fornecedor e, ao receber o ETH do
// saque, tenta reentrar em `sacar` para drenar a campanha. O contrato deve
// bloquear a reentrada (nonReentrant + Checks-Effects-Interactions), entregando
// apenas o valor legitimo.
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { deployComCampanhaFixture } = require("./fixtures");

async function comAtacante() {
  const ctx = await loadFixture(deployComCampanhaFixture);
  // 5 ETH na campanha — o suficiente para um eventual saque duplo (2x3 ETH).
  await ctx.doeFacil.connect(ctx.doador).doar(ctx.campanhaID, {
    value: hre.ethers.parseEther("5"),
  });

  const Atacante = await hre.ethers.getContractFactory("AtacanteReentrancia");
  const atacante = await Atacante.deploy(ctx.endereco);
  await atacante.waitForDeployment();
  const atacanteEndereco = await atacante.getAddress();

  return { ...ctx, atacante, atacanteEndereco };
}

describe("DoeFacil — seguranca (reentrancia no sacar)", function () {
  it("bloqueia a reentrada e entrega apenas o valor legitimo", async function () {
    const { doeFacil, endereco, ong, campanhaID, atacante, atacanteEndereco } = await comAtacante();

    const valor = hre.ethers.parseEther("3");
    await doeFacil.connect(ong).autorizar_fornecedor(campanhaID, atacanteEndereco);
    await atacante.configurar(campanhaID, valor);

    // O saque legitimo deve concluir, transferindo exatamente `valor`.
    await expect(
      doeFacil.connect(ong).sacar(campanhaID, valor, atacanteEndereco),
    ).to.changeEtherBalance(atacante, valor);

    // A reentrada foi tentada e bloqueada.
    expect(await atacante.tentativasReentrada()).to.equal(1);
    expect(await atacante.reentradaBloqueada()).to.equal(true);

    // Nao houve saque duplo: sobra 5 - 3 = 2 ETH na campanha e no contrato.
    expect(await doeFacil.consultar_saldo(campanhaID)).to.equal(hre.ethers.parseEther("2"));
    expect(await hre.ethers.provider.getBalance(endereco)).to.equal(hre.ethers.parseEther("2"));
  });
});
