const Services =require('./services/services.js');

Services.logs.log('Starting Program');

Services.logs.log('Loading Enviroment');
Services.file.loadEnviroment();

Services.logs.log('Test Enviroment');
(!Services.file.testEnvVariables()) ? Services.logs.error('Test Enviroment'):Services.logs.success('Test Enviroment');

Services.logs.log('Prepare GDRIVE Variables');
(!Services.file.prepareGDRIVEVariables()) ? Services.logs.error('Prepare GDRIVE Variables'):Services.logs.success('Prepare GDRIVE Variables');


Services.logs.log('Test ReadFiles');
(!Services.file.testReadFile()) ? Services.logs.error('Test Enviroment'):Services.logs.success('Test ReadFiles');

Services.logs.log('Test Gdrive Connection');
(async ()=>{ await Services.gdrive.testConnection();})();

Services.logs.log('Test Database');
Services.db.testDatabaseConnection();


Services.logs.log('Test Files Table in database');
Services.db.checkFilesTable();







//Services.logs.success('End script :)');
//process.exit();



