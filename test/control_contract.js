const BN = require('bn.js'); // https://github.com/indutny/bn.js
const util = require('util');
const ControlContract = artifacts.require("ControlContractMock");
const CommunityMock = artifacts.require("CommunityMock");
const SomeExternalMock = artifacts.require("SomeExternalMock");

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
   
    it('simple test method with no params', async () => {
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        var ControlContractInstance = await ControlContract.new(CommunityMockInstance.address, { from: accountTen });
        var SomeExternalMockInstance = await SomeExternalMock.new({from: accountTen});
        var counterBefore = await SomeExternalMockInstance.viewCounter({from: accountTen});
        
        let funcHexademicalStr = await SomeExternalMockInstance.returnFuncSignatureHexadecimalString({ from: accountTen });
        await ControlContractInstance.allowInvoke('sub-admins',SomeExternalMockInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('members',SomeExternalMockInstance.address,funcHexademicalStr,{ from: accountTen });
        
        
        await ControlContractInstance.invoke(
            SomeExternalMockInstance.address,
            funcHexademicalStr,
            '', //string memory params,
            1, //uint256 minimum,
            1 //uint256 fraction
            , { from: accountOne }
        );
        
        var invokeID; 
        await ControlContractInstance.getPastEvents('OperationInvoked', {
            filter: {addr: accountOne}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            invokeID = events[0].returnValues['invokeID'];
        });


        await ControlContractInstance.endorse(invokeID, { from: accountTwo });
        
        await ControlContractInstance.endorse(invokeID, { from: accountThree });
        
        var counterAfter = await SomeExternalMockInstance.viewCounter({from: accountTen});
        
        assert.equal(counterAfter-counterBefore, 1,'counter doest not work');
        
    });
    
    it('simple test method with params (mint tokens)', async () => {
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        var ControlContractInstance = await ControlContract.new(CommunityMockInstance.address, { from: accountTen });
        
        var ERC20MintableInstance = await ERC20Mintable.new('t1','t1',{from: accountTen});
        
        await ERC20MintableInstance.transferOwnership(ControlContractInstance.address,{from: accountTen});
        
        var counterBefore = await ERC20MintableInstance.balanceOf(accountFive, {from: accountTen});

            
        //0x40c10f19000000000000000000000000ea674fdde714fd979de3edf0f56aa9716b898ec80000000000000000000000000000000000000000000000008ac7230489e80000
        let funcHexademicalStr = '40c10f19';
        let memoryParamsHexademicalStr = '000000000000000000000000'+(accountFive.replace('0x',''))+'0000000000000000000000000000000000000000000000008ac7230489e80000';
        await ControlContractInstance.allowInvoke('sub-admins',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('members',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });

        
        await ControlContractInstance.invoke(
            ERC20MintableInstance.address,
            funcHexademicalStr,
            memoryParamsHexademicalStr, //string memory params,
            1, //uint256 minimum,
            1 //uint256 fraction
            , { from: accountOne }
        );
        
        var invokeID,invokeIDWei; 
        await ControlContractInstance.getPastEvents('OperationInvoked', {
            filter: {addr: accountOne}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            invokeID = events[0].returnValues['invokeID'];
            invokeIDWei = events[0].returnValues['invokeIDWei'];
        });


        await ControlContractInstance.endorse(invokeID, { from: accountTwo });

        //await ControlContractInstance.endorse(invokeID, { from: accountThree });
        
        await truffleAssert.reverts(
            web3.eth.sendTransaction({from: accountTwo, to: ControlContractInstance.address, value: invokeIDWei, gas: 300000}),
            "Sender is already endorse this transaction"
        );
        
        await truffleAssert.reverts(
            web3.eth.sendTransaction({from: accountThree, to: ControlContractInstance.address, value: invokeIDWei+2, gas: 300000}),
            "Such invokeID does not exist"
        );
        await web3.eth.sendTransaction({from: accountThree, to: ControlContractInstance.address, value: invokeIDWei, gas: 300000});
        
        
        var counterAfter = await ERC20MintableInstance.balanceOf(accountFive, {from: accountTen});
        
        assert.equal(counterAfter-counterBefore, 10*oneEther,'balance doest not equal');
        
    });
    
    
});
