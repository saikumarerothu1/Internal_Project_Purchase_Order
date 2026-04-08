const cds = require('@sap/cds');

module.exports = async (srv) => 
{        
    // Using CDS API      
    const Z_PURCHASE_ORDER_SERVICE = await cds.connect.to("Z_PURCHASE_ORDER_SERVICE"); 
      srv.on('READ', 'Z_PURCHASE_ORDER', req => Z_PURCHASE_ORDER_SERVICE.run(req.query)); 
}