
const app = getApp()
const order = wx.cloud.database().collection('order_record')


Page({

  data: {
  },
  onShow: function () {
    this.getAllOrder()
    //this.getMyOrder()
    //this.toOrder()
  },
  onLoad() {
  },

  getAllOrder(){
    const that =this;
    order.get({
      success(res) {
        console.log("order_list",res.data)
        that.setData({
          order_list : res.data        
        })        
      },
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
    const userid=e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: '/pages/user_infor/user_infor?userid='+userid,
    })
    
  },
  //帖子详情
  toOrderinfor(){
    wx.navigateTo({
      url: '/pages/order_infor/order_infor',
    })
  }

})