const colors=require('cli-colors');
const success=colors.green;
const warning=colors.yellow;
const error=colors.red;

class LogService{
    static log(txt){
        console.log(`[${new Date().toISOString()}]:::: ${txt}`);
    }
    static success(txt){
        console.log(success(`[${new Date().toISOString()}]:::: ${txt}::SUCCESS`));
    }
    static error(txt){
        console.log(error(`[${new Date().toISOString()}]:::: ${txt}::ERROR`));
        process.exit();
    }
    static warning(txt){
        console.log(warning(`[${new Date().toISOString()}]:::: ${txt}::ATTENTION`));
    }
}
module.exports=LogService