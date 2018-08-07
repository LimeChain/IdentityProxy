pragma solidity ^0.4.21;

import "./IIdentityProxy.sol";

contract UpgradeableProxy {
    IIdentityProxy identityProxyContract;



    function () public payable {
        delegatedFwd(identityProxyContract, msg.data);
    }

    function setIdentityProxyContract(address _identityProxyContract) {
        require(_identityProxyContract != address(0));
        identityProxyContract = IIdentityProxy (_identityProxyContract);
    }

    function delegatedFwd(address _dst, bytes _calldata) internal {
        assembly {
            switch extcodesize(_dst) case 0 { revert(0, 0) }

            let result := delegatecall(sub(gas, 10000), _dst, add(_calldata, 0x20), mload(_calldata), 0, 0)
            let size := returndatasize

            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)

            
            switch result case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }

}