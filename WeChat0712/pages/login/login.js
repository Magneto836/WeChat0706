
const app = getApp()

Page({
  data: {
      passwordFieldType :'password',
      condition:true
  },
  onLoad() {
    console.log(app.globalData.userInfo)
    wx.hideHomeButton(); 
    if (app.globalData.userInfo!=null){
      wx.switchTab({
        url: '/pages/message/message',
      })
    }
  },
  
  getUserAccount(e) {
   
      this.setData({
        account_id: e.detail.value
      });
    
   
  },
  
  getUserPassword(e) {
    this.setData({
      password : e.detail.value
    })
  },
  ShowPassword(){
  if(this.data.passwordFieldType == 'text'){
    this.setData({
      passwordFieldType : "password"
    })
  }
  else{
    this.setData({
      passwordFieldType : "text"
    })
  }
  var currentShowText = this.data.condition;
    this.setData({
      condition: !currentShowText
    });
  },

  togglePasswordVisibility(e) {
    this.setData({
      passwordFieldType: e.detail.value.length > 0 ? 'text' : 'password'
    });
    console.log("passwordFieldType值为", this.data.passwordFieldType);
  },
  login() {
      var that = this;
      if(that.data.account_id==undefined){
        wx.showToast({
          icon :'error',
          title: '请输入账号 ',
        })
      }
      else if(that.data.password==undefined){
        wx.showToast({
          icon :'error',
          title: '请输入密码 ',
        })
      }
      else {
        wx.cloud.database().collection('chat_user').where({
          account_id: that.data.account_id,
          password: that.data.password
        }).get({
            success(res) {
                console.log(res)
                if(res.data.length>0){
                    // 拿到 _id
                    app.globalData.userInfo = res.data[0]
                    wx.setStorageSync('userInfo', res.data[0])
                    wx.switchTab({
                      url: '/pages/index/index',
                      success(res){
                          wx.showToast({
                            icon:'success',
                            title: '登陆成功',
                          })
                      }
                    })
                } else {
                    wx.showToast({
                      icon: 'error',
                      title: '账号密码错误',
                    })
                }
            }
            
        })
      }

  },


  toRegister() {
      wx.navigateTo({
        url: '/pages/register/register',
      })
  },

  
})
