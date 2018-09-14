let url = require('../config/settings').server.url;
let event = require('../config/events')
let ioClient = require('socket.io-client');
let connection = process.env.connection;
let connectedNodesList = [];
let allSockets = [];
let socektsUrl = new Map();

const databaseManager = require('./database/databaseManager')


module.exports = {
    init: function(io) {
        // Incoming
        io.on(event.connection, function (socket) {
            allSockets.push(socket)
            socket.on(event.incommingConnection, function(connectedUrl){
                connectedNodesList.push(connectedUrl)
                socektsUrl.set(socket, connectedUrl);
            })
            socket.emit(event.nodesList, connectedNodesList);
            setEventHandlers(socket);
        });
        if(!connection){
            return;
        }
        connectToNodes([connection])      
    },


    emitIdDataOnCreation: function(data){
        allSockets.forEach(socket => {
            socket.emit(event.idCreation, data);
        })     
    },


    emitIdDeployed: function(data){
        allSockets.forEach(socket => {
            socket.emit(event.idDeployed, data)
        })
    }
    
}



const connectToNodes = (nodes) => {
    for(let i = 0; i < nodes.length; i++){
        let nodeUrl = nodes[i]
        if(connectedNodesList.includes(nodeUrl)){
            continue;
        }
        let socket = ioClient.connect(nodeUrl);
        socket.emit(event.incommingConnection, url)
        
        connectedNodesList.push(nodeUrl);
        allSockets.push(socket)
        socektsUrl.set(socket, nodeUrl);
        
        socket.on(event.nodesList, function(data) {
            console.log(`You are connected to ${nodeUrl}.`)
            console.log(`Node ${nodeUrl} is connected with ${data}`)
            connectToNodes(data)
        })

        setEventHandlers(socket);     
    }
}



const setEventHandlers = (socket) => {
    socket.on(event.connect, function(data) {
        console.log('Connected.')
    })


    socket.on(event.idCreation, async function(data){
        await databaseManager.addToDatabase(data.counterfactualContractAddress, data)
        console.log(`Identity on address ${data.counterfactualContractAddress} has been created and successfully saved on your database`)
    })


    socket.on(event.idDeployed, async function(data){
        let record = await databaseManager.findRecord(data)

        if(record && record.status === 'notDeployed'){
            await databaseManager.updateStatus(data)
        }
        console.log(`Identity on ${data} address has been deployed and its status has been successfully updated in the database`)
    })


    socket.on(event.disconnect, function(data){
        let disconnectedUrl = socektsUrl.get(socket)
        
        let index = connectedNodesList.indexOf(disconnectedUrl);
        if (index !== -1){
            connectedNodesList.splice(index, 1);
        } 
        console.log('Disconnected: ', disconnectedUrl)
    })
    
}