# IdentityProxy

The goal of this project is to have example of Identity proxy.

Current implementation of the Proxy has constructor, nonce and execute method.

Constructor is used to set the signer to owner. No gas needed for the signer.

Nonce is used anti replay attacks

Execute requires target address, value to be sent along the transaction the data to be sent and hash signature of the proof of sending

```
	/**
	 * @dev executes a transaction only if it is formatted and signed by the owner of this. Anyone can call execute. Nonce introduced as anti replay attack mechanism.
	 * 
	 * @param relayerReward - the value to be sent back to the relayer
	 * @param target - the contract to be called
	 * @param value - the value to be sent to the target
	 * @param data - the data to be sent to be target
	 * @param dataHashSignature - signed bytes of the keccak256 of target, nonce, value and data keccak256(target, nonce, value, data)
	 */
	function execute(uint256 relayerReward, address target, uint256 value, bytes data, bytes dataHashSignature) public payable onlySigner(relayerReward, target, value, data, dataHashSignature) returns (bool) { ... }

```

We should probably add keys and reward back mechanism
