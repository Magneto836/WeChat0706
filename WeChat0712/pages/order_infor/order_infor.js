
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
      account_id:"wzc"
    }).get({
      success(res) {  
        console('成功打开数据库')
        that.setData({
          order_list : res.data        
        })       
      },
      fail(err){
        console.log('error')
      }
    })
  }



})