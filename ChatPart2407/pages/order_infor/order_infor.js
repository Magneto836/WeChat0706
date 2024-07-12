
const app = getApp();

const order = wx.cloud.database().collection('order_record');
Page({
  data: {

  },
  
  onLoad(options) {
    console.log('11',options)
    this.setData({
      order_id:options.order_id
    })
    console.log('order_id',this.data.order_id)

  },
  onShow:function(){
    this.getThisOrder()
  },
  getThisOrder(){
    const that =this;
    order.where({
      _id:that.data.order_id
    }).get({
      success(res) {  
        console.log('成功打开数据库,res:',res)
        that.setData({
          thisorder : res.data[0]       
        })       
      },
      fail(err){
        console.log('error')
      }
    })
  }



})