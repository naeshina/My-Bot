const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiAI {
  constructor(apikey) {
    this.genAI = new GoogleGenerativeAI(apikey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateContent(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }
}
module.exports = GeminiAI