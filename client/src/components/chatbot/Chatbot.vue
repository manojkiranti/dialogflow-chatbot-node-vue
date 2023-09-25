<template>
  <div class="main-window">
    <div id="chat-circle" class="btn btn-raised" @click="openWindow" :class="{ active: closeWindow }">
      <span class="icon-wrap">
        <i class="material-icons">
          chat
        </i>
      </span>
    </div>
    <div class="cx-chatbot-wrap" :class="{ active: chatInit, close: closeWindow }">
      <Header @closeChat="closeChat" />
      <Banner v-show="showBanner" />
      <main-body @initialBtnClick="handleSelctButton" v-show="showMainNavigation" />
      <div id="cx-chatbot" class="cx-chatbot" v-show="chatInit">
        <perfect-scrollbar ref="scroll" id="chat-window">
          <div class="chat-content-box">
            <template v-for="(message, index) in messages">
              <template v-if="message.msg && message.msg.text && message.msg.text.text">
                <Message :key="index" :speaks="message.speaks" :text="message.msg.text.text" />
              </template>
              <template v-else-if="message.msg &&
                message.msg.payload &&
                message.msg.payload.fields &&
                message.msg.payload.fields.cards
                ">
                <div :key="index" class="card-content-wrapper">
                  <div class="card-panel card-panel-normal">
                    <div class="card-content">
                      <!-- <div class="col s2">
                        <a class="btn-floating btn-large waves-effect waves-light red"
                          ><i class="material-icons">{{ message.speaks }}</i></a
                        >
                      </div> -->
                      <div class="card-body-wrap card-carousel">
                        <div class="card-body">
                          <VueSlickCarousel v-bind="settings">
                            <template v-for="(card, cardIndex) in message.msg.payload
                              .fields.cards.listValue.values">
                              <Card :key="cardIndex" :payload="card.structValue" @btnSelected="handleSelctButton" />
                            </template>
                          </VueSlickCarousel>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="message.msg &&
                message.msg.payload &&
                message.msg.payload.fields &&
                message.msg.payload.fields.quick_replies_web
                ">
                <QuickReplies :key="index" :text="message.msg.payload.fields.text
                  ? message.msg.payload.fields.text
                  : null
                  " :speaks="message.speaks" :payload="message.msg.payload.fields.quick_replies_web.listValue
    .values
    " @replyClick="handleQuickReplyPayload" />
              </template>
              <template v-else-if="message.msg &&
                message.msg.payload &&
                message.msg.payload.fields &&
                message.msg.payload.fields.accordion
                ">
                <Accordion :key="index" :payload="message.msg.payload.fields.accordion" />
              </template>
              <template v-else-if="message.msg &&
                message.msg.payload &&
                message.msg.payload.fields &&
                message.msg.payload.fields.textBox
                ">
                <text-box :key="index" :payload="message.msg.payload.fields.textBox" />
              </template>
            </template>
            <div class="col s12 m8 offset-m2 offset-12">
              <div class="chat-msg-item-wrap">
                <div class="row valign-wrapper m-0">
                  <div class="col s12" ref="navigationContainer"></div>
                </div>
              </div>
            </div>
            <div class="btm-chat-content" ref="messageEnd"></div>
          </div>
        </perfect-scrollbar>
      </div>


      <div class="chat-processing" v-if="chatIsProcessing" style="background: #FFF;">
        <img src="@/assets/images/typing.gif" style="height: 26px;" alt="processing ..." />
      </div>
      <div class="chat-input-wrapper">
        <div class="chat-right-content" @click="getStartedNavigation">
          <i class="material-icons">reorder</i>
        </div>
        <div class="chat-input">
          <input @keypress="handleInputKeyPress($event)" placeholder="Type a message..." v-model="userMsg"
            ref="chantInput" type="text" />
        </div>
        <div class="chat-right-content" @click="handleInputKeyPress(userMsg, 'click')">
          <i class="material-icons">send</i>
        </div>
        <div class="chat-right-content speaker" :class="{ active: audioIsOn }" @click="handleAudioToSpeech">
          <i class="material-icons">{{
            audioIsOn ? `settings_voice` : `keyboard_voice`
          }}</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Message from "./Message";
import Card from "./Card";
import Accordion from "./accordion/Accordion";
import TextBox from "./text-box/TextBox";
import Header from "./Header";
import Banner from "./Banner";
import MainBody from "./MainBody";

import QuickReplies from "./QuickReplies";
import VueSlickCarousel from "vue-slick-carousel";

import Vue from "vue";
import axios from "axios";
import Cookies from "universal-cookie";
import { v4 as uuid } from "uuid";

import { getPositionOfCurrentUser, getDigitalSignature } from '../../helper/quickBtn';
import { ucwords } from '../../helper/utils'

export default {
  name: "ChatBot",
  components: {
    Message,
    Card,
    QuickReplies,
    Header,
    Banner,
    MainBody,
    VueSlickCarousel,
    Accordion,
    TextBox,
  },
  props: {
    messagesProp: {},
  },
  created() {
    if (this.cookies.get("userID") === undefined) {
      this.cookies.set("userID", uuid(), { path: "/" });
    }
  },
  mounted() {
    // removed async
    // this.df_event_query("Welcome");
    // if(window.location.pathname === '/shop' && !this.shopWelcomeSent) {
    //   await this.resolveAfterXSeconds(2);
    //    this.df_event_query('WELCOME_SHOP');
    //    this.shopWelcomeSent = true;
    // }
    console.log(getDigitalSignature());
  },
  updated() {
    this.$refs["messageEnd"].scrollIntoView({ behavior: "smooth" });
    let objDiv = document.getElementById("chat-window");
    this.$nextTick(() => {
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  },
  data() {
    return {
      messages: [],
      closeWindow: true,
      showBot: true,
      shopWelcomeSent: false,
      cookies: new Cookies(),
      userMsg: "",
      chatInit: false,
      showBanner: true,
      showMainNavigation: true,
      settings: {
        edgeFriction: 0.35,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        variableWidth: true,
      },
      audioIsOn: false,
      chatIsProcessing: false
    };
  },
  methods: {
    closeChat() {
      this.closeWindow = true;
    },
    openWindow() {
      this.closeWindow = false;
    },
    getStartedNavigation() {
      let that = this;
      var component = Vue.extend(MainBody)

      var instance = new component({
        propsData: { hideChatInfoHeader: true },
      });

      instance.$mount()

      this.$refs.navigationContainer.appendChild(instance.$el)

      instance.$on('initialBtnClick', function (selected) {
        that.handleSelctButton(selected, ucwords(selected.replace('_', ' ')))
      });

      this.$refs["messageEnd"].scrollIntoView({ behavior: "smooth" });
      let objDiv = document.getElementById("chat-window");
      this.$nextTick(() => {
        objDiv.scrollTop = objDiv.scrollHeight;
      });
    },

    handleAudioToSpeech() {
      if (this.audioIsOn) {
        this.audioIsOn = false;
        return;
      }
      this.audioIsOn = true
      let that = this;
      let SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      let recognition = new SpeechRecognition();
      // recognition.continuous = true;

      // This runs when the speech recognition service starts
      recognition.onstart = function () { };

      // recognition.onspeechend = function() {
      //     recognition.stop();
      // }

      recognition.onresult = function (event) {
        var transcript = event.results[0][0].transcript;
        that.speakorOn(transcript);
        recognition.stop();
      };

      // recognition.onend = function() {
      //   recognition.start();
      // };

      // start recognition
      recognition.start();
      this.removeNavigationContainer();
    },

    speakorOn(transcript) {
      if (this.audioIsOn) {
        this.userMsg = transcript;
      }
      this.removeNavigationContainer();
    },

    replySpeakor(transcript) {
      if ("speechSynthesis" in window) {
        // Speech Synthesis supported 🎉
        var msg = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        msg.voice = voices[9]
        msg.text = transcript;
        // this.audioIsOn = false
        window.speechSynthesis.speak(msg);
        // window.speechSynthesis.cancel();
      } else {
        // Speech Synthesis Not Supported 😣
        alert("Sorry, your browser doesn't support text to speech!");
      }
      this.removeNavigationContainer();
    },

    removeNavigationContainer() {
      this.$refs.navigationContainer.innerHTML = "";
    },

    handleSelctButton(postback, queryText) {
      let locationBaseQuery = ["locate-branch", "locate-atm"];
      if (locationBaseQuery.includes(postback)) {
        getPositionOfCurrentUser();
      } else {
        let says = {
          speaks: "me",
          msg: {
            text: {
              text: queryText,
            },
          },
        };
        this.messages = [...this.messages, says];
        this.df_event_query(postback);
        this.removeNavigationContainer();
      }
    },
    resolveAfterXSeconds(x) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(x);
        }, x * 100);
      });
    },
    show() {
      this.show = true;
    },
    hide() {
      this.show = false;
    },
    handleQuickReplyPayload(event, payload, text) {
      event.preventDefault();
      event.stopPropagation();
      switch (payload) {
        case "recommend_yes":
          this.df_event_query("SHOW_RECOMMENDATIONS");
          break;
        case "training_masterclass":
          this.df_event_query("MASTERCLASS");
          break;
        default:
          this.df_text_query(payload);
          break;
      }
      this.removeNavigationContainer();
    },
    handleInputKeyPress(e, type = "keyboard") {
      if (e || e.length !== 0) {
        if (type === "click") {
          this.df_text_query(this.userMsg);
          this.userMsg = "";
          // this.$refs["chatInput"].value = "";
        } else if (type === "voice") {
          this.df_text_query(e);
          e = "";
          this.userMsg = "";
        } else {
          if (e.key === "Enter") {
            this.df_text_query(e.target.value);
            e.target.value = "";
            this.userMsg = "";
          }
        }
      }
      this.removeNavigationContainer();
    },
    async df_text_query(queryText) {
      this.chatIsProcessing = true;
      let says = {
        speaks: "me",
        msg: {
          text: {
            text: queryText,
          },
        },
      };
      this.messages = [...this.messages, says];
      this.chatInitialize();
      try {
        const res = await axios.post("/api/df_text_query", {
          text: queryText,
          userID: this.cookies.get("userID"),
        });
        let index = 0;

        for (let msg of res.data.fulfillmentMessages) {
          let time = 0;
          if (index >= 1) {
            time = index * 10;
          }

          setTimeout(() => {
            says = {
              speaks: "bot",
              msg: msg,
            };
            this.messages = [...this.messages, says];
            if (msg.hasOwnProperty("text") && this.audioIsOn) {
              for (let speakerr of msg.text.text) {
                if (speakerr) {
                  this.replySpeakor(speakerr);
                }
              }

              this.audioIsOn = false;
            }
            this.chatIsProcessing = false;
          }, time);
          index++;
        }

      } catch (error) {
        says = {
          speaks: "bot",
          msg: {
            text: {
              text:
                "I'm having troubles. I need to terminate. Will be back later",
            },
          },
        };
        this.messages = [...this.messages, says];
        this.chatIsProcessing = false;
      }
      this.removeNavigationContainer()
    },
    async df_event_query(eventName) {
      this.chatIsProcessing = true;
      this.chatInitialize();
      let says = {};
      try {
        const res = await axios.post("/api/df_event_query", {
          event: eventName,
          userID: this.cookies.get("userID"),
        });
        let index = 0;
        for (let msg of res.data.fulfillmentMessages) {
          let time = 0;
          if (index >= 1) {
            time = index * 1000;
          }
          setTimeout(() => {
            says = {
              speaks: "bot",
              msg: msg,
            };
            this.messages = [...this.messages, says];
          }, time)
          index++;
        }
        this.chatIsProcessing = false;
      } catch (error) {
        says = {
          speaks: "bot",
          msg: {
            text: {
              text:
                "I'm having troubles. I need to terminate. Will be back later",
            },
          },
        };
        this.messages = [...this.messages, says];
        this.chatIsProcessing = false;
      }

      this.removeNavigationContainer()
    },
    chatInitialize() {
      if (!this.chatInit) {
        this.chatInit = true;
      }

      this.removeNavigationContainer();
    },
    chatInitialize() {
      if (!this.chatInit) {
        this.chatInit = true;
      }
      this.showBanner = false;
      this.showMainNavigation = false;
    },
  },
};
</script>

<style scoped>
.chat-right-content {
  cursor: pointer;
}

::-webkit-input-placeholder {
  font-style: italic;
}

:-moz-placeholder {
  font-style: italic;
}

::-moz-placeholder {
  font-style: italic;
}

:-ms-input-placeholder {
  font-style: italic;
}

.cx-chatbot-wrap {
  box-shadow: 0px 5px 35px 9px #fff !important;
}
</style>
