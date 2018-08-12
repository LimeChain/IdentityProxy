class CounterfactualTransactionsService {

	// TODO make this an actual storage
	constructor() {
		this.counterFactualContracts = {};
	}

	upsertData(identityContract, fullData) {
		this.counterFactualContracts[identityContract] = fullData;
	}

	getData(identityContract) {
		return this.counterFactualContracts[identityContract]
	}
}

module.exports = CounterfactualTransactionsService;
