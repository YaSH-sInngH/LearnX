import { Configuration, OpenAIApi } from 'openai';
import { extractTranscript } from './videoService.js'; // Implement video transcript extraction

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateQuiz = async (videoUrl) => {
  try {
    const transcript = await extractTranscript(videoUrl);
    
    const prompt = `Generate 5 MCQ questions based on this video transcript:
    ${transcript}
    
    Format as JSON:
    {
      "questions": [
        {
          "question": "",
          "options": ["", "", "", ""],
          "correctAnswer": 0
        }
      ]
    }`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return JSON.parse(response.data.choices[0].text);
  } catch (error) {
    console.error('AI quiz generation failed:', error);
    throw new Error('Failed to generate quiz');
  }
};