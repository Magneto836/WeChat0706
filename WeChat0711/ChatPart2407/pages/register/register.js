
const app = getApp()

// var sameAccountId = false;

Page({
  data: {
    passwordFieldType1 :'password',
    passwordFieldType2 :'password'
},
  onshow() {
  },
  getUserProfile(e) {
       
    var that = this;
    wx.getUserProfile({
      desc: '展示信息',
      success: (res) => {
        console.log(res)
        that.setData({
          userInfo: res.userInfo
        })
        wx.showToast({
          title: '已授权',
          duration: 500
        })
        // 加入全局变量
        app.globalData.userInfo = res.userInfo
        console.log(app.globalData.userInfo)
      }
    })
  },

  onLoad: function(options){
    console.log(app.globalData.userInfo);
    this.setData({
        userInfo: app.globalData.userInfo
    })
  },
  getUserAccountId(e) {
    this.setData({
      account_id : e.detail.value
    })
  },
  ValidUserName(input) {
    const regex = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
    return regex.test(input);
  },
  ValidPassword(input) {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(input);
  },
  getUserPassword(e) {
    this.setData({
      ps1 : e.detail.value
    })
  },
  confirmUserPassword(e) {
    this.setData({
      ps2 : e.detail.value
    })
  },

  register() {
    var that = this;
    if (!this.registerCheck())return;
    const username = that.data.account_id 
    const PassWord = that.data.ps1
    console.log("密码为",PassWord)
    const isValidUserName = this.ValidUserName(username);
    const isValidPassword = this.ValidPassword(PassWord);
    if (!isValidUserName) {
      wx.showToast({
        icon: 'error',
        title: '输入用户名无效',
      });
    }
    else if(!isValidPassword){
      wx.showToast({
        icon: 'error',
        title: '密码含无效字符',
      });
    }
    else {
    
    wx.cloud.database().collection('chat_user').where({
      account_id: that.data.account_id
    }).get({
      success(res) {
        console.log(res)
        // 去除重复用户名
        if (res.data.length>0){
          wx.showToast({
            icon : 'error',
            title: '昵称重复',
          })
          return;
        }
        else {
          wx.cloud.database().collection('chat_user').add({
            data:{
              avatarUrl: that.data.userInfo.avatarUrl,
              nickName : that.data.userInfo.nickName,
              account_id: that.data.account_id,
              password: that.data.ps2,
              friends: [],
              new_friends: []
            },
            success(res){
              console.log(res)
              // 将用户名和密码保存到全局变量 app.globalData中
              app.globalData.userInfo.account_id = that.data.account_id;
              app.globalData.userInfo.password = that.data.password;
              wx.switchTab({
                url: '/pages/message/message',
              })
            }
          })
        }
      }
    })
  }

  },

  registerCheck() {

    if (this.data.ps1 != this.data.ps2) {
      wx.showToast({
        icon :'error',
        title: '密码不相同',
      })
      return false
    }  else if (this.data.ps1.length < 3) {
      console.log("密码为",this.data.ps1)
      wx.showToast({
        icon : 'error',
        title: '密码过短',
      })
      return false
    }else if (this.data.ps1.length > 15) {
      wx.showToast({
        icon : 'error',
        title: '密码过长',
      })
      return false
    } else if (this.data.account_id.length > 10) {
      wx.showToast({
        icon : 'error',
        title: '昵称过长',
      })
      return false
    }
    return true
  },
  ShowPassword1(){
    if(this.data.passwordFieldType1 == 'text'){
      this.setData({
        passwordFieldType1 : "password"
      })
    }
    else{
      this.setData({
        passwordFieldType1 : "text"
      })
    }
    
    },
    ShowPassword2(){
      if(this.data.passwordFieldType2 == 'text'){
        this.setData({
          passwordFieldType2 : "password"
        })
      }
      else{
        this.setData({
          passwordFieldType2 : "text"
        })
      }
      
      },






})
