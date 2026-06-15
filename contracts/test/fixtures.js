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

module.exports = { deployDoeFacilFixture };
