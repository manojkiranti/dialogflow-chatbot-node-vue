const dialogFlow = require("dialogflow");
const crypto = require("crypto");
const request = require("request");
const uuid = require("uuid");
const sessionIds = new Map();

const config = require("../config/keys");

const projectId = config.googleProjectId;
const credentials = {
  client_email: config.googleClientEmail,
  private_key: config.googlePrivateKey,
};

const sessionClient = new dialogFlow.SessionsClient({
  projectId: projectId,
  credentials: credentials,
});
const sessionPath = sessionClient.sessionPath(
  config.googleProjectId,
  config.dialogFlowSessionID
);

const { insertNewEnquiry, insertNewUser } = require("../chatbot/database");
const { digitalBankCards } = require("../chatbot/payload");

module.exports = {
  // Hand Over Protocals
  sendPassThread: (senderID) => {
    request({
      uri: "https://graph.facebook.com/v3.2/me/pass_thread_control",
      qs: { access_token: config.FB_PAGE_TOKEN },
      method: "POST",
      json: {
        recipient: {
          id: senderID,
        },
        target_app_id: config.FB_PAGE_INBOX_ID, // ID in the page inbox setting under messenger platform
      },
    });
  },

  // FB helpers

  greetUserText: (userId) => {
    let self = module.exports;
    //first read user firstname
    request(
      {
        uri: "https://graph.facebook.com/v3.2/" + userId,
        qs: {
          access_token: config.FB_PAGE_TOKEN,
        },
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var user = JSON.parse(body);

          if (user.first_name) {
            insertNewUser({
              fb_id: userId,
              first_name: user.first_name,
              last_name: user.last_name,
              profile_pic: user.profile_pic,
              registerDate: Date.now(),
            });
            // console.log("FB user: %s %s, %s",
            // 	user.first_name, user.last_name, user.gender);

            self.sendTextMessage(
              userId,
              "Namaste " +
                user.first_name +
                "! I am Genie Virtual Assistant. Please use following buttons to get Genie related " +
                "information or ask m a question. I will try my best to answer your queries."
            );

            // self.sendToDialogFlow(userId, "Home");
          } else {
            console.log("Cannot get data for fb user with id", userId);
          }
        } else {
          console.error(response.error);
        }
      }
    );
  },

  /*
   * Verify that the callback came from Facebook. Using the App Secret from
   * the App Dashboard, we can verify the signature that is sent with each
   * callback in the x-hub-signature field, located in the header.
   *
   * https://developers.facebook.com/docs/graph-api/webhooks#setup
   *
   */
  verifyRequestSignature: async (req, res, buf) => {
    var signature = req.headers["x-hub-signature"];

    if (!signature) {
      throw new Error("Couldn't validate the signature.");
    } else {
      var elements = signature.split("=");
      var method = elements[0];
      var signatureHash = elements[1];

      var expectedHash = crypto
        .createHmac("sha1", config.FB_APP_SECRET)
        .update(buf)
        .digest("hex");

      if (signatureHash != expectedHash) {
        throw new Error("Couldn't validate the request signature.");
      }
    }
  },

  receivedMessage: async (event) => {
    let self = module.exports;
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    if (!sessionIds.has(senderID)) {
      sessionIds.set(senderID, uuid.v1());
    }
    //console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    //console.log(JSON.stringify(message));

    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    if (isEcho) {
      self.handleEcho(messageId, appId, metadata);
      return;
    } else if (quickReply) {
      self.handleQuickReply(senderID, quickReply, messageId);
      return;
    }

    if (messageText) {
      //send message to api.ai
      self.sendToDialogFlow(senderID, messageText);
    } else if (messageAttachments) {
      self.handleMessageAttachments(messageAttachments, senderID);
    }
  },

  //https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
  handleEcho: (messageId, appId, metadata) => {
    // Just logging message echoes to console
    console.log(
      "Received echo for message %s and app %d with metadata %s",
      messageId,
      appId,
      metadata
    );
  },

  handleQuickReply: (senderID, quickReply, messageId) => {
    let self = module.exports;
    var quickReplyPayload = quickReply.payload;
    console.log(
      "Quick reply for message %s with payload %s",
      messageId,
      quickReplyPayload
    );
    //send payload to api.ai
    self.sendToDialogFlow(senderID, quickReplyPayload);
  },

  sendToDialogFlow: async (sender, textString, params) => {
    let self = module.exports;
    self.sendTypingOn(sender);

    try {
      const sessionPath = sessionClient.sessionPath(
        config.GOOGLE_PROJECT_ID,
        sessionIds.get(sender)
      );

      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: textString,
            languageCode: config.DF_LANGUAGE_CODE,
          },
        },
        queryParams: {
          payload: {
            data: params,
          },
        },
      };
      const responses = await sessionClient.detectIntent(request);

      const result = responses[0].queryResult;
      self.handleDialogFlowResponse(sender, result);
    } catch (e) {
      console.log("error");
      console.log(e);
    }
  },

  handleMessageAttachments: (messageAttachments, senderID) => {
    let self = module.exports;
    //for now just reply
    self.sendTextMessage(senderID, "Attachment received. Thank you.");
  },

  sendTextMessage: (recipientId, text) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: text,
      },
    };
    self.callSendAPI(messageData);
  },

  // Turn typing indicator on
  sendTypingOn: (recipientId) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      sender_action: "typing_on",
    };

    self.callSendAPI(messageData);
  },

  // Turn typing indicator off
  sendTypingOff: (recipientId) => {
    let self = module.exports;

    var messageData = {
      recipient: {
        id: recipientId,
      },
      sender_action: "typing_off",
    };

    self.callSendAPI(messageData);
  },

  /**
   * Call the Send API. The message data goes in the body. If successful, we'll
   * get the message id in a response
   */
  callSendAPI: (messageData) => {
    request(
      {
        uri: "https://graph.facebook.com/v3.2/me/messages",
        qs: {
          access_token: config.FB_PAGE_TOKEN,
        },
        method: "POST",
        json: messageData,
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var recipientId = body.recipient_id;
          var messageId = body.message_id;

          if (messageId) {
            console.log(
              "Successfully sent message with id %s to recipient %s",
              messageId,
              recipientId
            );
          } else {
            console.log(
              "Successfully called Send API for recipient %s",
              recipientId
            );
          }
        } else {
          console.error(
            "Failed calling Send API",
            response.statusCode,
            response.statusMessage,
            body.error
          );
        }
      }
    );
  },

  handleDialogFlowResponse: (sender, response) => {
    let self = module.exports;
    let responseText = response.fulfillmentMessages.fulfillmentText;

    let messages = response.fulfillmentMessages;
    let action = response.action;
    let contexts = response.outputContexts;
    let parameters = response.parameters;

    self.sendTypingOff(sender);

    if (self.isDefined(action)) {
      self.handleDialogFlowAction(
        sender,
        action,
        messages,
        contexts,
        parameters,
        response
      );
    } else if (self.isDefined(messages)) {
      self.handleMessages(messages, sender);
      //   if (response.queryText === "Digital banking") {
      //     self.sendCustomCardMessageForNow(sender, digitalBankCards());
      //   } else {
      //     self.handleMessages(messages, sender);
      //   }
    } else if (responseText == "" && !self.isDefined(action)) {
      //dialogflow could not evaluate input.
      self.sendTextMessage(
        sender,
        "I'm not sure what you want. Can you be more specific?"
      );
    } else if (self.isDefined(responseText)) {
      self.sendTextMessage(sender, responseText);
    }
  },

  sendCustomCardMessageForNow: (recipientId, messages) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: messages,
    };
    console.log(messageData);
    self.callSendAPI(messageData);
  },

  handleDialogFlowAction: (
    sender,
    action,
    messages,
    contexts,
    parameters,
    queryResult
  ) => {
    let self = module.exports;

    switch (action) {
      case "talk.human":
        self.sendPassThread(sender);
        break;
      case "detail-loan-application":
        if (
          queryResult.hasOwnProperty("allRequiredParamsPresent") &&
          queryResult.allRequiredParamsPresent
        ) {
          let data = {};

          let user_name = self.getGivenEntity(parameters, "user-name");
          let loan_type = self.getGivenEntity(parameters, "loan-type");
          let occupation = self.getGivenEntity(parameters, "user-occupation");
          let is_loan_taken_prev = self.getGivenEntity(
            parameters,
            "user-prev-loan"
          );
          let phone_number = self.getGivenEntity(parameters, "phone-number");

          if (user_name != "") {
            data.name = user_name;
          }

          if (loan_type != "") {
            data.loan_type = loan_type;
          }

          if (occupation != "") {
            data.occupation = occupation;
          }

          if (is_loan_taken_prev != "") {
            data.is_loan_taken_prev = is_loan_taken_prev;
          }

          if (phone_number != "") {
            data.phone_number = phone_number;
          }

          data.registerDate = Date.now();

          insertNewEnquiry(data);
        }

        self.handleMessages(messages, sender);
        break;

      case "get-account-balance":
        const checkableOtpCode = "1234";

        let accountBalance = self.getRandomAccountBalance();
        let phone_number =
          parameters.fields.hasOwnProperty("phone_number") &&
          parameters.fields["phone_number"].stringValue != ""
            ? parameters.fields["phone_number"].stringValue
            : "";
        let otp_code =
          parameters.fields.hasOwnProperty("otp_code") &&
          parameters.fields["otp_code"].stringValue != ""
            ? parameters.fields["otp_code"].stringValue
            : "";

        if (phone_number != "" && otp_code == "") {
          self.sendTypingOn(sender);
          self.sendTextMessage(
            sender,
            "The otp code has been sent to your mobile!"
          );
        }

        if (
          queryResult.hasOwnProperty("allRequiredParamsPresent") &&
          queryResult.allRequiredParamsPresent
        ) {
          if (otp_code == checkableOtpCode) {
            self.sendTextMessage(
              sender,
              "You have " + accountBalance + " in your account. Thank You!"
            );
          } else {
            self.sendTextMessage(
              sender,
              "The otp code " +
                otp_code +
                " does not matched! Please try again!"
            );
          }
        }

        self.handleMessages(messages, sender);
        break;

      case "get-current-weather":
        if (
          parameters.fields.hasOwnProperty("geo-city") &&
          parameters.fields["geo-city"].stringValue != ""
        ) {
          request(
            {
              url: "http://api.openweathermap.org/data/2.5/weather", //URL to hit
              qs: {
                appid: config.WEATHER_API_KEY,
                q: parameters.fields["geo-city"].stringValue,
              }, //Query string data
            },
            function (error, response, body) {
              if (response.statusCode === 200) {
                let weather = JSON.parse(body);
                if (weather.hasOwnProperty("weather")) {
                  let reply = `${messages[0].text.text} ${weather["weather"][0]["description"]}`;
                  self.sendTextMessage(sender, reply);
                } else {
                  self.sendTextMessage(
                    sender,
                    `No weather forecast available for ${parameters.fields["geo-city"].stringValue}`
                  );
                }
              } else {
                self.sendTextMessage(
                  sender,
                  "Weather forecast is not available"
                );
              }
            }
          );
        } else {
          self.handleMessages(messages, sender);
        }
        break;

      case "faq-delivery":
        self.handleMessages(messages, sender);

        self.sendTypingOn(sender);

        //ask what user wants to do next
        setTimeout(function () {
          let buttons = [
            {
              type: "web_url",
              url: "https://www.myapple.com/track_order",
              title: "Track my order",
            },
            {
              type: "phone_number",
              title: "Call us",
              payload: "+16505551234",
            },
            {
              type: "postback",
              title: "Keep on Chatting",
              payload: "CHAT",
            },
          ];

          self.sendButtonMessage(
            sender,
            "What would you like to do next?",
            buttons
          );
        }, 3000);

        break;
      case "detailed-application":
        if (
          isDefined(contexts[0]) &&
          (contexts[0].name.includes("job_application") ||
            contexts[0].name.includes(
              "job-application-details_dialog_context"
            )) &&
          contexts[0].parameters
        ) {
          let phone_number =
            isDefined(contexts[0].parameters.fields["phone-number"]) &&
            contexts[0].parameters.fields["phone-number"] != ""
              ? contexts[0].parameters.fields["phone-number"].stringValue
              : "";
          let user_name =
            isDefined(contexts[0].parameters.fields["user-name"]) &&
            contexts[0].parameters.fields["user-name"] != ""
              ? contexts[0].parameters.fields["user-name"].stringValue
              : "";
          let previous_job =
            isDefined(contexts[0].parameters.fields["previous-job"]) &&
            contexts[0].parameters.fields["previous-job"] != ""
              ? contexts[0].parameters.fields["previous-job"].stringValue
              : "";
          let years_of_experience =
            isDefined(contexts[0].parameters.fields["years-of-experience"]) &&
            contexts[0].parameters.fields["years-of-experience"] != ""
              ? contexts[0].parameters.fields["years-of-experience"].stringValue
              : "";
          let job_vacancy =
            isDefined(contexts[0].parameters.fields["job-vacancy"]) &&
            contexts[0].parameters.fields["job-vacancy"] != ""
              ? contexts[0].parameters.fields["job-vacancy"].stringValue
              : "";

          if (
            phone_number == "" &&
            user_name != "" &&
            previous_job != "" &&
            years_of_experience == ""
          ) {
            let replies = [
              {
                content_type: "text",
                title: "Less than 1 year",
                payload: "Less than 1 year",
              },
              {
                content_type: "text",
                title: "Less than 10 years",
                payload: "Less than 10 years",
              },
              {
                content_type: "text",
                title: "More than 10 years",
                payload: "More than 10 years",
              },
            ];
            self.sendQuickReply(sender, messages[0].text.text[0], replies);
          } else if (
            phone_number != "" &&
            user_name != "" &&
            previous_job != "" &&
            years_of_experience != "" &&
            job_vacancy != ""
          ) {
            let emailContent =
              "A new job enquiery from " +
              user_name +
              " for the job: " +
              job_vacancy +
              ".<br> Previous job position: " +
              previous_job +
              "." +
              ".<br> Years of experience: " +
              years_of_experience +
              "." +
              ".<br> Phone number: " +
              phone_number +
              ".";

            self.sendEmail("New job application", emailContent);

            self.handleMessages(messages, sender);
          } else {
            self.handleMessages(messages, sender);
          }
        }
        break;
      default:
        //unhandled action, just send back the text
        self.handleMessages(messages, sender);
        break;
    }
  },

  getGivenEntity: (params, field) => {
    let self = module.exports;
    return self.isDefined(params.fields[field]) && params.fields[field] != ""
      ? params.fields[field].stringValue
      : "";
  },

  handleCardMessages: (messages, sender) => {
    let self = module.exports;

    let elements = [];
    for (var m = 0; m < messages.length; m++) {
      let message = messages[m];
      let buttons = [];
      for (var b = 0; b < message.card.buttons.length; b++) {
        let isLink =
          message.card.buttons[b].postback.substring(0, 4) === "http";
        let isPhone =
          message.card.buttons[b].postback.substring(0, 4) === "+977";
        let button;
        if (isLink) {
          button = {
            type: "web_url",
            title: message.card.buttons[b].text,
            url: message.card.buttons[b].postback,
          };
        } else if (isPhone) {
          button = {
            type: "phone_number",
            title: message.card.buttons[b].text,
            payload: message.card.buttons[b].postback,
          };
        } else {
          button = {
            type: "postback",
            title: message.card.buttons[b].text,
            payload: message.card.buttons[b].postback,
          };
        }
        buttons.push(button);
      }

      let element = {
        title: message.card.title,
        image_url: message.card.imageUri,
        subtitle: message.card.subtitle,
        buttons: buttons,
      };
      elements.push(element);
    }
    self.sendGenericMessage(sender, elements);
  },

  handleMessage: (message, sender) => {
    let self = module.exports;
    switch (message.message) {
      case "text": //text
        message.text.text.forEach((text) => {
          if (text !== "") {
            self.sendTextMessage(sender, text);
          }
        });
        break;
      case "quickReplies": //quick replies
        let replies = [];
        message.quickReplies.quickReplies.forEach((text) => {
          let reply = {
            content_type: "text",
            title: text,
            payload: text,
          };
          replies.push(reply);
        });
        self.sendQuickReply(sender, message.quickReplies.title, replies);
        break;
      case "image": //image
        self.sendImageMessage(sender, message.image.imageUri);
        break;
    }
  },

  handleMessages: (messages, sender) => {
    let self = module.exports;
    let timeoutInterval = 1100;
    let previousType;
    let cardTypes = [];
    let timeout = 0;

    for (var i = 0; i < messages.length; i++) {
      if (
        previousType == "card" &&
        (messages[i].message != "card" || i == messages.length - 1)
      ) {
        timeout = (i - 1) * timeoutInterval;
        setTimeout(
          self.handleCardMessages.bind(null, cardTypes, sender),
          timeout
        );
        cardTypes = [];
        timeout = i * timeoutInterval;
        setTimeout(self.handleMessage.bind(null, messages[i], sender), timeout);
      } else if (messages[i].message == "card" && i == messages.length - 1) {
        cardTypes.push(messages[i]);
        timeout = (i - 1) * timeoutInterval;
        setTimeout(
          self.handleCardMessages.bind(null, cardTypes, sender),
          timeout
        );
        cardTypes = [];
      } else if (messages[i].message == "card") {
        cardTypes.push(messages[i]);
      } else {
        timeout = i * timeoutInterval;
        setTimeout(self.handleMessage.bind(null, messages[i], sender), timeout);
      }

      previousType = messages[i].message;
    }
  },

  // Send a button message using the Send API.
  sendButtonMessage: (recipientId, text, buttons) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: text,
            buttons: buttons,
          },
        },
      },
    };

    self.callSendAPI(messageData);
  },

  // Send a message with Quick Reply buttons.
  sendQuickReply: (recipientId, text, replies, metadata) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: text,
        metadata: self.isDefined(metadata) ? metadata : "",
        quick_replies: replies,
      },
    };

    self.callSendAPI(messageData);
  },

  // Send an image using the Send API.
  sendImageMessage: (recipientId, imageUrl) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "image",
          payload: {
            url: imageUrl,
          },
        },
      },
    };

    self.callSendAPI(messageData);
  },

  // Send audio using the Send API.
  sendGifMessage: (recipientId) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "image",
          payload: {
            url: config.SERVER_URL + "/assets/instagram_logo.gif",
          },
        },
      },
    };

    self.callSendAPI(messageData);
  },

  // Send a video using the Send API.
  // example videoName: "/assets/allofus480.mov"
  sendVideoMessage: (recipientId, videoName) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "video",
          payload: {
            url: config.SERVER_URL + videoName,
          },
        },
      },
    };

    self.callSendAPI(messageData);
  },

  /**
   * Send a video using the Send API.
   * example fileName: fileName"/assets/test.txt"
   */
  sendFileMessage: (recipientId, fileName) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "file",
          payload: {
            url: config.SERVER_URL + fileName,
          },
        },
      },
    };

    self.callSendAPI(messageData);
  },

  // Send a read receipt to indicate the message has been read
  sendReadReceipt: (recipientId) => {
    let self = module.exports;

    var messageData = {
      recipient: {
        id: recipientId,
      },
      sender_action: "mark_seen",
    };

    self.callSendAPI(messageData);
  },

  sendReceiptMessage: (
    recipientId,
    recipient_name,
    currency,
    payment_method,
    timestamp,
    elements,
    address,
    summary,
    adjustments
  ) => {
    let self = module.exports;
    // Generate a random receipt ID as the API requires a unique ID
    var receiptId = "order" + Math.floor(Math.random() * 1000);

    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "receipt",
            recipient_name: recipient_name,
            order_number: receiptId,
            currency: currency,
            payment_method: payment_method,
            timestamp: timestamp,
            elements: elements,
            address: address,
            summary: summary,
            adjustments: adjustments,
          },
        },
      },
    };

    self.callSendAPI(messageData);
  },

  // Send a message with the account linking call-to-action
  sendAccountLinking: (recipientId) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "Welcome. Link your account.",
            buttons: [
              {
                type: "account_link",
                url: config.SERVER_URL + "/authorize",
              },
            ],
          },
        },
      },
    };

    self.callSendAPI(messageData);
  },

  sendGenericMessage: (recipientId, elements) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: elements,
          },
        },
      },
    };

    self.callSendAPI(messageData);
  },

  /*
   * Postback Event
   *
   * self event is called when a postback is tapped on a Structured Message.
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
   */
  receivedPostback: (event) => {
    let self = module.exports;
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;

    console.log("PAYLOAD", payload);
    // /FACEBOOK_WELCOME
    switch (payload) {
      case "GET_STARTED":
        self.greetUserText(senderID);

        break;
      case "JOB_APPLY":
        //get feedback with new jobs
        self.sendToDialogFlow(senderID, "job openings");
        break;
      case "CHAT":
        //user wants to chat
        self.sendTextMessage(
          senderID,
          "I love chatting too. Do you have any other questions for me?"
        );
        break;
      default:
        //unindentified payload
        // self.sendTextMessage(
        //   senderID,
        //   "I'm not sure what you want. Can you be more specific?"
        // );
        self.sendToDialogFlow(senderID, payload);
        break;
    }

    console.log(
      "Received postback for user %d and page %d with payload '%s' " + "at %d",
      senderID,
      recipientID,
      payload,
      timeOfPostback
    );
  },

  /*
   * Message Read Event
   *
   * self event is called when a previously-sent message has been read.
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
   */
  receivedMessageRead: (event) => {
    let self = module.exports;
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    // All messages before watermark (a timestamp) or sequence have been seen.
    var watermark = event.read.watermark;
    var sequenceNumber = event.read.seq;

    console.log(
      "Received message read event for watermark %d and sequence " +
        "number %d",
      watermark,
      sequenceNumber
    );
  },

  /* Account Link Event
   *
   * self event is called when the Link Account or UnLink Account action has been
   * tapped.
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
   */
  receivedAccountLink: (event) => {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    var status = event.account_linking.status;
    var authCode = event.account_linking.authorization_code;

    console.log(
      "Received account link event with for user %d with status %s " +
        "and auth code %s ",
      senderID,
      status,
      authCode
    );
  },

  /*
   * Delivery Confirmation Event
   *
   * self event is sent to confirm the delivery of a message. Read more about
   * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
   *
   */
  receivedDeliveryConfirmation: (event) => {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var delivery = event.delivery;
    var messageIDs = delivery.mids;
    var watermark = delivery.watermark;
    var sequenceNumber = delivery.seq;

    if (messageIDs) {
      messageIDs.forEach(function (messageID) {
        console.log(
          "Received delivery confirmation for message ID: %s",
          messageID
        );
      });
    }

    console.log("All message before %d were delivered.", watermark);
  },

  /*
   * Authorization Event
   *
   * The value for 'optin.ref' is defined in the entry point. For the "Send to
   * Messenger" plugin, it is the 'data-ref' field. Read more at
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
   *
   */
  receivedAuthentication: (event) => {
    let self = module.exports;
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfAuth = event.timestamp;

    // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
    // The developer can set self to an arbitrary value to associate the
    // authentication callback with the 'Send to Messenger' click event. self is
    // a way to do account linking when the user clicks the 'Send to Messenger'
    // plugin.
    var passThroughParam = event.optin.ref;

    console.log(
      "Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d",
      senderID,
      recipientID,
      passThroughParam,
      timeOfAuth
    );

    // When an authentication is received, we'll send a message back to the sender
    // to let them know it was successful.
    self.sendTextMessage(senderID, "Authentication successful");
  },

  // Global helpers
  isDefined: (obj) => {
    if (typeof obj == "undefined") {
      return false;
    }

    if (!obj) {
      return false;
    }

    return obj != null;
  },

  sendEmail: (subject, content) => {
    let self = module.exports;
    console.log("sending email");
    var helper = require("sendgrid").mail;

    var from_email = new helper.Email(config.EMAIL_FROM);
    var to_email = new helper.Email(config.EMAIL_TO);
    var subject = subject;
    var content = new helper.Content("text/html", content);
    var mail = new helper.Mail(from_email, subject, to_email, content);

    var sg = require("sendgrid")(config.SENGRID_API_KEY);
    var request = sg.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: mail.toJSON(),
    });

    sg.API(request, function (error, response) {
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
  },

  // will be removed later

  getRandomAccountBalance: () => {
    let items = ["Nrs. 11000", "Nrs. 5500", "Nrs. 549", "Nrs. 1002", "Nrs. 0"];

    return items[Math.floor(Math.random() * items.length)];
  },
};
