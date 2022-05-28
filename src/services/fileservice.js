const fs=require('fs');
const path=require('path');

const defaultPath=`${path.resolve()}/src/tmp/`;

const DIRS_TO_BACKUP=[];

const FileService={
    loadEnviroment:(envfile_name='.env')=>{
        const dotenv=require('dotenv');
        dotenv.config(envfile_name);
    },
    testEnvVariables:()=>{
        const { CREDENTIALS_JSON, GDRIVE_FOLDER }=process.env
        if(CREDENTIALS_JSON&&GDRIVE_FOLDER) return true;
        else return false;
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
}
module.exports=FileService