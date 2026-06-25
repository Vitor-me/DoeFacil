// Fixture da DoeFacil DAO: publica GovToken, um DoeFacil novo e a DAO, e
// transfere a posse do DoeFacil para a DAO (so uma proposta aprovada verifica
// uma ONG). Tambem expoe um helper para mintar + delegar de uma vez.
const hre = require("hardhat");

async function deployDaoFixture() {
  const [deployer, membroA, membroB, membroC, ongAlvo, ...outros] =
    await hre.ethers.getSigners();

  const GovToken = await hre.ethers.getContractFactory("GovToken");
  const token = await GovToken.deploy();
  await token.waitForDeployment();

  const DoeFacil = await hre.ethers.getContractFactory("DoeFacil");
  const doeFacil = await DoeFacil.deploy();
  await doeFacil.waitForDeployment();

  const votingPeriod = 3600; // 1 hora
  const quorumPercent = 20;
  const proposalThreshold = hre.ethers.parseEther("1");

  const DAO = await hre.ethers.getContractFactory("DoeFacilDAO");
  const dao = await DAO.deploy(
    await token.getAddress(),
    await doeFacil.getAddress(),
    votingPeriod,
    quorumPercent,
    proposalThreshold,
  );
  await dao.waitForDeployment();

  await doeFacil.transferOwnership(await dao.getAddress());

  // Minta `qtdEth` tokens para `conta` e ja delega para ela mesma.
  async function darPoder(conta, qtdEth) {
    await token.mint(conta.address, hre.ethers.parseEther(String(qtdEth)));
    await token.connect(conta).delegate(conta.address);
  }

  return {
    token, doeFacil, dao, deployer,
    membroA, membroB, membroC, ongAlvo, outros,
    votingPeriod, quorumPercent, proposalThreshold, darPoder,
  };
}

module.exports = { deployDaoFixture };
