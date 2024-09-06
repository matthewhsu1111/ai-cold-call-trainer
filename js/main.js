let conversationHistory = [];
let isListening = false;
let isInterrupted = false;

let startButton, stopButton, conversationDiv, gradeDiv, thinkingDiv, addObjectionBtn, triggerWordsInput, objectionResponseInput;

document.addEventListener('DOMContentLoaded', function() {
    startButton = document.getElementById('start-btn');
    stopButton = document.getElementById('stop-btn');
    conversationDiv = document.getElementById('conversation');
    gradeDiv = document.getElementById('grade');
    thinkingDiv = document.getElementById('thinking');

    addObjectionBtn = document.getElementById('add-objection-btn');
    triggerWordsInput = document.getElementById('trigger-words');
    objectionResponseInput = document.getElementById('objection-response');

    if (addObjectionBtn) {
        addObjectionBtn.addEventListener('click', addCustomObjection);
    }

    if (startButton) {
        startButton.addEventListener('click', startConversation);
    }

    if (stopButton) {
        stopButton.addEventListener('click', stopConversation);
    }
});

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

function addCustomObjection() {
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
}