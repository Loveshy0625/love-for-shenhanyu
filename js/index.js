'use strict';

(function () {

    var AUTHOR = {
        AUTHOR: 'author',
        ME: 'me'
    };

    var TYPING_MSG_CONTENT = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

    // 将 Vue 实例暴露到全局
    window.vm = new Vue({
        el: '#mobile',

        data: {
            messages: [],
            dialogs: null,
            lastDialog: null,
            msgChain: Promise.resolve(),
            isTyping: false,
            hasPrompt: false,
            latestMsgContent: null,
            isFinished: false,
            isInitialized: false
        },
        
        computed: {
            hasOptions: function() {
                if (this.isFinished) return true;
                if (this.isTyping) return false;
                if (this.lastDialog && this.lastDialog.responses && this.lastDialog.responses.length > 0) {
                    return true;
                }
                return false;
            }
        },

        mounted: function () {
            var _this = this;
            console.log('Vue mounted, loading dialog.json...');
            
            // 使用 fetch API 加载 JSON
            fetch('./assets/dialog.json')
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(function(data) {
                    console.log('Dialog data loaded:', data);
                    _this.dialogs = data;
                    _this.isInitialized = true;
                    console.log('Dialog loaded successfully, ready to start');
                })
                .catch(function(error) {
                    console.error('Failed to load dialog.json:', error);
                    alert('加载对话失败，请刷新页面重试');
                });
        },

        methods: {
            appendDialog: function (id) {
                var _this2 = this;

                console.log('appendDialog called with id:', id);

                if (!this.dialogs) {
                    console.error('Dialogs not loaded yet!');
                    return;
                }

                // 如果 id 是数组，遍历处理
                if (Array.isArray(id)) {
                    id.forEach(function(singleId) {
                        _this2.appendDialog(singleId);
                    });
                    return;
                }

                if (!id) {
                    if (this.lastDialog) {
                        this.lastDialog.responses = null;
                    }
                    return;
                }

                this.isTyping = true;

                var dialog = this.getDialog(id);
                
                if (!dialog) {
                    console.error('Dialog not found:', id);
                    this.isTyping = false;
                    return;
                }

                console.log('Found dialog:', dialog);

                // dialog.details 是数组的数组，取第一个数组
                // 特殊处理：如果是倒数日对话（ID: 0004），使用动态内容
                var messageArray;
                if (id === '0004' && typeof getDynamicCountdownContent === 'function') {
                    messageArray = [getDynamicCountdownContent()];
                    console.log('Using dynamic countdown content');
                } else {
                    messageArray = dialog.details && dialog.details.length > 0 ? dialog.details[0] : [];
                }
                console.log('Message array length:', messageArray.length);

                if (!messageArray || messageArray.length === 0) {
                    console.error('No messages in dialog');
                    this.isTyping = false;
                    return;
                }

                // 逐条发送消息
                var sendNextMessage = function(index) {
                    if (index >= messageArray.length) {
                        // 所有消息发送完毕
                        _this2.lastDialog = dialog;
                        _this2.isTyping = false;
                        // 检查是否是对话结束（没有 responses）
                        if (!dialog.responses || dialog.responses.length === 0) {
                            _this2.isFinished = true;
                        }
                        console.log('Dialog finished, isFinished:', _this2.isFinished);
                        
                        // 如果有下一个对话，继续
                        if (dialog.nextAuthor) {
                            _this2.appendDialog(dialog.nextAuthor);
                        }
                        return;
                    }

                    var content = messageArray[index];
                    console.log('Sending message', index, ':', content.substring(0, 30) + '...');

                    _this2.delay(700).then(function () {
                        return _this2.sendMsg(content, AUTHOR.AUTHOR);
                    }).then(function () {
                        sendNextMessage(index + 1);
                    });
                };

                // 开始发送第一条消息
                sendNextMessage(0);
            },
            
            sendMsg: function (message, author) {
                console.log('sendMsg:', author, message.substring(0, 50) + '...');
                if (author === 'me') {
                    return this.sendUserMsg(message);
                } else {
                    return this.sendFriendMsg(message, author);
                }
            },
            
            sendFriendMsg: function (message, author) {
                var _this3 = this;
                var content = message;
                var length = content.replace(/<[^>]+>/g, "").length;
                var isImg = /<img[^>]+>/.test(content);
                var isTyping = length > 2 || isImg;

                var msg = {
                    author: author,
                    content: isTyping ? TYPING_MSG_CONTENT : content,
                    isImg: isImg
                };
                
                console.log('Pushing message:', msg.content.substring(0, 30) + '...');
                this.messages.push(msg);
                console.log('Current messages count:', this.messages.length);

                // 强制 Vue 更新视图
                this.$forceUpdate();

                if (isTyping) {
                    this.markMsgSize(msg);
                    setTimeout(this.updateScroll, 100);

                    return this.delay(Math.min(100 * length, 2000)).then(function () {
                        return _this3.markMsgSize(msg, content);
                    }).then(function () {
                        return _this3.delay(150);
                    }).then(function () {
                        msg.content = content;
                        _this3.onMessageSending();
                    });
                }

                this.onMessageSending();
                return Promise.resolve();
            },
            
            sendUserMsg: function (message) {
                this.messages.push({
                    author: AUTHOR.ME,
                    content: message
                });
                this.onMessageSending();
                return Promise.resolve();
            },
            
            markMsgSize: function (msg, content) {
                var _this4 = this;
                this.latestMsgContent = content || msg.content;

                return this.delay(0).then(function () {
                    if (msg.isImg) {
                        return _this4.onImageLoad($('#mock-msg img'));
                    }
                }).then(function () {
                    var $mockMsg = $('#mock-msg');
                    msg.width = $mockMsg.width();
                    msg.height = $mockMsg.height();
                    _this4.messages = [].concat(_this4.messages);
                });
            },
            
            getDialog: function (id) {
                if (!this.dialogs || !this.dialogs.fromMe) {
                    console.error('Dialogs not loaded');
                    return null;
                }
                var dialogs = this.dialogs.fromMe.filter(function (dialog) {
                    return dialog.id === id;
                });
                return dialogs && dialogs.length > 0 ? dialogs[0] : null;
            },
            
            togglePrompt: function (toShow) {
                if (this.isTyping && toShow) {
                    return;
                }
                this.hasPrompt = toShow;
            },
            
            respond: function (response) {
                return this.say(response.content, response.nextAuthor);
            },
            
            say: function (content, dialogId) {
                var _this5 = this;
                this.hasPrompt = false;

                return this.delay(200)
                .then(function () {
                    return _this5.sendMsg(content, AUTHOR.ME);
                }).then(function () {
                    return _this5.delay(300);
                }).then(function () {
                    return _this5.appendDialog(dialogId);
                });
            },
            
            restartDialog: function () {
                this.isFinished = false;
                this.messages = [];
                this.lastDialog = null;
                this.appendDialog('0000');
            },
            
            delay: function (amount) {
                if (amount === undefined) amount = 0;
                return new Promise(function (resolve) {
                    setTimeout(resolve, amount);
                });
            },
            
            updateScroll: function () {
                var $chatbox = $('#mobile-body-content');
                var distance = $chatbox[0].scrollHeight - $chatbox.height() - $chatbox.scrollTop();
                var duration = 250;
                var startTime = Date.now();

                function step() {
                    var p = Math.min(1, (Date.now() - startTime) / duration);
                    $chatbox.scrollTop($chatbox.scrollTop() + distance * p);
                    if (p < 1) requestAnimationFrame(step);
                }
                step();
            },
            
            onMessageSending: function () {
                var _this = this;
                setTimeout(function () {
                    _this.updateScroll();
                    var $latestMsg = $('#mobile-body-content .msg-row:last-child .msg');
                    $latestMsg.find('a').attr('target', '_blank');
                });
            },
            
            onImageLoad: function ($img) {
                return new Promise(function (resolve) {
                    $img.one('load', resolve).each(function (index, target) {
                        target.complete && $(target).trigger('load');
                    });
                });
            }
        }
    });

    console.log('Vue instance created');
})();
