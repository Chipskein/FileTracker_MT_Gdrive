const sqlite3 = require('sqlite3').verbose();
const path=require('path');
const LogService = require('./logservice');
const DATABASE_PATH=`${path.resolve()}/src/database/data.db`;
const db=new sqlite3.Database(DATABASE_PATH);
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
                id TEXT(64),
                name TEXT(80) NOT NULL,
                description TEXT(100) NOT NULL,
                updated_at DATETIME
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
    getFilesSummaryById:(hashid)=>{
        db.get('SELECT * FROM files WHERE id= ? ',[hashid],(err,result)=>{
            if(err){
                console.log(err);
            } else{
                console.log(result);
            };
        })
        db.close();
    }
}
module.exports=DBService