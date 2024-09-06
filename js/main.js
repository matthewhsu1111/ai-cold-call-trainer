let conversationHistory = [];
let isListening = false;
let isInterrupted = false;

const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const conversationDiv = document.getElementById('conversation');
const gradeDiv = document.getElementById('grade');
const thinkingDiv = document.getElementById('thinking');

const addObjectionBtn = document.getElementById('add-objection-btn');
const triggerWordsInput = document.getElementById('trigger-words');
const objectionResponseInput = document.getElementById('objection-response');

function startConversation() {
    conversationHistory = [];
    isListening = false;
    isInterrupted = false;
    startButton.disabled = true;
    stopButton.disabled = false;
    conversationDiv.innerHTML = '';
    gradeDiv.innerHTML = '';
    nlpManager.selectPersonality(); // Select a random personality for this conversation
    rooferRespond("Hello? Who's this?");
}

function stopConversation() {
    speechRecognition.stop();
    isListening = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    displayGrade();
}

async function rooferRespond(message) {
    thinkingDiv.style.display = 'block';
    
    // Add a random pause between 1 to 3 seconds
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    thinkingDiv.style.display = 'none';
    const botMessage = addMessageToConversation('bot', message);
    conversationHistory.push({role: "assistant", content: message});
    botMessage.classList.add('speaking');
    await speakMessage(message);
    botMessage.classList.remove('speaking');
    
    if (isInterrupted || message.toLowerCase().includes('goodbye')) {
        stopConversation();
    } else {
        userListen();
    }
}

async function handleUserInput(text) {
    addMessageToConversation('user', text);
    thinkingDiv.style.display = 'block';
    conversationHistory.push({role: "user", content: text});
    const response = await nlpManager.generateResponse(conversationHistory);
    thinkingDiv.style.display = 'none';

    if (nlpManager.shouldInterrupt(conversationHistory)) {
        isInterrupted = true;
    }

    rooferRespond(response);
}

function userListen() {
    addMessageToConversation('system', 'Listening...');
    speechRecognition.start(async (text, confidence) => {
        if (confidence > 0.5) {
            handleUserInput(text);
        } else {
            addMessageToConversation('system', 'Sorry, I didn\'t catch that. Could you please repeat?');
            userListen();
        }
    });
}

async function speakMessage(message) {
    return new Promise((resolve) => {
        speechSynthesis.speak(message, resolve);
    });
}

function addMessageToConversation(speaker, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = speaker;
    messageDiv.textContent = `${speaker === 'user' ? 'You' : 'Roofer'}: ${text}`;
    conversationDiv.appendChild(messageDiv);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
    return messageDiv;
}

function displayGrade() {
    const grade = gradingSystem.gradeConversation(conversationHistory);
    gradeDiv.innerHTML = `
        <h2>Conversation Grade</h2>
        <p>Overall Score: ${grade.overallScore}</p>
        <h3>Feedback:</h3>
        <ul>
            ${grade.feedback.map(feedback => `<li>${feedback}</li>`).join('')}
        </ul>
    `;
}

addObjectionBtn.addEventListener('click', () => {
    const triggerWords = triggerWordsInput.value.split(',').map(word => word.trim());
    const response = objectionResponseInput.value.trim();
    
    if (triggerWords.length > 0 && response) {
        nlpManager.objectionsManager.addObjection(triggerWords, response);
        triggerWordsInput.value = '';
        objectionResponseInput.value = '';
        alert('Custom objection added successfully!');
    } else {
        alert('Please enter valid trigger words and response.');
    }
});

startButton.addEventListener('click', startConversation);
stopButton.addEventListener('click', stopConversation);