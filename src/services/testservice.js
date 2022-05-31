const LogService = require("./logservice")
const GdriveService = require("./gdriveservice");
const FileService = require("./fileservice")
const DBService = require("./dbservice")

class TestService{
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
}
module.exports=TestService;