const Storage = artifacts.require('Storage');

contract('Storage', () => {
  it('Should set the value of the data variable', async () => {
    const storage = await Storage.deployed();
    await storage.set('this');
    const result = await storage.get();
    assert(result == 'this');
  })
})