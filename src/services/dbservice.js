const sqlite3 = require('sqlite3').verbose();
const path=require('path');

const FileService = require('./fileservice');
const LogService = require('./logservice');
const GdriveService=require('./gdriveservice');

const DATABASE_PATH=`${path.resolve()}/src/database/data.db`;
const db=new sqlite3.Database(DATABASE_PATH,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
const DBService={
    testDatabaseConnection:()=>{
        db.get('SELECT 1+2 as test',[],(err,result)=>{
            if(err){
                LogService.error('Test Database'+err)
                process.exit();
            } else{
                if(result.test==3) LogService.success('Test Database');
            }
            ;
        })
    },
    checkFilesTable:()=>{
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
        db.get('SELECT name FROM sqlite_master WHERE type= ? AND name= ? ',['table','files'],(err,result)=>{
            if(err){
                LogService.error('Test Files Table in database'+err);
            } else{
                if (result&&result.name) LogService.success("Table files exists!");
                else{
                    db.run(sql,[],(result,err)=>{
                        if(err) LogService.error('Test Files Table in database,Table files NOT Created!'+err);
                        else{
                            LogService.warning("Table files created!");
                        }
                    });
                }
            }
            ;
        })

    },
    getFilesSummaryById:(hashid,callback)=>{
        db.get('SELECT * FROM files WHERE id= ? ',[hashid],(err,result)=>{
            if(err){
                LogService.error(`getFilesSummaryById FAIL::${err}`);
            } else{
                if(result) callback(result);
                else LogService.warning(`${hashid} not found in files table`);
            };
        })
    },
    insertInFilesIfNotExists:()=>{
        db.serialize(()=>{
            db.run("begin transaction");
            const files=FileService.readAllFromMCD_DIR();
            const Prepquery=db.prepare('INSERT OR IGNORE INTO files(id,name,description,extension,updated_at,path) VALUES (?,?,?,?,?,?)');
            for(let file of files){
                Prepquery.run(file.id,file.name,file.description,file.extension,file.updated_at,file.filepath);
            };
            Prepquery.finalize();
            db.run("commit");
        })
    },
    VerifyAllWithOutGdriveId:async ()=>{
        const sql=`SELECT * FROM files f where f.gdrive_id is null;`;
        db.all(sql,[],async (err,result)=>{
            if(err){
                LogService.error(`VerifyAllWithOutGdriveId`);
            } else{
                if(result.length>0){
                    for(let file of result){
                        await GdriveService.createAndUploadFile(file.name,file.path,(err,fileId)=>{
                            if(err){
                                LogService.error(`VerifyAllWithOutGdriveId`);
                            } else{
                                DBService.updateGdriveId({id:file.id,gdrive_id:fileId});
                            }
                        })
                    }
                }
                LogService.success(`Verify GDRIVE ID in Files`);
            }
        })
    },
    updateGdriveId:(file)=>{
        db.run(`UPDATE files SET gdrive_id = ? WHERE id = ?`,[file.gdrive_id,file.id],(result,err)=>{
            if(err){
                LogService.error('updateGdriveId,'+err);
            }
        })
    }
}
module.exports=DBService