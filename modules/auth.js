const Enseigne = require("../models/enseigne");

module.exports = function(req, res, next) {
    try {
        const authorization = req.headers['authorization'];
        if (!authorization) {
            //res.status(403).json({result: false, error: 'no api key provided'}).end();
            res.status(403).end();
        }
        Enseigne.findOne({
            apiKey: authorization
        }).then((data) => {
            if (data) {
                next();
            } else {
                //res.status(403).json({result: false, error: 'invalid api key'}).end();
                res.status(403).end();
            }
        })
    } catch(error) {
        res.status(403).end();
    }
}
