// pages/friendDetail/friendDetail.js
const app = getApp();

Page({
  data: {
    friend: {
      avatarUrl: '',
      nickname: '',
      account_id: '',
      _id: ''
    },
    isFriend: false
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
  addFriend() {
    const db = wx.cloud.database();
    const _ = db.command;
    const userId = app.globalData.userInfo._id;
    const friendId = this.data.friend._id;

    if (this.data.isFriend) {
      wx.showToast({
        title: '你们已经是好友了',
        icon: 'none'
      });
      return;
    }

    db.collection('chat_user').doc(userId).update({
      data: {
        friends: _.push(friendId)
      },
      success: res => {
        wx.showToast({
          title: '添加好友成功',
        });
        this.setData({
          isFriend: true
        });
        // 更新全局用户信息
        app.globalData.userInfo.friends.push(friendId);
        wx.setStorageSync('userInfo', app.globalData.userInfo);
      },
      fail: err => {
        console.error('添加好友失败', err);
        wx.showToast({
          icon: 'none',
          title: '添加好友失败'
        });
      }
    });
  }
});
