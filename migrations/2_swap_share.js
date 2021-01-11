const SwapShare = artifacts.require("SwapShare");
const SwapShareDAI = artifacts.require("SwapShareDAI");

module.exports = async function(deployer) {
  await deployer.deploy(SwapShareDAI);
  const token = await SwapShareDAI.deployed();

  await deployer.deploy(SwapShare, token.address);
};
