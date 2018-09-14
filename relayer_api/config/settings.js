const settings = {
    server: {
        port: process.env.PORT || 5000,
        url: `http://localhost:${process.env.PORT || 5000}`
    },
    infuraApikey: "XTIF9kIt1kgSOOKclKG0",
    network: 'local',
    implementationAddress: '0x655341AabD39a5ee0939796dF610aD685a984C53',
    deploymentGas: 4500000,
    deploymentGasPrice: 100000000000
}

module.exports = settings;