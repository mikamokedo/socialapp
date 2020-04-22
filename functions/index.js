const functions = require('firebase-functions');
const express = require('express');
const app = express();
const Fbauthi = require('./untils/authiToken');
const {getAllScreams,putOneScream,getScreamById,commentOnscream,likeScream,unLikeScream,deleteScream,markNotificationsRead} = require('./handle/screams');
const {singup,login,addUserDetail,getAuthenticatedUser,getUserDetail} = require('./handle/user');
const {db} = require('./untils/admin');
const cors = require('cors');
app.use(cors());



//GET ALL SCREAMS
app.get('/screams',getAllScreams);

//POST SCREAMS
app.post('/screams',Fbauthi,putOneScream);

//DELETE SCREAMS
app.delete('/screams/:screamId',Fbauthi,deleteScream);

//get SCREAM by id
app.get('/screams/:screamId',getScreamById);

//PUSH A COMMENT on creams
app.post('/screams/:screamId/comment',Fbauthi,commentOnscream);

//LIKE A SCREAm
app.get('/screams/:screamId/like',Fbauthi,likeScream);

//UNLIKE A SCREAm
app.get('/screams/:screamId/unlike',Fbauthi,unLikeScream);

//MAKE NOTIFICATIONS READ
app.post('/notifications',Fbauthi,markNotificationsRead);

//SIGNUP ROUTER
app.post('/singup',singup);


//LOGIN ROUTER
app.post('/login',login);

//ADDDETAIL USER ROUTER
app.post('/user',Fbauthi,addUserDetail);

//GET USER AUTHICATED
app.get('/user',Fbauthi,getAuthenticatedUser);
//GET USER DElTAIL
app.get('/user/:handle',getUserDetail);



exports.api = functions.region('us-central1').https.onRequest(app);

//creat notification on like
exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}').onCreate((snapshot) =>{
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then((doc) =>{
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
            return db.doc(`/notifications/${snapshot.id}`).set({

                createdAt : new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: "like",
                read: false,
                screamId: doc.id
            })
        }
    })
    .catch((error) =>{
        res.status(500).json({error : error.code})
    })

});


//creat notification on comment
exports.createNotificationOnComment = functions.region('us-central1').firestore.document('comments/{id}').onCreate((snapshot) =>{
   return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then((doc) =>{
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt : new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: "comment",
                read: false,
                screamId: doc.id
            })
        }
    })
    .catch((error) =>{
        res.status(500).json({error : error.code})
    })

});


//delete notification on unlike
exports.deleteNotificationOnUnlike = functions.region('us-central1').firestore.document('likes/{id}').onDelete((snapshot) =>{
    return db.doc(`/notifications/${snapshot.id}`).delete()
    .catch((error) =>{
        res.status(500).json({error : error.code})
    })

});

exports.onUserImageChange = functions
.region('us-central1')
.firestore.document('users/{userId}')
.onUpdate((change) =>{
    console.log(change.before.data());
    console.log(change.after.data());
if(change.before.data().avatar !== change.after.data().avatar){
    console.log('image haschange');
    let batch = db.batch();
    return db
            .collection('screams')
            .where("userHandle","==",change.before.data().handle)
            .get()
    .then((data) =>{
        data.forEach((ele) =>{
            const scream = db.doc(`/screams/${ele.id}`);
            batch.update(scream,{avatar : change.after.data().avatar})
        })
        return db
        .collection('comments')
        .where("userHandle","==",change.before.data().handle)
        .get()
        })
        .then((data) =>{
            data.forEach((ele) =>{
                const comment = db.doc(`/comments/${ele.id}`);
                batch.update(comment,{avatar : change.after.data().avatar})
            })
            return batch.commit();

        })

}

});


exports.onScreamDelete = functions.region('us-central1').firestore.document('screams/{screamId}')
.onDelete((snapshot,context) =>{
    const screamId = context.params.screamId;
    let batch = db.batch();
    return db.collection('comments').where("screamId", "==", screamId).get()
    .then((data) =>{
        data.forEach((doc) =>{
            batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection('likes').where("screamId", "==", screamId).get();
    })
    .then((data) =>{
        data.forEach((doc) =>{
            batch.delete(db.doc(`/likes/${doc.id}`));
        })
        return db.collection('notifications').where("screamId", "==", screamId).get();
    })
    .then((data) =>{
        data.forEach((doc) =>{
            batch.delete(db.doc(`/notifications/${doc.id}`));
        })
        return batch.commit();
    })
    .catch((error) =>{
        res.status(500).json({error: error.code});
    })

})