// Testes da funcao doar: registra ETH, atualiza arrecadado/saldo e respeita prazo.
const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { deployComCampanhaFixture } = require("./fixtures");

describe("DoeFacil — doar", function () {
  it("recebe a doacao, atualiza arrecadado/saldo e emite o evento", async function () {
    const { doeFacil, doador, campanhaID } = await loadFixture(deployComCampanhaFixture);
    const valor = hre.ethers.parseEther("2");

    await expect(doeFacil.connect(doador).doar(campanhaID, { value: valor }))
      .to.emit(doeFacil, "doacao_recebida")
      .withArgs(campanhaID, doador.address, valor);

    const campanha = await doeFacil.campanhas(campanhaID);
    expect(campanha.total_arrecadado).to.equal(valor);
    expect(campanha.saldo).to.equal(valor);
    expect(await doeFacil.consultar_saldo(campanhaID)).to.equal(valor);
  });

  it("acumula doacoes de varios doadores", async function () {
    const { doeFacil, doador, outros, campanhaID } = await loadFixture(deployComCampanhaFixture);
    const a = hre.ethers.parseEther("1");
    const b = hre.ethers.parseEther("3");

    await doeFacil.connect(doador).doar(campanhaID, { value: a });
    await doeFacil.connect(outros[0]).doar(campanhaID, { value: b });

    const campanha = await doeFacil.campanhas(campanhaID);
    expect(campanha.total_arrecadado).to.equal(a + b);
    expect(campanha.saldo).to.equal(a + b);
  });

  it("aumenta o saldo em ETH do proprio contrato", async function () {
    const { doeFacil, endereco, doador, campanhaID } = await loadFixture(deployComCampanhaFixture);
    const valor = hre.ethers.parseEther("2");

    await expect(doeFacil.connect(doador).doar(campanhaID, { value: valor })).to.changeEtherBalance(
      doador,
      -valor,
    );
    expect(await hre.ethers.provider.getBalance(endereco)).to.equal(valor);
  });

  it("reverte se o valor for zero", async function () {
    const { doeFacil, doador, campanhaID } = await loadFixture(deployComCampanhaFixture);

    await expect(doeFacil.connect(doador).doar(campanhaID, { value: 0 })).to.be.revertedWith(
      "O valor da doacao deve ser maior que zero",
    );
  });

  it("reverte ao doar para campanha inexistente (inativa)", async function () {
    const { doeFacil, doador } = await loadFixture(deployComCampanhaFixture);

    await expect(
      doeFacil.connect(doador).doar(999, { value: hre.ethers.parseEther("1") }),
    ).to.be.revertedWith("Esta campanha nao esta ativa");
  });

  it("reverte se o prazo da campanha ja encerrou", async function () {
    const { doeFacil, doador, campanhaID, prazo } = await loadFixture(deployComCampanhaFixture);
    await time.increaseTo(prazo + 1);

    await expect(
      doeFacil.connect(doador).doar(campanhaID, { value: hre.ethers.parseEther("1") }),
    ).to.be.revertedWith("O prazo da campanha ja encerrou");
  });
});
