const BusServices =require('./services/busservices.js');
const Service=new BusServices();
(async ()=>{await Service.start()})();

