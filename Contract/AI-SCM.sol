    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.4;

    contract AISupplyChain {
        // ==================== CUSTOM ERRORS (saves bytecode) ====================
        error Unauthorized();
        error InvalidOrder();
        error InvalidStatus();
        error InvalidProduct();
        error InvalidRole();
        error InsufficientFunds();
        error AlreadyExists();
        error NotFound();
        error InvalidWindow();
        
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
        
        enum TrackingStatus {
            OrderPlaced,            // 0: "Order Placed"
            MaterialsRequested,     // 1: "Materials Requested from RMS"
            MaterialsDispatched,    // 2: "Materials Dispatched"
            ProductionCompleted,    // 3: "Production Completed"
            DistributorAssigned,    // 4: "Assigned for Delivery"
            InTransit,              // 5: "In Transit"
            Delivered,              // 6: "Delivered to Consumer"
            ReturnRequested,        // 7: "Return Requested"
            ReturnApproved,         // 8: "Return Approved"
            ReturnRejected,         // 9: "Return Rejected"
            ReturnPickupAssigned,   // 10: "Assigned for Return Pickup"
            ReturnPickedUp,         // 11: "Return Picked Up"
            ReturnReceived,         // 12: "Return Received"
            RefundProcessed,        // 13: "Refund Processed"
            EscrowReleased          // 14: "Escrow Released"
        }

        struct TrackingPoint {
            address actor;
            ActorRole role;       // Enum
            uint256 timestamp;
            TrackingStatus status; // Enum
        }
        
        struct Product {
            uint256 productId;
            string name;
            string imageUri;
            string description;
            uint256 price;
            uint256 stock; // Added stock field
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
            uint256 deliveredAt;       // Timestamp when delivered (for escrow release)
            bool fundsReleased;        // Whether escrow has been released to actors
            bool exists;
        }
        
        // ==================== STATE VARIABLES ====================
        
        address public owner;
        uint256 public productCounter;
        uint256 public orderCounter;
        uint256 public returnCounter;
        uint256 public consumerCount; // Track number of consumers
        mapping(address => bool) public isConsumer; // Track registered consumers
        address[] public consumerPool; // Array of consumer addresses for display
        uint256 public defaultReturnWindow = 2 minutes; // Default return window (2 min for testing, change to 7 days for production)
        
        // Per-manufacturer return windows (in seconds)
        mapping(address => uint256) public manufacturerReturnWindow;
        
        // Payment distribution percentages (in basis points, 100 = 1%)
        uint256 public manufacturerShare = 7000; // 70%
        uint256 public rmsShare = 2000;          // 20%
        uint256 public distributorShare = 1000;  // 10%
        uint256 public constant TOTAL_SHARES = 10000; // 100%
        
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

        // Manufacturer Pool for monitoring
        address[] public manufacturerPool;
        mapping(address => bool) public isManufacturer;
        
        // ==================== EVENTS ====================
        
        event ActorRegistered(address indexed actor, ActorRole role);
        event ActorRemoved(address indexed actor, ActorRole role);
        event ProductListed(uint256 indexed productId, address indexed manufacturer, string name, uint256 stock);
        event ProductUpdated(uint256 indexed productId, string name, uint256 price, uint256 stock);
        event OrderPlaced(uint256 indexed bookingId, uint256 indexed productId, address indexed consumer);
        event MaterialsRequested(uint256 indexed bookingId, address indexed rms);
        event MaterialsDispatched(uint256 indexed bookingId, address indexed rms);
        event ProductionCompleted(uint256 indexed bookingId, address indexed manufacturer);
        event DistributorAssigned(uint256 indexed bookingId, address indexed distributor);
        event OrderDelivered(uint256 indexed bookingId, address indexed distributor);
        event TrackingPointAdded(uint256 indexed bookingId, address actor, ActorRole role, TrackingStatus status);
        
        // Return events
        event ReturnRequested(uint256 indexed returnId, uint256 indexed bookingId, address indexed consumer, ReturnReason reason);
        event ReturnApproved(uint256 indexed returnId, uint256 indexed bookingId);
        event ReturnRejected(uint256 indexed returnId, uint256 indexed bookingId, string reason);
        event ReturnPickedUp(uint256 indexed returnId, address indexed distributor);
        event ReturnReceived(uint256 indexed returnId, uint256 indexed bookingId);
        event RefundProcessed(uint256 indexed returnId, uint256 indexed bookingId, uint256 amount);
        
        // Payment distribution event
        event PaymentDistributed(
            uint256 indexed bookingId, 
            address manufacturer, 
            uint256 manufacturerAmount,
            address rms,
            uint256 rmsAmount,
            address distributor, 
            uint256 distributorAmount
        );
        event PaymentSharesUpdated(uint256 manufacturerShare, uint256 rmsShare, uint256 distributorShare);
        event ReturnWindowUpdated(address indexed manufacturer, uint256 returnWindow);
        event EscrowReleased(uint256 indexed bookingId, uint256 amount);
        
        // ==================== MODIFIERS ====================
        
        modifier onlyOwner() {
            if (msg.sender != owner) revert Unauthorized();
            _;
        }
        
        modifier onlyManufacturer() {
            if (actorRoles[msg.sender] != ActorRole.Manufacturer) revert Unauthorized();
            _;
        }
        
        modifier onlyConsumer() {
            if (actorRoles[msg.sender] != ActorRole.Consumer) revert Unauthorized();
            _;
        }
        
        modifier onlyRMS() {
            if (actorRoles[msg.sender] != ActorRole.RawMaterialSupplier) revert Unauthorized();
            _;
        }
        
        modifier onlyDistributor() {
            if (actorRoles[msg.sender] != ActorRole.Distributor) revert Unauthorized();
            _;
        }
        
        modifier orderExists(uint256 _bookingId) {
            if (!orders[_bookingId].exists) revert InvalidOrder();
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
            } else if (_role == ActorRole.Manufacturer) {
                if (!isManufacturer[_actor]) {
                    manufacturerPool.push(_actor);
                    isManufacturer[_actor] = true;
                }
            } else if (_role == ActorRole.Consumer) {
                // Only increment if not already registered as a consumer
                if (!isConsumer[_actor]) {
                    consumerCount++;
                    isConsumer[_actor] = true;
                    consumerPool.push(_actor);
                }
            }
            
            emit ActorRegistered(_actor, _role);
        }

        // Allow anyone to self-register as a consumer (called by frontend on wallet connect)
        function registerAsConsumer() external {
            // Only register if not already registered as consumer AND not a special role
            if (!isConsumer[msg.sender] && actorRoles[msg.sender] == ActorRole.Consumer) {
                consumerCount++;
                isConsumer[msg.sender] = true;
                consumerPool.push(msg.sender);
                emit ActorRegistered(msg.sender, ActorRole.Consumer);
            }
        }

        function removeActor(address _actor) external onlyOwner {
            ActorRole currentRole = actorRoles[_actor];
            
            // Allow removing any registered actor (including consumers if they were explicitly registered)
            if (currentRole == ActorRole.Distributor) {
                isDistributor[_actor] = false;
                _removeFromArray(distributorPool, _actor);
            } else if (currentRole == ActorRole.RawMaterialSupplier) {
                isRMS[_actor] = false;
                _removeFromArray(rmsPool, _actor);
            } else if (currentRole == ActorRole.Manufacturer) {
                isManufacturer[_actor] = false;
                _removeFromArray(manufacturerPool, _actor);
            }
            
            // Also check if they were a registered consumer (could be in consumerPool)
            if (isConsumer[_actor]) {
                if (consumerCount > 0) consumerCount--;
                isConsumer[_actor] = false;
                _removeFromArray(consumerPool, _actor);
            }

            delete actorRoles[_actor]; // Resets to default (Consumer)
            emit ActorRemoved(_actor, currentRole);
        }

        function _removeFromArray(address[] storage _array, address _item) private {
            for (uint256 i = 0; i < _array.length; i++) {
                if (_array[i] == _item) {
                    _array[i] = _array[_array.length - 1];
                    _array.pop();
                    break;
                }
            }
        }
        
        // ==================== PAYMENT SHARE MANAGEMENT ====================
        
        function updatePaymentShares(
            uint256 _manufacturerShare,
            uint256 _rmsShare,
            uint256 _distributorShare
        ) external onlyOwner {
            if (_manufacturerShare + _rmsShare + _distributorShare != TOTAL_SHARES) 
                revert InvalidStatus();
            manufacturerShare = _manufacturerShare;
            rmsShare = _rmsShare;
            distributorShare = _distributorShare;
            emit PaymentSharesUpdated(_manufacturerShare, _rmsShare, _distributorShare);
        }
        
        function getPaymentShares() external view returns (
            uint256 _manufacturerShare,
            uint256 _rmsShare,
            uint256 _distributorShare
        ) {
            return (manufacturerShare, rmsShare, distributorShare);
        }
        
        // ==================== MANUFACTURER RETURN WINDOW ====================
        
        // Manufacturer sets their own return window (in seconds)
        function setReturnWindow(uint256 _returnWindowSeconds) external onlyManufacturer {
            manufacturerReturnWindow[msg.sender] = _returnWindowSeconds;
            emit ReturnWindowUpdated(msg.sender, _returnWindowSeconds);
        }
        
        // Get return window for a manufacturer (returns default if not set)
        function getReturnWindow(address _manufacturer) external view returns (uint256) {
            uint256 window = manufacturerReturnWindow[_manufacturer];
            if (window == 0) return defaultReturnWindow;
            return window;
        }
        
        // ==================== PRODUCT MANAGEMENT ====================
        
        function listProduct(
            string memory _name,
            string memory _imageURI,
            string memory _description,
            uint256 _price,
            uint256 _stock // Added stock param
        ) external onlyManufacturer returns (uint256) {
            productCounter++;
            
            products[productCounter] = Product({
                productId: productCounter,
                name: _name,
                imageUri: _imageURI,
                description: _description,
                price: _price,
                stock: _stock, // Set stock
                manufacturer: msg.sender,
                isActive: true
            });
            
            emit ProductListed(productCounter, msg.sender, _name, _stock);
            return productCounter;
        }
        
        function deactivateProduct(uint256 _productId) external {
            if (products[_productId].manufacturer != msg.sender) revert Unauthorized();
            products[_productId].isActive = false;
        }

        function updateProduct(
            uint256 _productId,
            string memory _name,
            string memory _imageUri,
            string memory _description,
            uint256 _price,
            uint256 _stock // Added stock param
        ) external {
            if (products[_productId].manufacturer != msg.sender) revert Unauthorized();
            if (!products[_productId].isActive) revert InvalidProduct();

            Product storage product = products[_productId];
            product.name = _name;
            product.imageUri = _imageUri;
            product.description = _description;
            product.price = _price;
            product.stock = _stock; // Update stock

            emit ProductUpdated(_productId, _name, _price, _stock);
        }
        
        // ==================== ORDER WORKFLOW ====================
        
        // Step 1: Consumer places order
        // Step 1: Consumer places order
        function placeOrder(uint256 _productId) external onlyConsumer payable returns (uint256) {
            // Auto-register as consumer if not already counted
            if (!isConsumer[msg.sender]) {
                consumerCount++;
                isConsumer[msg.sender] = true;
            }

            Product storage product = products[_productId];
            if (!product.isActive) revert InvalidProduct();
            if (msg.value < product.price) revert InsufficientFunds();
            
            orderCounter++;
            uint256 bookingId = orderCounter;
            
            OrderStatus initialStatus = OrderStatus.Pending;
            address assignedRms = address(0);
            
            // CHECK STOCK: If stock > 0, fulfill from stock and skip RMS request step
            if (product.stock > 0) {
                product.stock--; // Decrement stock
                initialStatus = OrderStatus.ReadyForShipping; // Wait for manual dispatch
            }
            
            // No distributor assigned yet for stock items
            address finalDistributor = address(0);

            orders[bookingId] = Order({
                bookingId: bookingId,
                productId: _productId,
                consumer: msg.sender,
                manufacturer: product.manufacturer,
                pricePaid: msg.value,
                rmsAssigned: assignedRms,
                distributorAssigned: finalDistributor,
                status: initialStatus,
                createdAt: block.timestamp,
                deliveredAt: 0,
                fundsReleased: false,
                exists: true
            });
            
            // Add to dashboards
            actorOrders[msg.sender].push(bookingId);
            actorOrders[product.manufacturer].push(bookingId);
            
            // Track this event
            _addTrackingPoint(bookingId, msg.sender, ActorRole.Consumer, TrackingStatus.OrderPlaced);
            
            // Use stock: Skip straight to OrderPlaced (already done) -> Waiting for shipOrder
            
            emit OrderPlaced(bookingId, _productId, msg.sender);
            return bookingId;
        }

        // NEW: Manual dispatch for stock items (or completed production)
        function shipOrder(uint256 _bookingId) 
            external 
            onlyManufacturer 
            orderExists(_bookingId) 
        {
            Order storage order = orders[_bookingId];
            if (order.manufacturer != msg.sender) revert Unauthorized();
            if (order.status != OrderStatus.ReadyForShipping) revert InvalidStatus();
            if (distributorPool.length == 0) revert NotFound();
            
            // Random Distributor Selection
            uint256 randomIndex = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, distributorPool.length))
            ) % distributorPool.length;
            
            address selectedDistributor = distributorPool[randomIndex];
            order.distributorAssigned = selectedDistributor;
            order.status = OrderStatus.InTransit;
            
            // Add to distributor dashboard
            actorOrders[selectedDistributor].push(_bookingId);
            
            _addTrackingPoint(_bookingId, selectedDistributor, ActorRole.Distributor, TrackingStatus.DistributorAssigned);
            
            emit DistributorAssigned(_bookingId, selectedDistributor);
        }
        
        // Step 2: Manufacturer requests materials from RMS
        function requestMaterials(uint256 _bookingId, address _rmsAddress) 
            external 
            onlyManufacturer 
            orderExists(_bookingId) 
        {
            Order storage order = orders[_bookingId];
            if (order.manufacturer != msg.sender) revert Unauthorized();
            if (order.status != OrderStatus.Pending) revert InvalidStatus();
            if (actorRoles[_rmsAddress] != ActorRole.RawMaterialSupplier) revert InvalidRole();
            
            order.rmsAssigned = _rmsAddress;
            order.status = OrderStatus.MaterialsRequested;
            
            // Add to RMS dashboard
            actorOrders[_rmsAddress].push(_bookingId);
            
            _addTrackingPoint(_bookingId, msg.sender, ActorRole.Manufacturer, TrackingStatus.MaterialsRequested);
            
            emit MaterialsRequested(_bookingId, _rmsAddress);
        }
        
        // Step 3: RMS dispatches materials to Manufacturer
        function dispatchMaterials(uint256 _bookingId) 
            external 
            onlyRMS 
            orderExists(_bookingId) 
        {
            Order storage order = orders[_bookingId];
            if (order.rmsAssigned != msg.sender) revert Unauthorized();
            if (order.status != OrderStatus.MaterialsRequested) revert InvalidStatus();
            
            order.status = OrderStatus.MaterialsDispatched;
            
            _addTrackingPoint(_bookingId, msg.sender, ActorRole.RawMaterialSupplier, TrackingStatus.MaterialsDispatched);
            
            emit MaterialsDispatched(_bookingId, msg.sender);
        }
        
        // Step 4: Manufacturer completes production (triggers random distributor selection)
        function completeProduction(uint256 _bookingId) 
            external 
            onlyManufacturer 
            orderExists(_bookingId) 
        {
            Order storage order = orders[_bookingId];
            if (order.manufacturer != msg.sender) revert Unauthorized();
            if (order.status != OrderStatus.MaterialsDispatched) revert InvalidStatus();
            if (distributorPool.length == 0) revert NotFound();
            
            // Mark production complete
            order.status = OrderStatus.ReadyForShipping;
            _addTrackingPoint(_bookingId, msg.sender, ActorRole.Manufacturer, TrackingStatus.ProductionCompleted);
            
            // AUTOMATIC RANDOM DISTRIBUTOR SELECTION
            uint256 randomIndex = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, distributorPool.length))
            ) % distributorPool.length;
            
            address selectedDistributor = distributorPool[randomIndex];
            order.distributorAssigned = selectedDistributor;
            order.status = OrderStatus.InTransit;
            
            // Add to distributor dashboard
            actorOrders[selectedDistributor].push(_bookingId);
            
            _addTrackingPoint(_bookingId, selectedDistributor, ActorRole.Distributor, TrackingStatus.DistributorAssigned);
            
            emit ProductionCompleted(_bookingId, msg.sender);
            emit DistributorAssigned(_bookingId, selectedDistributor);
        }
        
        // Step 5: Distributor confirms delivery to consumer
        // Step 5: Distributor confirms delivery to consumer
        // Payment is held in escrow until return window expires
        function confirmDelivery(uint256 _bookingId) 
            external 
            onlyDistributor 
            orderExists(_bookingId) 
        {
            Order storage order = orders[_bookingId];
            if (order.distributorAssigned != msg.sender) revert Unauthorized();
            if (order.status != OrderStatus.InTransit) revert InvalidStatus();
            
            order.status = OrderStatus.Delivered;
            order.deliveredAt = block.timestamp;
            // fundsReleased stays false - payment held in escrow
            
            _addTrackingPoint(_bookingId, msg.sender, ActorRole.Distributor, TrackingStatus.Delivered);
            
            emit OrderDelivered(_bookingId, msg.sender);
        }
        
        // Release escrow after return window expires - anyone can call
        function releaseEscrow(uint256 _bookingId) 
            external 
            orderExists(_bookingId) 
        {
            Order storage order = orders[_bookingId];
            
            if (order.status != OrderStatus.Delivered) revert InvalidStatus();
            if (order.fundsReleased) revert AlreadyExists();
            if (hasActiveReturn[_bookingId]) revert InvalidStatus(); // Cannot release if return in progress
            
            // Check if return window has expired
            uint256 returnWindowDuration = manufacturerReturnWindow[order.manufacturer];
            if (returnWindowDuration == 0) {
                returnWindowDuration = defaultReturnWindow;
            }
            
            if (block.timestamp < order.deliveredAt + returnWindowDuration) {
                revert InvalidWindow(); // Return window not expired yet
            }
            
            order.fundsReleased = true;
            
            _addTrackingPoint(_bookingId, msg.sender, ActorRole.Consumer, TrackingStatus.EscrowReleased);
            
            // Calculate payment shares
            uint256 totalPayment = order.pricePaid;
            uint256 mfrAmount = (totalPayment * manufacturerShare) / TOTAL_SHARES;
            uint256 rmsAmount = (totalPayment * rmsShare) / TOTAL_SHARES;
            uint256 distAmount = totalPayment - mfrAmount - rmsAmount; // Remaining goes to distributor

            // For stock orders (no RMS assigned), pick a random RMS from pool
            address rmsRecipient = order.rmsAssigned;
            if (rmsRecipient == address(0) && rmsPool.length > 0) {
                uint256 randomIndex = uint256(
                    keccak256(abi.encodePacked(block.timestamp, msg.sender, _bookingId))
                ) % rmsPool.length;
                rmsRecipient = rmsPool[randomIndex];
                order.rmsAssigned = rmsRecipient; // Save for record
            } else if (rmsRecipient == address(0)) {
                // No RMS in pool at all - give share to manufacturer
                mfrAmount += rmsAmount;
                rmsAmount = 0;
            }
            
            // Transfer payments
            (bool s1, ) = payable(order.manufacturer).call{value: mfrAmount}("");
            if (!s1) revert InsufficientFunds();
            
            // Only transfer to RMS if amount > 0 AND address exists
            if (rmsAmount > 0 && rmsRecipient != address(0)) {
                (bool s2, ) = payable(rmsRecipient).call{value: rmsAmount}("");
                if (!s2) revert InsufficientFunds();
            }
            
            (bool s3, ) = payable(order.distributorAssigned).call{value: distAmount}("");
            if (!s3) revert InsufficientFunds();
            
            emit PaymentDistributed(
                _bookingId, 
                order.manufacturer, mfrAmount,
                rmsRecipient, rmsAmount,
                order.distributorAssigned, distAmount
            );
            emit EscrowReleased(_bookingId, totalPayment);
        }
        
        // ==================== TRACKING SYSTEM ====================
        
        function _addTrackingPoint(
            uint256 _bookingId,
            address _actor,
            ActorRole _role,
            TrackingStatus _status
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

        // Get Manufacturer pool
        function getManufacturerPool() external view returns (address[] memory) {
            return manufacturerPool;
        }

        // Get Consumer pool
        function getConsumerPool() external view returns (address[] memory) {
            return consumerPool;
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
            if (_stepIndex2 >= history.length || _stepIndex1 >= history.length) revert InvalidOrder();
            if (_stepIndex2 <= _stepIndex1) revert InvalidOrder();
            
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
            
            if (order.consumer != msg.sender) revert Unauthorized();
            if (order.status != OrderStatus.Delivered) revert InvalidStatus();
            if (hasActiveReturn[_bookingId]) revert AlreadyExists();
            if (order.fundsReleased) revert InvalidWindow(); // Cannot return if funds already released
            
            // Check per-manufacturer return window
            uint256 returnWindowDuration = manufacturerReturnWindow[order.manufacturer];
            if (returnWindowDuration == 0) {
                returnWindowDuration = defaultReturnWindow;
            }
            if (block.timestamp > order.deliveredAt + returnWindowDuration) revert InvalidWindow();
            
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
                ActorRole.Consumer,
                TrackingStatus.ReturnRequested
            );
            
            emit ReturnRequested(returnId, _bookingId, msg.sender, _reason);
            return returnId;
        }
        
        // Step 2: Manufacturer approves return - refund comes from escrow
        function approveReturn(uint256 _returnId) external onlyManufacturer {
            ReturnRequest storage returnReq = returnRequests[_returnId];
            Order storage order = orders[returnReq.bookingId];
            
            if (returnReq.bookingId == 0) revert NotFound();
            if (order.manufacturer != msg.sender) revert Unauthorized();
            if (returnReq.approved) revert AlreadyExists();
            if (order.status != OrderStatus.ReturnRequested) revert InvalidStatus();
            if (order.fundsReleased) revert InvalidStatus(); // Escrow already released
            
            returnReq.approved = true;
            returnReq.refundAmount = order.pricePaid;  // Full refund from escrow
            returnReq.refundDeposited = true;          // Escrow is already in contract
            
            // Randomly assign a distributor for return pickup
            if (distributorPool.length == 0) revert NotFound();
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
                ActorRole.Manufacturer,
                TrackingStatus.ReturnApproved
            );

            // Process refund to consumer immediately (User Request)
            uint256 refundAmount = order.pricePaid;
            returnReq.refundProcessed = true;
            (bool success, ) = payable(order.consumer).call{value: refundAmount}("");
            if (!success) revert InsufficientFunds();
            
            // Update order status to show refund processed but still in transit
            // We keep it as ReturnInTransit for tracking, but refund is done.
            
            emit RefundProcessed(_returnId, returnReq.bookingId, refundAmount);
            
            _addTrackingPoint(
                returnReq.bookingId,
                selectedDistributor,
                ActorRole.Distributor,
                TrackingStatus.ReturnPickupAssigned
            );
            
            emit ReturnApproved(_returnId, returnReq.bookingId);
            emit DistributorAssigned(returnReq.bookingId, selectedDistributor);
        }
        
        function rejectReturn(uint256 _returnId, string memory _rejectionReason) external onlyManufacturer {
            ReturnRequest storage returnReq = returnRequests[_returnId];
            Order storage order = orders[returnReq.bookingId];
            
            if (returnReq.bookingId == 0) revert NotFound();
            if (order.manufacturer != msg.sender) revert Unauthorized();
            if (returnReq.approved) revert AlreadyExists();
            if (order.status != OrderStatus.ReturnRequested) revert InvalidStatus();
            
            // Reset order status back to delivered
            order.status = OrderStatus.Delivered;
            hasActiveReturn[returnReq.bookingId] = false;
            
            _addTrackingPoint(
                returnReq.bookingId,
                msg.sender,
                ActorRole.Manufacturer,
                TrackingStatus.ReturnRejected
            );
            
            emit ReturnRejected(_returnId, returnReq.bookingId, _rejectionReason);
        }
        
        // Step 3: Distributor confirms pickup from consumer
        function confirmReturnPickup(uint256 _returnId) external onlyDistributor {
            ReturnRequest storage returnReq = returnRequests[_returnId];
            Order storage order = orders[returnReq.bookingId];
            
            if (returnReq.bookingId == 0) revert NotFound();
            if (!returnReq.approved) revert InvalidStatus();
            if (returnReq.pickedUp) revert AlreadyExists();
            if (returnReq.returnDistributor != msg.sender) revert Unauthorized();
            if (order.status != OrderStatus.ReturnInTransit) revert InvalidStatus();
            
            returnReq.pickedUp = true;  // Mark as picked up
            
            _addTrackingPoint(
                returnReq.bookingId,
                msg.sender,
                ActorRole.Distributor,
                TrackingStatus.ReturnPickedUp
            );
            
            emit ReturnPickedUp(_returnId, msg.sender);
        }
        
        // Step 4: Manufacturer confirms return received and processes refund
        function confirmReturnReceived(uint256 _returnId) external onlyManufacturer {
            ReturnRequest storage returnReq = returnRequests[_returnId];
            Order storage order = orders[returnReq.bookingId];
            
            if (returnReq.bookingId == 0) revert NotFound();
            if (!returnReq.approved) revert InvalidStatus();
            if (!returnReq.pickedUp) revert InvalidStatus();
            if (!returnReq.pickedUp) revert InvalidStatus();
            // if (!returnReq.refundDeposited) revert InvalidStatus(); // refundDeposited is true but money already sent
            if (order.manufacturer != msg.sender) revert Unauthorized();
            if (order.status != OrderStatus.ReturnInTransit) revert InvalidStatus();
            if (returnReq.completed) revert AlreadyExists();
            
            returnReq.completed = true;
            order.status = OrderStatus.ReturnReceived;
            
            _addTrackingPoint(
                returnReq.bookingId,
                msg.sender,
                ActorRole.Manufacturer,
                TrackingStatus.ReturnReceived
            );
            
            // Refund already processed in approveReturn
            
            order.status = OrderStatus.Refunded;
            
            _addTrackingPoint(
                returnReq.bookingId,
                order.consumer,
                ActorRole.Consumer,
                TrackingStatus.RefundProcessed
            );
            
            emit ReturnReceived(_returnId, returnReq.bookingId);
            emit ReturnReceived(_returnId, returnReq.bookingId);
            // emit RefundProcessed(_returnId, returnReq.bookingId, refundAmount); // Already emitted
        }
        
        // ==================== RETURN SYSTEM VIEW FUNCTIONS ====================
        
        // Get return details
        function getReturn(uint256 _returnId) external view returns (ReturnRequest memory) {
            if (returnRequests[_returnId].bookingId == 0) revert NotFound();
            return returnRequests[_returnId];
        }
        
        // Get return by booking ID
        function getReturnByBookingId(uint256 _bookingId) external view orderExists(_bookingId) returns (ReturnRequest memory) {
            uint256 returnId = orderToReturn[_bookingId];
            if (returnId == 0) revert NotFound();
            return returnRequests[returnId];
        }
        
        // Check if order is eligible for return
        function isReturnEligible(uint256 _bookingId) external view orderExists(_bookingId) returns (bool) {
            Order memory order = orders[_bookingId];
            
            if (order.status != OrderStatus.Delivered) return false;
            if (hasActiveReturn[_bookingId]) return false;
            if (order.fundsReleased) return false;
            // Check per-manufacturer return window
            uint256 returnWindowDuration = manufacturerReturnWindow[order.manufacturer];
            if (returnWindowDuration == 0) {
                returnWindowDuration = defaultReturnWindow;
            }
            if (block.timestamp >= order.deliveredAt + returnWindowDuration) return false;
            
            return true;
        }
        
        // Get remaining return window time
        function getRemainingReturnTime(uint256 _bookingId) external view orderExists(_bookingId) returns (uint256) {
            Order memory order = orders[_bookingId];
            
            // Check per-manufacturer return window
            uint256 returnWindowDuration = manufacturerReturnWindow[order.manufacturer];
            if (returnWindowDuration == 0) {
                returnWindowDuration = defaultReturnWindow;
            }
            
            uint256 deadline = order.deliveredAt + returnWindowDuration;
            
            if (block.timestamp >= deadline) return 0;
            return deadline - block.timestamp;
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