const TestnetDAI = artifacts.require("TestnetDAI");
const Escrow = artifacts.require("Escrow");

module.exports = async function(deployer) {
  await deployer.deploy(TestnetDAI);
  const token = await TestnetDAI.deployed();

  await deployer.deploy(Escrow, token.address);
};
