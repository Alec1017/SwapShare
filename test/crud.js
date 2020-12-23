const Crud = artifacts.require('Crud')

contract('Crud', () => {
    let crud = null
    
    before(async () => {
        crud = await Crud.deployed()
    })

    it('Should create a new user', async () => {
        await crud.create('Frank')
        const user = await crud.read(1)
        
        assert(user[0].toNumber() == 1)
        assert(user[1] === 'Frank')
    })

    it('Should update a user', async () => {
        await crud.update(1, 'Alec')
        const user = await crud.read(1)
        
        assert(user[0].toNumber() == 1)
        assert(user[1] === 'Alec')
    })

    it('Should not read a non-existant user', async () => {
        try {
            await crud.read(56)
        } catch(error) {
            assert(error.message.includes('User does not exist!'))
            return
        }

        assert(false)
    })

    it('Should not update a non-existant user', async () => {
        try {
            await crud.update(2, 'Bill')
        } catch(error) {
            assert(error.message.includes('User does not exist!'))
            return
        }

        assert(false)
    })

    it('Should destroy a user', async () => {
        await crud.destroy(1)
        try {
            await crud.read(1)
        } catch(error) {
            assert(error.message.includes('User does not exist!'))
            return
        }

        assert(false)
    })

    it('Should not destroy a non-existant user', async () => {
        try {
            await crud.destroy(2)
        } catch(error) {
            assert(error.message.includes('User does not exist!'))
            return 
        }

        assert(false)
    })
})