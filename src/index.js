const Services =require('./services/services.js');

console.clear();
Services.logs.warning('Starting Program');

Services.logs.log('Loading Enviroment');
Services.file.loadEnviroment();

Services.logs.log('Test Enviroment');
(!Services.file.testEnvVariables()) ? Services.logs.error('Test Enviroment'):Services.logs.success('Test Enviroment');

Services.logs.log('Prepare GDRIVE Variables');
(!Services.file.prepareGDRIVEVariables()) ? Services.logs.error('Prepare GDRIVE Variables'):Services.logs.success('Prepare GDRIVE Variables');

Services.logs.log('Test ReadFiles');
(!Services.file.testReadFile()) ? Services.logs.error('Test ReadFiles'):Services.logs.success('Test ReadFiles');

Services.logs.log('Test Gdrive Connection');
(async ()=>{ await Services.gdrive.testConnection();})();

Services.logs.log('Test Database');
Services.db.testDatabaseConnection();

Services.logs.log('Test Files Table in database');
Services.db.checkFilesTable();

Services.logs.log(`Insert or Not Files from ${process.env.MCD_DIR} in Files Table`);
Services.db.insertInFilesIfNotExists();

Services.logs.log(`Verify GDRIVE ID in Files`);
(async ()=>{await Services.db.VerifyAllWithOutGdriveId()})();


Services.logs.log(`Comparing mtime of file with file table last update`);
Services.db.CompareMtimeWithFileTable();




