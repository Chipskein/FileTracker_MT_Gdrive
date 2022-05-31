const sqlite3 = require('sqlite3').verbose();
const sqlite=require('sqlite');
const path=require('path');
const LogService = require('./logservice');

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
        if (result&&result.name) return true;
        else return await this.createTableFiles();
    }
    async createTableFiles(){
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
            return true;
        }
        catch(error){
            await db.close();
            return false;
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
    async insertInFilesIfNotExists(files){
        const db=await this.createConnection();
        try{
            await db.run("begin transaction");
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
            LogService.error(error);
        }
    }
    async VerifyUntrackedFiles(){
        LogService.warning(`Verify Untracked files `);
        const db=await this.createConnection();
        try{
            const sql=`SELECT * FROM files f where f.gdrive_id is null;`;
            const result=await db.all(sql)
            await db.close();
            if(result.length>0) return result;
            else false;
        }
        catch(error){
            await db.close();
            LogService.error(error);
        }
    }
    async updateGdriveId(file){
        const db=await this.createConnection();
        try{
            await db.run(`UPDATE files SET gdrive_id = ? WHERE id = ?`,[file.gdrive_id,file.id])
            LogService.success(file.id+' Updated');
            await db.close()
        }
        catch(error){
            await db.close();
            LogService.error(error);
        }
    }
    async updateMtime(id,mtime){
        const db=await this.createConnection();
        try{
            await db.run(`UPDATE files SET updated_at = ? WHERE id = ?`,[mtime,id]);
            await db.close();
            LogService.success(id+' Updated');
        }
        catch(error){
            await db.close();
            LogService(error);
        }
    }
    async CompareMtimeWithFileTable(realFiles){
        const db=await this.createConnection();
        try{
            const sql=`SELECT * FROM files f where id= ?`;
            const modified_files=[];
            for(let realfile of realFiles){
                let id=realfile.id;
                let mtime=new Date(realfile.updated_at).toISOString();
                const result=await db.get(sql,[id]);
                let FileTableMtime=new Date(result.updated_at).toISOString();
                if(FileTableMtime!=mtime) {
                    result.mtime=realfile.updated_at;
                    modified_files.push(result);
                }
            }
            await db.close();
            return modified_files;
        }
        catch(error){
            await db.close()
            LogService.error(error);
        }
    }
}
module.exports=DBService