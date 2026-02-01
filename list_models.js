require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    console.log('📋 Listing available Gemini models...');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ No API KEY found in .env');
        return;
    }

    // Direct fetch because SDK sometimes hides list_models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log('\n✅ AVAILABLE MODELS:');
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`  - ${m.name.replace('models/', '')} (${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.log('⚠️ No models found in response:', data);
        }
    } catch (error) {
        console.error('❌ Error listing models:', error);
    }
}

listModels();
