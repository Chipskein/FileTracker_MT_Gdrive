const LogService = require("./logservice")
const GdriveService = require("./gdriveservice");
const FileService = require("./fileservice")
const DBService = require("./dbservice")
const Services={
    logs:new LogService(),
    gdrive: new GdriveService(),
    file:new FileService(),
    db:new DBService()
}
module.exports=Services