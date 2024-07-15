// pages/friendDetail/friendDetail.js
const app = getApp();
const utils = require("../../utils/util")
const order = wx.cloud.database().collection('order_record')

Page({
  data: {
    friend: {
      avatarUrl: '',
      nickname: '',
      account_id: '', 
      _id: '',
    },
    userid: '',
    order_list: [],
    buttonClicked: 0,
    pendingRequests: []
  },
  onShow() {
    this.refreshdata();
    this.startInterval();
  },
  startInterval: function () {
    const that = this;
    // 保存定时器引用
    this.refreshInterval = setInterval(function () {
      that.refreshdata();
    }, 3000);
    // 启动缓存清理定时器
    this.cacheClearInterval = setInterval(function () {
      wx.clearStorage({
        success() {
          console.log('缓存已清理');
        },
        fail(err) {
          console.error('清理缓存失败', err);
        }
      });
    }, 8000); 
  },
  onLoad(options) {
    const friendId = options.friendId;
    const userid = options.userid; 
    console.log('传参：', userid)
    this.setData({
      userid: userid,
      order_list: []     
    });
    this.getUserOrder();
    this.getFriendDetail(friendId);
  },
  onHide() {
    // 清除定时器
    clearInterval(this.refreshInterval);
    clearInterval(this.cacheClearInterval);
    // 取消所有未完成的请求
    this.abortPendingRequests();
  },
  onUnload() {
    // 清除定时器
    clearInterval(this.refreshInterval);
    clearInterval(this.cacheClearInterval);
    // 取消所有未完成的请求
    this.abortPendingRequests();
  },
  abortPendingRequests() {
    this.data.pendingRequests.forEach(request => {
      if (request && typeof request.abort === 'function') {
        request.abort();
      }
    });
    this.setData({
      pendingRequests: []
    });
  },
  getNewFriends() {
    this.setData({
        userInfo : app.globalData.userInfo
    })
    var that = this;
    wx.cloud.database().collection('chat_record').where({
        userB_id: that.data.userInfo._id,
        friend_status : false
    }).get({
        success(res) {
            //console.log(res);
            that.setData({
                new_friends : res.data
            })
        }
    })
   
},
getAllUser() {
  var that = this;

  const _ = wx.cloud.database().command;
  
  wx.cloud.database().collection('chat_user').where({   //Node
      _id: (_.neq(that.data.userInfo._id))
  }).get({
      success(res) {
          
        
          that.setData({
              user_list : res.data
          })
      }
  })
},
getMyfriend() {
  var that = this;
  const DB = wx.cloud.database().command;
  wx.cloud.database().collection('chat_record').where(
      DB.or([
          {
              userA_id:that.data.userInfo._id,
              userB_id:that.data.friendId,
              friend_status: true
          },
          {
              userA_id:that.data.friendId,
              userB_id:that.data.userInfo._id,
              friend_status: true
          }
      ])
  ).watch({
    onChange: (snapshot) => {
      // console.log("message L:    snapshot", snapshot)
      that.setData({
          my_friends: snapshot.docs
      })
      console.log("my_friends L:    ", that.data.my_friends)
    },
    onError: function(err) {
      //console.log(err)
    }
  })
  
},
refreshdata(){
  const app = getApp()
  var friend = this.data.friend 
  //console.log("开始执行OnShow!!!!!!!!!!!!!!!!!!!!!!!")
  this.getNewFriends()
  this.getMyfriend()
  this.getAllUser()
  var that = this;
  
  wx.cloud.database().collection('chat_user').doc(app.globalData.userInfo._id).get({
      success: function(res) {
          //console.log("成功获取到最新的userInfo")
          app.globalData.userInfo = res.data;
          that.setData({
              userInfo: res.data
          });
          //console.log("UserInfo为", res.data)
          //console.log("friends值为", res.data.friends)
          
          if (res.data.NewFriend2) {
              if (res.data.NewFriend2.includes(that.data.friend.account_id)) {
                  var buttonClicked = 1;
                  //console.log("NewFriend2有值，NewFriend2值为", res.data.NewFriend2)
                  that.setData({
                      buttonClicked: buttonClicked
                  });
              }
          } else {
              //console.log("NewFriend2怎么没了")
              //console.log("NewFriend2值为", res.data.NewFriend2)
          }

          if (res.data.friends) {
              //console.log("确实有Friends")
              //console.log("friends值为", res.data.friends)
              //console.log("friend的data值为", that.data.friend._id)
              if (res.data.friends.includes(that.data.friend._id)) {
                  //console.log("包含，准备改值")
                  var buttonClicked = 2;
                  that.setData({
                      buttonClicked: buttonClicked
                  });
              }
          }
      },
      fail: function(err) {
          //console.error('获取最新的userInfo失败', err);
      }
  });
},

 
  RefreshStatus(){
    this.refreshdata()
  },

  getFriendDetail(friendId) {
    const db = wx.cloud.database();
    db.collection('chat_user').doc(friendId).get({
        success: res => {
            this.setData({
                friend: res.data,
                isFriend: app.globalData.userInfo.friends.includes(friendId)
            });
            //console.log("friend如下")
            //console.log(res.data)
            this.refreshdata();
        },
        fail: err => {
            //console.error('获取好友信息失败', err);
            wx.showToast({
                icon: 'none',
                title: '获取好友信息失败'
            });
        }
    });
},
addFriend(e) {
  var friend = this.data.friend;
  var that = this;
  if (this.data.buttonClicked == 1) {
      return; // 已经点击过，直接返回
  }
  if(this.data.userid == that.data.userInfo.account_id){
    wx.showToast({
      icon: 'error',
      title: '禁止自娱自乐',
    })
    return;//自己的账号
  }
  var buttonClicked = this.data.buttonClicked;
  if (buttonClicked == 0) {
      //console.log("准备添加好友，ButtonClicked值为", buttonClicked)
      buttonClicked = 1;
      //console.log("添加完好友，ButtonClicked值为", buttonClicked)
      var newFArray = that.data.userInfo.NewFriend2 || [];
      newFArray.push(friend.account_id);
      wx.cloud.database().collection('chat_user').doc(that.data.userInfo._id).update({
          data: {
              NewFriend2: newFArray
          },
          success: res => {
              that.refreshdata();
              wx.cloud.database().collection('chat_record').add({
                  data: {
                      userA_id: that.data.userInfo._id,
                      userA_account_id: that.data.userInfo.account_id,
                      userA_avatarUrl: that.data.userInfo.avatarUrl,
                      userB_id: friend._id,
                      userB_account_id: friend.account_id,
                      userB_avatarUrl: friend.avatarUrl,
                      record: [],
                      friend_status: false,
                      time: utils.formatTime(new Date())
                  },
                  success(res) {
                      //console.log(res)
                      that.refreshdata();
                  }
              })
          }
      });
  } else if (buttonClicked == 2) {
      //console.log("ButtonClicked2  Friend如下：")
      this.getMyfriend();
      const arr = this.data.my_friends
      var to_id =''
      for(let i=0;i<arr.length;i++){
        if(arr[i].userA_account_id==this.data.userid && arr[i].userB_account_id==that.data.userInfo.account_id){
          to_id = arr[i]._id
        }
        if(arr[i].userA_account_id==that.data.userInfo.account_id && arr[i].userB_account_id==this.data.userid){
          to_id = arr[i]._id
        }
      }
      setTimeout(() => {
          wx.navigateTo({
              url: '/pages/chat/chat?id=' + to_id
          });
      }, 1000); // 延迟 1 秒后访问 my_friends 数据
  }
},

getUserOrder(){
  const that =this;
  console.log('用户名：',that.data.userid)
  order.orderBy('order_time', 'desc').where({
    account_id : that.data.userid
  }).get({
    success(res) {  
      that.setData({
        order_list : res.data        
      })     
      console.log('order',that.data.order_list)  
    },
    fail(err){
      console.log('error')
    }
  })
},
toOrderinfor(e){
  const order_id = e.currentTarget.dataset.order_id
  console.log('这是什么',order_id)
  wx.navigateTo({
    url: '/pages/order_infor/order_infor?order_id='+order_id,
  })
},

});
