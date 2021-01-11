const SwapShare = artifacts.require("SwapShare");
const TestnetDAI = artifacts.require("TestnetDAI");

module.exports = async function(deployer) {
  await deployer.deploy(TestnetDAI);
  const token = await TestnetDAI.deployed();

  await deployer.deploy(SwapShare, token.address);
};
