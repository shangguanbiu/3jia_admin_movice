<template>
  <div class="app-container">
    <div class="filter-container">

      <el-form ref="dataForm" label-position="left" label-width="220px" style="width: 100%; margin-left:50px;">
        <el-form-item label="邀请码注册">
          <el-radio v-model="temp.is_invitation_code" :label="1">开启</el-radio>
          <el-radio v-model="temp.is_invitation_code" :label="0">关闭</el-radio>
        </el-form-item>
        <el-form-item label="充值上传图片凭据">
          <el-radio v-model="temp.is_img_voucher" :label="1">开启</el-radio>
          <el-radio v-model="temp.is_img_voucher" :label="0">关闭</el-radio>
          <span style="color:rgb(255, 100, 58) ;">用户充值订单是否需要上传图片截图，开启：需要上传并存服务器，关闭：不传图，不保存到服务器</span>
        </el-form-item>
        <el-form-item label="用户充值限制">
          <el-radio v-model="temp.is_limit_recharge" :label="1">开启</el-radio>
          <el-radio v-model="temp.is_limit_recharge" :label="0">关闭</el-radio>
          <span style="color:rgb(255, 100, 58) ;">用户充值订单有未处理充值记录不可再次充值</span>
        </el-form-item>
        <el-form-item label="客服地址">
          <el-input v-model="temp.kefu_url" style="width: 30%;" />
        </el-form-item>

        <el-form-item label="WhatsApp客服地址">
          <el-input v-model="temp.other_val" style="width: 30%;" />
        </el-form-item>
        <!-- <el-form-item label="用户提现限制">
          <el-radio v-model="temp.is_limit_withdrawal" :label="1">开启</el-radio>
          <el-radio v-model="temp.is_limit_withdrawal" :label="0">关闭</el-radio>
          <span style="color:rgb(255, 100, 58) ;">用户提现记录有未处理的记录不可再次提现</span>
        </el-form-item>
         <el-form-item label="首页房间布局">
          <el-radio v-model="temp.if_long" :label="0">横排</el-radio>
          <el-radio v-model="temp.if_long" :label="1">列排</el-radio>
          <span style="color:rgb(255, 100, 58) ;">首页4个房间配列方式,横排：一个大图，列排：2个小图并列</span>
        </el-form-item>
        
      <el-form-item label="倍数">
          <el-input v-model="temp.multiple" style="width: 30%;"/>
          <span style="color:rgb(255, 100, 58) ; padding-left: 15px;">用户提现要求：累计打码量大于最后一次充值金额乘以固定的倍数</span>
        </el-form-item> -->
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" @click="setbaseData">
          保存
        </el-button>
      </el-form>

    </div>



  </div>
</template>
  
<script>
import { fetchbase_set, savebase_set } from '@/api/room_sys'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination




export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      base_data: "",

      importanceOptions: [1, 2, 3],


      temp: {
        id: undefined,
        is_invitation_code: 1,
        is_img_voucher: 0,
        is_limit_recharge: 1,
        is_limit_withdrawal: 1,
        kefu_url: '',
        multiple: 1,
        if_long: 0,
        other_val: '',
      },

      dialogFormVisible: false,
      dialogStatus: '',


      pvData: [],
      rules: {

      },
      downloadLoading: false,

    }
  },
  created() {

    this.getList()
  },
  methods: {
    handleBack() {
      this.$router.push({
        path: "/room/index", query: {}
      })
    },

    getList() {
      fetchbase_set().then(response => {
        if (response.code == 200) {
          // this.temp = response.data

          this.temp.is_invitation_code = Number(response.data.is_invitation_code)
          this.temp.is_img_voucher = Number(response.data.is_img_voucher)
          this.temp.is_limit_recharge = Number(response.data.is_limit_recharge)
          this.temp.is_limit_withdrawal = Number(response.data.is_limit_withdrawal)
          this.temp.kefu_url = response.data.kefu_url
          this.temp.multiple = response.data.multiple
          this.temp.other_val = response.data.other_val
          this.temp.if_long = Number(response.data.if_long)

        }

      })
    },
    setbaseData() {
      savebase_set(this.temp).then((response) => {
        if (response.code == 200) {
          this.$notify({
            title: '成功',
            message: '保存成功',
            type: 'success',
            duration: 2000
          })
        }


      })
    },


  }
}
</script>
  