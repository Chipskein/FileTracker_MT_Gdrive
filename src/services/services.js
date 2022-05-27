const LogService = require("./logservice")
const GdriveService = require("./gdriveservice");
const FileService = require("./fileservice")
const Services={
    logs:LogService,
    gdrive:GdriveService,
    file:FileService
}
module.exports=Services