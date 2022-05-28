const fs=require('fs');
const path=require('path');
const hash=require('sha256');
const LogService = require('./logservice');
const defaultPath=`${path.resolve()}/src/tmp/`;

const FileService={
    loadEnviroment:(envfile_name='.env')=>{
        const dotenv=require('dotenv');
        dotenv.config(envfile_name);
    },
    testEnvVariables:()=>{
        const { CREDENTIALS_JSON, GDRIVE_FOLDER ,MCD_DIR }=process.env
        const os=process.platform;
        if(CREDENTIALS_JSON && GDRIVE_FOLDER && MCD_DIR){
            try{
                test1=JSON.parse(CREDENTIALS_JSON);
                test2=fs.existsSync(MCD_DIR)
                return test1&&test2 ? true:false
            }
            catch (e){
                LogService.error(e);
                return false;
            }
        } else return false;
    },
    prepareGDRIVEVariables:()=>{
        FileService.createFile('tmpcredentials.json',process.env.CREDENTIALS_JSON)
        contentFromCreatedFile=FileService.readFile(defaultPath+'tmpcredentials.json');
        if(contentFromCreatedFile==process.env.CREDENTIALS_JSON) return true;
        else false;
    },
    readFile:(filepath)=>{
        const fileBuffer=fs.readFileSync(filepath);
        const fileContent=fileBuffer.toString('utf-8');
        return fileContent;
    },
    testReadFile:()=>{
        const fileContent=FileService.readFile(path.resolve()+'/src/tmp/.gitkeep');
        return (fileContent=='temp dir') ? true:false; 
    },
    createWriteStream:(filename)=>{
        return fs.createWriteStream(defaultPath+filename);
    },
    createReadStreamFromFile:(path)=>{
        return fs.createReadStream(path);
    },
    createFile:(filename,content)=>{
        fs.writeFileSync(defaultPath+filename,content)
    },
    deleteFile:(path)=>{
        const exists=fs.existsSync(path)
        if(exists) fs.unlinkSync(path);
        return exists
    },
    readAllFromMCD_DIR:()=>{
        const MCD_DIR=process.env.MCD_DIR;
        const files=fs.readdirSync(MCD_DIR);
        const response=[];
        for (let filename of files) {
            const extension = path.extname(MCD_DIR+filename);
            const stats=fs.statSync(MCD_DIR+filename);
            const updated_at=stats.mtime;
            const filesize = stats.size;
            const id=hash(filename);
            const description='duckstation memory card file'
            const filepath=MCD_DIR+filename;
            response.push({id,name: filename, extension,description,filesize,updated_at,filepath});
        }
        return response;
    },
    SyncFile:(file)=>{
        console.log(file);
        //download file from drive to src/tmp
        //then compare hash of file in MCU with src/tmp
        // if differ update file in drive
        //update (gdrive_id) ?  updated_at to the same at real file
        //delete file in tmp
    }
}
module.exports=FileService