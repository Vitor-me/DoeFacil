// Fixtures de teste do DoeFacil.
//
// Centraliza o setup usado pelos testes: faz o deploy do contrato e separa as
// contas por papel (admin/owner, ONG, doador, fornecedor). Use sempre via
// `loadFixture` para que o Hardhat reaproveite o snapshot entre os testes (mais
// rapido) e cada teste comece de um estado limpo.
//
// Exemplo num arquivo de teste:
//   const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
//   const { deployDoeFacilFixture } = require("./fixtures");
//   const { doeFacil, admin, ong } = await loadFixture(deployDoeFacilFixture);
const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

// Deploy do contrato + contas nomeadas por papel.
// O deployer (primeira conta) vira o `owner` do contrato, pois o construtor
// usa `Ownable(msg.sender)`.
async function deployDoeFacilFixture() {
  const [admin, ong, doador, fornecedor, ...outros] = await hre.ethers.getSigners();

  const DoeFacil = await hre.ethers.getContractFactory("DoeFacil");
  const doeFacil = await DoeFacil.deploy();
  await doeFacil.waitForDeployment();

  const endereco = await doeFacil.getAddress();

  return { doeFacil, endereco, admin, ong, doador, fornecedor, outros };
}

// Igual a anterior, mas com a ONG ja verificada pelo owner.
async function deployComOngVerificadaFixture() {
  const ctx = await deployDoeFacilFixture();
  await ctx.doeFacil.connect(ctx.admin).verificar_ong(ctx.ong.address);
  return ctx;
}

// Cenario pronto para testes de doacao/saque: ONG verificada + 1 campanha ativa
// (id 1) com meta de 10 ETH e prazo a 7 dias no futuro.
async function deployComCampanhaFixture() {
  const ctx = await deployComOngVerificadaFixture();
  const meta = hre.ethers.parseEther("10");
  const prazo = (await time.latest()) + 7 * 24 * 60 * 60;
  await ctx.doeFacil.connect(ctx.ong).criar_campanha("Cestas Basicas", meta, prazo);
  return { ...ctx, campanhaID: 1n, meta, prazo };
}

module.exports = {
  deployDoeFacilFixture,
  deployComOngVerificadaFixture,
  deployComCampanhaFixture,
};
