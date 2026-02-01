import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ Gemini API Key is missing in environment variables');
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Use Gemini Flash Latest (same as Reports feature)
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        console.log('🤖 AI Chat: Starting chat session...');

        // Construct the chat session
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        // Provide context to the AI
        const systemContext = `
      You are 'Yuktha AI', a helpful and empathetic health assistant for the Yuktah Health platform.
      Your goal is to assist patients with general health questions, understanding medical terms, 
      and navigating the Yuktah platform.

      Platform features you know about:
      - Medicine Tracker: Reminds users to take pills
      - Report Analysis: AI analysis of lab reports
      - Family Access: Managing family member health profiles
      - Emergency QR: Quick access to emergency info

      IMPORTANT DISCLAIMER: 
      Always clarify that you are an AI, not a doctor. 
      For any serious medical symptoms, advise the user to consult a doctor immediately 
      or go to the emergency room. Do not provide diagnoses or prescribe medication.

      Keep your responses concise, friendly, and easy to understand.
    `;

        // Send user message with context
        let finalMessage = message;
        if (!history || history.length === 0) {
            finalMessage = `${systemContext}\n\nUser Question: ${message}`;
        }

        console.log('🤖 AI Chat: Sending message to Gemini...');
        const result = await chat.sendMessage(finalMessage);
        const response = await result.response;
        const text = response.text();
        console.log('🤖 AI Chat: Response received');

        return NextResponse.json({ reply: text });

    } catch (error: any) {
        console.error('❌ AI Chat Error:', error);
        // Log detailed error from Google API if available
        if (error.response) {
            console.error('❌ API Response Error:', JSON.stringify(error.response, null, 2));
        }
        return NextResponse.json(
            { error: error.message || 'Failed to generate response' },
            { status: 500 }
        );
    }
}
