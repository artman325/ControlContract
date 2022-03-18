# ControlContract

contracts/ControlContract.sol

# Overview

Once installed will be use methods:

| **method name** | **called by** | **description** |
|-|-|-|
|<a href="#addmethod">addMethod</a>|owner|adding method to be able to invoke|
|<a href="#endorse">endorse</a>|persons with endorse roles|endorse methods by invokeID|
|<a href="#getexpectgroupindex">getExpectGroupIndex</a>|anyone|showing expected group index|
|<a href="#heartbeat">heartbeat</a>|anyone|prolonging user current group ownership|
|<a href="#init">init</a>|factory|initialize while factory produce|
|<a href="#invoke">invoke</a>|persons with invoke roles|invoke methods|
|<a href="#owner">owner</a>|everyone||
|<a href="#renounceownership">renounceOwnership</a>|everyone||
|<a href="#transferownership">transferOwnership</a>|everyone||
## *Events*
### CurrentGroupIndexChanged

Arguments

| **name** | **type** | **description** |
|-|-|-|
| from | uint256 | not indexed |
| to | uint256 | not indexed |
| time | uint256 | not indexed |



### HeartBeat

Arguments

| **name** | **type** | **description** |
|-|-|-|
| groupIndex | uint256 | not indexed |
| time | uint256 | not indexed |



### OperationEndorsed

Arguments

| **name** | **type** | **description** |
|-|-|-|
| invokeID | uint256 | indexed |
| invokeIDWei | uint40 | not indexed |



### OperationExecuted

Arguments

| **name** | **type** | **description** |
|-|-|-|
| invokeID | uint256 | indexed |
| invokeIDWei | uint40 | not indexed |



### OperationInvoked

Arguments

| **name** | **type** | **description** |
|-|-|-|
| invokeID | uint256 | indexed |
| invokeIDWei | uint40 | not indexed |
| tokenAddr | address | not indexed |
| method | string | not indexed |
| params | string | not indexed |



### OwnershipTransferred

Arguments

| **name** | **type** | **description** |
|-|-|-|
| previousOwner | address | indexed |
| newOwner | address | indexed |



## *Functions*
### addMethod

Arguments

| **name** | **type** | **description** |
|-|-|-|
| tokenAddr | address | token's address |
| method | string | hexademical method's string |
| invokeRoleName | string | invoke rolename |
| endorseRoleName | string | endorse rolename |
| minimum | uint256 | minimum |
| fraction | uint256 | fraction value mul by 1e10 |



### endorse

Arguments

| **name** | **type** | **description** |
|-|-|-|
| invokeID | uint256 | invoke identificator |



### getExpectGroupIndex

Outputs

| **name** | **type** | **description** |
|-|-|-|
| index | uint256 | expected groupIndex. |



### heartbeat

> Notice: prolonging user current group ownership.  or transferring to next if previous expired or restore previous if user belong to group which index less then current



### init

> Details: here invokeRole can equal endorseRole withih one group but can't be in other groups

Arguments

| **name** | **type** | **description** |
|-|-|-|
| communityAddr | address | community address |
| groupRoles | tuple[] | tuples of GroupRolesSetting |



### invoke

Arguments

| **name** | **type** | **description** |
|-|-|-|
| tokenAddr | address | address of external token |
| method | string | method of external token that would be executed |
| params | string | params of external token's method |

Outputs

| **name** | **type** | **description** |
|-|-|-|
| invokeID | uint256 | identificator |
| invokeIDWei | uint40 |  |



### owner

> Details: Returns the address of the current owner.

Outputs

| **name** | **type** | **description** |
|-|-|-|
| -/- | address |  |



### renounceOwnership

> Details: Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.



### transferOwnership

> Details: Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.

Arguments

| **name** | **type** | **description** |
|-|-|-|
| newOwner | address |  |


