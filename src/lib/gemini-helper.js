/**
 * Shared Gemini helper for all AI features
 */
import { GEMINI_API_URL } from '@/config/gemini';

export async function callGemini(prompt) {
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Gemini API error ${response.status}`);
    }

    const data = await response.json();
    const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        data.candidates?.[0]?.content?.text ||
        data.text;

    if (!text) throw new Error('Empty response from Gemini');
    return text.trim();
}
