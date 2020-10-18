# ControlContract
Contract is implementation of Multiownable contract as improvement to OpenZeppelin Ownable contract
# Deploy
when deploy it is no need to pass parameters in to constructor

# Methods
 
## transferOperation
implementation `ERC20 transfer`
Params:
name  | type | description
--|--|--
token|IERC20|address of erc20 token
recipient|address|recipient
amount|uint256|amount

## approveOperation
implementation `ERC20 approve`
Params:
name  | type | description
--|--|--
token|IERC20|address of erc20 token
spender|address|spender
amount|uint256|amount

## transferFromOperation
implementation `ERC20 transferFrom`
Params:
name  | type | description
--|--|--
token|IERC20|address of erc20 token
sender|address|sender
recipient|address|recipient
amount|uint256|amount

## cancelPending
Allows owners to change their mind by cacnelling votesMaskByOperation operations
Params:
name  | type | description
--|--|--
operation|bytes32| identifactor of operation see event `OperationCreated`

## transferOwnershipWithHowMany
Allows owners to change ownership
Params:
name  | type | description
--|--|--
newOwners|address[]|array of addresses of new owners
newHowManyOwnersDecide|uint256|how many owners can decide

# Events

## OwnershipTransferred
name  | type 
--|--
previousOwners|address[]
howManyOwnersDecide|uint
newOwners|address[]
newHowManyOwnersDecide|uint

## OperationCreated
name  | type 
--|--
operation|bytes32
howMany|uint
ownersCount|uint
proposer|address

## OperationUpvoted
name  | type 
--|--
operation|bytes32
votes|uint
howMany|uint
ownersCount|uint
upvoter|address

## OperationPerformed
name  | type 
--|--
operation|bytes32
howMany|uint
ownersCount|uint
performer|address

## OperationDownvoted
name  | type 
--|--
operation|bytes32
votes|uint
ownersCount|uint
downvoter|address

## OperationCancelled
name  | type 
--|--
operation|bytes32
lastCanceller|address

# Lifecycle
* deploy ControlContract
* make transaction transferOwnershipWithHowMany(newOwners, newHowManyOwnersDecide) see `transferOwnershipWithHowMany`
* After that our ControlContract is multi ownable. that's mean that transaction, for examle `transfer` will execute only if all owners execute `transfer` with the same parameters.
