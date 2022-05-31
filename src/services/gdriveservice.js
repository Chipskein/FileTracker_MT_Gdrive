const { google }=require("googleapis");
const path=require('path');
const mimeType=require('mime-types');

const FileService = require("./fileservice");
const LogService=require('./logservice');
const FS=new FileService();

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
        let media = {mimeType:mimeType.lookup(filePath),body: FS.createReadStreamFromFile(filePath)};
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
        LogService.warning(`Downloading ${filename}`);
        const dest = FS.createWriteStream(filename);
        const drive = google.drive({version: 'v3', auth:this.auth});
        const { data }=await drive.files.get({fileId: fileId, alt: "media"},{responseType: "stream"})        
        data.pipe(dest);
    }
    async deleteFile(id){
        LogService.warning(`Deleting ${id} from Gdrive`);
        const drive = google.drive({version: 'v3', auth:this.auth});
        await drive.files.delete({fileId: id,});
    }
};

module.exports=GdriveService