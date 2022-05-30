const isOnline=require('is-online');
class NetworkServices{
    async isOnline(){
        return await isOnline();
    }
}
module.exports=NetworkServices;