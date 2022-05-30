const sqlite3 = require('sqlite3').verbose();
const sqlite=require('sqlite');
const path=require('path');

const GdriveService=require('./gdriveservice');
const FileService = require('./fileservice');
const LogService = require('./logservice');

const Logger=new LogService();

class DBService{
    constructor(){
        this.DATABASE_PATH=`${path.resolve()}/src/database/data.db`;
        this.driver=sqlite3.Database
    }
    async createConnection(){
        const db=this.db=await sqlite.open({ filename: this.DATABASE_PATH, driver: sqlite3.Database })
        return db;
    }
    async testDatabaseConnection(){
        const db=await this.createConnection();
        const { test }=await db.get('SELECT 1+2 as test');
        await db.close();
        if(test==3) return true;
        else false;
    }
    async checkFilesTable(){
        const db=await this.createConnection();
        const result=await db.get('SELECT name FROM sqlite_master WHERE type= ? AND name= ? ',['table','files'])
        await db.close();
        if (result&&result.name) Logger.success("Table files exists!");
        else await this.createTableFiles();
    }
    async createTableFiles(){
        Logger.warning("Creating files table");
        const db=await this.createConnection();
        try{
            const sql=`
                CREATE TABLE files (
                    id TEXT(64) NOT NULL,
                    name TEXT(80) NOT NULL,
                    description TEXT(100) NOT NULL,
                    extension TEXT NOT NULL,
                    updated_at DATETIME NOT NULL,
                    path TEXT NOT NULL,
                    gdrive_id TEXT(64),
                    PRIMARY KEY(id)
                );
            `;
            await this.db.run(sql);
            await db.close();
        }
        catch(error){
            await db.close();
            Logger.error(error);
        }
    }
    async getFilesSummaryById(hashid,callback){
        db.get('SELECT * FROM files WHERE id= ? ',[hashid],(err,result)=>{
            if(err){
                LogService.error(`getFilesSummaryById FAIL::${err}`);
            } else{
                if(result) callback(result);
                else LogService.warning(`${hashid} not found in files table`);
            };
        })
    }
    async insertInFilesIfNotExists(){
        const db=await this.createConnection();
        try{
            await db.run("begin transaction");
            const files=FileService.readAllFromMCD_DIR();
            const Prepquery=await db.prepare('INSERT OR IGNORE INTO files(id,name,description,extension,updated_at,path) VALUES (?,?,?,?,?,?)');
            for(let file of files){
                await Prepquery.run(file.id,file.name,file.description,file.extension,file.updated_at,file.filepath);
            };
            await Prepquery.finalize();
            await db.run("commit");
            await db.close();
        }
        catch(error){
            await db.close();
            Logger.error(error);
        }
    }
    async VerifyAllWithOutGdriveId(){
        Logger.warning(`Verify GDRIVE ID in Files`);
        const db=await this.createConnection();
        try{
            const sql=`SELECT * FROM files f where f.gdrive_id is null;`;
            const result=await db.all(sql)
            const Gdriver=new GdriveService()
            if(result.length>0){
                for(let file of result){
                    const { id }=await Gdriver.createAndUploadFile(file.name,file.path)  
                    await this.updateGdriveId({id:file.id,gdrive_id:id});
                }
            }
            Logger.success(`Verify GDRIVE ID in Files`);
            await db.close();
        }
        catch(error){
            await db.close();
            Logger.error(error);
        }
    }
    async updateGdriveId(file){
        const db=await this.createConnection();
        try{
            await db.run(`UPDATE files SET gdrive_id = ? WHERE id = ?`,[file.gdrive_id,file.id])
            Logger.success(file.id+'updated');
            await db.close()
        }
        catch(error){
            await db.close();
            Logger.error(error);
        }
    }
    async updateMtime(id,mtime){
        const db=await this.createConnection();
        try{
            await db.run(`UPDATE files SET updated_at = ? WHERE id = ?`,[mtime,id]);
            await db.close();
            Logger.success(id+' Updated');
        }
        catch(error){
            await db.close();
            Logger(error);
        }
    }
    async CompareMtimeWithFileTable(){
        const db=await this.createConnection();
        try{
            const sql=`SELECT * FROM files f where id= ?`;
            const realFiles=FileService.readAllFromMCD_DIR();
            for(let realfile of realFiles){
                let id=realfile.id;
                let mtime=new Date(realfile.updated_at).toISOString();
                const result=await db.get(sql,[id]);
                let FileTableMtime=new Date(result.updated_at).toISOString();
                if(FileTableMtime!=mtime){
                    await FileService.SyncFile(result.id,result.name,result.gdrive_id,mtime)
                }
            }
            await db.close()   
        }
        catch(error){
            await db.close()
            Logger.error(error);
        }
    }
}
module.exports=DBService