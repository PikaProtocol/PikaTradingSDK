
const methods = require('./methods');

// Re-export everything from the 'methods' module
module.exports = {
  ...methods
};

// getMarkPrice(1);
// approveAllowance(100)
// enableTrading()

// approveAllowanceForPerp()
// getPositionId(1, true)
// getPosition(1, false)
// getActivePositions()
// getActivePositionsFor(0xaaa...)
// openPosition(1, true, 1, 30, 1850, '0x')
// createOpenMarketOrderWithCloseTriggerOrders(1, true, 100, 100, 1850, 1500, 2000, '0x')
// modifyMargin(1, 30, 1, true)
// getActiveOrders()
// getActiveOrdersFor(0xaaa...)
// openOrder(1, false, 1, 30, 2000, true)
// closePosition(1, 30, true, 1850)
// cancelOrder(0, true)
// cancelMultipleOrders([], [])
// cancelAllOrders()
// createCloseTriggerOrders(1, 30, 1, true, 1600, 2000)
// createCloseOrder(1, 30, true, 2000, true)
// updateOpenOrder(1, 1, 1850, true, true)
// updateCloseOrder(1, 30, 1850, true, true)
