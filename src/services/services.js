const LogService = require("./logservice")
const GdriveService = require("./gdriveservice");
const FileService = require("./fileservice")
const DBService = require("./dbservice")
const Services={
    logs:LogService,
    gdrive:GdriveService,
    file:FileService,
    db:DBService
}
module.exports=Services