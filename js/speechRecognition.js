class SpeechRecognitionManager {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = this.handleResult.bind(this);
        this.recognition.onerror = this.handleError.bind(this);
        this.recognition.onend = () => this.recognition.start();

        this.onResultCallback = null;
    }

    start(callback) {
        this.onResultCallback = callback;
        this.recognition.start();
    }

    stop() {
        this.recognition.stop();
    }

    handleResult(event) {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        const confidence = event.results[last][0].confidence;
        
        if (this.onResultCallback) {
            this.onResultCallback(text, confidence);
        }
    }

    handleError(event) {
        console.error('Speech recognition error', event.error);
    }
}

const speechRecognition = new SpeechRecognitionManager();