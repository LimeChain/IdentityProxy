# IdentityProxy

The goal of this project is to have example of Identity proxy.

Current implementation of the Proxy has constructor, nonce and execute method.

Constructor is used to set the signer to owner. No gas needed for the signer.

Nonce is used anti replay attacks

Execute requires target address, value to be sent along the transaction the data to be sent and hash signature of the proof of sending

We should probably add keys and reward back mechanism
