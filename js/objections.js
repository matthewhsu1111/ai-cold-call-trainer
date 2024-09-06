class ObjectionsManager {
  constructor() {
      this.objections = [
          { 
              trigger: ["cost", "expensive", "price"],
              response: "We're on a tight budget right now. How much does your software cost?"
          },
          {
              trigger: ["time", "busy", "schedule"],
              response: "I'm swamped with projects. I don't have time to learn new software."
          },
          {
              trigger: ["current system", "already using"],
              response: "We're already using a system that works fine. Why should we switch?"
          },
          {
              trigger: ["team", "employees", "staff"],
              response: "My team isn't very tech-savvy. Will this be easy for them to learn?"
          },
          {
              trigger: ["integration", "existing tools"],
              response: "Does your software integrate with our existing tools and processes?"
          }
      ];
  }

  addObjection(triggerWords, response) {
      this.objections.push({ trigger: triggerWords, response: response });
  }

  getObjection(message) {
      for (let objection of this.objections) {
          if (objection.trigger.some(word => message.toLowerCase().includes(word))) {
              return objection.response;
          }
      }
      return null;
  }
}