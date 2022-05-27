const fs=require('fs');
const path=require('path');
const FileService={
    loadEnviroment:(envfile_name='.env')=>{
        const dotenv=require('dotenv');
        dotenv.config(envfile_name);
    },
    testEnvVariables:()=>{
        const { CREDENTIALS_JSON }=process.env
        if(CREDENTIALS_JSON) return true;
        else return false;
    },
    readFile:(filepath)=>{
        const fileBuffer=fs.readFileSync(filepath);
        const fileContent=fileBuffer.toString('utf-8');
        return fileContent;
    },
    testReadFile:()=>{
        const fileContent=FileService.readFile(path.resolve()+'/src/tmp/.gitkeep');
        return (fileContent=='temp dir') ? true:false; 
    }
}
module.exports=FileService