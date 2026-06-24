const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { deployDaoFixture } = require("./dao-fixtures");

describe("DoeFacilDAO — criarProposta", function () {
  it("membro com poder de voto suficiente cria proposta", async function () {
    const { dao, membroA, ongAlvo, darPoder } = await loadFixture(deployDaoFixture);
    await darPoder(membroA, 5);

    await expect(dao.connect(membroA).criarProposta(ongAlvo.address, "Verificar ONG X"))
      .to.emit(dao, "PropostaCriada");

    const p = await dao.propostas(1);
    expect(p.proponente).to.equal(membroA.address);
    expect(p.ongAlvo).to.equal(ongAlvo.address);
    expect(p.executada).to.equal(false);
    expect(await dao.contadorPropostas()).to.equal(1n);
  });

  it("rejeita proposta de quem nao atinge o proposalThreshold", async function () {
    const { dao, membroB, ongAlvo } = await loadFixture(deployDaoFixture);
    await expect(
      dao.connect(membroB).criarProposta(ongAlvo.address, "Sem tokens"),
    ).to.be.revertedWith("Poder de voto insuficiente para propor");
  });

  it("rejeita ONG alvo zero", async function () {
    const { dao, membroA, darPoder } = await loadFixture(deployDaoFixture);
    await darPoder(membroA, 5);
    await expect(
      dao.connect(membroA).criarProposta(hre.ethers.ZeroAddress, "ONG invalida"),
    ).to.be.revertedWith("ONG alvo invalida");
  });
});
