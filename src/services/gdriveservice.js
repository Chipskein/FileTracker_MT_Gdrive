const { google }=require("googleapis");
const path=require('path');

const LogService=require('./logservice');
const FileService=require('./fileservice');

class GdriveService{
    constructor(){
         this.KEY_PATH=`${path.resolve()}/src/tmp/tmpcredentials.json`;
         this.SCOPES = ['https://www.googleapis.com/auth/drive'];
         this.auth = new google.auth.GoogleAuth({keyFilename: this.KEY_PATH,scopes: this.SCOPES});
    }
    async testConnection(){
        const files=await this.listFiles();
    }
    async createAndUploadFile(fileName,filePath){
        const driveService = google.drive({version: 'v3', auth:this.auth});
        const FOLDER= process.env.GDRIVE_FOLDER;
        let fileMetaData = {'name': fileName,'parents': [FOLDER]};
        let media = {mimeType: "*/*",body: FileService.createReadStreamFromFile(filePath)};
        let options={resource: fileMetaData,media: media,fields: 'id'};          
        const { data } =await driveService.files.create(options);
        return data;
    }    
    async listFiles(){
        const drive = google.drive({ version: 'v3', auth:this.auth });
        const FOLDER= process.env.GDRIVE_FOLDER;
        const options={fields: 'nextPageToken, files(id, name)',q: `'${FOLDER}' in parents and trashed=false`}
        const response=await drive.files.list(options);
        const files=response.data.files;
        return files;
    }
    async downloadFile(fileId,filename){
        const dest = FileService.createWriteStream(filename);
        const drive = google.drive({version: 'v3', auth:this.auth});
        const response=await drive.files.get({fileId: fileId, alt: "media"},{responseType: "stream"})
        console.log(response);
    }
    async deleteFile(id){
        const drive = google.drive({version: 'v3', auth:this.auth});
        const response=await drive.files.delete({fileId: id,});
        console.log(response);
    }
};

module.exports=GdriveService