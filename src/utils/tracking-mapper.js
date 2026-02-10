// Maps Contract Enums back to original display strings
// Matches OrderStatus enum in AI-SCM.sol

export const TrackingStatus = {
    0: "OrderPlaced",
    1: "MaterialsRequested",
    2: "MaterialsDispatched",
    3: "ProductionCompleted",
    4: "DistributorAssigned",
    5: "InTransit",
    6: "Delivered",
    7: "ReturnRequested",
    8: "ReturnApproved",
    9: "ReturnRejected",
    10: "ReturnPickupAssigned",
    11: "ReturnPickedUp",
    12: "ReturnReceived",
    13: "RefundProcessed",
    14: "EscrowReleased"
};

export const TrackingStatusText = {
    0: "Order Placed",
    1: "Materials Requested from RMS",
    2: "Materials Dispatched",
    3: "Production Completed",
    4: "Assigned for Delivery",
    5: "In Transit",
    6: "Delivered to Consumer",
    7: "Return Requested",
    8: "Return Approved",
    9: "Return Rejected",
    10: "Assigned for Return Pickup",
    11: "Return Picked Up",
    12: "Return Received",
    13: "Refund Processed",
    14: "Escrow Released"
};

export const ActorRoleText = {
    0: "Consumer",
    1: "Manufacturer",
    2: "RawMaterialSupplier", // RMS
    3: "Distributor"
};

// Matches OrderStatus enum in AI-SCM.sol
export const OrderStatusText = {
    0: "Pending",
    1: "Materials Requested",
    2: "Materials Dispatched",
    3: "In Production",
    4: "Ready For Shipping",
    5: "In Transit",
    6: "Delivered",
    7: "Return Requested",
    8: "Return In Transit",
    9: "Return Received",
    10: "Refunded"
};

export const getOrderStatusText = (statusEnum) => {
    return OrderStatusText[Number(statusEnum)] || "Unknown Status";
};

export const getTrackingStatusText = (statusEnum) => {
    return TrackingStatusText[Number(statusEnum)] || "Unknown Status";
};

export const getActorRoleText = (roleEnum, statusEnum) => {
    // Special case for RMS acronym
    if (Number(roleEnum) === 2) return "RMS";
    return ActorRoleText[Number(roleEnum)] || "Unknown Actor";
};
