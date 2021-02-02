# ControlContract
Lets a community collectively manage a wallet and tokens by calliing any method from external contract

# Deploy
when deploy it is need to pass parameters in to constructor<br/>
Params:
name  | type | description
--|--|--
communityAddr|address|address of community contract

Once installed will be use methods:
<table>
<thead>
	<tr>
		<th>method name</th>
		<th>called by</th>
		<th>description</th>
	</tr>
</thead>
<tbody>
	<tr>
		<td><a href="#allowinvoke">allowInvoke</a></td>
		<td>owner</td>
		<td>setup role to invoke</td>
	</tr>
	<tr>
		<td><a href="#allowendorse">allowEndorse</a></td>
		<td>owner</td>
		<td>setup role to endorse</td>
	</tr>
	<tr>
		<td><a href="#invoke">invoke</a></td>
		<td>member who can invoke (see <a href="#allowinvoke">allowInvoke</a>)</td>
		<td>initiating transaction</td>
	</tr>
	<tr>
		<td><a href="#endorse">endorse</a></td>
		<td>member who can endorse (see <a href="#allowendorse">allowEndorse</a>)</td>
		<td>endorsing transaction</td>
	</tr>
</tbody>
</table>

# Methods
 
## invoke
method will initiate a creation transaction. return `invokeID` - invoke identificator and `invokeIDWei` - value in wei that can be send to contract directly to endorse<br/>
Params:
name  | type | description
--|--|--
tokenAddr|address|address of external token
method|hexadecimal string|method of external token that would be executed
params|hexadecimal string|params of external token's method
minimum|uint256|minimum
fraction|uint256|fraction value mul by 1e10

## endorse
endorsed transaction by `invokeID`<br/>
Params:
name  | type | description
--|--|--
invokeID|uint256|invoke identificator

## allowInvoke
allow participant with `roleName` to invoke transaction with `method` of `tokenAddr`<br/>
Params:
name  | type | description
--|--|--
roleName|string|role name
tokenAddr|address| token's address
method|hexadecimal string|method of external token that would be executed

## allowEndorse
allow participant with `roleName` to endorse transaction with `method` of `tokenAddr`<br/>
Params:
name  | type | description
--|--|--
roleName|string|role name
tokenAddr|address| token's address
method|hexadecimal string|method of external token that would be executed

# Events

## OperationInvoked
happens while calling method <a href="#invoke">invoke</a>
Params:
name  | type | description
--|--|--
invokeID|uint256|invokeID
invokeIDWei|uint40|invokeIDWei
tokenAddr|address| token's address
method|hexadecimal string| method of external token that would be executed
params|hexadecimal string| method's params

## OperationEndorsed
happens while calling method <a href="#endorse">endorse</a> or sending eth directly to contract
Params:
name  | type | description
--|--|--
invokeID|uint256|invokeID
invokeIDWei|uint40|invokeIDWei

## OperationExecuted
happens when transaction should be executed
Params:
name  | type | description
--|--|--
invokeID|uint256|invokeID
invokeIDWei|uint40|invokeIDWei

# Lifecycle
* deploy ControlContract with address of community contract
* for example we want to execute transaction that mint 10 ERC20 tokens to `<address 1>` for example `0xea674fdde714fd979de3edf0f56aa9716b898ec8`.
    * allow <address 2> with "role2" to invoke such transactions calling method `allowInvoke` with params:<br/>
    roleName = 'role2'<br/>
    tokenAddr = '<erc20 token>'<br/>
    method = '40c10f19' //// first 4 bytes of the Keccak hash of the ASCII form of the signature 'mint(address,uint256)' see https://solidity.readthedocs.io/en/latest/abi-spec.html#examples<br/>
    * allow <address 3> with "role3" to endorse such transactions calling method `allowEndorse` with params:<br/>
    roleName = 'role2'<br/>
    tokenAddr = '<erc20 token>'<br/>
    method = '40c10f19' //// first 4 bytes of the Keccak hash of the ASCII form of the signature 'mint(address,uint256)'<br/>
    * user <address 2> try to invoke calling `invoke('<erc20 token>', '40c10f19','000000000000000000000000ea674fdde714fd979de3edf0f56aa9716b898ec80000000000000000000000000000000000000000000000008ac7230489e80000',1,1)`.  it will emit event `OperationInvoked(invokeID)`
    * user <address 3> with "role3" try to endorse this transaction by `invokeID`
    * alternative to calling method `endorse` is send eth directly to contract with value `invokeIDWei` announced in event `OperationInvoked`
    * if count of endorsed people will be more than M=(max(minimum,  memberCount * fraction/1e10)) then transaction will be executed
