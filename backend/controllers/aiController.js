const axios = require('axios');

const analyzeCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    // Mock structured AI response. Replace with real Gemini/OpenAI call when API key is available.
    const mockAnalysis = {
      timeComplexity: "O(n) - The code iterates through the input linearly.",
      spaceComplexity: "O(1) - No additional space scaling with input size is used.",
      potentialBugs: ["No input validation.", "May fail on empty arrays or null input."],
      edgeCases: ["Empty input array.", "Single element.", "Extremely large numbers causing overflow."],
      alternativeApproach: "Consider using a hash map for O(1) lookups, trading space for time efficiency.",
      codeQuality: "Code is clean and readable, but variable names could be more descriptive. Consider adding comments.",
      overallEvaluation: {
        problemSolving: "Good — candidate understood the problem quickly.",
        algorithmChoice: "Appropriate for the given constraints.",
        codeQuality: "Solid — minor style improvements needed.",
        recommendation: "Recommended",
        rating: 4,
      }
    };

    await new Promise(resolve => setTimeout(resolve, 1200));
    res.status(200).json(mockAnalysis);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ message: 'Failed to analyze code' });
  }
};

module.exports = { analyzeCode };
