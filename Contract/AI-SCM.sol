// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AISupplyChain {
    
    // ==================== ENUMS & STRUCTS ====================
    
    enum OrderStatus {
        Pending,              // 0: Order placed by consumer
        MaterialsRequested,   // 1: MFR requested materials from RMS
        MaterialsDispatched,  // 2: RMS dispatched materials
        InProduction,         // 3: MFR received materials, producing
        ReadyForShipping,     // 4: MFR completed production
        InTransit,            // 5: Distributor picked up
        Delivered,            // 6: Delivered to consumer
        ReturnRequested,      // 7: Consumer requested return
        ReturnInTransit,      // 8: Distributor picking up return
        ReturnReceived,       // 9: Manufacturer received return
        Refunded              // 10: Consumer refunded
    }
    
    enum ReturnReason {
        Defective,
        WrongItem,
        NotAsDescribed,
        ChangedMind,
        Other
    }
    
    struct ReturnRequest {
        uint256 returnId;
        uint256 bookingId;
        address consumer;
        ReturnReason reason;
        string description;
        uint256 requestedAt;
        bool approved;
        bool completed;
        address returnDistributor;
        bool pickedUp;               // Whether distributor has picked up the return
        uint256 refundAmount;        // Amount to refund (matches ABI)
        bool refundDeposited;        // Whether refund has been deposited (matches ABI)
        bool refundProcessed;        // Whether refund has been processed (matches ABI)
    }
    
    enum ActorRole {
        Consumer,
        Manufacturer,
        RawMaterialSupplier,
        Distributor
    }
    
    struct TrackingPoint {
        address actor;
        string role;
        uint256 timestamp;
        string status;
    }
    
    struct Product {
        uint256 productId;
        string name;
        string imageUri;
        string description;
        uint256 price;
        address manufacturer;
        bool isActive;
    }
    
    struct Order {
        uint256 bookingId;
        uint256 productId;
        address consumer;
        address manufacturer;
        uint256 pricePaid;         // Amount paid by consumer (matches ABI)
        address rmsAssigned;
        address distributorAssigned;
        OrderStatus status;
        uint256 createdAt;
        bool exists;
    }
    
    // ==================== STATE VARIABLES ====================
    
    address public owner;
    uint256 public productCounter;
    uint256 public orderCounter;
    uint256 public returnCounter;
    uint256 public returnWindow = 7 days; // Default return window
    
    // Registries
    mapping(address => ActorRole) public actorRoles;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Order) public orders;
    
    // Return system
    mapping(uint256 => ReturnRequest) public returnRequests;
    mapping(uint256 => uint256) public orderToReturn; // bookingId => returnId
    mapping(uint256 => bool) public hasActiveReturn; // bookingId => bool
    
    // Tracking system for AI analysis
    mapping(uint256 => TrackingPoint[]) public orderHistory;
    
    // Dashboard views - each actor sees only their relevant orders
    mapping(address => uint256[]) public actorOrders;
    
    // Distributor pool for random selection
    address[] public distributorPool;
    mapping(address => bool) public isDistributor;

    // RMS Pool for manufacturer selection
    address[] public rmsPool;
    mapping(address => bool) public isRMS;
    
    // ==================== EVENTS ====================
    
    event ActorRegistered(address indexed actor, ActorRole role);
    event ProductListed(uint256 indexed productId, address indexed manufacturer, string name);
    event ProductUpdated(uint256 indexed productId, string name, uint256 price);
    event OrderPlaced(uint256 indexed bookingId, uint256 indexed productId, address indexed consumer);
    event MaterialsRequested(uint256 indexed bookingId, address indexed rms);
    event MaterialsDispatched(uint256 indexed bookingId, address indexed rms);
    event ProductionCompleted(uint256 indexed bookingId, address indexed manufacturer);
    event DistributorAssigned(uint256 indexed bookingId, address indexed distributor);
    event OrderDelivered(uint256 indexed bookingId, address indexed distributor);
    event TrackingPointAdded(uint256 indexed bookingId, address actor, string role, string status);
    
    // Return events
    event ReturnRequested(uint256 indexed returnId, uint256 indexed bookingId, address indexed consumer, ReturnReason reason);
    event ReturnApproved(uint256 indexed returnId, uint256 indexed bookingId);
    event ReturnRejected(uint256 indexed returnId, uint256 indexed bookingId, string reason);
    event ReturnPickedUp(uint256 indexed returnId, address indexed distributor);
    event ReturnReceived(uint256 indexed returnId, uint256 indexed bookingId);
    event RefundProcessed(uint256 indexed returnId, uint256 indexed bookingId, uint256 amount);
    
    // ==================== MODIFIERS ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyManufacturer() {
        require(actorRoles[msg.sender] == ActorRole.Manufacturer, "Only manufacturers allowed");
        _;
    }
    
    modifier onlyConsumer() {
        require(actorRoles[msg.sender] == ActorRole.Consumer, "Only consumers allowed");
        _;
    }
    
    modifier onlyRMS() {
        require(actorRoles[msg.sender] == ActorRole.RawMaterialSupplier, "Only RMS allowed");
        _;
    }
    
    modifier onlyDistributor() {
        require(actorRoles[msg.sender] == ActorRole.Distributor, "Only distributors allowed");
        _;
    }
    
    modifier orderExists(uint256 _bookingId) {
        require(orders[_bookingId].exists, "Order does not exist");
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor() {
        owner = msg.sender;
    }
    
    // ==================== ACTOR REGISTRATION ====================
    
    function registerActor(address _actor, ActorRole _role) external onlyOwner {
        actorRoles[_actor] = _role;
        
        if (_role == ActorRole.Distributor) {
            if (!isDistributor[_actor]) {
                distributorPool.push(_actor);
                isDistributor[_actor] = true;
            }
        } else if (_role == ActorRole.RawMaterialSupplier) {
            if (!isRMS[_actor]) {
                rmsPool.push(_actor);
                isRMS[_actor] = true;
            }
        }
        
        emit ActorRegistered(_actor, _role);
    }
    
    // ==================== PRODUCT MANAGEMENT ====================
    
    function listProduct(
        string memory _name,
        string memory _imageURI,
        string memory _description,
        uint256 _price
    ) external onlyManufacturer returns (uint256) {
        productCounter++;
        
        products[productCounter] = Product({
            productId: productCounter,
            name: _name,
            imageUri: _imageURI,
            description: _description,
            price: _price,
            manufacturer: msg.sender,
            isActive: true
        });
        
        emit ProductListed(productCounter, msg.sender, _name);
        return productCounter;
    }
    
    function deactivateProduct(uint256 _productId) external {
        require(products[_productId].manufacturer == msg.sender, "Not your product");
        products[_productId].isActive = false;
    }

    function updateProduct(
        uint256 _productId,
        string memory _name,
        string memory _imageUri,
        string memory _description,
        uint256 _price
    ) external {
        require(products[_productId].manufacturer == msg.sender, "Not your product");
        require(products[_productId].isActive, "Product is not active");

        Product storage product = products[_productId];
        product.name = _name;
        product.imageUri = _imageUri;
        product.description = _description;
        product.price = _price;

        emit ProductUpdated(_productId, _name, _price);
    }
    
    // ==================== ORDER WORKFLOW ====================
    
    // Step 1: Consumer places order
    function placeOrder(uint256 _productId) external onlyConsumer payable returns (uint256) {
        Product memory product = products[_productId];
        require(product.isActive, "Product not available");
        require(msg.value >= product.price, "Insufficient payment");
        
        orderCounter++;
        uint256 bookingId = orderCounter;
        
        orders[bookingId] = Order({
            bookingId: bookingId,
            productId: _productId,
            consumer: msg.sender,
            manufacturer: product.manufacturer,
            pricePaid: msg.value,     // Store the amount paid by consumer
            rmsAssigned: address(0),
            distributorAssigned: address(0),
            status: OrderStatus.Pending,
            createdAt: block.timestamp,
            exists: true
        });
        
        // Add to dashboards
        actorOrders[msg.sender].push(bookingId);
        actorOrders[product.manufacturer].push(bookingId);
        
        // Track this event
        _addTrackingPoint(bookingId, msg.sender, "Consumer", "Order Placed");
        
        emit OrderPlaced(bookingId, _productId, msg.sender);
        return bookingId;
    }
    
    // Step 2: Manufacturer requests materials from RMS
    function requestMaterials(uint256 _bookingId, address _rmsAddress) 
        external 
        onlyManufacturer 
        orderExists(_bookingId) 
    {
        Order storage order = orders[_bookingId];
        require(order.manufacturer == msg.sender, "Not your order");
        require(order.status == OrderStatus.Pending, "Invalid status");
        require(actorRoles[_rmsAddress] == ActorRole.RawMaterialSupplier, "Invalid RMS address");
        
        order.rmsAssigned = _rmsAddress;
        order.status = OrderStatus.MaterialsRequested;
        
        // Add to RMS dashboard
        actorOrders[_rmsAddress].push(_bookingId);
        
        _addTrackingPoint(_bookingId, msg.sender, "Manufacturer", "Materials Requested from RMS");
        
        emit MaterialsRequested(_bookingId, _rmsAddress);
    }
    
    // Step 3: RMS dispatches materials to Manufacturer
    function dispatchMaterials(uint256 _bookingId) 
        external 
        onlyRMS 
        orderExists(_bookingId) 
    {
        Order storage order = orders[_bookingId];
        require(order.rmsAssigned == msg.sender, "Not assigned to you");
        require(order.status == OrderStatus.MaterialsRequested, "Invalid status");
        
        order.status = OrderStatus.MaterialsDispatched;
        
        _addTrackingPoint(_bookingId, msg.sender, "Raw Material Supplier", "Materials Dispatched to Manufacturer");
        
        emit MaterialsDispatched(_bookingId, msg.sender);
    }
    
    // Step 4: Manufacturer completes production (triggers random distributor selection)
    function completeProduction(uint256 _bookingId) 
        external 
        onlyManufacturer 
        orderExists(_bookingId) 
    {
        Order storage order = orders[_bookingId];
        require(order.manufacturer == msg.sender, "Not your order");
        require(order.status == OrderStatus.MaterialsDispatched, "Invalid status");
        require(distributorPool.length > 0, "No distributors available");
        
        // Mark production complete
        order.status = OrderStatus.ReadyForShipping;
        _addTrackingPoint(_bookingId, msg.sender, "Manufacturer", "Production Completed - Ready for Shipping");
        
        // AUTOMATIC RANDOM DISTRIBUTOR SELECTION
        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, distributorPool.length))
        ) % distributorPool.length;
        
        address selectedDistributor = distributorPool[randomIndex];
        order.distributorAssigned = selectedDistributor;
        order.status = OrderStatus.InTransit;
        
        // Add to distributor dashboard
        actorOrders[selectedDistributor].push(_bookingId);
        
        _addTrackingPoint(_bookingId, selectedDistributor, "Distributor", "Randomly Assigned for Delivery");
        
        emit ProductionCompleted(_bookingId, msg.sender);
        emit DistributorAssigned(_bookingId, selectedDistributor);
    }
    
    // Step 5: Distributor confirms delivery to consumer
    function confirmDelivery(uint256 _bookingId) 
        external 
        onlyDistributor 
        orderExists(_bookingId) 
    {
        Order storage order = orders[_bookingId];
        require(order.distributorAssigned == msg.sender, "Not assigned to you");
        require(order.status == OrderStatus.InTransit, "Invalid status");
        
        order.status = OrderStatus.Delivered;
        
        _addTrackingPoint(_bookingId, msg.sender, "Distributor", "Delivered to Consumer");
        
        // Transfer payment to manufacturer
        (bool success, ) = payable(order.manufacturer).call{value: products[order.productId].price}("");
require(success, "Transfer to manufacturer failed");
        
        emit OrderDelivered(_bookingId, msg.sender);
    }
    
    // ==================== TRACKING SYSTEM ====================
    
    function _addTrackingPoint(
        uint256 _bookingId,
        address _actor,
        string memory _role,
        string memory _status
    ) private {
        orderHistory[_bookingId].push(TrackingPoint({
            actor: _actor,
            role: _role,
            timestamp: block.timestamp,
            status: _status
        }));
        
        emit TrackingPointAdded(_bookingId, _actor, _role, _status);
    }
    
    // ==================== VIEW FUNCTIONS FOR AI & DASHBOARDS ====================
    
    // Get complete tracking history for AI analysis
    function getHistory(uint256 _bookingId) 
        external 
        view 
        orderExists(_bookingId) 
        returns (TrackingPoint[] memory) 
    {
        return orderHistory[_bookingId];
    }
    
    // Get all orders for a specific actor (their dashboard)
    function getActorOrders(address _actor) external view returns (uint256[] memory) {
        return actorOrders[_actor];
    }
    
    // Get order details
    function getOrder(uint256 _bookingId) 
        external 
        view 
        orderExists(_bookingId) 
        returns (Order memory) 
    {
        return orders[_bookingId];
    }
    
    // Get product details
    function getProduct(uint256 _productId) external view returns (Product memory) {
        return products[_productId];
    }
    
    // Get all active products
    function getActiveProducts() external view returns (Product[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= productCounter; i++) {
            if (products[i].isActive) activeCount++;
        }
        
        Product[] memory activeProducts = new Product[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= productCounter; i++) {
            if (products[i].isActive) {
                activeProducts[index] = products[i];
                index++;
            }
        }
        return activeProducts;
    }
    
    // Get distributor pool
    function getDistributorPool() external view returns (address[] memory) {
        return distributorPool;
    }

    // Get RMS pool
    function getRawMaterialSupplierPool() external view returns (address[] memory) {
        return rmsPool;
    }
    
    // Get actor role
    function getActorRole(address _actor) external view returns (ActorRole) {
        return actorRoles[_actor];
    }
    
    // ==================== AI ANALYTICS HELPERS ====================
    
    // Calculate time between two tracking points (for AI to analyze delays)
    function getTimeBetweenSteps(uint256 _bookingId, uint256 _stepIndex1, uint256 _stepIndex2) 
        external 
        view 
        orderExists(_bookingId) 
        returns (uint256) 
    {
        TrackingPoint[] memory history = orderHistory[_bookingId];
        require(_stepIndex2 < history.length && _stepIndex1 < history.length, "Invalid indices");
        require(_stepIndex2 > _stepIndex1, "Step 2 must be after Step 1");
        
        return history[_stepIndex2].timestamp - history[_stepIndex1].timestamp;
    }
    
    // Get total order processing time
    function getTotalProcessingTime(uint256 _bookingId) 
        external 
        view 
        orderExists(_bookingId) 
        returns (uint256) 
    {
        TrackingPoint[] memory history = orderHistory[_bookingId];
        if (history.length < 2) return 0;
        
        return history[history.length - 1].timestamp - history[0].timestamp;
    }
    
    // ==================== RETURN MANAGEMENT SYSTEM ====================
    
    // Step 1: Consumer initiates return request
    function requestReturn(
        uint256 _bookingId,
        ReturnReason _reason,
        string memory _description
    ) external orderExists(_bookingId) returns (uint256) {
        Order storage order = orders[_bookingId];
        
        require(order.consumer == msg.sender, "Not your order");
        require(order.status == OrderStatus.Delivered, "Order not delivered yet");
        require(!hasActiveReturn[_bookingId], "Return already requested for this order");
        require(
            block.timestamp <= order.createdAt + returnWindow,
            "Return window expired"
        );
        
        returnCounter++;
        uint256 returnId = returnCounter;
        
        returnRequests[returnId] = ReturnRequest({
            returnId: returnId,
            bookingId: _bookingId,
            consumer: msg.sender,
            reason: _reason,
            description: _description,
            requestedAt: block.timestamp,
            approved: false,
            completed: false,
            returnDistributor: address(0),
            pickedUp: false,            // Initially false, set by distributor
            refundAmount: 0,            // Will be set when refund is processed
            refundDeposited: false,     // Initially false
            refundProcessed: false      // Initially false
        });
        
        orderToReturn[_bookingId] = returnId;
        hasActiveReturn[_bookingId] = true;
        order.status = OrderStatus.ReturnRequested;
        
        _addTrackingPoint(
            _bookingId,
            msg.sender,
            "Consumer",
            string(abi.encodePacked("Return Requested - Reason: ", _getReasonString(_reason)))
        );
        
        emit ReturnRequested(returnId, _bookingId, msg.sender, _reason);
        return returnId;
    }
    
    // Step 2: Manufacturer approves or rejects return
    function approveReturn(uint256 _returnId) external payable onlyManufacturer {
        ReturnRequest storage returnReq = returnRequests[_returnId];
        Order storage order = orders[returnReq.bookingId];
        
        require(returnReq.bookingId > 0, "Return does not exist");
        require(order.manufacturer == msg.sender, "Not your order");
        require(!returnReq.approved, "Return already processed");
        require(order.status == OrderStatus.ReturnRequested, "Invalid order status");
        require(msg.value >= order.pricePaid, "Must deposit refund amount");
        
        returnReq.approved = true;
        returnReq.refundAmount = msg.value;       // Store the deposited refund
        returnReq.refundDeposited = true;         // Mark refund as deposited
        
        // Randomly assign a distributor for return pickup
        require(distributorPool.length > 0, "No distributors available");
        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, returnReq.returnId))
        ) % distributorPool.length;
        
        address selectedDistributor = distributorPool[randomIndex];
        returnReq.returnDistributor = selectedDistributor;
        order.status = OrderStatus.ReturnInTransit;
        
        // Add to distributor's return dashboard
        actorOrders[selectedDistributor].push(returnReq.bookingId);
        
        _addTrackingPoint(
            returnReq.bookingId,
            msg.sender,
            "Manufacturer",
            "Return Approved - Refund Deposited - Distributor Assigned for Pickup"
        );
        
        _addTrackingPoint(
            returnReq.bookingId,
            selectedDistributor,
            "Distributor",
            "Assigned for Return Pickup"
        );
        
        emit ReturnApproved(_returnId, returnReq.bookingId);
        emit DistributorAssigned(returnReq.bookingId, selectedDistributor);
    }
    
    function rejectReturn(uint256 _returnId, string memory _rejectionReason) external onlyManufacturer {
        ReturnRequest storage returnReq = returnRequests[_returnId];
        Order storage order = orders[returnReq.bookingId];
        
        require(returnReq.bookingId > 0, "Return does not exist");
        require(order.manufacturer == msg.sender, "Not your order");
        require(!returnReq.approved, "Return already approved");
        require(order.status == OrderStatus.ReturnRequested, "Invalid order status");
        
        // Reset order status back to delivered
        order.status = OrderStatus.Delivered;
        hasActiveReturn[returnReq.bookingId] = false;
        
        _addTrackingPoint(
            returnReq.bookingId,
            msg.sender,
            "Manufacturer",
            string(abi.encodePacked("Return Rejected - ", _rejectionReason))
        );
        
        emit ReturnRejected(_returnId, returnReq.bookingId, _rejectionReason);
    }
    
    // Step 3: Distributor confirms pickup from consumer
    function confirmReturnPickup(uint256 _returnId) external onlyDistributor {
        ReturnRequest storage returnReq = returnRequests[_returnId];
        Order storage order = orders[returnReq.bookingId];
        
        require(returnReq.bookingId > 0, "Return does not exist");
        require(returnReq.approved, "Return not approved yet");
        require(!returnReq.pickedUp, "Return already picked up");
        require(returnReq.returnDistributor == msg.sender, "Not assigned to you");
        require(order.status == OrderStatus.ReturnInTransit, "Invalid order status");
        
        returnReq.pickedUp = true;  // Mark as picked up
        
        _addTrackingPoint(
            returnReq.bookingId,
            msg.sender,
            "Distributor",
            "Return Item Picked Up from Consumer"
        );
        
        emit ReturnPickedUp(_returnId, msg.sender);
    }
    
    // Step 4: Manufacturer confirms return received and processes refund
    function confirmReturnReceived(uint256 _returnId) external onlyManufacturer {
        ReturnRequest storage returnReq = returnRequests[_returnId];
        Order storage order = orders[returnReq.bookingId];
        
        require(returnReq.bookingId > 0, "Return does not exist");
        require(returnReq.approved, "Return not approved");
        require(returnReq.pickedUp, "Return not picked up by distributor yet");
        require(returnReq.refundDeposited, "Refund not deposited");
        require(order.manufacturer == msg.sender, "Not your order");
        require(order.status == OrderStatus.ReturnInTransit, "Invalid order status");
        require(!returnReq.completed, "Return already completed");
        
        returnReq.completed = true;
        order.status = OrderStatus.ReturnReceived;
        
        _addTrackingPoint(
            returnReq.bookingId,
            msg.sender,
            "Manufacturer",
            "Return Received - Processing Refund"
        );
        
        // Process refund to consumer using the deposited amount
        uint256 refundAmount = returnReq.refundAmount;
        returnReq.refundProcessed = true;
        (bool success, ) = payable(order.consumer).call{value: refundAmount}("");
        require(success, "Refund to consumer failed");
        
        order.status = OrderStatus.Refunded;
        
        _addTrackingPoint(
            returnReq.bookingId,
            order.consumer,
            "Consumer",
            "Refund Processed"
        );
        
        emit ReturnReceived(_returnId, returnReq.bookingId);
        emit RefundProcessed(_returnId, returnReq.bookingId, refundAmount);
    }
    
    // ==================== RETURN SYSTEM VIEW FUNCTIONS ====================
    
    // Get return details
    function getReturn(uint256 _returnId) external view returns (ReturnRequest memory) {
        require(returnRequests[_returnId].bookingId > 0, "Return does not exist");
        return returnRequests[_returnId];
    }
    
    // Get return by booking ID
    function getReturnByBookingId(uint256 _bookingId) external view orderExists(_bookingId) returns (ReturnRequest memory) {
        uint256 returnId = orderToReturn[_bookingId];
        require(returnId > 0, "No return for this order");
        return returnRequests[returnId];
    }
    
    // Check if order is eligible for return
    function isReturnEligible(uint256 _bookingId) external view orderExists(_bookingId) returns (bool) {
        Order memory order = orders[_bookingId];
        
        if (order.status != OrderStatus.Delivered) return false;
        if (hasActiveReturn[_bookingId]) return false;
        if (block.timestamp > order.createdAt + returnWindow) return false;
        
        return true;
    }
    
    // Get remaining return window time
    function getRemainingReturnTime(uint256 _bookingId) external view orderExists(_bookingId) returns (uint256) {
        Order memory order = orders[_bookingId];
        uint256 deadline = order.createdAt + returnWindow;
        
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }
    
    // Admin: Update return window (only owner)
    function updateReturnWindow(uint256 _newWindow) external onlyOwner {
        require(_newWindow > 0, "Invalid return window");
        returnWindow = _newWindow;
    }
    
    // Helper function to convert ReturnReason enum to string
    function _getReasonString(ReturnReason _reason) private pure returns (string memory) {
        if (_reason == ReturnReason.Defective) return "Defective";
        if (_reason == ReturnReason.WrongItem) return "Wrong Item";
        if (_reason == ReturnReason.NotAsDescribed) return "Not As Described";
        if (_reason == ReturnReason.ChangedMind) return "Changed Mind";
        return "Other";
    }
}