pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "../ControlContract.sol";
import "../interfaces/ICommunity.sol";

contract ControlContractMock is ControlContract {
   
    function getGroupTimeoutActivity() public view returns(uint256) {
        return groupTimeoutActivity;
    }
    
    function getNow() public view returns(uint256) {
        return block.timestamp;
    }
    function getCurrentGroupIndex() public view returns(uint256) {
        return currentGroupIndex;
    }
    
    // function getEndorseAllowedMock(address tokenAddr, string memory method, address sender) public view  returns(uint256[] memory list) {
      
    //   for (uint256 i=0; i< endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].length(); i++) {
            
    //             list[list.length] = endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].at(i);
            
    //     }
    // }
  
    // function getEndorsedRolesMock(address tokenAddr, string memory method, address sender) public view  returns(string[] memory list) {
    //     string[] memory roles = ICommunity(communityAddress).getRoles(sender);

    //     for (uint256 i=0; i< roles.length; i++) {
            
    //         if (endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].contains(roleIDs[roles[i]])) {
    //             list[list.length] = roles[i];
    //         }
    //     }
    // }
    
}