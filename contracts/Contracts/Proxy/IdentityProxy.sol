pragma solidity ^0.4.21;

import "./SharedStorage.sol";

contract IdentityProxy is SharedStorage {


    function () public payable {
        delegatedFwd(contractImplementation, msg.data);
    }

    constructor (address _identityContractAddress) public {
        contractImplementation = _identityContractAddress;
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