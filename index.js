const {
	approveAllowance,
	enableTrading,
	getPosition,
	openPosition,
	createOpenMarketOrderWithCloseTriggerOrders,
	modifyMargin,
	openOrder,
	closePosition,
	cancelOrder,
	cancelOrderAll,
	createCloseTriggerOrders,
	createCloseOrder,
	updateOrder
} = require("./methods");

approveAllowance(100)
// enableTrading()

// getPosition(1, false)
// openPosition(1, true, 1, 30, 1850, '0x')
// createOpenMarketOrderWithCloseTriggerOrders(1, true, 100, 100, 1850, 1500, 2000, '0x')
// modifyMargin(1, 30, 1, true)
// openOrder(1, false, 1, 30, 2000, true)
// closePosition(1, 30, true, 1850)
// cancelOrder('limit', 0, true) //limit or stop
// cancelOrderAll([], [])
// createCloseTriggerOrders(1, 30, 1, true, 1600, 2000)
// createCloseOrder(1, 30, true, 2000, true)
// updateOrder(1, 1, 30, 1850, true, true)
