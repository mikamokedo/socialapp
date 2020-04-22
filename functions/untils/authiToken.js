const {db,admin} = require('../untils/admin');
//AUTHI TOKEN MIDLEWARE
module.exports = (req,res,next) =>{
    let idtoken;
    if(req.headers.authorization && req.headers.authorization.startsWith('mikamokedo ')){
        idtoken = req.headers.authorization.split("mikamokedo ")[1];
    }
    else{
        return res.status(400).json({error: 'no token'})

    }
    admin.auth().verifyIdToken(idtoken)
    .then((decodedToken) =>{
        req.user = decodedToken;
        return db.collection('users').where('userId', "==", req.user.uid).limit(1).get();
    })
    .then((data) =>{
        req.user.handle = data.docs[0].data().handle;
        req.user.avatar = data.docs[0].data().avatar;
        console.log('authi run');
        return next();
    })
    .catch((error) =>{
        return res.status(400).json(error);
    })
   
}


