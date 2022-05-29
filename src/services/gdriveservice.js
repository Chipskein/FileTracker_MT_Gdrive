const { google }=require("googleapis");
const path=require('path');

const KEY_PATH=`${path.resolve()}/src/tmp/tmpcredentials.json`;
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({keyFilename: KEY_PATH,scopes: SCOPES});

const LogService=require('./logservice');
const FileService=require('./fileservice');

const GdriveService={
    testConnection:async ()=>{
        await GdriveService.listFiles(GdriveService.handlerTestCallback);
    },
    handlerTestCallback:(err,data)=>{
        if(err){
            LogService.error('Test GDRIVE Connection')
        } else {
            LogService.success('Test GDRIVE Connection')
        };
    },
    createAndUploadFile:async (fileName,filePath,callback)=>{
        const driveService = google.drive({version: 'v3', auth});
        const FOLDER= process.env.GDRIVE_FOLDER;
        let fileMetaData = {'name': fileName,'parents': [FOLDER]}
        let media = {mimeType: "*/*",body: FileService.createReadStreamFromFile(filePath)}
        
        driveService.files.create({
              resource: fileMetaData,
              media: media,
              fields: 'id'
            }, function (err, file) {
              if (err) {
                callback(err,null);
            } else {
                callback(err,file.data.id);
              }
        });
    },    
    listFiles:async (callback)=>{
        const array = [];
        const drive = google.drive({ version: 'v3', auth });
        const FOLDER= process.env.GDRIVE_FOLDER;
        drive.files.list({fields: 'nextPageToken, files(id, name)',q: `'${FOLDER}' in parents and trashed=false`}, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                files.map((file) => {
                    array.push(file);
                });
            }
            callback(err,array);
        });
    },
    downloadFile:(fileId,filename)=>{
        const dest = FileService.createWriteStream(filename);
        const drive = google.drive({version: 'v3', auth});
        drive.files.get({fileId: fileId, alt: "media"},{responseType: "stream"},(err,{data}) => {
            if (err) {
                console.log(err);
                return;
            }
            data
            .on("end", () => console.log("Download Done."))
            .on("error", (err) => {
                console.log(err);
                return process.exit();
            })
            .pipe(dest);
        }
        );
    },
    deleteFile:async (id)=>{
        const drive = google.drive({version: 'v3', auth});
        drive.files.delete({fileId: id,});
    }
};

module.exports=GdriveService