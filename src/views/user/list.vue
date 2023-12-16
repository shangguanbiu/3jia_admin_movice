<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" :placeholder="$t('table.title')" style="width: 200px;" class="filter-item"
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
      @sort-change="sortChange">
      <el-table-column label="序号" sortable width="80" prop="id">
      </el-table-column>
      <el-table-column label="账号" min-width="120" prop="username">
      </el-table-column>
      <el-table-column label="等级" min-width="80" prop="level">
      </el-table-column>
      <el-table-column label="邮箱" prop="email"  min-width="120">
      </el-table-column>
      <el-table-column label="金额" prop="recharge">
      </el-table-column>
      <el-table-column label="提现金额" prop="cash">
      </el-table-column>
      
      <el-table-column label="总盈亏" prop="win">
      </el-table-column>
      <el-table-column label="状态" prop="level">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.state == 0">正常</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.state !== 0">禁用</span>
        </template>
      </el-table-column>
      <el-table-column label="提现状态" prop="level">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.tixianstate == 0">正常</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.tixianstate !== 0">禁用</span>
        </template>
      </el-table-column>
      <el-table-column label="冻结状态" prop="level">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.dongjiestate == 0">正常</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.dongjiestate !== 0">禁用</span>
        </template>
      </el-table-column>
      <el-table-column label="认证状态" prop="level">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.renzhengstate == 0">已认证</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.renzhengstate !== 0">未认证</span>
        </template>
      </el-table-column>
      
      <el-table-column label="邀请码" prop="invite_code">
      </el-table-column>
      <el-table-column label="下级数量" prop="levelNum">
      </el-table-column>
      <el-table-column label="注册码" prop="user_invite_code">
      </el-table-column>
      <el-table-column label="备注" >
        <template slot-scope="scope">
            <el-tooltip :content="scope.row.remarks">
              <span v-if="scope.row.remarks ? scope.row.remarks.length > 5 : false"> {{
                scope.row.remarks.slice(0, 4)
              }}... </span>
              <span v-else> {{ scope.row.remarks }} </span>
            </el-tooltip>
          </template>
      </el-table-column>
      <el-table-column label="创建时间" width="210" prop="createTime">
      </el-table-column>
      <el-table-column label="操作" width="100">

        <template slot-scope="scope">
          <span style="color:#3E3EF7;cursor: pointer;" @click="handleUpdate(row)">编辑</span> 
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px"
        style="width: 400px; margin-left:50px;">
        
        <el-form-item label="用户名" prop="title">
          <el-input v-model="temp.username" :readonly="ifadd" />
        </el-form-item>
        <el-form-item label="金额" prop="title">
          <el-input v-model="temp.money" />
        </el-form-item>
        <el-form-item label="用户等级">
          <el-select v-model="temp.level" class="filter-item" placeholder="Please select">
            <el-option label="vip1" value="0" />
            <el-option label="vip2" value="1" />
            <el-option label="vip3" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态">
          
          <el-radio v-model="temp.status" :label="true">正常</el-radio>
           <el-radio v-model="temp.status" :label="false">禁用</el-radio>
        </el-form-item>
        <el-form-item label="提现状态">
          
          <el-radio v-model="temp.txstatus" :label="true">正常</el-radio>
           <el-radio v-model="temp.txstatus" :label="false">禁用</el-radio>
        </el-form-item>
        <el-form-item label="冻结状态">
         
          <el-radio v-model="temp.djstatus" :label="true">正常</el-radio>
           <el-radio v-model="temp.djstatus" :label="false">冻结</el-radio>
        </el-form-item>
        <el-form-item label="认证状态">
          
          <el-radio v-model="temp.rzstatus" :label="true">已认证</el-radio>
           <el-radio v-model="temp.rzstatus" :label="false">未认证</el-radio>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
            placeholder="Please input" />
        </el-form-item>
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
      ifadd:true,
      list: [{
        id: 1,
        username: '15996666999',
        email: 'qqqq@qq.com',
        recharge: 5999,
        cash: 44444,
        level:'vip1',
        levelid:0,
        levelNum: 44,
        win: 556,
        state: 1,
        tixianstate: 1,
        dongjiestate: 1,
        renzhengstate: 0,
        fengkongstate: 1,
        createTime: '1989-11-13 04:40',
        invite_code: 9999,
        remarks:'很长很长的备注',
        user_invite_code: ''
      }, {
        id: 2,
        username: '15922229999',
        email: 'qqqq@qq.com',
        recharge: 5999,
        cash: 44444,
        levelNum: 44,
        level:'vip2',
        levelid:1,
        win: 556,
        state: 1,
        tixianstate: 0,
        dongjiestate: 0,
        renzhengstate: 1,
        fengkongstate: 2,
        createTime: '1989-11-13 04:40',
        invite_code: 9999,
        remarks:'很长很长的备注',
        user_invite_code: ''
      },
      {
        id: 3,
        username: '15999999999',
        email: 'qqqq@qq.com',
        recharge: 5999,
        cash: 44444,
        levelNum: 44,
        level:'vip3',
        levelid:2,
        win: 556,
        state: 0,
        tixianstate: 0,
        dongjiestate: 0,
        renzhengstate: 0,
        fengkongstate: 3,
        createTime: '1989-11-13 04:40',
        invite_code: 9999,
        remarks:'很长很长的备注',
        user_invite_code: ''
      }
      ],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],

      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published',

        username:'',
        money:'',
        level:'',
        status: true,
        txstatus: true,
        djstatus: true,
        rzstatus: true,

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
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        //  this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
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
        username:'',
        money:'',
        level:'',
        status: true,
        txstatus: true,
        djstatus: true,
        rzstatus: true,
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.ifadd=true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.ifadd=false
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
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
  