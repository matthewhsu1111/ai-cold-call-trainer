class SpeechSynthesisManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
    }

    init() {
        // Wait for voices to be loaded
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = this.synth.getVoices();
            this.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
        };
    }

    speak(text, callback) {
        if (this.synth.speaking) {
            console.log('Speech synthesis is already in progress. Waiting...');
            setTimeout(() => this.speak(text, callback), 100);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        if (this.voice) {
            utterance.voice = this.voice;
        }

        utterance.onend = () => {
            if (callback) callback();
        };

        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance Error', event);
        };

        this.synth.speak(utterance);
    }
}

const speechSynthesis = new SpeechSynthesisManager();
speechSynthesis.init();