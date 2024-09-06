class NLPManager {
  constructor() {
      this.openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
      this.openaiKey = ''; // We'll fetch this securely
      
      this.rooferPersona = `You are a busy roofing contractor. You're often skeptical of new software solutions, 
      but you're open to ideas that could genuinely improve your business. Your main concerns are typically 
      cost, ease of use, and whether the software will actually save time or increase profits. You're not very 
      tech-savvy, so you prefer simple, straightforward explanations. You're also quite busy and impatient. 
      If the caller is stuttering, unclear, or wasting your time, you might interrupt them and end the call. 
      Respond as this persona would to a salesperson cold calling about new software for your roofing business.`;

      this.interruptionThreshold = 2; // Number of poor responses before interrupting
      this.poorResponseCount = 0;

      this.objectionsManager = new ObjectionsManager();
  }

  async getApiKey() {
      const response = await fetch('/api/getOpenAIKey');
      const data = await response.json();
      this.openaiKey = data.key;
  }

  async generateResponse(conversationHistory) {
      if (!this.openaiKey) {
          await this.getApiKey();
      }

      // Check for interruption
      if (this.shouldInterrupt(conversationHistory)) {
          this.poorResponseCount = 0; // Reset the count
          return this.generateInterruption();
      }

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