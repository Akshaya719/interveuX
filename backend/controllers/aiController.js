const { GoogleGenerativeAI } = require('@google/generative-ai');

const analyzeCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key configured, return a meaningful fallback instead of a hardcoded mock
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(200).json({
        timeComplexity: 'Add your GEMINI_API_KEY to backend/.env to enable real AI analysis.',
        spaceComplexity: 'N/A',
        potentialBugs: ['AI analysis not configured.'],
        edgeCases: [],
        alternativeApproach: 'Please configure GEMINI_API_KEY in the backend .env file.',
        codeQuality: 'N/A',
        overallEvaluation: {
          problemSolving: 'N/A',
          algorithmChoice: 'N/A',
          codeQuality: 'N/A',
          recommendation: 'Configure API Key',
          rating: 0,
        }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert software engineer conducting a technical interview. Analyze the following ${language} code and provide a structured evaluation. 

CODE:
\`\`\`${language}
${code}
\`\`\`

Respond ONLY with valid JSON in this exact structure (no markdown, no explanation outside the JSON):
{
  "timeComplexity": "string describing time complexity (e.g. O(n log n))",
  "spaceComplexity": "string describing space complexity",
  "potentialBugs": ["list of potential bugs or issues"],
  "edgeCases": ["list of edge cases not handled"],
  "alternativeApproach": "string describing a better alternative if applicable",
  "codeQuality": "string evaluation of code style, readability, naming",
  "overallEvaluation": {
    "problemSolving": "Brief evaluation of problem solving ability",
    "algorithmChoice": "Brief evaluation of algorithm choice",
    "codeQuality": "Brief evaluation of code quality",
    "recommendation": "one of: Strongly Recommended, Recommended, Borderline, Not Recommended",
    "rating": number from 1 to 5
  }
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the response
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', cleaned);
      return res.status(500).json({ message: 'AI returned an invalid response. Please try again.' });
    }

    res.status(200).json(analysis);

  } catch (error) {
    console.error('AI Analysis Error:', error?.message);
    res.status(500).json({ message: 'Failed to analyze code. Check your GEMINI_API_KEY.' });
  }
};

module.exports = { analyzeCode };
