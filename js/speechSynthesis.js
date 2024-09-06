class SpeechSynthesisManager {
  constructor() {
      this.synth = window.speechSynthesis;
  }

  speak(text, callback) {
      if (this.synth.speaking) {
          console.error('speechSynthesis.speaking');
          return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

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