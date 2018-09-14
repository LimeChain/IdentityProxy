const CounterfactualData = require('./models/counterfactualData')

module.exports = {

    addToDatabase: async function(counterfactualContractAddress, fullCounterfactualData){

        let model = new CounterfactualData({counterfactualContractAddress: counterfactualContractAddress, fullData: fullCounterfactualData, status: 'notDeployed'})
		let result = await model.save();

    },

    findRecord: async function(identityAddress){
        let counterfactualData = await CounterfactualData.findOne({counterfactualContractAddress: identityAddress})
        return counterfactualData
    },

    updateStatus: async function(identityAddress){
        let counterfactualData = await CounterfactualData.findOne({counterfactualContractAddress: identityAddress})
        await CounterfactualData.updateOne({counterfactualContractAddress:identityAddress}, {
			status: 'deployed'
		})
    }

}