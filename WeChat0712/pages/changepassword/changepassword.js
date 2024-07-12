// pages/changepassword/changepassword.js

const app = getApp();
Page({
  data: {
    passwordFieldType1 :'password',
    passwordFieldType2 :'password'
},
  onLoad() {
    this.setData({
        userInfo: app.globalData.userInfo
    });
    console.log("UserInfo为", app.globalData.userInfo)
},

  GetOriginPassword(e) {
    this.setData({
      OriPs : e.detail.value
    })

  },
  GetChangePassword(e) {
    this.setData({
      ChPs : e.detail.value
    })
  },
  ConfirmChangePassword(e) {
    this.setData({
      ConPs : e.detail.value
    })
  },
  ConfirmChange(){
    var that = this 
    console.log("原始密码为",that.data.OriPs)
    console.log("账号为",that.data.userInfo.account_id)
    if(that.data.OriPs !=that.data.userInfo.password){
      wx.showToast({
        icon : 'none',
        title: '原始密码输入错误，请重新输入',
      })
    }
    else {
      if(!this.registerCheck()) return ;
      else {
        wx.cloud.database().collection('chat_user').where({
          account_id : that.data.userInfo.account_id
          
        }).update({
          data : {
          password : that.data.ChPs
          }
        })

        wx.showToast({
          icon :'success',
          title: '密码修改成功 ',
        })
        app.globalData.userInfo = null;
        wx.reLaunch  ({
          url: '/pages/login/login',
        }); 
        
      }

    }



  },


  registerCheck() {
    if(this.data.ChPs == undefined){
      wx.showToast({
        icon :'none',
        title: '请输入修改后密码 ',
      })
    }
    else{

    
   
    if (this.data.ChPs != this.data.ConPs) {
      wx.showToast({
        icon :'error',
        title: '密码不相同',
      })
      return false
    } else if (this.data.ChPs.length > 15) {
      wx.showToast({
        icon : 'error',
        title: '密码过长',
      })
      return false
    } 
    return true
  }
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