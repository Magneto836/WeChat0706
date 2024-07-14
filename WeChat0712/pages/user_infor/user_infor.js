
const app = getApp();

const order = wx.cloud.database().collection('order_record');
Page({
  data: {

  },
  
  onLoad(options) {
    this.setData({
      userid:options.userid
    })
    console.log('userid',this.data.userid)
    console.log('1')
  },
  onShow:function(){
    console.log('1')
    this.getUserOrder()
  },
  getUserOrder(){
    const that =this;
    order.where({
      account_id : that.data.userid
    }).get({
      success(res) {  
        that.setData({
          order_list : res.data        
        })     
        console.log('order',that.data.order_list)  
      },
      fail(err){
        console.log('error')
      }
    })
  }



})