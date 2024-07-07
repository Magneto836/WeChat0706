// pages/friendDetail/friendDetail.js
const app = getApp();
const utils = require("../../utils/util")
Page({
  data: {
    friend: {
      avatarUrl: '',
      nickname: '',
      account_id: '',
      _id: ''
    },
    buttonClicked : 0
  },
  onShow(){
    this.refreshdata();
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
            console.log(res);
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
      console.log("message L:    snapshot", snapshot)
      this.setData({
          my_friends: snapshot.docs
      })
      console.log("my_friends L:    ", this.data.my_friends)
    },
    onError: function(err) {
      console.log(err)
    }
  })
  
},
  refreshdata(){
    var friend = this.data.friend 
    console.log("开始执行OnShow!!!!!!!!!!!!!!!!!!!!!!!")
    this.getNewFriends()
    this.getMyfriend()
    this.getAllUser()
    var that = this;
var userInfo = app.globalData.userInfo;

if (userInfo.NewFriend2) {

  
  console.log("friend的data值为",friend)
 
  if (userInfo.NewFriend2.includes(this.data.friend.account_id)) {
    var buttonClicked = 1;
    this.setData({
      buttonClicked: buttonClicked
    });
  }
 
}
  else {console.log("NewFriend2怎么没了")
  console.log("NewFriend2值为",userInfo.NewFriend2)}


if (userInfo.friends) {
console.log("确实有Friends")
console.log("friends值为",userInfo.friends)
  console.log("friend的data值为",friend)
if (userInfo.friends.includes(this.data.friend._id)) {
  var buttonClicked = 2;
  this.setData({
    buttonClicked: buttonClicked
  });
}




}


  },
  onLoad(options) {
    const friendId = options.friendId;
    this.getFriendDetail(friendId);
  },
  getFriendDetail(friendId) {
    const db = wx.cloud.database();
    db.collection('chat_user').doc(friendId).get({
      success: res => {
        this.setData({
          friend: res.data,
          isFriend: app.globalData.userInfo.friends.includes(friendId)
        });
        console.log("friend如下")
        console.log(res.data)
        this.refreshdata();
      },
      fail: err => {
        console.error('获取好友信息失败', err);
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
    if (this.data.buttonClicked==1) {
      return; // 已经点击过，直接返回
  }
  var buttonClicked = this.data.buttonClicked;
 if(buttonClicked ==0 ){
  console.log("要添加的人为",friend.account_id)
  var newFArray = that.data.userInfo.NewFriend2 || [];
  newFArray.push(friend.account_id);
  console.log("输出NewFArray",newFArray)
  wx.cloud.database().collection('chat_user').doc(that.data.userInfo._id).update({
    data: {
        NewFriend2: newFArray
    },
  
  });
  this.refreshdata();
  wx.cloud.database().collection('chat_record').add({
      data:{
          userA_id : that.data.userInfo._id,
          userA_account_id : that.data.userInfo.account_id,
          userA_avatarUrl : that.data.userInfo.avatarUrl,

          userB_id : friend._id,
          userB_account_id : friend.account_id,
          userB_avatarUrl : friend.avatarUrl,

          record : [],
          friend_status : false,
          time: utils.formatTime(new Date())
      },
      success(res) {
          console.log(res)
         
      }
  })
 }
else if (buttonClicked == 2) {
  console.log("ButtonClicked2  Friend如下：")
  this.getMyfriend();
  setTimeout(() => {
    console.log(that.data.my_friends)
    wx.navigateTo({
      url: '/pages/chat/chat?id=' + that.data.my_friends[0]._id
    });
  }, 1000); // 延迟 1 秒后访问 my_friends 数据
}

  /** 
  wx.switchTab({
    url: '/pages/chat/chat',
    success: function(res) {
      console.log("跳转到消息页面成功");
    },
    fail: function(err) {
      console.error("跳转到消息页面失败", err);
    }
  });
}
*/
this.refreshdata()
},
});
