// Contract ABI and Address
// Replace CONTRACT_ADDRESS with your deployed contract address
export const CONTRACT_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016"; // TODO: Replace with actual address

export const CONTRACT_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "actor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum AISupplyChain.ActorRole",
				"name": "role",
				"type": "uint8"
			}
		],
		"name": "ActorRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "actor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum AISupplyChain.ActorRole",
				"name": "role",
				"type": "uint8"
			}
		],
		"name": "ActorRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "actor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum AISupplyChain.ActorRole",
				"name": "role",
				"type": "uint8"
			}
		],
		"name": "ActorRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "distributor",
				"type": "address"
			}
		],
		"name": "DistributorAssigned",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "rms",
				"type": "address"
			}
		],
		"name": "MaterialsDispatched",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "rms",
				"type": "address"
			}
		],
		"name": "MaterialsRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "distributor",
				"type": "address"
			}
		],
		"name": "OrderDelivered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "productId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "consumer",
				"type": "address"
			}
		],
		"name": "OrderPlaced",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "productId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "manufacturer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "ProductListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "productId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "ProductUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "manufacturer",
				"type": "address"
			}
		],
		"name": "ProductionCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "returnId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RefundDeposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "returnId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RefundProcessed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "returnId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			}
		],
		"name": "ReturnApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "returnId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "distributor",
				"type": "address"
			}
		],
		"name": "ReturnPickedUp",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "returnId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			}
		],
		"name": "ReturnReceived",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "returnId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "ReturnRejected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "returnId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "consumer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum AISupplyChain.ReturnReason",
				"name": "reason",
				"type": "uint8"
			}
		],
		"name": "ReturnRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "actor",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "role",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "status",
				"type": "string"
			}
		],
		"name": "TrackingPointAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "actorOrders",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "actorRoles",
		"outputs": [
			{
				"internalType": "enum AISupplyChain.ActorRole",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_returnId",
				"type": "uint256"
			}
		],
		"name": "approveReturn",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "completeProduction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "confirmDelivery",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_returnId",
				"type": "uint256"
			}
		],
		"name": "confirmReturnPickup",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_returnId",
				"type": "uint256"
			}
		],
		"name": "confirmReturnReceived",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_productId",
				"type": "uint256"
			}
		],
		"name": "deactivateProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "dispatchMaterials",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "distributorPool",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getActiveProducts",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "productId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "imageUri",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "manufacturer",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct AISupplyChain.Product[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_actor",
				"type": "address"
			}
		],
		"name": "getActorOrders",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_actor",
				"type": "address"
			}
		],
		"name": "getActorRole",
		"outputs": [
			{
				"internalType": "enum AISupplyChain.ActorRole",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDistributorPool",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getRawMaterialSupplierPool",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getManufacturerPool",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "getHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "actor",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "role",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "status",
						"type": "string"
					}
				],
				"internalType": "struct AISupplyChain.TrackingPoint[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "getOrder",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "bookingId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "productId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "consumer",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "manufacturer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "pricePaid",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "rmsAssigned",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "distributorAssigned",
						"type": "address"
					},
					{
						"internalType": "enum AISupplyChain.OrderStatus",
						"name": "status",
						"type": "uint8"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "exists",
						"type": "bool"
					}
				],
				"internalType": "struct AISupplyChain.Order",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_productId",
				"type": "uint256"
			}
		],
		"name": "getProduct",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "productId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "imageUri",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "manufacturer",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct AISupplyChain.Product",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "getRemainingReturnTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_returnId",
				"type": "uint256"
			}
		],
		"name": "getReturn",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "returnId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "bookingId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "consumer",
						"type": "address"
					},
					{
						"internalType": "enum AISupplyChain.ReturnReason",
						"name": "reason",
						"type": "uint8"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "requestedAt",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "completed",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "returnDistributor",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "refundAmount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "refundDeposited",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "refundProcessed",
						"type": "bool"
					}
				],
				"internalType": "struct AISupplyChain.ReturnRequest",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "getReturnByBookingId",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "returnId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "bookingId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "consumer",
						"type": "address"
					},
					{
						"internalType": "enum AISupplyChain.ReturnReason",
						"name": "reason",
						"type": "uint8"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "requestedAt",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "approved",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "completed",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "returnDistributor",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "pickedUp",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "refundAmount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "refundDeposited",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "refundProcessed",
						"type": "bool"
					}
				],
				"internalType": "struct AISupplyChain.ReturnRequest",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_stepIndex1",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_stepIndex2",
				"type": "uint256"
			}
		],
		"name": "getTimeBetweenSteps",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "getTotalProcessingTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "hasActiveReturn",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isDistributor",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			}
		],
		"name": "isReturnEligible",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_imageURI",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "listProduct",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "orderCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "orderHistory",
		"outputs": [
			{
				"internalType": "address",
				"name": "actor",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "role",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "status",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "orderToReturn",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "orders",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "productId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "consumer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "manufacturer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "pricePaid",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "rmsAssigned",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "distributorAssigned",
				"type": "address"
			},
			{
				"internalType": "enum AISupplyChain.OrderStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_productId",
				"type": "uint256"
			}
		],
		"name": "placeOrder",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "productCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "products",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "productId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUri",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "manufacturer",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_actor",
				"type": "address"
			},
			{
				"internalType": "enum AISupplyChain.ActorRole",
				"name": "_role",
				"type": "uint8"
			}
		],
		"name": "registerActor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_returnId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_rejectionReason",
				"type": "string"
			}
		],
		"name": "rejectReturn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_rmsAddress",
				"type": "address"
			}
		],
		"name": "requestMaterials",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bookingId",
				"type": "uint256"
			},
			{
				"internalType": "enum AISupplyChain.ReturnReason",
				"name": "_reason",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			}
		],
		"name": "requestReturn",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "returnCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "returnRequests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "returnId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bookingId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "consumer",
				"type": "address"
			},
			{
				"internalType": "enum AISupplyChain.ReturnReason",
				"name": "reason",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "requestedAt",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "completed",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "returnDistributor",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "refundAmount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "refundDeposited",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "refundProcessed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "returnWindow",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newWindow",
				"type": "uint256"
			}
		],
		"name": "updateReturnWindow",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_productId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_imageUri",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "updateProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_actor",
				"type": "address"
			}
		],
		"name": "removeActor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]