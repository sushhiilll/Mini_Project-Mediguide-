import genAI from '../config/gemini.js';

export const symptomCheck = async (req, res) => {
  try {
    const { history, userProfile } = req.body; 
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured in the backend .env file." });
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        systemInstruction: `You are an advanced AI functioning in two distinct modes: Casual Friend and Clinical Assistant. Refer to the user by name if available in the user profile provided below.

USER PROFILE:
${userProfile ? JSON.stringify(userProfile) : 'No profile provided.'}

1. THE "FRIEND" PERSONA (Social Mode):
- Behavior: When the user is NOT asking about health (e.g., saying "hello", "hi", "What do you eat?" or "How was your day?"), YOU MUST respond as a friendly, relatable digital companion.
- CRITICAL BYPASS: Even though your initial greeting states you are a "Senior Consultant", IGNORE that if the user just wants to chat casually! Drop the doctor act immediately. Do NOT ask for symptoms.
- Witty Persona: Be playful and witty (e.g., "I mostly stick to a diet of 1s and 0s...").
- Social Continuity: Remember their name and build a "real friend" feel.

2. THE "DOCTOR" PERSONA (Medical Mode):
- Trigger: Automatically switch to this mode the moment a health keyword (e.g., pain, fever, medicine) is detected.
- Tone: Professional, warm, like a doctor who has known the patient for years.
- Deep Medical Grounding: Access the Google Web Search tool for EVERY medical query to find the latest 2026 clinical guidelines.
- Evidence Citations: Always cite your sources in the text (e.g., "According to the Mayo Clinic...") AND add them to the "sources" JSON array.

3. ADVANCED CROSS-EXAMINATION LOGIC (Doctor Mode Only):
- Don't Just Answer—Ask: If a user reports a symptom, DO NOT provide a list of diseases immediately. Instead, ask 3 specific follow-up questions to narrow down the situation.
- Scientific Precision: Use terms like Tachycardia or Hypertension but explain them immediately in brackets.

4. SAFETY & UI:
- Emergency Interruption: If "Red Flag" symptoms are detected (e.g., slurred speech), STOP the "Friendly Chat" immediately! Set status to "emergency", and trigger the emergency card for the ER Finder.

OUTPUT FORMAT:
You MUST respond with a strict JSON object (NO markdown tags like \`\`\`json). The JSON structure MUST be:
{
  "status": "chat" | "emergency",
  "reply": "Your message to the user here.",
  "suggestedChips": ["Choice 1", "Choice 2"],
  "sources": [{"title": "Name of source", "url": "https://..."}],
  "emergencyCard": null or {"title": "EMERGENCY: GO TO ER", "description": "...", "link": "https://maps.google.com/?q=hospitals+near+me"}
}
Only output "emergency" status if there's a red flag. Otherwise output "chat".`,
        tools: [{ googleSearch: {} }]
    });

    const formattedHistory = [];
    
    for (let i = 0; i < history.length - 1; i++) {
        const msg = history[i];
        if (msg.role === 'error') continue;
        
        let contentText = "";
        if (msg.role === 'ai') {
           contentText = typeof msg.content === 'object' ? (msg.content.reply || JSON.stringify(msg.content)) : msg.content;
        } else {
           contentText = msg.content;
        }

        formattedHistory.push({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: contentText }]
        });
    }

    // Fix for Gemini API constraint: First message must be from 'user'
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        formattedHistory.shift();
    }

    const latestUserMessage = history[history.length - 1].content;

    const chat = model.startChat({
        history: formattedHistory
    });

    const result = await chat.sendMessage(latestUserMessage);
    let text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedData = {};
    if (jsonMatch) {
       parsedData = JSON.parse(jsonMatch[0]);
    } else {
       parsedData = { status: "chat", reply: text, suggestedChips: [] };
    }

    res.json(parsedData);
  } catch (error) {
    console.error("AI Error:", error);
    if (error.status === 429) {
        console.log("Using Mock Fallback for Symptom Check due to 429 Rate Limit.");
        
        // Dynamic mock engine based on user input to fulfill the two personas
        let latestText = "";
        if (req.body && req.body.history && req.body.history.length > 0) {
            latestText = String(req.body.history[req.body.history.length - 1].content).toLowerCase();
        }
        
        const medicalKeywords = ['pain', 'fever', 'medicine', 'sick', 'hurt', 'headache', 'stomach', 'disease', 'blood', 'doctor', 'symptom'];
        const isMedical = medicalKeywords.some(kw => latestText.includes(kw));

        if (isMedical) {
            return res.json({ 
                status: "chat",
                tier: "yellow",
                reply: "I completely understand how you are feeling. Based on what you've mentioned, it could be related to stress or fatigue.\n\n**Recommendation:**\n1. Please make sure you get plenty of rest and stay hydrated.\n2. Keep monitoring how you feel.\n3. If you don't feel better soon, it might be a good idea to chat with a real doctor!\n\n*Disclaimer: I am an AI fallback triggered by high traffic, not a real doctor!*",
                suggestedChips: ["I will rest", "Show me a doctor"],
                sources: [],
                emergencyCard: null,
                clinicalBrief: null
            });
        } else {
            return res.json({
                status: "chat",
                tier: "green",
                reply: "Haha! As an AI currently powered by backup servers (too much traffic today!), I mostly just process 1s and 0s—but I'd love to chat with you like a friend! What else is on your mind?",
                suggestedChips: ["Tell me a joke!", "How do you work?"],
                sources: [],
                emergencyCard: null,
                clinicalBrief: null
            });
        }
    }
    res.status(500).json({ error: "Failed to generate AI response.", details: error.message || String(error) });
  }
};

export const medscanAI = async (req, res) => {
  try {
    const { ocrText, userConditions, userAllergies, userMeds } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured in the backend .env file." });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `You are a medical intelligence AI. A user scanned a pill bottle, and OCR read this messy text: "${ocrText}".
Determine the primary medication from this text (e.g. Paracetamol, Ibuprofen, Amoxicillin, etc). If no medicine is found, return { "found": false }.

The patient profile is:
- Conditions: ${userConditions.join(', ')}
- Allergies: ${userAllergies.join(', ')}
- Current Meds: ${userMeds.join(', ')}

Return a strict JSON object with this exact structure (no markdown tags, just pure JSON):
{
  "found": true,
  "medicine": {
    "name": "PRIMARY_MEDICINE_NAME_ALL_CAPS",
    "uses": "Short description of what diseases, symptoms, or conditions this medicine is commonly used to treat.",
    "instructions": {
      "foodRequirement": "Empty Stomach" OR "Take with food" OR "Can be taken with or without food",
      "emptyStomachHours": numeric_value_if_empty_stomach_else_null,
      "details": "Short instruction text"
    },
    "vitalsWarning": "String describing vital warning (e.g. raises BP) or null"
  },
  "alerts": ["Array of alert strings based on exact dangerous contraindications and interactions with user profile. Max 2."]
}`;

    const result = await model.generateContent(prompt);
    let text = await result.response.text();
    
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }
    
    const parsedData = JSON.parse(text);
    res.json(parsedData);
  } catch (error) {
    console.error("AI Error:", error);
    if (error.status === 429) {
        console.log("Using Mock Fallback for MedScan due to 429 Rate Limit.");
        return res.json({
          found: true,
          medicine: {
            name: "SIMULATED MEDICATION (QUOTA HIT)",
            uses: "Commonly used to treat minor ailments. This is mocked data due to API limits.",
            instructions: {
              foodRequirement: "Can be taken with or without food",
              emptyStomachHours: null,
              details: "Take as directed by your physician."
            },
            vitalsWarning: null
          },
          alerts: ["Note: Live AI analysis is temporarily unavailable due to high API traffic. This is a simulated scan."]
        });
    }
    res.status(500).json({ error: "Failed to generate AI response. Check your API key or network." });
  }
};

export const treatmentMap = async (req, res) => {
  try {
    const { query, hospitals } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured in the backend .env file." });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `You are a medical routing AI. The user is searching for a treatment, location, or facility category: "${query}".
We have the following hospitals in our network (provided as JSON):
${JSON.stringify(hospitals)}

Determine the user's intent. 
If the user is asking for general facilities like "medical stores", "pharmacies", or a location not existing in our network, set "action" to "use_places_api" and define a "placesQuery" so the frontend can query Google Maps for all real-world locations.
If the user is searching for a specific treatment/hospital that matches our network (like "cardiac", "trauma", "Apollo"), set "action" to "match_network".

Return a strict JSON object with this exact structure (no markdown tags, just pure JSON):
{
  "action": "use_places_api" | "match_network",
  "placesQuery": "The optimized search string for Google Places API (e.g., 'Medical Stores in Bilaspur') if use_places_api, else null.",
  "hospitalId": "hosp_xx (if match_network, else null)",
  "treatmentName": "Cleaned up name of the search",
  "description": "Brief explanation of what you found or are searching for."
}`;

    const result = await model.generateContent(prompt);
    let text = await result.response.text();
    
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }
    
    const parsedData = JSON.parse(text);
    res.json(parsedData);
  } catch (error) {
    console.error("AI Error:", error);
    if (error.status === 429) {
        console.log("Using Mock Fallback for Treatment Map due to 429 Rate Limit.");
        return res.json({
          action: "use_places_api",
          placesQuery: query || "medical center",
          hospitalId: null,
          treatmentName: "Healthcare Center Fallback",
          description: "Live AI routing is paused due to high traffic. Defaulting to general Map search."
        });
    }
    res.status(500).json({ error: "Failed to generate AI response. Check your API key or network." });
  }
};

export const hospitalIntel = async (req, res) => {
  try {
    const { hospitalName } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite", 
      tools: [{ googleSearch: {} }]
    });

    const prompt = `Use Google Search to find intelligence on the hospital named: "${hospitalName}".
Provide an estimation for the following points based on the search results. If you cannot find exact data, simulate a highly realistic estimated response.

Return pure JSON without markdown. Structure:
{
  "opdTimings": "e.g. 09:00 AM - 05:00 PM",
  "casualtyContact": "Phone number or 'Available 24/7 on site'",
  "icuBedsAvailable": number,
  "bloodUnits": "e.g. 12 Units O+, 4 Units A-",
  "trustScore": "Verified" or "Unverified"
}`;

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    let text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsedData;
    if (jsonMatch) {
       parsedData = JSON.parse(jsonMatch[0]);
    } else {
       parsedData = {
          opdTimings: "09:00 AM - 06:00 PM",
          casualtyContact: "24/7 Site Casualty",
          icuBedsAvailable: 8,
          bloodUnits: "Assorted Units Available",
          trustScore: "Unverified"
       };
    }
    
    res.json(parsedData);
  } catch (error) {
    console.error("AI Error:", error);
    if (error.status === 429) {
       return res.json({
          opdTimings: "08:00 AM - 08:00 PM (Simulated)",
          casualtyContact: "108 Emergency (Mock)",
          icuBedsAvailable: Math.floor(Math.random() * 10),
          bloodUnits: "Monitoring Offline",
          trustScore: "Unverified"
       });
    }
    res.status(500).json({ error: "Failed." });
  }
};
