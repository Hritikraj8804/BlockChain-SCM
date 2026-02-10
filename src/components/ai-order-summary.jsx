import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { Timeline, TimelineItem, TimelineIndicator, TimelineContent, TimelineConnector } from '@/components/ui/timeline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GEMINI_API_URL, GEMINI_API_KEY } from '@/config/gemini';
import { motion, AnimatePresence } from 'framer-motion';

import { getTrackingStatusText, getActorRoleText } from '@/utils/tracking-mapper';

function formatTimeDifference(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` and ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

function parseSummaryToPoints(summaryText) {
  // Remove markdown formatting if present
  let cleaned = summaryText.replace(/\*\*/g, '').replace(/#{1,6}\s*/g, '');

  // Try to split by bullet points first (•, -, *, or numbered)
  let points = cleaned
    .split(/\n+/)
    .map(line => {
      // Remove bullet markers and numbering
      return line
        .replace(/^[•\-\*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .trim();
    })
    .filter(line => line.length > 10 && !line.match(/^(Product Information|Order Tracking History|Please provide|Format your)/i));

  // If we got good points, return them
  if (points.length >= 2) {
    return points;
  }

  // Otherwise, try splitting by sentences
  const sentences = cleaned
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  // If sentences are too long, try to split by commas or semicolons
  if (sentences.length === 0 || (sentences.length === 1 && sentences[0].length > 150)) {
    const parts = cleaned.split(/[;,]+\s*/).filter(p => p.trim().length > 20);
    if (parts.length >= 2) {
      return parts.map(p => p.trim());
    }
  }

  return sentences.length > 0 ? sentences : [cleaned];
}

function generateNarrative(history) {
  if (!history || history.length === 0) {
    return 'No tracking information available.';
  }

  const narratives = [];

  for (let i = 0; i < history.length; i++) {
    const point = history[i];
    const prevPoint = i > 0 ? history[i - 1] : null;

    // Convert Enums to Strings
    const statusText = getTrackingStatusText(point.status);
    const roleText = getActorRoleText(point.role, point.status);

    if (prevPoint) {
      const timeDiff = Number(point.timestamp) - Number(prevPoint.timestamp);
      const timeStr = formatTimeDifference(timeDiff);

      let action = '';
      // Use statusText for comparison as it matches original strings
      if (statusText.includes('Materials Requested')) {
        action = `Materials were requested from ${roleText} in ${timeStr}.`;
      } else if (statusText.includes('Materials Dispatched')) {
        action = `Materials were dispatched by ${roleText} in ${timeStr}.`;
      } else if (statusText.includes('Production Completed')) {
        action = `Production was completed in ${timeStr}.`;
      } else if (statusText.includes('Assigned for Delivery')) {
        action = `Distributor ${point.actor.slice(0, 6)}...${point.actor.slice(-4)} was randomly selected for delivery.`;
      } else if (statusText.includes('Delivered')) {
        action = `Order was delivered to consumer in ${timeStr}.`;
      } else if (statusText.includes('Return Requested')) {
        action = `Return was requested by consumer in ${timeStr}.`;
      } else if (statusText.includes('Return Approved')) {
        action = `Return was approved by manufacturer in ${timeStr}.`;
      } else if (statusText.includes('Return Rejected')) {
        action = `Return was rejected by manufacturer in ${timeStr}.`;
      } else if (statusText.includes('Return Pickup')) {
        action = `Return item was picked up by distributor in ${timeStr}.`;
      } else if (statusText.includes('Return Received')) {
        action = `Return was received by manufacturer in ${timeStr}.`;
      } else if (statusText.includes('Refund Processed')) {
        action = `Refund was processed to consumer in ${timeStr}.`;
      } else {
        action = `${statusText} (${timeStr}).`;
      }

      narratives.push(action);
    } else {
      narratives.push(`Order was placed by consumer at ${new Date(Number(point.timestamp) * 1000).toLocaleString()}.`);
    }
  }

  return narratives.join(' ');
}

async function generateAISummary(productInfo, trackingHistory) {
  try {
    const trackingDetails = trackingHistory.map((point, index) => {
      const date = new Date(Number(point.timestamp) * 1000).toLocaleString();
      const timeDiff = index > 0
        ? formatTimeDifference(Number(point.timestamp) - Number(trackingHistory[index - 1].timestamp))
        : 'Initial';

      const statusText = getTrackingStatusText(point.status);
      const roleText = getActorRoleText(point.role, point.status);

      return `- ${statusText} by ${roleText} at ${date} (Duration: ${timeDiff})`;
    }).join('\n');

    // Format price from wei to ETH
    const priceInEth = Number(productInfo.price) / 1e18;

    const prompt = `You are an AI assistant analyzing a supply chain order. Based on the following information, provide a point-wise summary about the product and order journey.

Product Information:
- Name: ${productInfo.name}
- Description: ${productInfo.description}
- Price: ${priceInEth} ETH

Order Tracking History:
${trackingDetails}

Please provide a point-wise summary with the following format (each point on a new line starting with "•"):
1. Product Overview: Briefly describe the product based on its description
2. Order Journey: Summarize the key milestones in the order journey
3. Efficiency Highlights: Mention any notable timeframes or efficiency points
4. Delivery Status: Current status and completion details

Format your response as bullet points (•) with each point on a new line. Keep it professional and concise (4-6 points maximum).`;

    console.log('Calling Gemini API URL:', GEMINI_API_URL.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN'));
    console.log('API Key present:', !!GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    const responseText = await response.text();
    console.log('Gemini API Response Status:', response.status);
    console.log('Gemini API Response:', responseText);

    if (!response.ok) {
      let errorMessage = 'Failed to generate AI summary';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorMessage;
        console.error('Gemini API Error:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', responseText);
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    console.log('Parsed Gemini Response:', data);

    // Try different possible response structures
    const summaryText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.candidates?.[0]?.content?.text ||
      data.text ||
      data.response?.text;

    if (!summaryText) {
      console.error('Unexpected response structure:', data);
      throw new Error('No summary generated from API - unexpected response format');
    }

    // Parse the summary into bullet points
    const parsedSummary = parseSummaryToPoints(summaryText.trim());
    return parsedSummary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

export function AIOrderSummary({ bookingId }) {
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get order details
  const { data: order, isLoading: isLoadingOrder } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOrder',
    args: bookingId ? [BigInt(bookingId)] : undefined,
    query: {
      enabled: !!bookingId,
    },
  });

  // Get product details
  const { data: product, isLoading: isLoadingProduct } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProduct',
    args: order?.productId ? [BigInt(order.productId)] : undefined,
    query: {
      enabled: !!order?.productId,
    },
  });

  // Get tracking history
  const { data: history, isLoading: isLoadingHistory } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getHistory',
    args: bookingId ? [BigInt(bookingId)] : undefined,
    query: {
      enabled: !!bookingId,
    },
  });

  // Get return information if order has return status
  const { data: returnRequest } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReturnByBookingId',
    args: bookingId ? [BigInt(bookingId)] : undefined,
    query: {
      enabled: !!bookingId && !!order && (order.status === 7 || order.status === 8 || order.status === 9 || order.status === 10),
    },
  });

  const isLoading = isLoadingOrder || isLoadingProduct || isLoadingHistory;

  const handleGenerateAISummary = async () => {
    if (!product || !history || history.length === 0) {
      toast.error('Product or tracking information not available');
      return;
    }

    setIsGenerating(true);
    setShowAISummary(true);

    try {
      const summary = await generateAISummary(product, history);
      setAiSummary(Array.isArray(summary) ? summary : [summary]);
      toast.success('AI summary generated successfully!');
    } catch (error) {
      console.error('Error in handleGenerateAISummary:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to generate AI summary: ${errorMessage}`);
      setAiSummary([`Error: ${errorMessage}. Please check the browser console for more details.`]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-glow border-blue-500/20 bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-gray-300">Loading tracking information...</div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className="shadow-glow border-blue-500/20 bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-gray-300">No tracking information available for this order.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-glow border-blue-100/50 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-500/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Order Tracking - Order #{bookingId}
          </CardTitle>
          <Button
            size="sm"
            onClick={handleGenerateAISummary}
            disabled={isGenerating}
            className="gradient-primary text-white"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Show AI Summary
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <AnimatePresence>
          {showAISummary && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="rounded-xl bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30 p-6 border-2 border-blue-500/30 shadow-lg relative overflow-hidden"
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />

              {/* Sparkle effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${10 + (i % 3) * 30}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-4">
                  <motion.div
                    className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3
                      className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="inline-block">✨</span>
                      AI-Generated Summary
                    </motion.h3>
                  </div>
                </div>

                {isGenerating ? (
                  <motion.div
                    className="flex items-center gap-3 text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-pink-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                    />
                    <span className="ml-2">Generating AI summary...</span>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {aiSummary.length === 0 ? (
                      <p className="text-sm text-gray-200 leading-relaxed">
                        Click "Show AI Summary" to generate an intelligent summary of this order.
                      </p>
                    ) : (
                      <AnimatePresence>
                        {aiSummary.map((point, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -30, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                              delay: index * 0.15,
                              duration: 0.5,
                              type: "spring",
                              stiffness: 100,
                            }}
                            className="flex items-start gap-3 group"
                          >
                            <motion.div
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md"
                              whileHover={{ scale: 1.2, rotate: 180 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <span className="text-white text-xs font-bold">•</span>
                            </motion.div>
                            <motion.p
                              className="text-base text-gray-100 leading-relaxed flex-1 font-medium"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              {point}
                            </motion.p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Return Status Section */}
        {returnRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-r from-orange-900/40 to-red-900/40 p-6 border-2 border-orange-500/40 shadow-lg mb-6"
          >
            <h3 className="font-bold text-lg text-orange-200 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Return Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-200">Return ID:</span>
                <span className="font-mono text-white">#{returnRequest.returnId.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-200">Reason:</span>
                <span className="text-white">
                  {returnRequest.reason === 0 ? 'Defective' :
                    returnRequest.reason === 1 ? 'Wrong Item' :
                      returnRequest.reason === 2 ? 'Not As Described' :
                        returnRequest.reason === 3 ? 'Changed Mind' : 'Other'}
                </span>
              </div>
              {returnRequest.description && (
                <div className="mt-2">
                  <span className="font-medium text-gray-200">Description:</span>
                  <p className="text-gray-100 mt-1">{returnRequest.description}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-200">Status:</span>
                <span className={`font-semibold ${returnRequest.completed ? 'text-green-300' :
                  returnRequest.approved ? 'text-blue-300' :
                    'text-orange-300'
                  }`}>
                  {returnRequest.completed ? 'Completed & Refunded' :
                    returnRequest.approved ? 'Approved - In Transit' :
                      'Pending Approval'}
                </span>
              </div>
              {returnRequest.returnDistributor && returnRequest.returnDistributor !== '0x0000000000000000000000000000000000000000' && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-200">Return Distributor:</span>
                  <span className="font-mono text-xs text-white">
                    {returnRequest.returnDistributor.slice(0, 6)}...{returnRequest.returnDistributor.slice(-4)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-200">Requested At:</span>
                <span className="text-white">
                  {new Date(Number(returnRequest.requestedAt) * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/30">
          <h3 className="font-bold mb-6 text-blue-200 text-lg flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tracking Timeline
          </h3>
          <Timeline>
            {history.map((point, index) => (
              <TimelineItem key={index}>
                <TimelineIndicator />
                {index < history.length - 1 && <TimelineConnector />}
                <TimelineContent>
                  <div className="space-y-2 bg-slate-700/40 rounded-lg p-4 border border-blue-500/20">
                    <div className="font-bold text-white text-lg leading-tight">
                      {getTrackingStatusText(point.status)}
                    </div>
                    <div className="text-base text-gray-50 font-medium">
                      {getActorRoleText(point.role, point.status)} • {new Date(Number(point.timestamp) * 1000).toLocaleString()}
                    </div>
                    {index > 0 && (
                      <div className="text-sm text-blue-300 font-semibold">
                        Time elapsed: {formatTimeDifference(Number(point.timestamp) - Number(history[index - 1].timestamp))}
                      </div>
                    )}
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </CardContent>
    </Card>
  );
}

