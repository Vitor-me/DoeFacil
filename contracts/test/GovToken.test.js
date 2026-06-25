const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");

async function deployTokenFixture() {
  const [owner, membro, outro] = await hre.ethers.getSigners();
  const GovToken = await hre.ethers.getContractFactory("GovToken");
  const token = await GovToken.deploy();
  await token.waitForDeployment();
  return { token, owner, membro, outro };
}

describe("GovToken", function () {
  it("o owner consegue mintar tokens para um membro", async function () {
    const { token, membro } = await loadFixture(deployTokenFixture);
    await token.mint(membro.address, hre.ethers.parseEther("10"));
    expect(await token.balanceOf(membro.address)).to.equal(hre.ethers.parseEther("10"));
  });

  it("quem nao e owner nao consegue mintar", async function () {
    const { token, membro } = await loadFixture(deployTokenFixture);
    await expect(
      token.connect(membro).mint(membro.address, hre.ethers.parseEther("1")),
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("o poder de voto so existe apos delegar", async function () {
    const { token, membro } = await loadFixture(deployTokenFixture);
    await token.mint(membro.address, hre.ethers.parseEther("10"));
    expect(await token.getVotes(membro.address)).to.equal(0n);
    await token.connect(membro).delegate(membro.address);
    expect(await token.getVotes(membro.address)).to.equal(hre.ethers.parseEther("10"));
  });
});
