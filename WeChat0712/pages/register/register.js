const app = getApp()

Page({
  data: {
    avatarUrl: '', // 默认头像 URL，可以设置为一个默认图片的路径
    nickName: '',
    passwordFieldType1: 'password',
    passwordFieldType2: 'password',
    account_id: '',
    ps1: '',
    ps2: '',
    userInfo: {},
    condition1:true,
    condition2:true
  },

  onLoad: function(options) {
    this.setData({
        userInfo: app.globalData.userInfo || {}
    })
  },

  getUserAccountId(e) {
    this.setData({
      account_id: e.detail.value
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
      ps1: e.detail.value
    })
  },

  ConfirmUserPassword(e) {
    this.setData({
      ps2: e.detail.value
    })
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    
    // 将选择的头像上传到云存储
    this.uploadAvatar(avatarUrl).then(cloudPath => {
      let userInfo = this.data.userInfo || {};
      userInfo.avatarUrl = cloudPath; // 将云存储路径赋给userInfo
      this.setData({
        avatarUrl: cloudPath, // 更新显示的头像路径
        userInfo
      });

      // 更新用户信息到云数据库
      wx.cloud.database().collection('chat_user').doc(userInfo._id).update({
        data: {
          avatarUrl: cloudPath
        },
        success: res => {
          console.log('头像更新成功');
        },
        fail: err => {
          console.error('头像更新失败', err);
        }
      });
    });
  },
  uploadAvatar(filePath) {
    return new Promise((resolve, reject) => {
      const cloudPath = `avatar/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.png`;
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => {
          console.log('头像上传成功', res);
          resolve(res.fileID); // 返回云存储文件ID
        },
        fail: err => {
          console.error('头像上传失败', err);
          reject(err);
        }
      });
    });
  },
  
  onNicknameInput(e) {
    let userInfo = this.data.userInfo || {};
    userInfo.nickName = e.detail.value;
    this.setData({
      nickName: e.detail.value,
      userInfo
    });
  },

  register() {
    var that = this;
    if (!this.registerCheck()) return;
    const username = that.data.account_id;
    const password = that.data.ps1;

    const isValidUserName = this.ValidUserName(username);
    const isValidPassword = this.ValidPassword(password);

    if (!isValidUserName) {
      wx.showToast({
        icon: 'error',
        title: '输入用户名无效',
      });
    } else if (!isValidPassword) {
      wx.showToast({
        icon: 'error',
        title: '密码含无效字符',
      });
    } else {
      wx.cloud.database().collection('chat_user').where({
        account_id: that.data.account_id
      }).get({
        success(res) {
          console.log(res)
          if (res.data.length > 0) {
            wx.showToast({
              icon: 'error',
              title: '昵称重复',
            })
            return;
          } else {
            wx.cloud.database().collection('chat_user').add({
              data: {
                avatarUrl: that.data.avatarUrl,
                nickName: that.data.nickName,
                account_id: that.data.account_id,
                password: that.data.ps2,
                friends: [],
                new_friends: []
              },
              success(res) {
                console.log(res)
                app.globalData.userInfo = {
                  avatarUrl: that.data.avatarUrl,
                  nickName: that.data.nickName,
                  account_id: that.data.account_id,
                  password: that.data.ps2
                };
                wx.switchTab({
                  url: '/pages/index/index',
                })
              }
            })

            wx.showToast({
              icon: 'success',
              title: '注册成功',
            })
          }
        }
      })
    }
  },

  registerCheck() {
    if (this.data.ps1 != this.data.ps2) {
      wx.showToast({
        icon: 'error',
        title: '密码不相同',
      })
      return false
    } else if (this.data.ps1.length < 3) {
      wx.showToast({
        icon: 'error',
        title: '密码过短',
      })
      return false
    } else if (this.data.ps1.length > 15) {
      wx.showToast({
        icon: 'error',
        title: '密码过长',
      })
      return false
    } else if (this.data.account_id.length > 10) {
      wx.showToast({
        icon: 'error',
        title: '昵称过长',
      })
      return false
    }
    return true
  },

  ShowPassword1() {
    this.setData({
      passwordFieldType1: this.data.passwordFieldType1 === 'text' ? 'password' : 'text'
    }, () => {
      // 手动更新视图
      this.selectComponent('.inputBox').update(); 
    });
    var currentShowText1 = this.data.condition1;
    this.setData({
      condition1: !currentShowText1
    });
  },

  ShowPassword2() {
    this.setData({
      passwordFieldType2: this.data.passwordFieldType2 === 'text' ? 'password' : 'text'
    }, () => {
      // 手动更新视图
      this.selectComponent('.inputBox').update(); 
    });
    var currentShowText2 = this.data.condition2;
    this.setData({
      condition2: !currentShowText2
    });
  }
})