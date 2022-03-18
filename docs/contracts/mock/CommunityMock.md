# CommunityMock

contracts/mock/CommunityMock.sol

# Overview

Once installed will be use methods:

| **method name** | **called by** | **description** |
|-|-|-|
|<a href="#getmember">getMember</a>|everyone||
|<a href="#getroles">getRoles</a>|everyone||
|<a href="#membercount">memberCount</a>|everyone||
|<a href="#owner">owner</a>|everyone||
|<a href="#renounceownership">renounceOwnership</a>|everyone||
|<a href="#setmembercount">setMemberCount</a>|everyone||
|<a href="#setroles">setRoles</a>|everyone||
|<a href="#transferownership">transferOwnership</a>|everyone||
## *Events*
### OwnershipTransferred

Arguments

| **name** | **type** | **description** |
|-|-|-|
| previousOwner | address | indexed |
| newOwner | address | indexed |



## *Functions*
### getMember

Arguments

| **name** | **type** | **description** |
|-|-|-|
| role | string |  |

Outputs

| **name** | **type** | **description** |
|-|-|-|
| -/- | address[] |  |



### getRoles

Arguments

| **name** | **type** | **description** |
|-|-|-|
| member | address |  |

Outputs

| **name** | **type** | **description** |
|-|-|-|
| list | string[] |  |



### memberCount

Arguments

| **name** | **type** | **description** |
|-|-|-|
| role | string |  |

Outputs

| **name** | **type** | **description** |
|-|-|-|
| -/- | uint256 |  |



### owner

> Details: Returns the address of the current owner.

Outputs

| **name** | **type** | **description** |
|-|-|-|
| -/- | address |  |



### renounceOwnership

> Details: Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.



### setMemberCount

Arguments

| **name** | **type** | **description** |
|-|-|-|
| _count | uint256 |  |

Outputs

| **name** | **type** | **description** |
|-|-|-|
| -/- | uint256 |  |



### setRoles

Arguments

| **name** | **type** | **description** |
|-|-|-|
| member | address |  |
| _roles | string[] |  |



### transferOwnership

> Details: Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.

Arguments

| **name** | **type** | **description** |
|-|-|-|
| newOwner | address |  |


