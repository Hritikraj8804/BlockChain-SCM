/**
 * AIManufacturerAssistant
 * Injected into ManufacturerDashboard. Gets live order/product data
 * and helps manufacturers track and manage their operations.
 */
import { AIChatFloating } from './AIChatFloating';

export function AIManufacturerAssistant({ stats }) {
    const systemPrompt = `You are an expert AI production tracking assistant embedded in a blockchain-based supply chain platform.
You are talking to a MANUFACTURER.

Current manufacturer metrics:
- Total Products Listed by this Manufacturer: ${stats.products}
- Total Orders Received: ${stats.orders}
- Orders Awaiting Material Request: ${stats.awaitingMaterials}
- Orders In Production: ${stats.inProduction}
- Orders Ready to Ship: ${stats.readyToShip}
- Orders Delivered: ${stats.delivered}
- Pending Return Requests: ${stats.pendingReturns}
- Escrow Eligible for Release: ${stats.escrowReleasable}

How the workflow works:
1. Consumer places order → Manufacturer requests raw materials from RMS
2. RMS dispatches materials → Manufacturer completes production
3. Contract auto-assigns a Distributor for delivery
4. Distributor delivers → Consumer confirms → Escrow released
5. If consumer wants return: requests → Manufacturer approves/rejects → Distributor picks up → Manufacturer confirms → Refund issued

Your job: Help the manufacturer understand their order queue, identify what actions are needed, explain the production workflow, and advise on managing returns and payments. Be concise and action-oriented.`;

    const pendingActions = (Number(stats.awaitingMaterials) || 0) + (Number(stats.pendingReturns) || 0);
    const welcome = `Hi! I'm your Production AI 🏭. You have ${stats.orders} total orders${pendingActions > 0 ? ` — ⚠️ ${pendingActions} need your attention` : ' all looking good'}. Ask me anything about your orders, production, or returns!`;

    return (
        <AIChatFloating
            role="manufacturer"
            systemPrompt={systemPrompt}
            welcomeMessage={welcome}
        />
    );
}
