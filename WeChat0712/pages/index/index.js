
const app = getApp()
const order = wx.cloud.database().collection('order_record')
const chat=wx.cloud.database().collection('chat_user')


Page({

  data: {
    friendId:'',
    search_input:'',
    activeTab:'失物招领'
  },
  onShow: function () {
    this.getAllOrder()
    //this.getMyOrder()
    //this.toOrder()
  },
  onLoad() {
    this.getAllOrder()
  },

  getAllOrder(){
    const that =this;
    order.where({
      label:that.data.activeTab
    }).orderBy('order_time', 'desc').get({
      success(res) {
        console.log("order_list",res.data)
        that.setData({
          order_list : res.data       
        })        
      },
    })
  },
  getSearch(e){
    const search = e.detail.value
    console.log('输入',search)
    this.setData({
      search_input:search
    })
  },
  //发帖
  toOrder(){
    wx.navigateTo({
      url: '/pages/order/order',
    })
  },
  //用户详情
  toUserinfor(e){
    const that = this;
    const userid = e.currentTarget.dataset.userid;
    chat.where({
      account_id: userid
    }).get({
      success(res) {
        console.log('读到库');
        console.log(res);
        // 确保友好的错误处理
        if (res.data && res.data.length > 0) {
          that.setData({
            friendId: res.data[0]._id // 假设 res.data 是一个数组，取第一个元素的 _id
          }, () => {
            // 在 setData 完成后，打印 friendId
            console.log(that.data.friendId);
          });
          wx.navigateTo({
            url: '/pages/friendDetail/friendDetail?friendId=' + that.data.friendId+'&userid='+userid
          });
        } else {
          console.error('没有找到匹配的用户');
        }
      },
      fail(err) {
        console.error('查询失败', err);
      }
    });
  },
  //帖子详情
  toOrderinfor(e){
    const order_id = e.currentTarget.dataset.order_id
    console.log('这是什么',order_id)
    wx.navigateTo({
      url: '/pages/order_infor/order_infor?order_id='+order_id,
    })
  },



  toSearch(){
    if(!this.searchCherk()){
      return;
    }
    wx.navigateTo({
      url: '/pages/search/search?search_input='+this.data.search_input,
    })
  },
  searchCherk(){
    if(this.data.search_input.length < 1){
      wx.showToast({
        icon: 'error',
        title: '搜索不能为空',
      })
      return false
    }
    return true;
  },
  setActiveTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    }, () => {
      this.getAllOrder(); // 切换标签后重新获取数据
    });
  }

})