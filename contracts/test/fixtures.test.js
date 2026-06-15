// Smoke test das fixtures: garante que o setup compartilhado carrega e que as
// contas saem com os papeis certos. Os testes de logica (doar, criar campanha,
// etc.) entram quando a Integrante 1 implementar as funcoes do contrato.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { deployDoeFacilFixture } = require("./fixtures");

describe("fixtures: deployDoeFacilFixture", function () {
  it("faz o deploy e retorna um endereco valido", async function () {
    const { doeFacil, endereco } = await loadFixture(deployDoeFacilFixture);
    expect(endereco).to.properAddress;
    expect(await doeFacil.getAddress()).to.equal(endereco);
  });

  it("define o admin (deployer) como owner do contrato", async function () {
    const { doeFacil, admin } = await loadFixture(deployDoeFacilFixture);
    expect(await doeFacil.owner()).to.equal(admin.address);
  });

  it("separa as contas por papel, todas distintas", async function () {
    const { admin, ong, doador, fornecedor } = await loadFixture(deployDoeFacilFixture);
    const enderecos = [admin.address, ong.address, doador.address, fornecedor.address];
    expect(new Set(enderecos).size).to.equal(4);
  });
});
