import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK lazily for server-side API calls
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', restaurant: 'Currylicious by NAMS Home Kitchen' });
});

// AI Endpoint 1: Generate Dish Description
app.post('/api/gemini/describe-dish', async (req, res) => {
  try {
    const { name, category, price, spicyLevel } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Dish name is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        description: `A delicious, mouth-watering ${category || 'dish'} cooked with authentic Currylicious spices, fresh herbs, and rich home-kitchen passion.`,
      });
    }

    const prompt = `Write a short, appetizing, 2-sentence menu description for a food item named "${name}" (Category: ${category || 'Curry Special'}, Price: ₱${price || '0'}, Spicy Level: ${spicyLevel || 'Medium'}). Emphasize authentic spices, rich aromatic flavors, and home kitchen quality for "Currylicious by NAMS Home Kitchen". Keep it engaging and hunger-inducing.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const description = response.text?.trim() || `Slow-cooked with authentic home-ground spices and fresh herbs, perfect with warm basmati rice or garlic naan.`;
    return res.json({ description });
  } catch (error) {
    console.error('Error generating dish description:', error);
    return res.status(500).json({
      description: `A delicious home-style dish rich in aromatic spices and fresh herbs from Currylicious NAMS Home Kitchen.`,
    });
  }
});

// AI Endpoint 2: AI Food Pairings & Upsell Suggestion
app.post('/api/gemini/suggest-pairings', async (req, res) => {
  try {
    const { cartItems } = req.body;
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.json({ suggestion: 'Add a signature curry and fresh garlic naan for the ultimate feast!' });
    }

    const itemNames = cartItems.map((i: any) => i.name).join(', ');
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        suggestion: 'Pro Chef Tip: Pair your curries with our hot Garlic Butter Naan and chilled Mango Lassi for a complete home kitchen experience!',
      });
    }

    const prompt = `The customer currently has these items in their cart at "Currylicious by NAMS Home Kitchen": [${itemNames}].
Suggest ONE complementary item (like Garlic Butter Naan, Saffron Rice, Mango Lassi, or Cucumber Raita) in 1-2 friendly, enthusiastic sentences with emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const suggestion = response.text?.trim() || 'Pair your meal with our hot Garlic Naan and refreshing Mango Lassi!';
    return res.json({ suggestion });
  } catch (error) {
    console.error('Error suggesting pairings:', error);
    return res.json({
      suggestion: '✨ Pro Tip: Add Garlic Naan and Mango Lassi to complete your Currylicious meal!',
    });
  }
});

export default app;
