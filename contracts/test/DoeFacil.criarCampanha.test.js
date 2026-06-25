// Testes da funcao criar_campanha: so ONG verificada, meta > 0 e prazo futuro.
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { deployDoeFacilFixture, deployComOngVerificadaFixture } = require("./fixtures");

async function prazoFuturo() {
  return (await time.latest()) + 7 * 24 * 60 * 60;
}

describe("DoeFacil — criar_campanha", function () {
  it("ONG verificada cria a campanha e emite o evento", async function () {
    const { doeFacil, ong } = await loadFixture(deployComOngVerificadaFixture);
    const meta = hre.ethers.parseEther("10");
    const prazo = await prazoFuturo();

    await expect(doeFacil.connect(ong).criar_campanha("Cestas Basicas", meta, prazo))
      .to.emit(doeFacil, "campanha_criada")
      .withArgs(1, "Cestas Basicas", meta);

    expect(await doeFacil.contadorCampanhas()).to.equal(1);

    const campanha = await doeFacil.campanhas(1);
    expect(campanha.ong).to.equal(ong.address);
    expect(campanha.titulo).to.equal("Cestas Basicas");
    expect(campanha.meta_arrecadacao).to.equal(meta);
    expect(campanha.total_arrecadado).to.equal(0);
    expect(campanha.saldo).to.equal(0);
    expect(campanha.prazo).to.equal(prazo);
    expect(campanha.ativa).to.equal(true);
  });

  it("incrementa o id a cada nova campanha", async function () {
    const { doeFacil, ong } = await loadFixture(deployComOngVerificadaFixture);
    const meta = hre.ethers.parseEther("1");
    const prazo = await prazoFuturo();

    await doeFacil.connect(ong).criar_campanha("A", meta, prazo);
    await doeFacil.connect(ong).criar_campanha("B", meta, prazo);

    expect(await doeFacil.contadorCampanhas()).to.equal(2);
    expect((await doeFacil.campanhas(2)).titulo).to.equal("B");
  });

  it("reverte se a ONG nao for verificada", async function () {
    const { doeFacil, ong } = await loadFixture(deployDoeFacilFixture);
    const prazo = await prazoFuturo();

    await expect(
      doeFacil.connect(ong).criar_campanha("X", hre.ethers.parseEther("1"), prazo),
    ).to.be.revertedWith("Somente ONGs verificadas podem criar campanhas");
  });

  it("reverte se a meta for zero", async function () {
    const { doeFacil, ong } = await loadFixture(deployComOngVerificadaFixture);
    const prazo = await prazoFuturo();

    await expect(doeFacil.connect(ong).criar_campanha("X", 0, prazo)).to.be.revertedWith(
      "A meta deve ser maior que zero",
    );
  });

  it("reverte se o prazo nao estiver no futuro", async function () {
    const { doeFacil, ong } = await loadFixture(deployComOngVerificadaFixture);
    const passado = (await time.latest()) - 1;

    await expect(
      doeFacil.connect(ong).criar_campanha("X", hre.ethers.parseEther("1"), passado),
    ).to.be.revertedWith("O prazo deve ser uma data no futuro");
  });
});
