const fs=require('fs');
const path=require('path');
const hash=require('sha256');
const defaultPath=`${path.resolve()}/src/tmp/`;

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
            const lastUpdate=stats.mtime;
            const fileSizeInBytes = stats.size;
            const id=hash(filename)
            response.push({id,name: filename, extension, fileSizeInBytes ,lastUpdate});
        }
        return response;
    }
}
module.exports=FileService