# ControlContractFactory

contracts/ControlContractFactory.sol

# Overview

Once installed will be use methods:

| **method name** | **called by** | **description** |
|-|-|-|
|<a href="#instances">instances</a>|everyone||
|<a href="#instancescount">instancesCount</a>|everyone|view amount of created instances|
|<a href="#produce">produce</a>|everyone|creation СontrolContract instance|
## *Constructor*


Arguments

| **name** | **type** | **description** |
|-|-|-|
| controlContractImpl | address | address of СontrolContract implementation |



## *Events*
### InstanceCreated

Arguments

| **name** | **type** | **description** |
|-|-|-|
| instance | address | not indexed |
| instancesCount | uint256 | not indexed |



## *StateVariables*
### controlContractImplementation

> Notice: ControlContract implementation address


| **type** |
|-|
|address|



## *Functions*
### instances

Arguments

| **name** | **type** | **description** |
|-|-|-|
| -/- | uint256 |  |

Outputs

| **name** | **type** | **description** |
|-|-|-|
| -/- | address |  |



### instancesCount

> Details: view amount of created instances

Outputs

| **name** | **type** | **description** |
|-|-|-|
| amount | uint256 | amount instances |



### produce

Arguments

| **name** | **type** | **description** |
|-|-|-|
| communityAddr | address | community address |
| groupRoles | tuple[] | tuples of GroupRolesSetting |

Outputs

| **name** | **type** | **description** |
|-|-|-|
| instance | address | address of created instance `СontrolContract` |


