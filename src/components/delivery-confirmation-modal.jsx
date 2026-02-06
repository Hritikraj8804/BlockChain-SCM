import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatUnits } from 'viem';

// Get delivery days from localStorage or use default
const getDeliveryDays = (productName) => {
    try {
        const deliveryData = JSON.parse(localStorage.getItem('product_delivery_days') || '{}');
        const days = deliveryData[productName?.toLowerCase()?.trim()];
        if (days && days >= 1 && days <= 30) {
            return days;
        }
    } catch (_) { }
    return 7; // Default 7 days
};

export function DeliveryConfirmationModal({
    product,
    onConfirm,
    onCancel,
    isPending,
}) {
    const [isVisible, setIsVisible] = useState(true);

    // Get estimated delivery days from localStorage (set by manufacturer)
    const estimatedDays = getDeliveryDays(product?.name);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        setIsVisible(false);
        setTimeout(() => onCancel(), 200);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={handleCancel}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md"
                    >
                        <Card className="border border-border/60 bg-card shadow-2xl overflow-hidden">
                            {/* Header with delivery icon */}
                            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/60 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-foreground">
                                            Confirm Your Order
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            Review estimated delivery time
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-5">
                                {/* Product Info */}
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/40">
                                    {product.imageUri && product.imageUri.trim() !== '' ? (
                                        <img
                                            src={product.imageUri}
                                            alt={product.name}
                                            className="w-16 h-16 rounded-lg object-cover border border-border/60"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-border/60">
                                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                                        <p className="text-lg font-bold text-price mt-1">
                                            {formatUnits(product.price, 18)} ETH
                                        </p>
                                    </div>
                                </div>

                                {/* Delivery Estimate */}
                                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-500/30">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Estimated Delivery</p>
                                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                {estimatedDays} Days
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Expected by: <strong>{formatDate(deliveryDate)}</strong></span>
                                    </div>
                                </div>

                                {/* Information Note */}
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>
                                        This includes manufacturing, quality check, and shipping time.
                                        You can track your order status in real-time after purchase.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        className="flex-1"
                                        disabled={isPending}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirm}
                                        className="flex-1 bg-primary hover:bg-secondary text-primary-foreground"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Confirm & Pay
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
