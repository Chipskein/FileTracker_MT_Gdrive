const Services =require('./services/services.js');

console.clear();

(async ()=>{
        Services.logs.warning('Starting Program');

        Services.logs.log('Loading Enviroment');
        await Services.file.loadEnviroment();

        Services.logs.log('Test Enviroment');
        (!Services.file.testEnvVariables()) ? Services.logs.error('Test Enviroment'):Services.logs.success('Test Enviroment');

        Services.logs.log('Prepare GDRIVE Variables');
        (!Services.file.prepareGDRIVEVariables()) ? Services.logs.error('Prepare GDRIVE Variables'):Services.logs.success('Prepare GDRIVE Variables');

        Services.logs.log('Test ReadFiles');
        (!Services.file.testReadFile()) ? Services.logs.error('Test ReadFiles'):Services.logs.success('Test ReadFiles');

        Services.logs.log('Test Gdrive Connection');
        await Services.gdrive.testConnection();

        Services.logs.log('Test Database');
        await Services.db.testDatabaseConnection();

        Services.logs.log('Test Files Table in database');
        await Services.db.checkFilesTable();

        Services.logs.log(`Insert or Not Files from ${process.env.MCD_DIR} in Files Table`);
        await Services.db.insertInFilesIfNotExists();

        Services.logs.log(`Verify GDRIVE ID in Files`);
        await Services.db.VerifyAllWithOutGdriveId();

        Services.logs.log(`Comparing mtime of file with file table last update`);
        await Services.db.CompareMtimeWithFileTable();
})()
/*
Services.logs.warning('Cleaning tmp/ dir');
Services.file.clearTMP();
Services.logs.success('Ending Program');
*/