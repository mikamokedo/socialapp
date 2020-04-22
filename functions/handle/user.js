
const {db} = require('../untils/admin');
const {firebase} = require('../untils/fireconfig');
const {isEmpty} = require('../untils/functioncheck');
const {reducerDataNewUser} = require('../untils/functioncheck');

exports.singup = (req,res) =>{
   
    let token;
    let userId;
    const newUser = {
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        handle : req.body.handle
    };
    db.doc(`/users/${newUser.handle}`).get().then((doc) =>{
        if(doc.exists){
            
            return res.status(500).json({eror: 'this handle is already taken'})
            
        }
        else{
            return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
        }

    })
    .then((data) =>{
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then((token1) =>{
        token = token1;
        let newUserData = {
            email : newUser.email,
            handle : newUser.handle,
            userId,
            avatar: 'https://firebasestorage.googleapis.com/v0/b/socialapp-65337.appspot.com/o/avatar.jpg?alt=media&token=525ad09f-1d3c-4031-97c5-a48526b59ed1',
            createdAt : new Date().toISOString()
        };

            return db.doc(`/users/${newUser.handle}`).set(newUserData);
        

    })
    .then((data) =>{
        return res.status(201).json({token})
    })
    .catch((error) =>{
        return res.status(500).json({eror: 'email hass been registed'})

    })
};


exports.login = (req,res) =>{
    let error= {};
    if(isEmpty(req.body.email)){
        error.email = "must bee not empty"
    };
    if(isEmpty(req.body.password)){
        error.email = "must bee not empty"
    };
    if(Object.keys(error).length > 0){
        return res.status(400).json({error})

    };
        
    let datalogin = {
        email : req.body.email,
        password: req.body.password
    }

    firebase.auth().signInWithEmailAndPassword(datalogin.email,datalogin.password)
    .then((data) =>{
        return data.user.getIdToken();
    })
    .then((token) =>{

        return res.status(200).json({token : token})
    })
    .catch((erorr) =>{
        return res.status(500).json({erorr})
    })
};

exports.addUserDetail = (req,res) =>{
   
    let newDetailUser = reducerDataNewUser(req.body);
    db.doc(`users/${req.user.handle}`).update(newDetailUser)
    .then((data) =>{
        return res.status(200).json('add information success');

    })
    .catch((error) =>{
        return res.status(400).json({error : error.code})
    })



}

exports.getAuthenticatedUser = (req,res) =>{
    let userData = {};
    db.doc(`users/${req.user.handle}`).get()
    .then((doc) =>{
        if(doc.exists){
            userData.credentials = doc.data();
            return db.collection('likes').where('userHandle', '==', req.user.handle).get()

        }
    })
    .then((data) =>{
        userData.likes = [];
        data.forEach(element => {
            userData.likes.push(element.data());
        });
        return db.collection('notifications').where("recipient", "==", req.user.handle).orderBy("createdAt","desc").limit(10).get()
    })
    .then((doc) =>{
        userData.notifications = [];
        doc.forEach(element => {
            userData.notifications.push({
                recipient: element.data().recipient,
                sender: element.data().sender,
                createdAt: element.data().createdAt,
                screamId: element.data().screamId,
                type: element.data().type,
                read: element.data().read,
                notificationsId: doc.id

            }) 
        }); 
    })
    .then(() =>{
        return res.json(userData);
    })
    .catch((error) =>{
        return res.status(500).json({error: error.code})
    })

};


exports.getUserDetail = (req,res) =>{
    let userDetail = {};
    db.doc(`/users/${req.params.handle}`).get()
    .then((doc) =>{
        if(!doc.exists){
            return res.status(500).json('dont have any user like this');
        }
        userDetail.user = doc.data();
        return db.collection('screams').where('userHandle','==',req.params.handle).orderBy('createdAt','desc').get()
    })
    .then((doc) =>{
        userDetail.screams = [];
        if(!doc.exists){
            doc.forEach(ele =>{
                    userDetail.screams.push({
                    body : ele.data().body,
                    createdAt : ele.data().createdAt,
                    userHandle : ele.data().userHandle,
                    avatar : ele.data().avatar,
                    likeCount : ele.data().likeCount,
                    commentCount : ele.data().commentCount,
                    screamId : doc.id    
                })
    
            })
        }
        return res.status(500).json(userDetail);
    })
    .then(() =>{
        return res.json(userDetail)
    })
    .catch((error) =>{
        res.status(500).json({error : error.code})
    })



}