const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { deployDaoFixture } = require("./dao-fixtures");

async function comPropostaAtiva() {
  const ctx = await loadFixture(deployDaoFixture);
  const { dao, membroA, ongAlvo, darPoder } = ctx;
  await darPoder(membroA, 5);
  await dao.connect(membroA).criarProposta(ongAlvo.address, "Verificar ONG X");
  return ctx;
}

describe("DoeFacilDAO — votar", function () {
  it("registra o voto com o peso do snapshot", async function () {
    const ctx = await comPropostaAtiva();
    await ctx.dao.connect(ctx.membroA).votar(1, true);
    const p = await ctx.dao.propostas(1);
    expect(p.votosFavor).to.equal(hre.ethers.parseEther("5"));
    expect(p.votosContra).to.equal(0n);
  });

  it("impede votar duas vezes na mesma proposta", async function () {
    const ctx = await comPropostaAtiva();
    await ctx.dao.connect(ctx.membroA).votar(1, true);
    await expect(ctx.dao.connect(ctx.membroA).votar(1, false)).to.be.revertedWith(
      "Ja votou nesta proposta",
    );
  });

  it("transferir tokens depois da criacao NAO gera voto extra", async function () {
    const ctx = await comPropostaAtiva();
    const { token, dao, membroA, membroB } = ctx;
    await token.connect(membroA).transfer(membroB.address, hre.ethers.parseEther("5"));
    await token.connect(membroB).delegate(membroB.address);
    await expect(dao.connect(membroB).votar(1, true)).to.be.revertedWith(
      "Sem poder de voto no snapshot",
    );
  });

  it("rejeita voto de quem nao tinha poder no snapshot", async function () {
    const ctx = await comPropostaAtiva();
    await expect(ctx.dao.connect(ctx.membroC).votar(1, true)).to.be.revertedWith(
      "Sem poder de voto no snapshot",
    );
  });
});
