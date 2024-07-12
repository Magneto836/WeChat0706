
const app = getApp()
const order = wx.cloud.database().collection('order_record')
const chat=wx.cloud.database().collection('chat_user')


Page({

  data: {
    friendId:''
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
        } else {
          console.error('没有找到匹配的用户');
        }
      },
      fail(err) {
        console.error('查询失败', err);
      }
    });
    setTimeout(() => {
    wx.navigateTo({
      url: '/pages/friendDetail/friendDetail?friendId=' + that.data.friendId+'&userid='+userid
    });
    }, 1000); 
  },
  //帖子详情
  toOrderinfor(){
    wx.navigateTo({
      url: '/pages/order_infor/order_infor',
    })
  }

})