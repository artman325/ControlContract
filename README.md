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
		<td><a href="#addmethod">addMethod</a></td>
		<td>owner</td>
		<td>setup method, fraction, minimum and roles to invoke/endorse</td>
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

## endorse
endorsed transaction by `invokeID`<br/>
Params:
name  | type | description
--|--|--
invokeID|uint256|invoke identificator

## addMethod
allow participant with `invokeRoleName`/`endorseRoleName` to invoke/endorse transaction with `method` of `tokenAddr`<br/>
Note that attemptштп add method with different fraction/minimum will revert. so can be added only one time. But roles can be added it any time, just add the same fraction/minimum
Params:
name  | type | description
--|--|--
tokenAddr|address|address of external token
method|hexadecimal string|method of external token that would be executed
invokeRoleName|string| invoke role name
endorseRoleName|string| endorse role name
minimum|uint256|minimum
fraction|uint256|fraction value mul by 1e10

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

## Contracts MD
[ControlContract.md](docs/contracts/ControlContractFactory.md)<br>
[ControlContract.md](docs/contracts/ControlContract.md)<br>


