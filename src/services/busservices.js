const LogService = require("./logservice")
const GdriveService = require("./gdriveservice");
const FileService = require("./fileservice")
const DBService = require("./dbservice")
class BusServices{
    async start(){

        LogService.warning('Starting Program');
        
        await this.prepareEnv();

        await this.testEnv();
        await this.testFilesService();
        await this.testGdriveService();
        await this.testDatabaseService();

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

    }
    async prepareEnv(){
        const FS=new FileService();
        LogService.log('Loading Enviroment');
        await FS.loadEnviroment();
    }
    async testEnv(){
        const FS=new FileService();
        LogService.log('Test Enviroment');
        (!FS.testEnvVariables()) ? LogService.error('Test Enviroment'):LogService.success('Test Enviroment');
    }
    async testFilesService(){
        const FS=new FileService();
        LogService.log('Test ReadFiles');
        (!FS.testReadFile()) ? LogService.error('Test ReadFiles'):LogService.success('Test ReadFiles');
    }
    async testGdriveService(){
        const FS=new FileService();
        const GDS=new GdriveService()

        LogService.log('Prepare GDRIVE Variables');
        (!FS.prepareGDRIVEVariables()) ? LogService.error('Prepare GDRIVE Variables'):LogService.success('Prepare GDRIVE Variables');

        LogService.log('Test Gdrive Connection');
        await GDS.testConnection();
    }
    async testDatabaseService(){
        const DBS=new DBService();
        LogService.log('Test Database');
        await DBS.testDatabaseConnection();
        LogService.log('Test Files Table in database');
        await DBS.checkFilesTable();
    }
    async TrackNewFiles(){
        const FS=new FileService();
        const DBS=new DBService();
        const files=FS.readAllFromMCD_DIR()
        LogService.log(`Track files from ${process.env.MCD_DIR}`);
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
            await GDS.downloadFile(gdrive_id,fileId);
            let GdriveFilePath=defaultPath+fileId;
            let RealFilePath=process.env.MCD_DIR+realFileName;
            let GdriveFile_EQ_RealFile=this.CompareFilesBufferByPath(GdriveFilePath,RealFilePath)
            if(!GdriveFile_EQ_RealFile){
                const { id } = await GDS.createAndUploadFile(realFileName,RealFilePath)
                await DBS.updateGdriveId({id:file.id,gdrive_id:file.gdrive_id});
                await DBS.updateMtime(file.id,file.mtime);
                await GDS.deleteFile(file.gdrive_id);
                Logger.success(file.name+"Has been updated");
            }
            else{
                files_mtime_corruped.push(file);
            }
        }
        return {files_mtime_corruped,filesUpdated}
    }
}
module.exports=BusServices