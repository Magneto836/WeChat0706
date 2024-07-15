const app = getApp()
const db = wx.cloud.database();
const order = db.collection('order_record');
const utils = require("../../utils/util")

Page({
  data: { 
    neirong:'',
    wordlen: 0,
    lab:'',
    options:[
      {la:'失物招领',value:'失物招领'},
      {la:'闲物出售',value:'闲物出售'},
      {la:'校园生活',value:'校园生活'},
      {la:'学习讨论',value:'学习讨论'}
    ]
  },
  onLoad(){
    this.setData({
      userInfo : app.globalData.userInfo
    })
  },
  getOrderContent(e){
    let input = e.detail.value.trim()
    const neirong = input
    const wordlen = neirong.length
    this.setData({
      neirong : neirong,
      wordlen:wordlen
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
        //user_id: ,
        account_id: this.data.userInfo.account_id,
        avatarUrl: this.data.userInfo.avatarUrl,
        contnet: this.data.neirong,
        label: this.data.lab,
        order_time: utils.formatTime(new Date())
      },
      success(res){
        wx.showToast({
          icon: 'success',
          title: '发布成功',
        })
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
    }else if(this.data.neirong.length > 100){
      wx.showToast({
        icon: 'error',
        title: '文本内容过长',
      })
      return false
    }
    if(!this.data.lab){
      wx.showToast({
        icon: 'error',
        title: '请选择分区',
      })
      return false
    }
    return true
  }
})