let viewController = (function() {
    let view = async function(req, res) {
        res.render('partials/home')

    }

    return {
        view: view
    }
    
})()

module.exports = viewController