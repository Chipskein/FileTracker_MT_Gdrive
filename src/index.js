const Services =require('./services/services.js');
Services.logs.log('Starting Program');

Services.logs.log('Loading Enviroment');
Services.file.loadEnviroment();

Services.logs.log('Test Enviroment');
(!Services.file.testEnvVariables()) ? Services.logs.error('Test Enviroment'):"";
Services.logs.success('Test Enviroment');

Services.logs.log('Test ReadFiles');
Services.file.testReadFile();
(!Services.file.testReadFile()) ? Services.logs.error('Test Enviroment'):"";
Services.logs.success('Test ReadFiles');

//Test Google Drive








Services.logs.success('End script :)');
process.exit();



