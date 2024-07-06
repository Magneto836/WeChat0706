
const app = getApp()

const utils = require("../../utils/util")

Page({

    data: {
        buttonClicked:{}
    },
    onShow() {
    this.refreshdata();
  

    },
    refreshdata(){
      console.log("开始执行OnShow!!!!!!!!!!!!!!!!!!!!!!!")
      this.getNewFriends()
      this.getMyfriend()
      this.getAllUser()
      var that = this;
  var userInfo = app.globalData.userInfo;
   if (that.data.user_list && that.data.user_list.length > 0 ) var buttonClicked = new Array(that.data.user_list.length).fill(0);
  if (userInfo.NewFriend2) {
    console.log("确实有NewF")
    if(that.data &&Array.isArray(that.data.user_list)){
      userInfo.NewFriend2.forEach(account_id => {
        var index = that.data.user_list.findIndex(user => user.account_id === account_id);
        if (index !== -1) {
      var buttonClicked = that.data.buttonClicked;
            buttonClicked[index] = 1;
            console.log("index值为",index)
            that.setData({
                buttonClicked: buttonClicked
            });
        }
        
    });
    }
    
    
}

if (userInfo.friends) {
  console.log("确实有Friends")
  if(that.data &&Array.isArray(that.data.user_list)){
    userInfo.friends.forEach(_id => {
      var index = that.data.user_list.findIndex(user => user._id === _id);
      if (index !== -1) {
    var buttonClicked = that.data.buttonClicked;
          buttonClicked[index] = 2;
          console.log("index值为",index)
          that.setData({
              buttonClicked: buttonClicked
          });
      }
      
  });
  }
  
  
}









    },

    onLoad() {
        this.setData({
            userInfo : app.globalData.userInfo
        })
    },

    // 获取所有用户信息
    getAllUser() {
      var that = this;

      const _ = wx.cloud.database().command;
      
      wx.cloud.database().collection('chat_user').where({   //Node
          _id: (_.neq(that.data.userInfo._id))
      }).get({
          success(res) {
              console.log("user_list")
              console.log(res.data)
              that.setData({
                  user_list : res.data
              })
          }
      })
  },
    addFriend(e) {
        var index = e.currentTarget.dataset.index;
        var that = this;
        if (this.data.buttonClicked[index]==1) {
          return; // 已经点击过，直接返回
      }
      var buttonClicked = this.data.buttonClicked;
      /** 
      buttonClicked[index] = true;
      this.setData({
          buttonClicked: buttonClicked
      });
      */
    console.log("要添加的人为",that.data.user_list[index].account_id)
    var newFArray = that.data.userInfo.NewFriend2 || [];
    newFArray.push(that.data.user_list[index].account_id);
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

                userB_id : that.data.user_list[index]._id,
                userB_account_id : that.data.user_list[index].account_id,
                userB_avatarUrl : that.data.user_list[index].avatarUrl,

                record : [],
                friend_status : false,
                time: utils.formatTime(new Date())
            },
            success(res) {
                console.log(res)
                wx.showToast({
                  title: '已发送好友申请',
                })
            }
        })

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
    acceptNewFriend(e) {
        var index = e.currentTarget.dataset.index;
        var that =  this;

       
  
      // 更新按钮状态为已点击
    



        wx.cloud.database().collection('chat_record').doc(that.data.new_friends[index]._id).update({
            data:{
                friend_status: true
            },
            success(res) {
                //console.log(res)
                wx.showToast({
                  title: '已通过好友',
                })

                that.setData({
                    new_accepted_friend_id : that.data.new_friends[index].userA_id
                })
            }
        })

        // AB成为朋友
        wx.cloud.database().collection('chat_user').where({
            _id : that.data.userInfo._id
        }).get({
            success(res) {
                console.log(res.data)
                var my_friends = res.data[0].friends;
                my_friends.push(that.data.new_friends[index].userA_id)
                app.globalData.userInfo.friends = my_friends                
                wx.cloud.database().collection('chat_user').where({
                    _id : that.data.userInfo._id
                }).update({
                    data : {
                        friends : my_friends
                    }
                })
            }
        })

    

        wx.cloud.database().collection('chat_user').where({
            _id : that.data.new_friends[index].userA_id
        }).get({
            success(res) {
                //console.log(res)
                var A_friends = res.data[0].friends;
                A_friends.push(that.data.userInfo._id)
                wx.cloud.database().collection('chat_user').where({
                    _id : that.data.new_friends[index].userA_id
                }).update({
                    data : {
                        friends : A_friends
                    }
                })
                that.onShow()
            }
        })
    },

    // 对话信息
    getMyfriend() {
        var that = this;
        const DB = wx.cloud.database().command;
        wx.cloud.database().collection('chat_record').where(
            DB.or([
                {
                    userA_id:that.data.userInfo._id,
                    friend_status: true
                },
                {
                    userB_id:that.data.userInfo._id,
                    friend_status: true
                }
            ])
        ).get({
            success(res){
                //console.log(res)
                that.setData({
                    my_friends : res.data
                })
            }
        })

        
    },


    startChat(e) {
        var index = e.currentTarget.dataset.index;

        wx.navigateTo({
          url: '/pages/chat/chat?id=' + this.data.my_friends[index]._id
        })
    }
})