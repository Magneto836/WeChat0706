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
  },
  startCacheClearInterval() {
    const oneHour = 15000; 

    this.cacheClearInterval = setInterval(() => {
      wx.clearStorage({
        success() {
          console.log('缓存已清理');
        },
        fail(err) {
          console.error('清理缓存失败', err);
        }
      });
    }, oneHour);
  },

  onHide() {
    // 小程序隐藏时执行的代码
    if (this.cacheClearInterval) {
      clearInterval(this.cacheClearInterval);
    }
  },

  onUnload() {
    // 小程序卸载时执行的代码
    if (this.cacheClearInterval) {
      clearInterval(this.cacheClearInterval);
    }
  }
})
