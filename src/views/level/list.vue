<template>
  <div class="app-container">
    <div class="filter-container">
      
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>
    
    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%;"
      @sort-change="sortChange" :default-sort="{ prop: 'create_time', order: 'descending' }">
      
      <el-table-column label="标题"  prop="user_login">
      </el-table-column>
      <el-table-column label="关联ID"  prop="user_login">
      </el-table-column>
      <el-table-column label="启用状态" prop="level">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.user_status == 1">启用</span>
          <span style="color:#ff643a;cursor: pointer;" v-else>禁用</span>
        </template>
      </el-table-column>
      
      <el-table-column label="金额" prop="balance">
      </el-table-column>
      <el-table-column label="每日可浏览次数" prop="balance">
      </el-table-column>
      <el-table-column label="有效期" prop="create_time">
      </el-table-column>
      <el-table-column label="描述" min-width="130">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.remark">
            <span v-if="scope.row.remark ? scope.row.remark.length > 5 : false"> {{
              scope.row.remark.slice(0, 4)
            }}... </span>
            <span v-else> {{ scope.row.remark }} </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="create_time">
      </el-table-column>
      <el-table-column label="操作" align="center">

<template slot-scope="{row}">
  <span style="color:#3E3EF7;cursor: pointer;" @click="handleUpdate(row)">编辑</span>
</template>
</el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px"
        style=" margin-left:50px;">
        <div style="width: 400px;">
        <el-form-item label="标题" prop="user_login">
          <el-input v-model="temp.user_login" />
        </el-form-item>
        <el-form-item label="关联ID" prop="user_login">
          <el-input v-model="temp.user_login" />
        </el-form-item>
      </div>
      
        <div style="width: 450px;">
          <el-form-item label="每日可浏览条数" prop="balance">
          <el-input v-model="temp.balance" />
          
        </el-form-item>
        <el-form-item label="金额" prop="balance">
          <el-input v-model="temp.balance" />
          
        </el-form-item>
        
        <el-form-item label="启用状态">

          <el-radio v-model="temp.user_status" :label="1">正常</el-radio>
          <el-radio v-model="temp.user_status" :label="0">禁用</el-radio>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="填写备注信息" />
        </el-form-item>
        
      </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  
<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import { fetchuserlist, adduserlist } from '@/api/room_sys'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 1, display_name: 'vip1' },
  { key: 2, display_name: 'vip2' },
  { key: 3, display_name: 'vip3' },
  { key: 4, display_name: 'vip4' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

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
      ifadd: true,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 20,
        keyword: null,

      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],

      showReviewer: false,
      temp: {
        id: undefined,
        total_ma: '',
        user_login: '',
        user_nickname: '',
        user_email: "",
        user_pass: '',
        balance: 0,
        status: 1,
        level: 1,
        hand_val:0,
        user_status: 1,
        withdrawal_status: 1,
        freeze_status: 1,
        flow_val: 1,
        remark: '',

      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        user_login: [{ required: true, message: '请输入用户登录名', trigger: 'change' }],
        user_nickname: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],

        balance: [{ required: true, message: '请输入用户金额', trigger: 'blur' }],
      },
      downloadLoading: false,
      balance:0
    }
  },
  created() {
    this.getList()
  },
  methods: {
    add_money(type){
      if(type==1){
        this.temp.balance=Number(this.temp.balance)-Number(this.balance)
      }else{
        this.temp.balance=Number(this.temp.balance)+Number(this.balance)
      }
    },
    formatNum(value) {
      if (!value && value !== 0) return 0;
      let str = value.toString();
      let reg =
        str.indexOf(".") > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
      return str.replace(reg, "$1,");
    },
    getList() {
      this.listLoading = true
      fetchuserlist(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.pagesize = 10
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        total_ma: '',
        user_login: '',
        user_nickname: '',
        user_email: "",
        user_pass: '',
        balance: 0,
        status: 1,
        level: 1,
        hand_val:0,
        user_status: 1,
        withdrawal_status: 1,
        freeze_status: 1,
        flow_val: 1,
        remark: '',
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.ifadd = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.user_login = this.temp.user_login.trim()
          if (this.temp.user_pass == '') {
            this.$message({
              message: '请输入登录密码',
              type: 'error'
            })
          }
          adduserlist(this.temp).then((res) => {
            if (res.code == 200) {
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            }
            this.dialogFormVisible = false
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      //this.ifadd = false
      this.temp = Object.assign({}, row) // copy obj
      this.temp.user_pass = ''
      this.balance=0
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.user_login = this.temp.user_login.trim()
          const tempData = Object.assign({}, this.temp)
          adduserlist(tempData).then((res) => {
            if (res.code == 200) {
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            }
            this.dialogFormVisible = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
  