const {WebhookClient, Payload} = require('dialogflow-fulfillment');

module.exports = app => {
    app.post('/', async (req, res) => {
        const agent = new WebhookClient({ request: req, response: res });

        function snoopy(agent) {
            agent.add(new Payload(agent.UNSPECIFIED,{
                accordion: [
                  {
                    header: "chatbot",
                    description: "<p>Chatbot for facebook and web</p> <p>second line</p>"
                  }
                ]
              }, {rawPayload: true, sendAsMessage: true} ));
        }

        function fallback(agent) {
            agent.add(`I didn't understand`);
            agent.add(`I'm sorry, can you try again?`);
        }
        let intentMap = new Map();
        intentMap.set('fulfillment-sample', snoopy);

        intentMap.set('Default Fallback Intent', fallback);

        agent.handleRequest(intentMap);
    });

} 