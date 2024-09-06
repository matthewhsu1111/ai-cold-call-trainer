class NLPManager {
  constructor() {
      this.openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
      this.openaiKey = ''; // You'll need to set this securely
      
      this.personalities = [
          "You are a skeptical and busy roofer, hard to impress and always looking for the catch.",
          "You are an enthusiastic roofer, open to new ideas but need clear explanations of benefits.",
          "You are a tech-savvy roofer, interested in cutting-edge solutions but concerned about implementation costs.",
          "You are a traditional roofer, resistant to change and prefer tried-and-true methods.",
          "You are a growth-oriented roofer, always looking for ways to expand your business but cautious about investments."
      ];
      this.rooferPersona = this.personalities[0];

      this.interruptionThreshold = 2; // Number of poor responses before interrupting
      this.poorResponseCount = 0;

      this.objectionsManager = new ObjectionsManager();
  }

  selectPersonality() {
      this.rooferPersona = this.personalities[Math.floor(Math.random() * this.personalities.length)];
  }

  async getApiKey() {
    // Check for Vercel's build-time environment variable
    if (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) {
        return process.env.OPENAI_API_KEY;
    }
    // Check for browser environment variable (if you've set it up this way)
    else if (typeof window !== 'undefined' && window.env && window.env.OPENAI_API_KEY) {
        return window.env.OPENAI_API_KEY;
    }
    else {
        throw new Error('OpenAI API key not found in environment variables');
    }
}

  async generateResponse(conversationHistory) {
    if (!this.openaiKey) {
        try {
            this.openaiKey = await this.getApiKey();
        } catch (error) {
            console.error('Failed to get API key:', error);
            return "I'm sorry, I'm having trouble connecting to my brain right now. Can we try again later?";
        }
    }

      // Check for interruption
      if (this.shouldInterrupt(conversationHistory)) {
          this.poorResponseCount = 0; // Reset the count
          return this.generateInterruption();
      }

      // Check for custom objections
      const lastUserMessage = conversationHistory[conversationHistory.length - 1];
      if (lastUserMessage.role === 'user') {
          const customObjection = this.objectionsManager.getObjection(lastUserMessage.content);
          if (customObjection) {
              return customObjection;
          }
      }

      const response = await fetch(this.openaiEndpoint, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.openaiKey}`
          },
          body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                  {role: "system", content: this.rooferPersona},
                  ...conversationHistory.map(msg => ({role: msg.role, content: msg.content}))
              ]
          })
      });
      const data = await response.json();
      return data.choices[0].message.content;
  }

  shouldInterrupt(conversationHistory) {
      const lastUserMessage = conversationHistory[conversationHistory.length - 1];
      if (lastUserMessage.role === 'user') {
          const content = lastUserMessage.content.toLowerCase();
          if (content.includes('um') || content.includes('uh') || content.length < 10) {
              this.poorResponseCount++;
          } else {
              this.poorResponseCount = 0; // Reset if a good response
          }
      }
      return this.poorResponseCount >= this.interruptionThreshold;
  }

  generateInterruption() {
      const interruptions = [
          "Look, I don't have time for this. Just shoot me an email if you have something important to say. Goodbye.",
          "I'm really busy right now and this doesn't seem like a good use of my time. Let's end the call here.",
          "I appreciate you reaching out, but I need to get back to work. Send me some information in writing if you want. Goodbye.",
          "Sorry, but I'm not interested. Please take me off your call list. Thanks, bye.",
          "I've got a crew waiting on me. If you can't get to the point quickly, we need to end this call."
      ];
      return interruptions[Math.floor(Math.random() * interruptions.length)];
  }
}

const nlpManager = new NLPManager();