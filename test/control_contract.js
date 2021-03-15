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
    
    it('validate input params', async () => {
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        var ControlContractInstance;
        
        await ControlContract.new(CommunityMockInstance.address, [['sub-admins','members']], { from: accountTen });
    });
    
    it('simple test method with no params', async () => {
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        await CommunityMockInstance.setRoles(accountOne, ['sub-admins']);
        await CommunityMockInstance.setRoles(accountTwo, ['members']);
        await CommunityMockInstance.setRoles(accountThree, ['members']);
        
        var ControlContractInstance = await ControlContract.new({ from: accountTen });
        await ControlContractInstance.init(CommunityMockInstance.address, [['sub-admins','members']], { from: accountTen });
        
        var SomeExternalMockInstance = await SomeExternalMock.new({from: accountTen});
        var counterBefore = await SomeExternalMockInstance.viewCounter({from: accountTen});
        
        let funcHexademicalStr = await SomeExternalMockInstance.returnFuncSignatureHexadecimalString({ from: accountTen });
        await ControlContractInstance.allowInvoke('sub-admins',SomeExternalMockInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('members',SomeExternalMockInstance.address,funcHexademicalStr,{ from: accountTen });
        
        
        await ControlContractInstance.invoke(
            SomeExternalMockInstance.address,
            funcHexademicalStr,
            '', //string memory params,
            2, //uint256 minimum,
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
        await CommunityMockInstance.setRoles(accountOne, ['sub-admins']);
        await CommunityMockInstance.setRoles(accountTwo, ['members']);
        await CommunityMockInstance.setRoles(accountThree, ['members']);
        
        
        var ControlContractInstance = await ControlContract.new({ from: accountTen });
        await ControlContractInstance.init(CommunityMockInstance.address, [['sub-admins','members']], { from: accountTen });
        
        
        var ERC20MintableInstance = await ERC20Mintable.new({from: accountTen});
        await ERC20MintableInstance.init('t1','t1',{from: accountTen});
        
        await ERC20MintableInstance.transferOwnership(ControlContractInstance.address,{from: accountTen});
        
        var counterBefore = await ERC20MintableInstance.balanceOf(accountFive, {from: accountTen});

        // transfer to accountFive 10 tokens    
        //0x40c10f19000000000000000000000000ea674fdde714fd979de3edf0f56aa9716b898ec80000000000000000000000000000000000000000000000008ac7230489e80000
        let funcHexademicalStr = '40c10f19';
        let memoryParamsHexademicalStr = '000000000000000000000000'+(accountFive.replace('0x',''))+'0000000000000000000000000000000000000000000000008ac7230489e80000';
        await ControlContractInstance.allowInvoke('sub-admins',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('members',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });


        await ControlContractInstance.invoke(
            ERC20MintableInstance.address,
            funcHexademicalStr,
            memoryParamsHexademicalStr, //string memory params,
            2, //uint256 minimum,
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
            web3.eth.sendTransaction({from: accountTwo, to: ControlContractInstance.address, value: invokeIDWei, gas: 4000000}),
            "Sender is already endorse this transaction"
        );

        await truffleAssert.reverts(
            web3.eth.sendTransaction({from: accountThree, to: ControlContractInstance.address, value: invokeIDWei+2, gas: 4000000}),
            "Such invokeID does not exist"
        );
        await web3.eth.sendTransaction({from: accountThree, to: ControlContractInstance.address, value: invokeIDWei, gas: 4000000});
        
        
        var counterAfter = await ERC20MintableInstance.balanceOf(accountFive, {from: accountTen});
        
        assert.equal(counterAfter-counterBefore, 10*oneEther,'balance doest not equal');

    });

    it('heartbeat test', async () => {
        var groupTimeoutActivity;
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        
        await CommunityMockInstance.setRoles(accountOne, ['group1_can_invoke']);
        await CommunityMockInstance.setRoles(accountTwo, ['group1_can_endorse']);
        await CommunityMockInstance.setRoles(accountThree, ['group2_can_invoke']);
        await CommunityMockInstance.setRoles(accountFourth, ['group2_can_endorse']);
        
        var ControlContractInstance = await ControlContract.new({ from: accountTen });
        await ControlContractInstance.init(CommunityMockInstance.address, [['group1_can_invoke','group1_can_endorse'], ['group2_can_invoke','group2_can_endorse']], { from: accountTen });
        
        groupTimeoutActivity = await ControlContractInstance.getGroupTimeoutActivity({from: accountTen});
        
        var ERC20MintableInstance = await ERC20Mintable.new({from: accountTen});
        await ERC20MintableInstance.init('t1','t1',{from: accountTen});
        
        await ERC20MintableInstance.transferOwnership(ControlContractInstance.address,{from: accountTen});
        
        var counterBefore = await ERC20MintableInstance.balanceOf(accountFive, {from: accountTen});
        
        
        // transfer to accountFive 10 tokens    
        //0x40c10f19000000000000000000000000ea674fdde714fd979de3edf0f56aa9716b898ec80000000000000000000000000000000000000000000000008ac7230489e80000
        let funcHexademicalStr = '40c10f19';
        let memoryParamsHexademicalStr = '000000000000000000000000'+(accountFive.replace('0x',''))+'0000000000000000000000000000000000000000000000008ac7230489e80000';
        await ControlContractInstance.allowInvoke('group1_can_invoke',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowInvoke('group2_can_invoke',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('group1_can_endorse',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('group2_can_endorse',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        
        var invokeID,invokeIDWei; 
        await ControlContractInstance.heartbeat({ from: accountOne });
        
//         await ControlContractInstance.getPastEvents('OperationInvoked', {
//             filter: {addr: accountOne}, 
//             fromBlock: 0,
//             toBlock: 'latest'
//         }, function(error, events){ })
//         .then(function(events){
//             invokeID = events[0].returnValues['invokeID'];
//             invokeIDWei = events[0].returnValues['invokeIDWei'];
// console.log('invokeID=',invokeID.toString());
// console.log('invokeIDWei=',invokeIDWei.toString());
//         });

let t1,t2,t3,t4;   
// console.log('[#1]Block=',(await web3.eth.getBlock("latest")).number,' time='+(await web3.eth.getBlock("latest")).timestamp);
        // now active is group1
        // group 2 can not endorse or invoke
        await truffleAssert.reverts(
            ControlContractInstance.invoke(
                ERC20MintableInstance.address,
                funcHexademicalStr,
                memoryParamsHexademicalStr, //string memory params,
                1, //uint256 minimum,
                1 //uint256 fraction
                , { from: accountThree }
            ),
            "Sender is out of current owner group"
        );

// console.log('[#2]Block=',(await web3.eth.getBlock("latest")).number,' time='+(await web3.eth.getBlock("latest")).timestamp);

// console.log('getCurrentGroupIndex=',(await ControlContractInstance.getCurrentGroupIndex({from: accountTen})).toString());
// console.log('getExpectGroupIndex=',(await ControlContractInstance.getExpectGroupIndex({from: accountTen})).toString());
// console.log((await ControlContractInstance.getNow({from: accountTen})).toString());

        // pass groupTimeoutActivity = 30 days + extra seconds
        // NOTE: next transaction after advanceTimeAndBlock can be in block with +1or+0 seconds blocktimestamp. so in invoke we get the exact groupTimeoutActivity pass. in the end of period group is still have ownership.
        t2 =await helper.advanceTimeAndBlock(parseInt(groupTimeoutActivity)+10);
// console.log('getCurrentGroupIndex=',(await ControlContractInstance.getCurrentGroupIndex({from: accountTen})).toString());
// console.log('getExpectGroupIndex=',(await ControlContractInstance.getExpectGroupIndex({from: accountTen})).toString());
// console.log((await ControlContractInstance.getNow({from: accountTen})).toString());
        
// console.log(parseInt(groupTimeoutActivity));

        // and again
        t3 =await ControlContractInstance.invoke(
            ERC20MintableInstance.address,
            funcHexademicalStr,
            memoryParamsHexademicalStr, //string memory params,
            1, //uint256 minimum,
            1 //uint256 fraction
            , { from: accountThree }
        );


// console.log('Block=',t1.receipt.blockNumber,' time='+(await web3.eth.getBlock(t1.receipt.blockNumber)).timestamp);

// console.log('[#3]Block=',t2.number,' time='+t2.timestamp);
// console.log('[#4]Block=',t3.receipt.blockNumber,' time='+(await web3.eth.getBlock(t3.receipt.blockNumber)).timestamp);



// console.log('getCurrentGroupIndex=',(await ControlContractInstance.getCurrentGroupIndex({from: accountTen})).toString());
// console.log('getExpectGroupIndex=',(await ControlContractInstance.getExpectGroupIndex({from: accountTen})).toString());
        
// console.log((await ControlContractInstance.getNow({from: accountTen})).toString());

        await ControlContractInstance.invoke(
            ERC20MintableInstance.address,
            funcHexademicalStr,
            memoryParamsHexademicalStr, //string memory params,
            1, //uint256 minimum,
            1 //uint256 fraction
            , { from: accountThree }
        );
        
// console.log('getCurrentGroupIndex=',(await ControlContractInstance.getCurrentGroupIndex({from: accountTen})).toString());
// console.log('getExpectGroupIndex=',(await ControlContractInstance.getExpectGroupIndex({from: accountTen})).toString());

        //return ownership by accountOne for group1
        await ControlContractInstance.heartbeat({ from: accountOne });
        
// console.log('getCurrentGroupIndex=',(await ControlContractInstance.getCurrentGroupIndex({from: accountTen})).toString());
// console.log('getExpectGroupIndex=',(await ControlContractInstance.getExpectGroupIndex({from: accountTen})).toString());

        // now active is group1
        // group 2 can not endorse or invoke
        await truffleAssert.reverts(
            ControlContractInstance.invoke(
                ERC20MintableInstance.address,
                funcHexademicalStr,
                memoryParamsHexademicalStr, //string memory params,
                1, //uint256 minimum,
                1 //uint256 fraction
                , { from: accountThree }
            ),
            "Sender is out of current owner group"
        );
// console.log('getCurrentGroupIndex=',(await ControlContractInstance.getCurrentGroupIndex({from: accountTen})).toString());
// console.log('getExpectGroupIndex=',(await ControlContractInstance.getExpectGroupIndex({from: accountTen})).toString());   
// assert.isTrue(false,"test stop");
        
        
    });
    
    it('changed ownership if first group did not send any transaction', async () => {
        var groupTimeoutActivity;
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        
        await CommunityMockInstance.setRoles(accountOne, ['group1_can_invoke']);
        await CommunityMockInstance.setRoles(accountTwo, ['group1_can_endorse']);
        await CommunityMockInstance.setRoles(accountThree, ['group2_can_invoke']);
        await CommunityMockInstance.setRoles(accountFourth, ['group2_can_endorse']);
        
        var ControlContractInstance = await ControlContract.new({ from: accountTen });
        await ControlContractInstance.init(CommunityMockInstance.address, [['group1_can_invoke','group1_can_endorse'], ['group2_can_invoke','group2_can_endorse']], { from: accountTen });
        
        groupTimeoutActivity = await ControlContractInstance.getGroupTimeoutActivity({from: accountTen});
        
        var ERC20MintableInstance = await ERC20Mintable.new({from: accountTen});
        await ERC20MintableInstance.init('t1','t1',{from: accountTen});
        await ERC20MintableInstance.transferOwnership(ControlContractInstance.address,{from: accountTen});
        
        
        // transfer to accountFive 10 tokens    
        //0x40c10f19000000000000000000000000ea674fdde714fd979de3edf0f56aa9716b898ec80000000000000000000000000000000000000000000000008ac7230489e80000
        let funcHexademicalStr = '40c10f19';
        let memoryParamsHexademicalStr = '000000000000000000000000'+(accountFive.replace('0x',''))+'0000000000000000000000000000000000000000000000008ac7230489e80000';
        await ControlContractInstance.allowInvoke('group1_can_invoke',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowInvoke('group2_can_invoke',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('group1_can_endorse',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('group2_can_endorse',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        
        await helper.advanceTimeAndBlock(parseInt(groupTimeoutActivity)+10);
        
        await ControlContractInstance.invoke(
            ERC20MintableInstance.address,
            funcHexademicalStr,
            memoryParamsHexademicalStr, //string memory params,
            1, //uint256 minimum,
            1 //uint256 fraction
            , { from: accountThree }
        );
    });
    
    it('try to change ownership if first group got error via transaction', async () => {
        
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        
        await CommunityMockInstance.setRoles(accountOne, ['group1_can_invoke']);
        await CommunityMockInstance.setRoles(accountTwo, ['group1_can_endorse']);
        await CommunityMockInstance.setRoles(accountThree, ['group2_can_invoke']);
        await CommunityMockInstance.setRoles(accountFourth, ['group2_can_endorse']);
        
        var ControlContractInstance = await ControlContract.new({ from: accountTen });
        await ControlContractInstance.init(CommunityMockInstance.address, [['group1_can_invoke','group1_can_endorse'], ['group2_can_invoke','group2_can_endorse']], { from: accountTen });
        
        var groupTimeoutActivity = await ControlContractInstance.getGroupTimeoutActivity({from: accountTen});
        
        var ERC20MintableInstance = await ERC20Mintable.new({from: accountTen});
        await ERC20MintableInstance.init('t1','t1',{from: accountTen});
        await ERC20MintableInstance.transferOwnership(ControlContractInstance.address,{from: accountTen});
        
        
        // transfer to accountFive 10 tokens    
        //0x40c10f19000000000000000000000000ea674fdde714fd979de3edf0f56aa9716b898ec80000000000000000000000000000000000000000000000008ac7230489e80000
        let funcHexademicalStr = '40c10f19';
        let memoryParamsHexademicalStr = '000000000000000000000000'+(accountFive.replace('0x',''))+'0000000000000000000000000000000000000000000000008ac7230489e80000';
        await ControlContractInstance.allowInvoke('group1_can_invoke',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowInvoke('group2_can_invoke',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('group1_can_endorse',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('group2_can_endorse',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        
        await helper.advanceTimeAndBlock(parseInt(groupTimeoutActivity)+10);
        
        await ControlContractInstance.invoke(
            ERC20MintableInstance.address,
            funcHexademicalStr,
            memoryParamsHexademicalStr, //string memory params,
            1, //uint256 minimum,
            1 //uint256 fraction
            , { from: accountThree }
        );
        
        let invokeIDWeiWrong = 123123;
        await truffleAssert.reverts(
            web3.eth.sendTransaction({from: accountOne, to: ControlContractInstance.address, value: invokeIDWeiWrong, gas: 4000000}),
            "Such invokeID does not exist"
        );
        await truffleAssert.reverts(
            ControlContractInstance.endorse(invokeIDWeiWrong, { from: accountTwo }),
            "Such invokeID does not exist"
        );
        
        // group2 membbers still owner of contract
        await ControlContractInstance.invoke(
            ERC20MintableInstance.address,
            funcHexademicalStr,
            memoryParamsHexademicalStr, //string memory params,
            1, //uint256 minimum,
            1 //uint256 fraction
            , { from: accountThree }
        );
        
    });
    
    it('change ownership of destination erc20 token', async () => {
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        
        await CommunityMockInstance.setRoles(accountOne, ['group1_can_invoke']);
        await CommunityMockInstance.setRoles(accountTwo, ['group1_can_endorse']);
        await CommunityMockInstance.setRoles(accountThree, ['group1_can_endorse']);
        
        var ControlContractInstance = await ControlContract.new({ from: accountTen });
        await ControlContractInstance.init(CommunityMockInstance.address, [['group1_can_invoke','group1_can_endorse']], { from: accountTen });
        
        var ERC20MintableInstance = await ERC20Mintable.new({from: accountTen});
        await ERC20MintableInstance.init('t1','t1',{from: accountTen});
        await ERC20MintableInstance.transferOwnership(ControlContractInstance.address,{from: accountTen});
        
        
        // change ownership of ERC20MintableInstance to accountFive
        // 0xf2fde38b000000000000000000000000ea674fdde714fd979de3edf0f56aa9716b898ec8
                     
        let funcHexademicalStr = 'f2fde38b';
        let memoryParamsHexademicalStr = '000000000000000000000000'+(accountFive.replace('0x',''));
        await ControlContractInstance.allowInvoke('group1_can_invoke',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
        await ControlContractInstance.allowEndorse('group1_can_endorse',ERC20MintableInstance.address,funcHexademicalStr,{ from: accountTen });
       
        await ControlContractInstance.invoke(
            ERC20MintableInstance.address,
            funcHexademicalStr,
            memoryParamsHexademicalStr, //string memory params,
            2, //uint256 minimum,
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
        await ControlContractInstance.endorse(invokeID, { from: accountThree });
        
        var  newOwnerOfErc20 = await ERC20MintableInstance.owner({ from: accountTwo });
        
        assert.equal(accountFive, newOwnerOfErc20,'can\'t change ownership');

    });
});
