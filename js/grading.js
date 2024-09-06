class GradingSystem {
  constructor() {
      this.positiveLanguage = ['efficiency', 'save time', 'increase profits', 'easy to use', 'customer satisfaction', 'streamline'];
      this.softwareTerms = ['cloud-based', 'mobile app', 'integration', 'automation', 'real-time', 'dashboard'];
      this.roofingTerms = ['estimate', 'invoice', 'scheduling', 'project management', 'material ordering', 'customer relationship management'];
  }

  gradeConversation(conversationHistory) {
      const userMessages = conversationHistory.filter(msg => msg.role === 'user');
      const botMessages = conversationHistory.filter(msg => msg.role === 'assistant');

      const grade = {
          overallScore: 0,
          feedback: []
      };

      this.gradeIntroduction(userMessages[0], grade);
      this.gradePitchContent(userMessages, grade);
      this.gradeResponseHandling(userMessages, botMessages, grade);
      this.gradeClosing(userMessages[userMessages.length - 1], grade);

      grade.overallScore = Math.min(100, Math.max(0, grade.overallScore));

      return grade;
  }

  gradeIntroduction(introMessage, grade) {
      const intro = introMessage.content.toLowerCase();
      if (intro.includes('my name is') && intro.includes('from')) {
          grade.feedback.push("Good job introducing yourself and your company.");
          grade.overallScore += 10;
      } else {
          grade.feedback.push("Remember to clearly introduce yourself and your company at the start of the call.");
          grade.overallScore -= 5;
      }
  }

  gradePitchContent(userMessages, grade) {
      const allUserContent = userMessages.map(msg => msg.content.toLowerCase()).join(' ');
      
      const positiveCount = this.positiveLanguage.reduce((count, word) => count + (allUserContent.includes(word) ? 1 : 0), 0);
      const softwareTermCount = this.softwareTerms.reduce((count, term) => count + (allUserContent.includes(term) ? 1 : 0), 0);
      const roofingTermCount = this.roofingTerms.reduce((count, term) => count + (allUserContent.includes(term) ? 1 : 0), 0);

      if (positiveCount > 3) {
          grade.feedback.push("Great job emphasizing the benefits of your software!");
          grade.overallScore += 15;
      } else {
          grade.feedback.push("Try to emphasize more benefits like efficiency, time-saving, and profit increase.");
          grade.overallScore -= 5;
      }

      if (softwareTermCount > 2 && roofingTermCount > 2) {
          grade.feedback.push("Excellent use of both software and roofing-specific terms. This shows you understand the industry.");
          grade.overallScore += 20;
      } else {
          grade.feedback.push("Try to incorporate more software and roofing-specific terms to demonstrate the relevance of your solution.");
          grade.overallScore -= 10;
      }
  }

  gradeResponseHandling(userMessages, botMessages, grade) {
      const questionCount = userMessages.filter(msg => msg.content.includes('?')).length;

      if (questionCount > 2) {
          grade.feedback.push("Good job asking questions to understand the roofer's needs.");
          grade.overallScore += 15;
      } else {
          grade.feedback.push("Try to ask more questions to understand the roofer's specific needs and challenges.");
          grade.overallScore -= 5;
      }

      // Check if user addressed objections raised by the bot
      botMessages.forEach((botMsg, index) => {
          if (botMsg.content.toLowerCase().includes('concern') || botMsg.content.toLowerCase().includes('but')) {
              if (index < userMessages.length - 1 && userMessages[index + 1].content.length > 50) {
                  grade.feedback.push("Good job addressing the roofer's concerns.");
                  grade.overallScore += 10;
              } else {
                  grade.feedback.push("Make sure to address all concerns raised by the roofer.");
                  grade.overallScore -= 5;
              }
          }
      });
  }

  gradeClosing(closingMessage, grade) {
      const closing = closingMessage.content.toLowerCase();
      if (closing.includes('next step') || closing.includes('follow up') || closing.includes('appointment')) {
          grade.feedback.push("Excellent job attempting to move the conversation forward.");
          grade.overallScore += 10;
      } else {
          grade.feedback.push("Remember to always try to establish next steps or a follow-up at the end of your call.");
          grade.overallScore -= 5;
      }
  }
}

const gradingSystem = new GradingSystem();