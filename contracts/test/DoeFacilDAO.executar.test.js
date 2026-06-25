const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { deployDaoFixture } = require("./dao-fixtures");

const Estado = { Ativa: 0, Aprovada: 1, Rejeitada: 2, Executada: 3 };

async function comTresMembros() {
  const ctx = await loadFixture(deployDaoFixture);
  const { darPoder, membroA, membroB, membroC } = ctx;
  await darPoder(membroA, 10);
  await darPoder(membroB, 10);
  await darPoder(membroC, 10);
  await ctx.dao.connect(membroA).criarProposta(ctx.ongAlvo.address, "Verificar ONG X");
  return ctx;
}

describe("DoeFacilDAO — executar", function () {
  it("aprovada com quorum: executa e verifica a ONG", async function () {
    const ctx = await comTresMembros();
    const { dao, doeFacil, ongAlvo, membroA, membroB, votingPeriod } = ctx;
    await dao.connect(membroA).votar(1, true);
    await dao.connect(membroB).votar(1, true);
    await time.increase(votingPeriod + 1);

    expect(await dao.estado(1)).to.equal(Estado.Aprovada);
    await expect(dao.executar(1)).to.emit(dao, "PropostaExecutada").withArgs(1, ongAlvo.address);

    const ong = await doeFacil.ongs(ongAlvo.address);
    expect(ong.verificada).to.equal(true);
    expect(await dao.estado(1)).to.equal(Estado.Executada);
  });

  it("nao executa antes do prazo", async function () {
    const ctx = await comTresMembros();
    await ctx.dao.connect(ctx.membroA).votar(1, true);
    await ctx.dao.connect(ctx.membroB).votar(1, true);
    await expect(ctx.dao.executar(1)).to.be.revertedWith("Votacao ainda aberta");
  });

  it("rejeitada por falta de quorum: nao executa", async function () {
    const ctx = await comTresMembros();
    await time.increase(ctx.votingPeriod + 1);
    expect(await ctx.dao.estado(1)).to.equal(Estado.Rejeitada);
    await expect(ctx.dao.executar(1)).to.be.revertedWith("Proposta nao aprovada");
  });

  it("rejeitada quando ha mais votos contra", async function () {
    const ctx = await comTresMembros();
    const { dao, membroA, membroB, membroC, votingPeriod } = ctx;
    await dao.connect(membroA).votar(1, true);
    await dao.connect(membroB).votar(1, false);
    await dao.connect(membroC).votar(1, false);
    await time.increase(votingPeriod + 1);
    expect(await dao.estado(1)).to.equal(Estado.Rejeitada);
    await expect(dao.executar(1)).to.be.revertedWith("Proposta nao aprovada");
  });

  it("nao executa duas vezes", async function () {
    const ctx = await comTresMembros();
    const { dao, membroA, membroB, votingPeriod } = ctx;
    await dao.connect(membroA).votar(1, true);
    await dao.connect(membroB).votar(1, true);
    await time.increase(votingPeriod + 1);
    await dao.executar(1);
    await expect(dao.executar(1)).to.be.revertedWith("Proposta ja executada");
  });
});
