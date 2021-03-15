# ControlContract
Lets a community collectively manage a wallet and tokens by calliing any method from external contract

# Deploy
when deploy it is no need to pass parameters in to constructor,<br/>
but need to run method <a href="#init">init</a> immediately after deploy 

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
		<td><a href="#init">init</a></td>
		<td>anyone</td>
		<td>should be executed by the creator immediately after deployment. can be executed only the one time</td>
	</tr>
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

## init
should be executed by creator immediately after deploy. can be executed only the one time

Params:
name  | type | description
--|--|--
communityAddr|address|address of community contract
GroupRolesSetting[]|tuple| array of groups. Each group should contain <br>two roles: who can invoke and who can endorse.<br>[[invokeRoleGroup1,endorseRoleGroup1], ...]

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
tokenAddr|address|token's address
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

## HeartBeat
happens when active group do smth
Params:
name  | type | description
--|--|--
groupIndex|uint256|group's index that has been active now
time|uint256|timestamp in GMT time

## CurrentGroupIndexChanged
happens when group regained ownership
Params:
name  | type | description
--|--|--
from|uint256|group index of old owner 
to|uint256|group index of new owner 
time|uint256|timestamp in GMT time
    
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
* about ownership
    ControlContract have the one owner as usual contract. This owner can specify who can invoke and endorse to execute transactions that will be executed on behalf of the contract. 
    This is indicated in the initialization method: like one group#1 with two roles: who can invoke and who can endorse transactions. 
    The owner can specify several such groups. For example <br/>
    <pre>
    [
        [invokeRole#1Group1,endorseRole#2Group1],
        [invokeRole#3Group2,endorseRole#4Group2],
        ...,
        [invokeRole#5GroupN,endorseRole#6GroupN]
    ] 
    </pre>
    As soon as group1 is not active(didn't send any transaction to contract through 30 days) then Group2 becomes as new owner and can send transactions. And so on until groups is not ended. Last in the list cannot lose ownership  if time expires. 
    But each group can restore ownership by sending a control transaction or any valid transaction (call / confirm), and if the current owner is the group in the list AFTER by order.
    For example: in the list [group1,group2,GROUP3,group4,group5], where group3 is a current owner. group1,group2 - can regain, but group4,group5 - can't
    