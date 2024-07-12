const app = getApp();
const db = wx.cloud.database();
const order = db.collection('order_record');
const user = db.collection('chat_user');
Page({
  data: {
    order_list:[],
    user_list:[],
    activeTab:'order'
  },
  
  onLoad(options) {
    console.log('11',options)
    this.setData({
      search_input:options.search_input
    })
    console.log('input',this.data.search_input)
  },
  onShow:function(){
    this.getOrder()
    this.getUser()
  },
  getOrder(){
    const that =this;
    order.where({
      contnet:db.RegExp({
        regexp:this.data.search_input,
        options:'i'
      })
    }).get({
      success(res) {  
        console.log('成功打开order数据库,res:',res)
        that.setData({
          order_list:res.data              
        })       
      },
      fail(err){
        console.log('error')
      }
    })
  },
  getUser(){
    const that =this;
    user.where({
      account_id:db.RegExp({
        regexp:this.data.search_input,
        options:'i'
      })
    }).get({
      success(res) {  
        console.log('成功打开user数据库,res:',res)
        that.setData({
          user_list:res.data              
        })       
      },
      fail(err){
        console.log('error')
      }
    })
  },
  setActiveTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  }



})