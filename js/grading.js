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
        this.gradeClosing(userMessages[userMessages.length - 1], botMessages[botMessages.length - 1], grade);

        // Check for premature ending
        if (this.wasInterrupted(botMessages)) {
            grade.feedback.push("The call was ended prematurely by the roofer. Try to be more concise and value-focused in your pitch.");
            grade.overallScore -= 20;
        }

        grade.overallScore = Math.min(100, Math.max(0, grade.overallScore));

        return grade;
    }

    wasInterrupted(botMessages) {
        const lastMessage = botMessages[botMessages.length - 1].content.toLowerCase();
        return lastMessage.includes('goodbye') || lastMessage.includes("don't have time") || lastMessage.includes('end the call');
    }

    // ... (other methods remain the same)

    gradeClosing(lastUserMessage, lastBotMessage, grade) {
        const closing = lastUserMessage.content.toLowerCase();
        if (this.wasInterrupted(lastBotMessage)) {
            grade.feedback.push("The roofer ended the call before you could properly close. Work on keeping their interest throughout the call.");
        } else if (closing.includes('next step') || closing.includes('follow up') || closing.includes('appointment')) {
            grade.feedback.push("Excellent job attempting to move the conversation forward.");
            grade.overallScore += 10;
        } else {
            grade.feedback.push("Remember to always try to establish next steps or a follow-up at the end of your call.");
            grade.overallScore -= 5;
        }
    }
}

const gradingSystem = new GradingSystem();