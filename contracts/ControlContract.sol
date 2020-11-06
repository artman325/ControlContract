pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./openzeppelin-contracts/contracts/math/Math.sol";
import "./openzeppelin-contracts/contracts/math/SafeMath.sol";
import "./openzeppelin-contracts/contracts/utils/Address.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";
import "./openzeppelin-contracts/contracts/utils/EnumerableSet.sol";
import "./openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./ICommunity.sol";
import "./lib/StringUtils.sol";

contract ControlContract is Ownable, ReentrancyGuard {
    using Math for uint256;
    using SafeMath for uint256;
    
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;
    
    using StringUtils for *;
    
    ICommunity communityAddress;
    
    struct Operation {
        address addr;
        string method;
        string params;
        uint256 minimum;
        uint256 fraction;
        
        EnumerableSet.AddressSet endorsedAccounts;
        
        bool proceed;
        string proceededRole;
        
        bool success;
        bytes msg;
        bool exists;
    }
    
    mapping(uint256 => Operation) internal operations;
    
    mapping(bytes32 => EnumerableSet.UintSet) invokeAllowed;
    mapping(bytes32 => EnumerableSet.UintSet) endorseAllowed;
    
    mapping(string => uint256) roleIDs;
    uint256 private lastRoleIndex = 0;
    
    uint256 internal fractionDiv = 1e10;
    
    modifier canInvoke(address tokenAddr, string memory method, address sender) {
        bool s = false;
        string[] memory roles = ICommunity(communityAddress).getRoles(sender);
        for (uint256 i=0; i< roles.length; i++) {
            if (invokeAllowed[keccak256(abi.encodePacked(tokenAddr,method))].contains(roleIDs[roles[i]])) {
                s = true;
            }
        }
        require(s == true, "Sender has not in Invoke role");
        _;
    }
    
    event OperationInvoked(uint256 indexed invokeID, address tokenAddr, string method, string params);
    event OperationEndorsed(uint256 indexed invokeID);
    event OperationExecuted(uint256 indexed invokeID);
    
    /**
     * @param communityAddr community address 
     */
    constructor(
        ICommunity communityAddr
    )
        public 
    {
        communityAddress = communityAddr;
    }
    
    /**
     * @param tokenAddr address of external token
     * @param method method of external token that would be executed
     * @param params params of external token's method
     * @param minimum  minimum
     * @param fraction fraction value mul by 1e10
     * @return invokeID invoke identificator
     */
    function invoke(
        address tokenAddr,
        string memory method,
        string memory params,
        uint256 minimum,
        uint256 fraction
    )
        public 
        canInvoke(tokenAddr, method, _msgSender())
        returns(uint256 invokeID)
    {
        invokeID = generateInvokeID();
        emit OperationInvoked(invokeID, tokenAddr, method, params);
        
        operations[invokeID].addr = tokenAddr;
        operations[invokeID].method = method;
        operations[invokeID].params = params;
        operations[invokeID].minimum = minimum;
        operations[invokeID].fraction = fraction;
        
        operations[invokeID].exists = true;
        
    }
    
    /**
     * @param invokeID invoke identificator
     */
    function endorse(
        uint256 invokeID
    ) 
        public
        nonReentrant()
    {
        require(operations[invokeID].exists == true, "Such invokeID does not exist");
        string[] memory roles = getEndorsedRoles(operations[invokeID].addr, operations[invokeID].method, _msgSender());
        require(roles.length > 0, "Sender has not in Endorse role");
        require(operations[invokeID].endorsedAccounts.contains(_msgSender()) == false, 'Sender is already endorse this transaction');
        require(operations[invokeID].proceed == false, 'Transaction have already executed');
        
        operations[invokeID].endorsedAccounts.add(_msgSender());
        
        emit OperationEndorsed(invokeID);
        
        uint256 memberCount;
        for (uint256 i=0; i< roles.length; i++) {
            memberCount = ICommunity(communityAddress).memberCount(roles[i]);
            if (operations[invokeID].endorsedAccounts.length() > operations[invokeID].minimum.max(memberCount.mul(operations[invokeID].fraction).div(fractionDiv))) {
                //addr.call(("7e15a6a70000000000000000000000000000000000000000000000000000000000000003").fromHex());
                operations[invokeID].proceed = true;
                (operations[invokeID].success,operations[invokeID].msg) = operations[invokeID].addr.call(
                    (
                        string(abi.encodePacked(operations[invokeID].method,operations[invokeID].params))
                    ).fromHex()
                );
                emit OperationExecuted(invokeID);
            }
        }
    }
    
    /**
     * @param roleName role name
     * @param tokenAddr token's address
     * @param method hexademical method's string
     */
    function allowInvoke(string memory roleName,address tokenAddr,string memory method) public onlyOwner {
        roleCheck(roleName);
        invokeAllowed[keccak256(abi.encodePacked(tokenAddr,method))].add(roleIDs[roleName]);
    }
    
    /**
     * @param roleName role name
     * @param tokenAddr token's address
     * @param method hexademical method's string
     */
    function allowEndorse(string memory roleName,address tokenAddr,string memory method) public onlyOwner {
        roleCheck(roleName);
        endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].add(roleIDs[roleName]);
    }
    
    /**
     * @param tokenAddr token's address
     * @param method hexademical method's string
     * @param sender sender address
     */
    function getEndorsedRoles(address tokenAddr, string memory method, address sender) internal view returns(string[] memory) {
        string[] memory roles = ICommunity(communityAddress).getRoles(sender);
        uint256 len;

        for (uint256 i=0; i< roles.length; i++) {
            if (endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].contains(roleIDs[roles[i]])) {
                len = len+1;
            }
        }
        string[] memory list = new string[](len);
        uint256 j = 0;
        for (uint256 i=0; i< roles.length; i++) {
            if (endorseAllowed[keccak256(abi.encodePacked(tokenAddr,method))].contains(roleIDs[roles[i]])) {
                list[j] = roles[i];
                j = j+1;
            }
        }
        return list;
    }
    
    /**
     * @param roleName role name
     */
    function roleCheck(string memory roleName) internal {
        if (roleIDs[roleName] == 0) {
            lastRoleIndex = lastRoleIndex.add(1);
            roleIDs[roleName] = lastRoleIndex;
        }
    }
    function generateInvokeID() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            now, 
            block.difficulty, 
            msg.sender
        )));    
    }
    
}

