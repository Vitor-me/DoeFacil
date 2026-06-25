// Testes de autorizar_fornecedor e sacar (padrao Checks-Effects-Interactions).
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { deployComCampanhaFixture } = require("./fixtures");

// Cenario: campanha pronta + 5 ETH ja doados, prontos para saque.
async function comSaldo() {
  const ctx = await loadFixture(deployComCampanhaFixture);
  await ctx.doeFacil.connect(ctx.doador).doar(ctx.campanhaID, {
    value: hre.ethers.parseEther("5"),
  });
  return ctx;
}

describe("DoeFacil — autorizar_fornecedor", function () {
  it("a ONG dona autoriza o fornecedor e emite o evento", async function () {
    const { doeFacil, ong, fornecedor, campanhaID } = await loadFixture(deployComCampanhaFixture);

    await expect(doeFacil.connect(ong).autorizar_fornecedor(campanhaID, fornecedor.address))
      .to.emit(doeFacil, "fornecedor_autorizado")
      .withArgs(campanhaID, fornecedor.address);

    expect(await doeFacil.fornecedores_autorizados(campanhaID, fornecedor.address)).to.equal(true);
  });

  it("reverte se quem autoriza nao e a ONG dona", async function () {
    const { doeFacil, doador, fornecedor, campanhaID } =
      await loadFixture(deployComCampanhaFixture);

    await expect(
      doeFacil.connect(doador).autorizar_fornecedor(campanhaID, fornecedor.address),
    ).to.be.revertedWith("Somente a ONG dona da campanha pode autorizar");
  });

  it("reverte para endereco de fornecedor invalido (zero)", async function () {
    const { doeFacil, ong, campanhaID } = await loadFixture(deployComCampanhaFixture);

    await expect(
      doeFacil.connect(ong).autorizar_fornecedor(campanhaID, hre.ethers.ZeroAddress),
    ).to.be.revertedWith("Endereco de fornecedor invalido");
  });
});

describe("DoeFacil — sacar", function () {
  it("transfere ao fornecedor autorizado, debita o saldo e emite o evento", async function () {
    const { doeFacil, ong, fornecedor, campanhaID } = await comSaldo();
    await doeFacil.connect(ong).autorizar_fornecedor(campanhaID, fornecedor.address);
    const valor = hre.ethers.parseEther("3");

    await expect(
      doeFacil.connect(ong).sacar(campanhaID, valor, fornecedor.address),
    ).to.changeEtherBalance(fornecedor, valor);

    await expect(
      doeFacil.connect(ong).sacar(campanhaID, hre.ethers.parseEther("1"), fornecedor.address),
    )
      .to.emit(doeFacil, "saque_realizado")
      .withArgs(campanhaID, fornecedor.address, hre.ethers.parseEther("1"));

    // 5 doados - 3 - 1 = 1 restante
    expect(await doeFacil.consultar_saldo(campanhaID)).to.equal(hre.ethers.parseEther("1"));
  });

  it("reverte se quem saca nao e a ONG dona", async function () {
    const { doeFacil, ong, doador, fornecedor, campanhaID } = await comSaldo();
    await doeFacil.connect(ong).autorizar_fornecedor(campanhaID, fornecedor.address);

    await expect(
      doeFacil.connect(doador).sacar(campanhaID, hre.ethers.parseEther("1"), fornecedor.address),
    ).to.be.revertedWith("Somente a ONG dona pode solicitar o saque");
  });

  it("reverte se o fornecedor nao estiver autorizado", async function () {
    const { doeFacil, ong, fornecedor, campanhaID } = await comSaldo();

    await expect(
      doeFacil.connect(ong).sacar(campanhaID, hre.ethers.parseEther("1"), fornecedor.address),
    ).to.be.revertedWith("Fornecedor nao autorizado");
  });

  it("reverte com saldo insuficiente", async function () {
    const { doeFacil, ong, fornecedor, campanhaID } = await comSaldo();
    await doeFacil.connect(ong).autorizar_fornecedor(campanhaID, fornecedor.address);

    await expect(
      doeFacil.connect(ong).sacar(campanhaID, hre.ethers.parseEther("6"), fornecedor.address),
    ).to.be.revertedWith("Saldo insuficiente na campanha");
  });

  it("reverte se o valor de saque for zero", async function () {
    const { doeFacil, ong, fornecedor, campanhaID } = await comSaldo();
    await doeFacil.connect(ong).autorizar_fornecedor(campanhaID, fornecedor.address);

    await expect(doeFacil.connect(ong).sacar(campanhaID, 0, fornecedor.address)).to.be.revertedWith(
      "O valor de saque deve ser maior que zero",
    );
  });
});
