const LogService = require("./logservice")
const GdriveService = require("./gdriveservice");
const FileService = require("./fileservice")
const DBService = require("./dbservice")
const TestService=require('./testservices');
const NetworkServices = require("./networkservice");
const path=require('path');
const defaultPath=`${path.resolve()}/src/tmp/`;
class BusServices{
    async start(){
        LogService.warning('Starting Program');

    
        await this.awaitForConnection();    
        await this.prepareEnv();
        await this.runTests();

        await this.TrackNewFiles();
        await this.uploadNewFiles();
        const files_Mtime_has_Change=await this.checkMtime()
        if(files_Mtime_has_Change){
            const {files_mtime_corruped,filesUpdated} = await this.SyncFiles(files_Mtime_has_Change);
            LogService.warning(`${files_mtime_corruped.length} files are corrupt`);
            LogService.warning(`${filesUpdated.length} files Updated !`);
        } else{
            LogService.warning('There is no change in Files');
        }        
        await this.shutdown();
    }
    async prepareEnv(){
        const FS=new FileService();
        LogService.log('Loading Enviroment');
        await FS.loadEnviroment();
    }
    async TrackNewFiles(){
        LogService.log(`Track files from ${process.env.MCD_DIR}`);
        const FS=new FileService();
        const DBS=new DBService();
        const files=FS.readAllFromMCD_DIR()
        await DBS.insertInFilesIfNotExists(files);
    }
    async uploadNewFiles(){
        const DBS=new DBService();
        const GDS=new GdriveService()
        const untrackedFiles=await DBS.VerifyUntrackedFiles();
        if(untrackedFiles){
            LogService.log(`Find New Files in ${process.env.MCD_DIR},Starting upload`);
            for(let file of untrackedFiles){
                const { id }=await GDS.createAndUploadFile(file.name,file.path)  
                await DBS.updateGdriveId({id:file.id,gdrive_id:id});
            }
        }
    }
    async checkMtime(){
        const DBS=new DBService();
        const FS=new FileService();
        LogService.log(`Checking Files for changes`);
        const realFiles=FS.readAllFromMCD_DIR();
        const modified_files=await DBS.CompareMtimeWithFileTable(realFiles);
        const filesToSync= modified_files.length>0 ? modified_files:false;
        return filesToSync;
    }
    async SyncFiles(files){
        const FS=new FileService();
        const GDS=new GdriveService();
        const DBS=new DBService();
        const files_mtime_corruped=[];
        const filesUpdated=[];
        for(let file of files){
            await GDS.downloadFile(file.gdrive_id,file.id);
            let GdriveFilePath=defaultPath+file.id;
            let RealFilePath=process.env.MCD_DIR+file.name;
            let GdriveFile_EQ_RealFile=FS.CompareFilesBufferByPath(GdriveFilePath,RealFilePath)
            if(!GdriveFile_EQ_RealFile){
                const { id } = await GDS.createAndUploadFile(file.name,RealFilePath)
                await DBS.updateGdriveId({id:file.id,gdrive_id:id});
                await DBS.updateMtime(file.id,file.mtime);
                await GDS.deleteFile(file.gdrive_id);
                LogService.success(file.name+" Has been updated");
                filesUpdated.push(file);
            }
            else{
                files_mtime_corruped.push(file);
            }
        }
        return {files_mtime_corruped,filesUpdated}
    }
    async runTests(){
        const TS=new TestService();
        await TS.testEnv();
        await TS.testFilesService();
        await TS.testGdriveService();
        await TS.testDatabaseService();
    }
    async prepareShutdown(){
        const FS=new FileService();
        FS.clearTMP();
    }
    async shutdown(){
        await this.prepareShutdown();
        LogService.warning('Shutdown Programm');
        process.exit();
    }
    async awaitForConnection(){
        const NS=new NetworkServices();
        let isOnline=await NS.isOnline();
        while(!isOnline){
            LogService.warning("Trying to connect to internet...");
            isOnline=await NS.isOnline();
        }
        LogService.success("Trying to connect to internet");
    }
}
module.exports=BusServices
