// Testes da funcao verificar_ong: apenas o owner (admin) pode verificar uma ONG.
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployDoeFacilFixture } = require("./fixtures");

describe("DoeFacil — verificar_ong", function () {
  it("o owner verifica a ONG e emite o evento", async function () {
    const { doeFacil, admin, ong } = await loadFixture(deployDoeFacilFixture);

    await expect(doeFacil.connect(admin).verificar_ong(ong.address))
      .to.emit(doeFacil, "ong_verificada")
      .withArgs(ong.address);

    const registro = await doeFacil.ongs(ong.address);
    expect(registro.verificada).to.equal(true);
  });

  it("reverte quando quem chama nao e o owner", async function () {
    const { doeFacil, ong, doador } = await loadFixture(deployDoeFacilFixture);

    await expect(doeFacil.connect(doador).verificar_ong(ong.address)).to.be.revertedWithCustomError(
      doeFacil,
      "OwnableUnauthorizedAccount",
    );

    const registro = await doeFacil.ongs(ong.address);
    expect(registro.verificada).to.equal(false);
  });
});
