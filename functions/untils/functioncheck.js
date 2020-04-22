//check empty
exports.isEmpty = (string) =>{
    if(string.trim() == ''){
        return true
    }
    return false;
};

const isEmpty = (string) =>{
    if(string.trim() == ''){
        return true
    }
    return false;
};
exports.reducerDataNewUser = (data) =>{
    let result = {};

    if(data.bio){
        if(!isEmpty(data.bio.trim())){
            result.bio =   data.bio;   
        }
    }
    if(data.website){
        if(!isEmpty(data.website.trim())){
            if(data.website.trim().substring(0,4) != "http"){
                result.website = `https://${data.website.trim()}`
    
            }
            else{
                result.website =data.website;
            }
    
    
        }
    }
   
    if(data.location){
        if(!isEmpty(data.location.trim())){
            result.location =   data.location;   
        }
    
    }
    if(data.avatar){
            result.avatar =   data.avatar;   
    
    }
  
    
    return result;



}

