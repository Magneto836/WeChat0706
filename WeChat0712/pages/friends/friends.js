// pages/friends/friends.js
const app = getApp();
const utils = require("../../utils/util");

function startWatch() {
  const db = wx.cloud.database();
  const watcher = db.collection('chat_user').where({
    account_id: app.globalData.userInfo.account_id
  }).watch({
    onChange: function(snapshot) {
      //console.log('snapshot', snapshot);
    },
    onError: function(err) {
      //console.error('the watch closed because of error', err);
      // 监听失败，重新启动监听
      setTimeout(startWatch, 3000); // 延迟3秒重新启动
    }
  });
}
Page({
    data: {
        userid:'',
        userInfo: null,
        user_list: [],
        new_friends: [],
        my_friends: []
    },
    onShow() {
      this.refreshData();
     
        
        //console.log("我的好友目前有",this.data.my_friends)
    },
    bbb(){
      this.refreshData()
    },
    refreshData() {
      console.log("现在开始刷新")
      this.getNewFriends();
      this.getMyfriend();
      this.getAllUser();
    },
    onLoad() {
      startWatch();
      this.setData({
        userInfo: app.globalData.userInfo,
        userid:'',
      });
    },

    // 获取所有用户信息
    getAllUser() {
        const that = this;
        const _ = wx.cloud.database().command;
        wx.cloud.database().collection('chat_user').where({
            _id: _.nin(that.data.userInfo.friends).and(_.neq(that.data.userInfo._id))
        }).get({
            success(res) {
                //console.log("user_list");
                //console.log(res.data);
                that.setData({
                    user_list: res.data
                });
            }
        });
    },
    abortPendingRequests() {
      this.data.pendingRequests.forEach(request => {
        if (request && typeof request.abort === 'function') {
          request.abort();
        }
      });
      this.data.pendingRequests = [];
    },
    addFriend(e) {
        const index = e.currentTarget.dataset.index;
        const that = this;
        wx.cloud.database().collection('chat_record').add({
            data: {
                userA_id: that.data.userInfo._id,
                userA_account_id: that.data.userInfo.account_id,
                userA_avatarUrl: that.data.userInfo.avatarUrl,
                userB_id: that.data.user_list[index]._id,
                userB_account_id: that.data.user_list[index.account_id],
                userB_avatarUrl: that.data.user_list[index].avatarUrl,
                record: [],
                friend_status: false,
                time: utils.formatTime(new Date())
            },
            success(res) {
                //console.log(res);
                wx.showToast({
                    title: '已发送好友申请',
                });
            }
        });
    },
    getNewFriends() {
        this.setData({
            userInfo: app.globalData.userInfo
        });
        const that = this;
        wx.cloud.database().collection('chat_record').where({
            userB_id: that.data.userInfo._id,
            friend_status: false
        }).get({
            success(res) {
                //console.log(res);
                that.setData({
                    new_friends: res.data
                });
            }
        });
    },
    acceptNewFriend(e) {
        const index = e.currentTarget.dataset.index;
        const that = this;
        wx.cloud.database().collection('chat_record').doc(that.data.new_friends[index]._id).update({
            data: {
                friend_status: true
            },
            success(res) {
                wx.showToast({
                    title: '已通过好友',
                });
                that.setData({
                    new_accepted_friend_id: that.data.new_friends[index].userA_id
                });
            }
        });

        wx.cloud.database().collection('chat_user').doc(that.data.userInfo._id).get({
            success(res) {
                const my_friends = res.data.friends;
                my_friends.push(that.data.new_friends[index].userA_id);
                app.globalData.userInfo.friends = my_friends;
                wx.cloud.database().collection('chat_user').doc(that.data.userInfo._id).update({
                    data: {
                        friends: my_friends
                    }
                });
            }
        });

        wx.cloud.database().collection('chat_user').doc(that.data.new_friends[index].userA_id).get({
            success(res) {
                const A_friends = res.data.friends;
                A_friends.push(that.data.userInfo._id);
                wx.cloud.database().collection('chat_user').doc(that.data.new_friends[index].userA_id).update({
                    data: {
                        friends: A_friends
                    }
                });
                that.onShow();
            }
        });
    },
    getMyfriend() {
        const that = this;
        const DB = wx.cloud.database().command;
        wx.cloud.database().collection('chat_record').where(
            DB.or([
                {
                    userA_id: that.data.userInfo._id,
                    friend_status: true
                },
                {
                    userB_id: that.data.userInfo._id,
                    friend_status: true
                }
            ])
        ).get({
            success(res) {
                that.setData({
                    my_friends: res.data
                });
            }
        });
    },
    startChat(e) {
        const index = e.currentTarget.dataset.index;
        wx.navigateTo({
            url: '/pages/chat/chat?id=' + this.data.my_friends[index]._id
        });
    },
    viewFriendDetail(e) {
        const that = this;
        const friendId = e.currentTarget.dataset.friendId;
        wx.cloud.database().collection('chat_user').where({
          _id:friendId
        }).get({
          success(res){
            console.log('数据库打开')
            if (res.data && res.data.length > 0) {
              console.log('查到：',res.data[0].account_id)
              that.setData({
                userid: res.data[0].account_id, // 假设 res.data 是一个数组，取第一个元素的 _id
                // 在 setData 完成后，打印 friendId
              });
              console.log('传走：',that.data.userid)
              wx.navigateTo({
                url: '/pages/friendDetail/friendDetail?friendId=' + friendId+'&userid='+that.data.userid
              });
            } else {
              //console.error('没有找到匹配的用户');
            }
          }
        })   
    }
});
