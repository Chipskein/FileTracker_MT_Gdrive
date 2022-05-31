const BusService =require('./services/busservice.js');
const Service=new BusService();
(async ()=>{await Service.start()})();

