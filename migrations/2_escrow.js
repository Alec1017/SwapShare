const TestnetDAI = artifacts.require("TestnetDAI");
const Escrow = artifacts.require("Escrow");

module.exports = async function(deployer) {
  await deployer.deploy(TestnetDAI);
  const token = await TestnetDAI.deployed();

  // Mint testDAI tokens to these accounts for testing
  token.mint('0xB31f5A3F71E829Bc08af8D437479B2dc8e9d9fC7')
  token.mint('0xEbb825581d127A493A4e4f9a881Cd4dcbA06F61f')

  await deployer.deploy(Escrow, token.address);
};
