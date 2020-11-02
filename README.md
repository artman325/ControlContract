# ControlContract
Lets a community collectively manage a wallet and tokens by calliing any method from external contract

# Deploy
when deploy it is need to pass parameters in to constructor
Params:
name  | type | description
--|--|--
communityAddr|address|address of community contract

# Methods
 
## invoke
method will initiate a creation transaction. return `invokeID` - invoke identificator
Params:
name  | type | description
--|--|--
tokenAddr|address|address of external token
method|hexadecimal string|method of external token that would be executed
params|hexadecimal string|params of external token's method
minimum|uint256|minimum
fraction|uint256|fraction value mul by 1e10

## endorse
endorsed transactino by `invokeID`
Params:
name  | type | description
--|--|--
invokeID|uint256|invoke identificator

## allowInvoked
allow participant with `roleName` to invoke transaction with `method` of `tokenAddr`
Params:
name  | type | description
--|--|--
roleName|string|role name
tokenAddr|address| token's address
method|hexadecimal string|method of external token that would be executed

## allowEndorsed
allow participant with `roleName` to endorse transaction with `method` of `tokenAddr`
Params:
name  | type | description
--|--|--
roleName|string|role name
tokenAddr|address| token's address
method|hexadecimal string|method of external token that would be executed


# Lifecycle
* deploy ControlContract wwith address of community contract
* for example we want to execute transaction that mint 10 ERC20 tokens to `<address 1>` for example `0xea674fdde714fd979de3edf0f56aa9716b898ec8`.
    * allow <address 2> with "role2" to invoke such transactions calling method `allowInvoked` with params:
    roleName = 'role2'
    tokenAddr = '<erc20 token>'
    method = '40c10f19' //// first 4 bytes of the Keccak hash of the ASCII form of the signature 'mint(address,uint256)' see https://solidity.readthedocs.io/en/latest/abi-spec.html#examples
    * allow <address 3> with "role3" to endorse such transactions calling method `allowEndorsed` with params:
    roleName = 'role2'
    tokenAddr = '<erc20 token>'
    method = '40c10f19' //// first 4 bytes of the Keccak hash of the ASCII form of the signature 'mint(address,uint256)'
    * user <address 2> try to invoke calling `invoke('<erc20 token>', '40c10f19','000000000000000000000000ea674fdde714fd979de3edf0f56aa9716b898ec80000000000000000000000000000000000000000000000008ac7230489e80000',1,1)`.  it will emit event `OperationInvoked(invokeID)`
    * user <address 3> with "role3" try to endorse this transaction by `invokeID`
    * if count of endorsed people will be more than M= (max(minimum,  memberCount * fraction/1e10)) then transaction will be executed
