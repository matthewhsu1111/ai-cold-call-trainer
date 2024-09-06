let conversationHistory = [];
let isListening = false;

const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const conversationDiv = document.getElementById('conversation');
const gradeDiv = document.getElementById('grade');

function startConversation() {
    conversationHistory = [];
    startButton.disabled = true;
    stopButton.disabled = false;
    conversationDiv.innerHTML = '';
    gradeDiv.innerHTML = '';
    addMessageToConversation('system', "The call has started. Begin your pitch to the roofer.");
    userListen();
}

function stopConversation() {
    speechRecognition.stop();
    isListening = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    displayGrade();
}

async function rooferRespond(userMessage) {
    conversationHistory.push({role: "user", content: userMessage});
    const response = await nlpManager.generateResponse(conversationHistory);
    conversationHistory.push({role: "assistant", content: response});
    addMessageToConversation('bot', response);
    await new Promise(resolve => speechSynthesis.speak(response, resolve));
    userListen();
}

function userListen() {
    addMessageToConversation('system', 'Listening to your pitch...');
    speechRecognition.start(async (text, confidence) => {
        if (confidence > 0.5) {
            addMessageToConversation('user', text);
            rooferRespond(text);
        } else {
            addMessageToConversation('system', 'Sorry, I didn\'t catch that. Could you please repeat?');
            userListen();
        }
    });
}

function addMessageToConversation(speaker, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = speaker;
    messageDiv.textContent = `${speaker === 'user' ? 'You' : 'Roofer'}: ${text}`;
    conversationDiv.appendChild(messageDiv);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

function displayGrade() {
    const grade = gradingSystem.gradeConversation(conversationHistory);
    gradeDiv.innerHTML = `
        <h2>Your Sales Pitch Grade</h2>
        <p>Overall Score: ${grade.overallScore}</p>
        <h3>Feedback:</h3>
        <ul>
            ${grade.feedback.map(feedback => `<li>${feedback}</li>`).join('')}
        </ul>
    `;
}

startButton.addEventListener('click', startConversation);
stopButton.addEventListener('click', stopConversation);