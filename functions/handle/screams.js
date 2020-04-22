const {db} = require('../untils/admin');

exports.getAllScreams = (request, response) =>{
    db.collection("screams").get().then((success) =>{
        let result = [];
        success.forEach((element) => {
            result.push({
                screamId : element.id,
                likeCount : element.data().likeCount,
                body : element.data().body,
                avatar : element.data().avatar,
                createdAt : element.data().createdAt,
                commentCount : element.data().commentCount,
                userHandle : element.data().userHandle
                
            });
        });
       return response.json(result);
    })
    .catch((error) => {
        return response.status(400).send('cannot get screams')
    })
};


exports.putOneScream = (request, response)=>{

    const newScream = {
        body : request.body.body,
        userHandle : request.user.handle,
        createdAt: new Date().toISOString(),
        likeCount : 0,
        commentCount: 0,
        avatar: request.user.avatar
    }
    db.collection("screams").add(newScream).then((doc) =>{
        let newScreamTemp = newScream;
        newScreamTemp.screamId = doc.id;
        return response.status(200).json(newScreamTemp);

    }).catch((error) =>{
        return response.status(400).send('some thing went wrong');
    })  
   
};

exports.getScreamById = (req,res) =>{
let screamData = {};

db.doc(`screams/${req.params.screamId}`).get()
.then((doc) =>{
    if(!doc.exists){
        return res.status(500).json('dont have this scream!');

    }
        screamData = doc.data();
        screamData.screamId = doc.id;
        return db.collection('comments').orderBy("createdAt","desc").where("screamId","==",req.params.screamId).get()

})
.then((data)=>{
    screamData.comments = [];
    data.forEach((element) => {
        screamData.comments.push(element.data());

    });  

    return res.json(screamData)


})
.catch((error) =>{

    return res.status(500).json({error : error.code})
})

}


exports.commentOnscream = (req,res) =>{
    if(!req.body.body || req.body.body.trim() == ""){

        return res.status(400).json('must be have body');
    }

    const newComment = {
        body : req.body.body,
        createdAt : new Date().toISOString(),
        screamId : req.params.screamId,
        userHandle: req.user.handle,
        avatar: req.user.avatar

    };


    db.doc(`screams/${req.params.screamId}`).get()
    .then((doc) =>{
        if(!doc.exists){
            return res.status(400).json('scream is not found');
        }
        else{
           return doc.ref.update({commentCount: doc.data().commentCount + 1})
        }

    })
    .then((data)=>{

        return db.collection('comments').add(newComment);
    })
    .then(() =>{

        return res.json(newComment);
    })
    .catch((error) =>{
        return res.status(400).json({error: 'some one wrong'});

    })




}

exports.likeScream = (req,res) =>{
   const dataLikeScream = db.collection('likes').where("screamId","==",req.params.screamId).where("userHandle","==",req.user.handle).limit(1);
    const dataScream = db.doc(`/screams/${req.params.screamId}`);
    let resScreamdata;
    dataScream.get().then((doc) =>{
        if(!doc.exists){
            return res.status(400).json('scream not found!')
        }
        resScreamdata = doc.data();
        resScreamdata.screamId = doc.id;
        return dataLikeScream.get();
    })
    .then((data) =>{
        if(data.empty){
            return db.collection('likes').add({
                userHandle: req.user.handle,
                screamId: req.params.screamId
            }).then(() =>{
                resScreamdata.likeCount ++;
                return dataScream.update({likeCount : resScreamdata.likeCount})
            }).then((data) =>{
                return res.json(resScreamdata)
            })
        }
        else{

            return res.status(400).json('scream is already like!')
        }
    })
}








exports.unLikeScream = (req,res) =>{
    const dataLikeScream = db.collection('likes').where("screamId","==",req.params.screamId).where("userHandle","==",req.user.handle).limit(1);
     const dataScream = db.doc(`/screams/${req.params.screamId}`);
     let resScreamdata;
     dataScream.get().then((doc) =>{
         if(!doc.exists){
             return res.status(400).json('scream not found!')
         }
         resScreamdata = doc.data();
         resScreamdata.screamId = doc.id;
         return dataLikeScream.get();
     })
     .then((data) =>{
         if(!data.empty){
             return db.doc(`/likes/${data.docs[0].id}`).delete().then(() =>{
                 resScreamdata.likeCount --;
                 return dataScream.update({likeCount : resScreamdata.likeCount})
             }).then((data) =>{
                 return res.json(resScreamdata)
             })
         }
         else{
 
             return res.status(400).json('scream is already like!')
         }
     })
 }


 exports.deleteScream = (req,res) =>{
    
        const getScream = db.doc(`/screams/${req.params.screamId}`);
        
        getScream.get().then((doc) =>{
            if(!doc.exists){
                return res.json('scream is not found');
            }
            if(doc.data().userHandle !== req.user.handle){
                return res.json('you do not have permision delete it');
            }
            else{

                return getScream.delete();
            }



        })
        .then((success) =>{
            return res.json('delete scream success')
        })
        .catch((error) =>{
            return res.json({error : error.code })
        })

 };

 exports.markNotificationsRead = (req,res) =>{
    let batch = db.batch();
    req.body.forEach((ele) =>{
        const notification = db.doc(`/notifications/${ele}`);
        batch.update(notification,{red:true});

    });
    batch.commit().then(() =>{
        return res.json({messege : 'notification mark red'})
    })
    .catch((error) =>{
        res.status(500).json({error : error.code});
    })
 };