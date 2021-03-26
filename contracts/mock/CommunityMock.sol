// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;


import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../interfaces/ICommunity.sol";

contract CommunityMock is OwnableUpgradeable, ICommunity {
    
    mapping(address => string[]) roles;
    uint256 count = 5;
    
    function memberCount(string memory role) public override view returns(uint256) {
        return count;
    }
    function setMemberCount(uint256 _count) public returns(uint256) {
        count = _count;
    }
    
    function setRoles(address member, string[] memory _roles) public {
        uint256 len;
        for(uint256 i = 0; i < _roles.length; i++) {
            len = roles[member].length;
            roles[member].push(_roles[i]);
        }
        
        
    }
    
    function getRoles(address member)public override view returns(string[] memory list){
        // string[] memory list = new string[](5);
        // list[0] = 'owners';
        // list[1] = 'admins';
        // list[2] = 'members';
        // list[3] = 'sub-admins';
        // list[4] = 'unkwnowns';
        
        list = roles[member];
        
        return list;
        
    }
    function getMember(string memory role) public override view returns(address[] memory){
        address[] memory list = new address[](0);
        return list;
    }
    
}
