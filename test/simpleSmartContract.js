const SimpleSmartContract = artifacts.require('SimpleSmartContract');

contract('SimpleSmartContract', () => {
  it('Should deploy smart contract properly', async () => {
    const simpleSmartContract = await SimpleSmartContract.deployed();
    assert(simpleSmartContract.address != '');
  })
})