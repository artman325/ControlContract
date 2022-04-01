// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "./interfaces/ICommunity.sol";
import "./interfaces/IControlContract.sol";

import "./lib/StringUtils.sol";
//deprecated
//import "./IntercoinTrait.sol";

contract ControlContract is OwnableUpgradeable, ReentrancyGuardUpgradeable, IControlContract/*, IntercoinTrait*/ {
  
    using AddressUpgradeable for address;
    
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    
    using StringUtils for *;
    
    ICommunity communityAddress;
    
    uint256 internal groupTimeoutActivity;
    
    uint256 internal currentGroupIndex;
    uint256 private maxGroupIndex;
    
    
    mapping(string => uint256) roleIDs;
    uint256 private lastRoleIndex;
    
    // mapping(bytes32 => EnumerableSetUpgradeable.UintSet) invokeAllowed;
    // mapping(bytes32 => EnumerableSetUpgradeable.UintSet) endorseAllowed;
    
    mapping(bytes32 => Method) methods;
    

    uint256 internal fractionDiv; //  = 1e10
    
    
    mapping(uint256 => Group) internal groups;
    
    
    
    //----------------------------------------------------
    // modifiers section 
    //----------------------------------------------------
    modifier canInvoke(
        address contractAddress, 
        string memory method, 
        address sender
    ) 
    {
        bool s = false;
        bytes32 k = keccak256(abi.encodePacked(contractAddress,method));
        string[] memory roles = ICommunity(communityAddress).getRoles(sender);
        for (uint256 i = 0; i < roles.length; i++) {
            if (methods[k].invokeRolesAllowed.contains(roleIDs[roles[i]])) {
                s = true;
            }
        }
        require(s == true, "Sender has not in Invoke role");
        _;
    }
    
    //----------------------------------------------------
    // events section 
    //----------------------------------------------------
    event OperationInvoked(uint256 indexed invokeID, uint40 invokeIDWei,  address contractAddress, string method, string params);
    event OperationEndorsed(uint256 indexed invokeID, uint40 invokeIDWei);
    event OperationExecuted(uint256 indexed invokeID, uint40 invokeIDWei);
    event HeartBeat(uint256 groupIndex, uint256 time);
    event CurrentGroupIndexChanged(uint256 from, uint256 to, uint256 time);
  
    //----------------------------------------------------
    // external section 
    //----------------------------------------------------
    receive() external payable {
        
        heartbeat();
        
        uint256 invokeID = groups[currentGroupIndex].pairWeiInvokeId[uint40(msg.value)];
        _endorse(invokeID);
    }
    
    //----------------------------------------------------
    // public section 
    //----------------------------------------------------
    /**
     * @dev here invokeRole can equal endorseRole withih one group but can't be in other groups
     * @param communityAddr community address
     * @param groupRoles tuples of GroupRolesSetting
     * @custom:calledby factory
     * @custom:shortd initialize while factory produce
     */
    function init(
        ICommunity communityAddr,
        GroupRolesSetting[] memory groupRoles
    )
        public 
        initializer
    {
        __Ownable_init();
        __ReentrancyGuard_init();
        
        communityAddress = communityAddr;
        
        groupTimeoutActivity = 2_592_000; // 30 days
        lastRoleIndex = 0;
        fractionDiv = 1e10;
        
        /*
        [   //  invokeRole         endorseRole
            [Role#1Group#1,Role#5Group#1],
            [Role#2Group#2,Role#6Group#2],
            [Role#3Group#3,Role#7Group#3],
            [Role#4Group#4,Role#8Group#4]
        ]
        */
        
        require(
            (address(communityAddr) != address(0)) && 
            (address(communityAddr).isContract()), 
            "Community address can not be zero"
        );
        require(groupRoles.length > 0, "need at least one group");
        
        currentGroupIndex = 0;
        maxGroupIndex = groupRoles.length;
        for (uint256 i = 0; i < groupRoles.length; i++) {
            require(
                (roleExists(groupRoles[i].invokeRole) == false) &&
                (roleExists(groupRoles[i].endorseRole) == false) &&
                (
                    keccak256(abi.encodePacked(groupRoles[i].invokeRole)) != keccak256(abi.encodePacked(groupRoles[i].endorseRole))
                ),
                "Role is already exists or invokeRole equal endorseRole"
            );
            
            groups[i].index = maxGroupIndex;
            groups[i].lastSeenTime = block.timestamp;
            groups[i].invokeRoles.add(roleAdd(groupRoles[i].invokeRole));
            groups[i].endorseRoles.add(roleAdd(groupRoles[i].endorseRole));
            
        }
    }
    
    /**
     * @param contractAddress address of external token
     * @param method method of external token that would be executed
     * @param params params of external token's method
     * @return invokeID identificator
     * @custom:calledby persons with invoke roles
     * @custom:shortd invoke methods
     */
    function invoke(
        address contractAddress,
        string memory method,
        string memory params
    )
        public 
        canInvoke(contractAddress, method, _msgSender())
        returns(uint256 invokeID, uint40 invokeIDWei)
    {
        bytes32 k = keccak256(abi.encodePacked(contractAddress,method));
        require(methods[k].exists == true, "Such method does not exists");
        
        heartbeat();
        
        invokeID = generateInvokeID();
        invokeIDWei = uint40(invokeID);
        
        groups[currentGroupIndex].pairWeiInvokeId[invokeIDWei] = invokeID;
        
        emit OperationInvoked(invokeID, invokeIDWei, contractAddress, method, params);
        
        groups[currentGroupIndex].operations[invokeID].addr = methods[k].addr;
        groups[currentGroupIndex].operations[invokeID].method = methods[k].method;
        groups[currentGroupIndex].operations[invokeID].params = params;
        groups[currentGroupIndex].operations[invokeID].minimum = methods[k].minimum;
        groups[currentGroupIndex].operations[invokeID].fraction = methods[k].fraction;
        
        groups[currentGroupIndex].operations[invokeID].exists = true;
        
    }
    
    /**
     * @param invokeID invoke identificator
     * @custom:calledby persons with endorse roles
     * @custom:shortd endorse methods by invokeID
     */
    function endorse(
        uint256 invokeID
    ) 
        public
    {
        heartbeat();
        _endorse(invokeID);
    }

    /**
     * @param contractAddress token's address
     * @param method hexademical method's string
     * @param invokeRoleName invoke rolename
     * @param endorseRoleName endorse rolename
     * @param minimum  minimum
     * @param fraction fraction value mul by 1e10
     * @custom:calledby owner
     * @custom:shortd adding method to be able to invoke
     */
    function addMethod(
        address contractAddress,
        string memory method,
        string memory invokeRoleName,
        string memory endorseRoleName,
        uint256 minimum,
        uint256 fraction
    )
        public 
        onlyOwner 
    {
        bytes32 k = keccak256(abi.encodePacked(contractAddress,method));
        
        require(roleExists(invokeRoleName), "Rolename does not exists");
        require(roleExists(endorseRoleName), "Rolename does not exists");
        
        // require(methods[k].exists == false, "Such method has already registered");
        if (methods[k].exists == false) {

        } else {
            require(
                (methods[k].minimum == minimum) && (methods[k].fraction == fraction), 
                "Such method has already registered with another minimum and fraction"
            );
        }
        
        methods[k].exists = true;
        methods[k].addr = contractAddress;
        methods[k].method = method;
        methods[k].minimum = minimum;
        methods[k].fraction = fraction;
        methods[k].invokeRolesAllowed.add(roleIDs[invokeRoleName]);
        methods[k].endorseRolesAllowed.add(roleIDs[endorseRoleName]);
        
    }

    /**
     * prolonging user current group ownership. 
     * or transferring to next if previous expired
     * or restore previous if user belong to group which index less then current
     * @custom:calledby anyone
     * @custom:shortd prolonging user current group ownership
     */
    function heartbeat(
    ) 
        public
    {
    
        uint256 len = 0;
        uint256 ii = 0;
        
        string[] memory roles = ICommunity(communityAddress).getRoles(_msgSender());
        for (uint256 i = 0; i < maxGroupIndex; i++) {
            for (uint256 j = 0; j < roles.length; j++) {
                if (
                    groups[i].invokeRoles.contains(roleIDs[roles[j]]) ||
                    groups[i].endorseRoles.contains(roleIDs[roles[j]])
                ) {
                    len += 1;
                }
          }
        }
        
        uint256[] memory userRoleIndexes = new uint256[](len);
        for (uint256 i = 0; i < maxGroupIndex; i++) {
            for (uint256 j = 0; j < roles.length; j++) {
                if (
                    groups[i].invokeRoles.contains(roleIDs[roles[j]]) ||
                    groups[i].endorseRoles.contains(roleIDs[roles[j]])
                ) {
                    
                    userRoleIndexes[ii] = i;
                    ii += 1;
                }
            }
        }
        
        uint256 expectGroupIndex = _getExpectGroupIndex();

        bool isBreak = false;
        uint256 itGroupIndex;

        for (uint256 i = 0; i <= expectGroupIndex; i++) {
            for (uint256 j = 0; j < userRoleIndexes.length; j++) { 
                if (i == userRoleIndexes[j]) {
                    itGroupIndex = i;
                    isBreak = true;
                    break;
                }
            }
            if (isBreak) {
                break;
            }
        }

        if (isBreak) {
            if (currentGroupIndex != itGroupIndex) {
                emit CurrentGroupIndexChanged(currentGroupIndex, itGroupIndex, block.timestamp);
            }
            currentGroupIndex = itGroupIndex;
            groups[itGroupIndex].lastSeenTime = block.timestamp;
            
            emit HeartBeat(currentGroupIndex, block.timestamp);
        } else {
            revert("Sender is out of current owner group");
        }

    }
    
    
    /**
     * @return index expected groupIndex.
     * @custom:calledby anyone
     * @custom:shortd showing expected group index
     */
    function getExpectGroupIndex(
    ) 
        public 
        view 
        returns(uint256 index) 
    {
        return _getExpectGroupIndex();
    }
    
    //----------------------------------------------------
    // internal section 
    //----------------------------------------------------
    
    /**
    * @return index expected groupIndex.
    */
    function _getExpectGroupIndex(
    ) 
        internal
        view 
        returns(uint256 index) 
    {

        index = currentGroupIndex;
        if (groups[currentGroupIndex].lastSeenTime + groupTimeoutActivity < block.timestamp) {
            index = currentGroupIndex + (
                (block.timestamp - groups[currentGroupIndex].lastSeenTime) / groupTimeoutActivity
            );
            if (maxGroupIndex <= index) {
                index = maxGroupIndex-1;
            }
        }
    }
    
    /**
     * @param invokeID invoke identificator
     */
    function _endorse(
        uint256 invokeID
    ) 
        internal
        nonReentrant()
    {
        require(groups[currentGroupIndex].operations[invokeID].exists == true, "Such invokeID does not exist");
        string[] memory roles = getEndorsedRoles(groups[currentGroupIndex].operations[invokeID].addr, groups[currentGroupIndex].operations[invokeID].method, _msgSender());
        require(roles.length > 0, "Sender has not in Endorse role");
        require(groups[currentGroupIndex].operations[invokeID].endorsedAccounts.contains(_msgSender()) == false, "Sender is already endorse this transaction");
        require(groups[currentGroupIndex].operations[invokeID].proceed == false, "Transaction have already executed");
        
        groups[currentGroupIndex].operations[invokeID].endorsedAccounts.add(_msgSender());
        
        emit OperationEndorsed(invokeID, uint40(invokeID));
        
        uint256 memberCount;
        for (uint256 i = 0; i < roles.length; i++) {
            memberCount = ICommunity(communityAddress).memberCount(roles[i]);
            //---
            uint256 max;
            max = memberCount * (groups[currentGroupIndex].operations[invokeID].fraction) / (fractionDiv);
            if (groups[currentGroupIndex].operations[invokeID].minimum > max) {
                max = groups[currentGroupIndex].operations[invokeID].minimum;
            }
            //---
            if (groups[currentGroupIndex].operations[invokeID].endorsedAccounts.length() >= max) {
                groups[currentGroupIndex].operations[invokeID].proceed = true;
                (
                    groups[currentGroupIndex].operations[invokeID].success, 
                    groups[currentGroupIndex].operations[invokeID].msg
                ) = groups[currentGroupIndex].operations[invokeID].addr.call(
                    (
                        string(abi.encodePacked(
                            groups[currentGroupIndex].operations[invokeID].method, 
                            groups[currentGroupIndex].operations[invokeID].params
                        ))
                    ).fromHex()
                );
                emit OperationExecuted(invokeID, uint40(invokeID));
            }
        }
    }
 
    
    /**
     * getting all endorse roles by sender's address and expected pair contract/method
     * 
     * @param contractAddress token's address
     * @param method hexademical method's string
     * @param sender sender address
     * @return endorse roles 
     */
    function getEndorsedRoles(
        address contractAddress, 
        string memory method, 
        address sender
    ) 
        internal 
        view 
        returns(string[] memory) 
    {
        string[] memory roles = ICommunity(communityAddress).getRoles(sender);
        uint256 len;

        for (uint256 i = 0; i < roles.length; i++) {
            if (methods[keccak256(abi.encodePacked(contractAddress,method))].endorseRolesAllowed.contains(roleIDs[roles[i]])) {
                len += 1;
            }
        }
        string[] memory list = new string[](len);
        uint256 j = 0;
        for (uint256 i = 0; i < roles.length; i++) {
            if (methods[keccak256(abi.encodePacked(contractAddress,method))].endorseRolesAllowed.contains(roleIDs[roles[i]])) {
                list[j] = roles[i];
                j += 1;
            }
        }
        return list;
    }
    
    /**
     * adding role to general list
     * 
     * @param roleName role name
     * 
     * @return index true if was added and false if already exists
     */
    function roleAdd(
        string memory roleName
    ) 
        internal 
        returns(uint256 index) 
    {
        if (roleIDs[roleName] == 0) {
            lastRoleIndex += 1;
            roleIDs[roleName] = lastRoleIndex;
            index = lastRoleIndex;
        } else {
            index = roleIDs[roleName];
        }
    }
    
    /**
     * @param roleName role name
     * @return ret true if roleName exists in general list
     */
    function roleExists(
        string memory roleName
    ) 
        internal 
        view
        returns(bool ret) 
    {
        ret = (roleIDs[roleName] == 0) ? false : true;
    }
    
    /**
     * generating pseudo-random id used as invoke identificator
     * @return invoke identificator
     */
    function generateInvokeID(
    ) 
        internal 
        view 
        returns(uint256) 
    {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp, 
            block.difficulty, 
            msg.sender
        )));    
    }
    
}

