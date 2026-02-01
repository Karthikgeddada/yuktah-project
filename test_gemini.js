require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('🧪 Testing Gemini API connection...');

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API Key present:', !!apiKey);
    if (apiKey) {
        console.log('🔑 Key starts with:', apiKey.substring(0, 8) + '...');
    } else {
        console.error('❌ No API KEY found in .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('🤖 Sending "Hello" to gemini-1.5-flash...');

    try {
        const result = await model.generateContent("Hello! Are you working?");
        const response = await result.response;
        const text = response.text();
        console.log('✅ SUCCESS! Response received:');
        console.log('---------------------------------------------------');
        console.log(text);
        console.log('---------------------------------------------------');
    } catch (error) {
        console.error('❌ FAILED to connect:');
        console.error(error);
    }
}

testGemini();
