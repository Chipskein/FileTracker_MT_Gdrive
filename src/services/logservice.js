const colors=require('cli-colors');
const success=colors.green;
const warning=colors.yellow;
const error=colors.red;

class LogService{
    log(txt){
        console.log(`[${new Date().toISOString()}]:::: ${txt}`);
    }
    success(txt){
        console.log(success(`[${new Date().toISOString()}]:::: ${txt}::SUCCESS`));
    }
    error(txt){
        console.log(error(`[${new Date().toISOString()}]:::: ${txt}::ERROR`));
        process.exit();
    }
    warning(txt){
        console.log(warning(`[${new Date().toISOString()}]:::: ${txt}::ATTENTION`));
    }
}
module.exports=LogService