// app.js
App({
  onLaunch() {
    
    wx.cloud.init({
      env:"cloud1-8gjzhrak6c6b1e4a"
    })
    if(wx.getStorageSync('userInfo')){
      this.globalData.userInfo = wx.getStorageSync('userInfo')
      console.log('get storage')
    }
  },
  globalData: {
    userInfo: null
  }
})
