const app = getApp()
const db = wx.cloud.database();
const order = db.collection('order_record');
const utils = require("../../utils/util")

Page({
  data: { 
    options:[
      {la:'失物招领',value:'失物招领'},
      {la:'闲物出售',value:'闲物出售'},
      {la:'3',value:'3'},
      {la:'4',value:'4'}
    ]
  },
  onshow() {
  },
  onLoad(){
    this.setData({
      userInfo : app.globalData.userInfo
    })
  },
  getOrderContent(e){
    this.setData({
      neirong : e.detail.value
    })
  },
  getOrderLabel(e){
    this.setData({
      lab : e.detail.value
    })
  },

  orderPost(){
    var that = this;
    if(!this.orderCheck()){
      console.log("订单信息未正确填写");
      return;
    }
    order.add({
      data:{
        account_id: this.data.userInfo.account_id,
        avatarUrl: this.data.userInfo.avatarUrl,
        contnet: this.data.neirong,
        label: this.data.lab,
        order_time: utils.formatTime(new Date())
      },
      success(res){
        wx.switchTab({
          url: '/pages/index/index',
        })
      }
    })
  },
  orderCheck(){
    if(this.data.neirong.length < 5){
      wx.showToast({
        icon: 'error',
        title: '文本内容过短',
      })
      return false
    }

    return true
  }
})