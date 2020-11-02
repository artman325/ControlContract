pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "../ControlContract.sol";
import "../ICommunity.sol";

contract ControlContractMock is ControlContract {
   
    
    /**
     * @param communityAddress address community
     */
    constructor
    (
        ICommunity communityAddress
    )
        public 
        ControlContract(communityAddress)
    {
    }
    
  function getEndorseAllowedMock(address tokenAddr, string memory method, address sender) public view  returns(uint256[] memory list) {
      
      for (uint256 i=0; i< endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].length(); i++) {
            
                list[list.length] = endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].at(i);
            
        }
  }
  
    function getEndorsedRolesMock(address tokenAddr, string memory method, address sender) public view  returns(string[] memory list) {
        string[] memory roles = ICommunity(communityAddress).getRoles(sender);

        for (uint256 i=0; i< roles.length; i++) {
            
            if (endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].contains(roleIDs[roles[i]])) {
                list[list.length] = roles[i];
            }
        }
    }
    
}