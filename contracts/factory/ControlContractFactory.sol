pragma solidity >=0.6.0 <0.7.0;
import "../openzeppelin-contracts/contracts/access/Ownable.sol";
import "../ControlContract.sol";
import "../ICommunity.sol";

contract ControlContractFactory is Ownable {
    
    ControlContract[] public controlContractAddresses;

    event ControlContractCreated(ControlContract controlContract);
    
     /**
     * @param communityAddr community address 
     
     */
    function createControlContract (
        ICommunity communityAddr
    ) 
        public
    {
        ControlContract controlContract = new ControlContract(communityAddr);
        controlContractAddresses.push(controlContract);
        emit ControlContractCreated(controlContract);
        controlContract.transferOwnership(_msgSender());  
    }
    
}