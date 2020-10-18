pragma solidity >=0.6.0 <0.7.0;
//pragma experimental ABIEncoderV2;


import "./openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

import "./openzeppelin-contracts/contracts/math/SafeMath.sol";
import "./openzeppelin-contracts/contracts/utils/Address.sol";

import "./Multiownable.sol";

contract ControlContract is Multiownable {
    
    using SafeMath for uint256;

    bool avoidReentrancy = false;
    
    constructor(
    )
        Multiownable()
        public 
    {

        // owners.push(msg.sender);
        // ownersIndices[msg.sender] = 1;
        // howManyOwnersDecide = 1;
    }
    
    /**
     * @dev Moves `amount` tokens from the control's account to `recipient`. after approving all owners
     *
     */
    function transferOperation(IERC20 token, address recipient, uint256 amount) public onlyManyOwners returns (bool success) {
        require(!avoidReentrancy);
        avoidReentrancy = true;
        success = IERC20(token).transfer(recipient, amount);
        avoidReentrancy = false;
    }
    
    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     */
    function approveOperation(IERC20 token, address spender, uint256 amount) public onlyManyOwners returns (bool success) {
        require(!avoidReentrancy);
        avoidReentrancy = true;
        success = IERC20(token).approve(spender, amount);
        avoidReentrancy = false;
    }
    
    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     * 
     */
    function transferFromOperation(IERC20 token, address sender, address recipient, uint256 amount) public onlyManyOwners returns (bool success) {
        require(!avoidReentrancy);
        avoidReentrancy = true;
        success = IERC20(token).transferFrom(sender, recipient, amount);
        avoidReentrancy = false;
    }
    
}

