<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" placeholder="请输入关键字,昵称、用户名" style="width: 200px;" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px;" icon="el-icon-search"
        @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%;"
      @sort-change="sortChange" :default-sort="{ prop: 'create_time', order: 'descending' }">

      <el-table-column label="群组名称" min-width="120" prop="user_nickname">
      </el-table-column>
      <el-table-column label="群人数" min-width="100" prop="balance">
      </el-table-column>
      <el-table-column label="状态" prop="level">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.user_status == 1">启用</span>
          <span style="color:#ff643a;cursor: pointer;" v-else>关闭</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" min-width="100" prop="user_nickname">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" @click="see_userlist = true">查看明细</span>

        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="130">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.remark">
            <span v-if="scope.row.remark ? scope.row.remark.length > 5 : false"> {{
              scope.row.remark.slice(0, 4)
            }}... </span>
            <span v-else> {{ scope.row.remark }} </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="150" align="center" prop="create_time">
      </el-table-column>
      <el-table-column label="操作" width="70">

        <template slot-scope="{row}">
          <span style="color:#3E3EF7;cursor: pointer;" @click="handleUpdate(row)">编辑</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px"
        style=" margin-left:50px;">
        <div style="width: 400px;">
          <el-form-item label="群组名称">
            <el-input v-model="temp.user_nickname" />
          </el-form-item>
          <el-form-item label="群组状态">

            <el-radio v-model="temp.user_status" :label="1">启用</el-radio>
            <el-radio v-model="temp.user_status" :label="0">关闭</el-radio>
          </el-form-item>
        </div>
        <el-form-item label="所属代理商">
            <el-select v-model="temp.level"  filterable class="filter-item"  placeholder="请选择所属代理商">
              <el-option label="代理商1" :value="1" />
              <el-option label="代理商2" :value="2" />
              <el-option label="代理商3" :value="3" />
              <el-option label="代理商4" :value="4" />
              <el-option label="代理商5" :value="5" />
            </el-select>
          </el-form-item>
        <div style="width: 100%;">
          <el-form-item label="群内用户">
            <el-select v-model="temp.level" multiple filterable class="filter-item" style="width: 100%;" placeholder="请选择用户">
              <el-option label="vip1" :value="1" />
              <el-option label="vip2" :value="2" />
              <el-option label="vip3" :value="3" />
              <el-option label="vip4" :value="4" />
              <el-option label="vip5" :value="5" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
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

    <el-dialog :visible.sync="see_userlist" title="群内用户列表">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="用户账号" />
        <el-table-column prop="pv" label="所属等级" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="see_userlist = false">{{ $t('table.confirm') }}</el-button>
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
      see_userlist: false,
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
        level: [1],
        hand_val: 0,
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
      balance: 0
    }
  },
  created() {
    this.getList()
  },
  methods: {
    add_money(type) {
      if (type == 1) {
        this.temp.balance = Number(this.temp.balance) - Number(this.balance)
      } else {
        this.temp.balance = Number(this.temp.balance) + Number(this.balance)
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
        level: [1],
        hand_val: 0,
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
      this.balance = 0
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
  