pragma solidity ^0.4.21;

import "./SharedStorage.sol";
import "../Implementation/IIdentityContract.sol";

contract IdentityProxy is SharedStorage {


    function () public payable {
        delegatedFwd(contractImplementation, msg.data);
    }

    /**
     * @dev sets the owner of this identity proxy to the person that has signed the data
     * 
     * @param masterContract - address of the master implementation
     * @param relayer - address of the relayer that has signed this counterfactual contract
     * @param signerAddressHash - keccak256 of the address of the signer
     * @param signerAddressSignature - signed signerAddressHash by the signer
     */
    constructor (address masterContract, address relayer, bytes32 signerAddressHash, bytes signerAddressSignature) public {
        contractImplementation = masterContract;

        owner = IIdentityContract(contractImplementation).getSigner(signerAddressHash, signerAddressSignature);
		bytes32 signerHash = keccak256(abi.encodePacked(owner));
		require(signerHash == signerAddressHash);

        relayer.transfer(address(this).balance/2);
        // TODO change the renumeration logic
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