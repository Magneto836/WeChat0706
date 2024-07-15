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
    order.orderBy('order_time', 'desc').where({
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
  toUserinfor(e){
    const that = this;
    const userid = e.currentTarget.dataset.userid;
    db.collection('chat_user').where({
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
  toOrderinfor(e){
    const order_id = e.currentTarget.dataset.order_id
    console.log('这是什么',order_id)
    wx.navigateTo({
      url: '/pages/order_infor/order_infor?order_id='+order_id,
    })
  },
  setActiveTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

})