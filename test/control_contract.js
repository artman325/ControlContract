const BN = require('bn.js'); // https://github.com/indutny/bn.js
const util = require('util');
const ControlContract = artifacts.require("ControlContract");

const ERC20Mintable = artifacts.require("ERC20Mintable");

const truffleAssert = require('truffle-assertions');

const helper = require("../helpers/truffleTestHelper");

contract('ControlContract', (accounts) => {
    
    // it("should assert true", async function(done) {
    //     await TestExample.deployed();
    //     assert.isTrue(true);
    //     done();
    //   });
    
    // Setup accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];  
    const accountThree = accounts[2];
    const accountFourth= accounts[3];
    const accountFive = accounts[4];
    const accountSix = accounts[5];
    const accountSeven = accounts[6];
    const accountEight = accounts[7];
    const accountNine = accounts[8];
    const accountTen = accounts[9];
    const accountEleven = accounts[10];
    const accountTwelwe = accounts[11];

    
    
    // setup useful values
    const decimals = 1000000000000000000;
    const oneEther = 1*decimals; // 1eth
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    
    it('test howManyDecideOwners option and transfer method', async () => {
        const TokenInstance = await ERC20Mintable.new('t','t', { from: accountTen});
        const ControlContractInstance = await ControlContract.new({ from: accountOne });
        
        //only all owners
        let howManyDecideOwners = 3;
        await ControlContractInstance.transferOwnershipWithHowMany([accountOne, accountTwo, accountThree], howManyDecideOwners, { from: accountOne });
        
        await TokenInstance.mint(ControlContractInstance.address, '0x'+(1*decimals).toString(16), { from: accountTen});
        
        let balanceControl_1,balanceControl_2,balanceControl_3,balanceControl_4,
            balanceaccountFourth_1,balanceaccountFourth_2,balanceaccountFourth_3,balanceaccountFourth_4;
        
        balanceControl_1 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_1 = (await TokenInstance.balanceOf(accountFourth));
        
        await ControlContractInstance.transferOperation(TokenInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountOne});
        balanceControl_2 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_2 = (await TokenInstance.balanceOf(accountFourth));
        
        await ControlContractInstance.transferOperation(TokenInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountTwo});
        balanceControl_3 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_3 = (await TokenInstance.balanceOf(accountFourth));
        
        await ControlContractInstance.transferOperation(TokenInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountThree});
        balanceControl_4 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_4 = (await TokenInstance.balanceOf(accountFourth));
       
        assert.equal(
            new BN(balanceControl_1+'',10).toString(16),
            new BN(balanceControl_2+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceControl_2+'',10).toString(16),
            new BN(balanceControl_3+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceaccountFourth_1+'',10).toString(16),
            new BN(balanceaccountFourth_2+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceaccountFourth_2+'',10).toString(16),
            new BN(balanceaccountFourth_3+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        
        assert.equal(
            new BN(balanceControl_1+'',10).toString(16),
            new BN(balanceaccountFourth_4+'',10).toString(16),
            'Balance is not changed'
        );
        assert.equal(
            new BN(balanceControl_4+'',10).toString(16),
            new BN(balanceaccountFourth_1+'',10).toString(16),
            'Balance is not changed'
        );
        
        
    });
    
    it('test approveOperation', async () => {
        const TokenInstance = await ERC20Mintable.new('t','t', { from: accountTen});
        const ControlContractInstance = await ControlContract.new({ from: accountOne });
        
        //only all owners
        let howManyDecideOwners = 3;
        await ControlContractInstance.transferOwnershipWithHowMany([accountOne, accountTwo, accountThree], howManyDecideOwners, { from: accountOne });
        
        await TokenInstance.mint(ControlContractInstance.address, '0x'+(1*decimals).toString(16), { from: accountTen});
        
        let balanceControl_1,balanceControl_2,balanceControl_3,balanceControl_4,
            balanceaccountFourth_1,balanceaccountFourth_2,balanceaccountFourth_3,balanceaccountFourth_4;
        
        balanceControl_1 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_1 = (await TokenInstance.balanceOf(accountFourth));
        
        await truffleAssert.reverts(
            TokenInstance.transferFrom(ControlContractInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountFourth}),
            "ERC20: transfer amount exceeds allowance"
        );
        await ControlContractInstance.approveOperation(TokenInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountOne});
        balanceControl_2 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_2 = (await TokenInstance.balanceOf(accountFourth));
        
        await truffleAssert.reverts(
            TokenInstance.transferFrom(ControlContractInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountFourth}),
            "ERC20: transfer amount exceeds allowance"
        );
        await ControlContractInstance.approveOperation(TokenInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountTwo});
        balanceControl_3 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_3 = (await TokenInstance.balanceOf(accountFourth));
        
        await truffleAssert.reverts(
            TokenInstance.transferFrom(ControlContractInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountFourth}),
            "ERC20: transfer amount exceeds allowance"
        );
        await ControlContractInstance.approveOperation(TokenInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountThree});
        
        await TokenInstance.transferFrom(ControlContractInstance.address, accountFourth, '0x'+(1*decimals).toString(16), { from: accountFourth});
        
        balanceControl_4 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_4 = (await TokenInstance.balanceOf(accountFourth));
       
        assert.equal(
            new BN(balanceControl_1+'',10).toString(16),
            new BN(balanceControl_2+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceControl_2+'',10).toString(16),
            new BN(balanceControl_3+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceaccountFourth_1+'',10).toString(16),
            new BN(balanceaccountFourth_2+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceaccountFourth_2+'',10).toString(16),
            new BN(balanceaccountFourth_3+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        
        assert.equal(
            new BN(balanceControl_1+'',10).toString(16),
            new BN(balanceaccountFourth_4+'',10).toString(16),
            'Balance is not changed'
        );
        assert.equal(
            new BN(balanceControl_4+'',10).toString(16),
            new BN(balanceaccountFourth_1+'',10).toString(16),
            'Balance is not changed'
        );
    });
    
    
    it('test transferFromOperation', async () => {
        const TokenInstance = await ERC20Mintable.new('t','t', { from: accountTen});
        const ControlContractInstance = await ControlContract.new({ from: accountOne });
        
        //only all owners
        let howManyDecideOwners = 3;
        await ControlContractInstance.transferOwnershipWithHowMany([accountOne, accountTwo, accountThree], howManyDecideOwners, { from: accountOne });
        
        await TokenInstance.mint(accountFourth, '0x'+(1*decimals).toString(16), { from: accountTen});
        
        
        let balanceControl_1,balanceControl_2,balanceControl_3,balanceControl_4,
            balanceaccountFourth_1,balanceaccountFourth_2,balanceaccountFourth_3,balanceaccountFourth_4;
        
        
        await TokenInstance.approve(ControlContractInstance.address, '0x'+(1*decimals).toString(16), { from: accountFourth});
        
        balanceControl_1 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_1 = (await TokenInstance.balanceOf(accountFourth));
        
        await ControlContractInstance.transferFromOperation(TokenInstance.address, accountFourth, ControlContractInstance.address, '0x'+(1*decimals).toString(16), { from: accountOne});
        balanceControl_2 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_2 = (await TokenInstance.balanceOf(accountFourth));
        
        await ControlContractInstance.transferFromOperation(TokenInstance.address, accountFourth, ControlContractInstance.address, '0x'+(1*decimals).toString(16), { from: accountTwo});
        balanceControl_3 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_3 = (await TokenInstance.balanceOf(accountFourth));
        
        await ControlContractInstance.transferFromOperation(TokenInstance.address, accountFourth, ControlContractInstance.address, '0x'+(1*decimals).toString(16), { from: accountThree});
        
        
        balanceControl_4 = (await TokenInstance.balanceOf(ControlContractInstance.address));
        balanceaccountFourth_4 = (await TokenInstance.balanceOf(accountFourth));
       
        assert.equal(
            new BN(balanceControl_1+'',10).toString(16),
            new BN(balanceControl_2+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceControl_2+'',10).toString(16),
            new BN(balanceControl_3+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceaccountFourth_1+'',10).toString(16),
            new BN(balanceaccountFourth_2+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        assert.equal(
            new BN(balanceaccountFourth_2+'',10).toString(16),
            new BN(balanceaccountFourth_3+'',10).toString(16),
            'Balance changed before last owner confirm'
        );
        
        assert.equal(
            new BN(balanceControl_1+'',10).toString(16),
            new BN(balanceaccountFourth_4+'',10).toString(16),
            'Balance is not changed'
        );
        assert.equal(
            new BN(balanceControl_4+'',10).toString(16),
            new BN(balanceaccountFourth_1+'',10).toString(16),
            'Balance is not changed'
        );
    });
});
