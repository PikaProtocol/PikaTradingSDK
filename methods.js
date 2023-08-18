require("dotenv").config();
const Web3 = require("web3");
const { ethers } = require("ethers");
const privateKey = process.env.PRIVATE_KEY;
const traderAddress = process.env.TRADER_ADDRESS;
const rpc = process.env.RPC_URL;
const MAX_ALLOWANCE = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
const EXECUTION_FEE = 25000;
const {
	parseUnits,
} = require("./utils");

const GAS = 800000;
const web3 = new Web3(new Web3.providers.HttpProvider(rpc));

web3.eth.accounts.wallet.add({
	privateKey: privateKey,
	address: traderAddress
});

const PikaPerpV4_ABI = require("./abis/PikaPerpV4.json");
const PikaPerpV4_ADDR = "0x9b86B2Be8eDB2958089E522Fe0eB7dD5935975AB";

const OrderBook_ABI = require("./abis/OrderBook.json");
const OrderBook_ADDR = "0x835a179a9E1A57f15823eFc82bC460Eb2D9d2E7C";

const PositionManager_ABI = require("./abis/PositionManager.json");
const PositionManager_ADDR = "0xB67c152E69217b5aCB85A2e19dF13423351b0E27";

const PositionRouter_ABI = require("./abis/PositionRouter.json");
const PositionRouter_ADDR = "0xa78Cd820b198A943199deb0506E77d655b5078cC";

const USDC_ABI = require("./abis/USDC.json");
const USDC_ADDR = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";

const PikaPerpV4ContractInstance = new web3.eth.Contract(PikaPerpV4_ABI, PikaPerpV4_ADDR);
const PositionManagerContractInstance = new web3.eth.Contract(PositionManager_ABI, PositionManager_ADDR);
const PositionRouterContractInstance = new web3.eth.Contract(PositionRouter_ABI, PositionRouter_ADDR);
const OrderBookContractInstance = new web3.eth.Contract(OrderBook_ABI, OrderBook_ADDR);
const USDCContractInstance = new web3.eth.Contract(USDC_ABI, USDC_ADDR);


export async function approveAllowanceForPositionManager(amount = MAX_ALLOWANCE) {
	try {
		const amountToApprove = parseUnits(amount, 6);
		await USDCContractInstance.methods.approve(PositionManager_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function approveAllowanceForPositionRouter(amount = MAX_ALLOWANCE) {
	try {
		const amountToApprove = parseUnits(amount, 6);
		await USDCContractInstance.methods.approve(PositionRouter_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function approveAllowanceForOrderBook(amount = MAX_ALLOWANCE) {
	try {
		const amountToApprove = parseUnits(amount, 6);
		await USDCContractInstance.methods.approve(OrderBook_ADDR, amountToApprove)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function enableMarketOrder() {
	try {
		await PikaPerpV4ContractInstance.methods.setAccountManager(PositionManager_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function enablePositionManager() {
	try {
		await PositionManagerContractInstance.methods.setAccountManager(PositionRouter_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function enableOrderBook() {
	try {
		await OrderBookContractInstance.methods.setAccountManager(PositionRouter_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function enableLimitOrder() {
	try {
		await PikaPerpV4ContractInstance.methods.setAccountManager(OrderBook_ADDR, true)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

function getPositionId(productId, isLong) {
	const id = ethers.utils.formatUnits(ethers.utils.solidityKeccak256(
		['address', 'uint256', 'bool'],
		[traderAddress, productId, isLong]
	), 0);
	console.log(id)
	return id.toString();
}

export async function getPosition(productId, isLong) {
	const id = getPositionId(productId, isLong);
	const positionArr = await PikaPerpV4ContractInstance.methods.getPositions([id]).call();
	return positionArr[0];
}

export async function openPosition(productId, isLong, leverage, margin, acceptablePrice, referralCode) {
	try {
		await PositionManagerContractInstance.methods.createOpenPosition(traderAddress, productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE, ethers.utils.hexZeroPad(referralCode, 32))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function createOpenMarketOrderWithCloseTriggerOrders(productId, isLong, leverage, margin, acceptablePrice, SLPrice, TPPrice, referralCode) {
	try {
		let totalExecutionFee = EXECUTION_FEE;
		if (SLPrice > 0 && TPPrice > 0) {
			totalExecutionFee = 3 * EXECUTION_FEE;
		} else if (SLPrice > 0 || TPPrice > 0) {
			totalExecutionFee = 2 * EXECUTION_FEE;
		}
		await PositionRouterContractInstance.methods.createOpenMarketOrderWithCloseTriggerOrders(productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE, parseUnits(SLPrice, 8), parseUnits(TPPrice, 8), ethers.utils.hexZeroPad(referralCode, 32))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(totalExecutionFee, 10),
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function openOrder(productId, isLong, leverage, margin, triggerPrice, triggerAboveThrehold) {
	try {
		await OrderBookContractInstance.methods.createOpenOrder(traderAddress, productId, parseUnits(margin, 8), parseUnits(leverage), isLong, parseUnits(triggerPrice, 8), triggerAboveThrehold, EXECUTION_FEE)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function createCloseOrder(productId, size, isLong, triggerPrice, triggerAboveThreshold) {
	try {
		const res = await OrderBookContractInstance.methods.createCloseOrder(traderAddress, productId, parseUnits(size), isLong, parseUnits(triggerPrice, 8), triggerAboveThreshold)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function updateOrder(index, leverage, size, triggerPrice, triggerAboveThrehold, isOpen) {
	try {
		if (isOpen == true) {
			const res = await OrderBookContractInstance.methods.updateOpenOrder(index, leverage, parseUnits(triggerPrice, 8), triggerAboveThrehold)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					maxPriorityFeePerGas: 3
				})
		} else {
			const res = await OrderBookContractInstance.methods.updateCloseOrder(index, size, parseUnits(triggerPrice, 8), triggerAboveThrehold)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					maxPriorityFeePerGas: 3
				})
		}
	} catch (error) {
		console.log('error---', error)
	}
}

export async function cancelOrder(orderType, index, isOpen) {
	try {
		if (isOpen) {
			const res = await OrderBookContractInstance.methods.cancelOpenOrder(index)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					maxPriorityFeePerGas: 3
				})
		} else {
			const res = await OrderBookContractInstance.methods.cancelCloseOrder(traderAddress, index)
				.send({
					from: traderAddress,
					chainId: 10,
					gas: GAS,
					maxPriorityFeePerGas: 3
				})
		}
	} catch (error) {
		console.log('error---', error)
	}
}

export async function cancelOrderAll(openOrderIndexes, closeOrderIndexes) {
	try {
		await OrderBookContractInstance.methods.cancelMultiple(openOrderIndexes, closeOrderIndexes)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function modifyMargin(positionId, margin, productId, shouldIncrease) {
	try {
		await PikaPerpV4ContractInstance.methods.modifyMargin(positionId, parseUnits(margin, 8), shouldIncrease)
			.send({
				from: traderAddress,
				chainId: 10,
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function closePosition(productId, margin, isLong, acceptablePrice) {
	try {
		await PositionManagerContractInstance.methods.createClosePosition(traderAddress, productId, parseUnits(margin), isLong, parseUnits(acceptablePrice, 8), EXECUTION_FEE)
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(EXECUTION_FEE, 10),
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function createCloseTriggerOrders(productId, margin, leverage, isLong, SLPrice, TPPrice) {
	try {
		let totalExecutionFee = 0;
		if (SLPrice > 0 && TPPrice > 0) {
			totalExecutionFee = 2 * EXECUTION_FEE;
		} else if (SLPrice > 0 || TPPrice > 0) {
			totalExecutionFee = 1 * EXECUTION_FEE;
		}
		await PositionRouterContractInstance.methods.createCloseTriggerOrders(productId, parseUnits(margin), parseUnits(leverage), isLong, EXECUTION_FEE, parseUnits(SLPrice, 8), parseUnits(TPPrice, 8))
			.send({
				from: traderAddress,
				chainId: 10,
				value: parseUnits(totalExecutionFee, 10),
				gas: GAS,
				maxPriorityFeePerGas: 3
			})
	} catch (error) {
		console.log('error---', error)
	}
}

export async function approveAllowance(amount) {
	await approveAllowanceForPositionManager(amount)
	await approveAllowanceForPositionRouter(amount)
	await approveAllowanceForOrderBook(amount)
}

export async function enableTrading() {
	await enableMarketOrder()
	await enablePositionManager()
	await enableOrderBook()
	await enableLimitOrder()
}

