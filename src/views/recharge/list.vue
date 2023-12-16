<template>
  <div class="app-container">
    <div class="filter-container">

      <el-date-picker
        v-model="listQuery.time"
        type="date"
        :clearable="false"
        :picker-options="pickerOptions"
        class="filter-item"
        placeholder="选择日期"
      />
      <el-select v-model="listQuery.status" placeholder="选择订单状态类型" class="filter-item" style="width: 130px;margin-left: 10px;">
        <el-option label="全部" value="" />
        <el-option label="处理中" :value="1" />
        <el-option label="成功" :value="2" />
        <el-option label="失败" :value="3" />
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleFilter">
        搜索
      </el-button>
      <el-select
        v-model="model_type"
        placeholder="操作"
        class="filter-item"
        style="width: 130px;margin-left: 10px; float: right;"
      >
        <el-option label="批量成功" value="1" />
        <el-option label="批量失败" value="2" />

      </el-select>
    </div>

    <el-table
      :key="tableKey"
      ref="table2"
      v-loading="listLoading"
      :data="list"
      stripe
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange" :default-sort = "{prop: 'create_time', order: 'descending'}"
      @selection-change="handleSelection"
    >
      <el-table-column type="selection" fixed align="center" width="55" />
      <el-table-column label="订单号" prop="order_no" min-width="165" />

      <el-table-column label="充值方式" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.account_id == 1" style="color:#ff643a;cursor: pointer;">支付宝</span>
          <span v-if="scope.row.account_id == 2" style="color:#53d6c4;cursor: pointer;">微信</span>
          <span v-if="scope.row.account_id == 3" style="color:#0717f3;cursor: pointer;">银行卡</span>
          <span v-if="scope.row.account_id == 4" style="color:#fdd803;cursor: pointer;">USDT</span>
        </template>
      </el-table-column>
      <el-table-column label="会员号" prop="user_login">
      </el-table-column>
      <el-table-column label="充值金额" prop="money">
        <template slot-scope="scope">
          {{ formatNum(scope.row.amount) }}
        </template>
      </el-table-column>
      <el-table-column label="缩略图">
        <template slot-scope="scope">

          <el-image
            style="width: 50px; height: 50px"
            :src="scope.row.img"
            fit="cover"
            lazy
            @click="see_img(scope.row.img)"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" style="font-size:330%" />
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="80" prop="remarks">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.remark">
            <span v-if="scope.row.remark ? scope.row.remark.length > 5 : false"> {{
              scope.row.remark.slice(0, 4)
            }}... </span>
            <span v-else> {{ scope.row.remark }} </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="statue">
        <template slot-scope="scope">
          <span v-if="scope.row.status == 1" style="color:#ff643a;cursor: pointer;">处理中</span>
          <span v-if="scope.row.status == 2" style="color:#53d6c4;cursor: pointer;">成功</span>
          <span v-if="scope.row.status == 3" style="color:#ccc;cursor: pointer;">失败</span>
        </template>
      </el-table-column>

      <el-table-column label="充值时间" min-width="140" prop="create_time">
      </el-table-column>

    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="类别名称" prop="type">
          <el-input v-model="temp.title" />
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
    <el-dialog title="图片详情" :visible.sync="see_img_dialog" center>
      <el-image :src="dialog_img" />
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import { fetchrechargelist, setracharge_ok } from '@/api/room_sys'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 1, display_name: '美元/人民币' },
  { key: 2, display_name: '欧元/美元' },
  { key: 3, display_name: '英镑/美元' },
  { key: 4, display_name: '美元日元' }
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
      dialog_img: '',
      model_type: '',
      see_img_dialog: false,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
        status: null,
        time: ''
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      form: {
        date: new Date(),
        type: ''
      },
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
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
      downloadLoading: false,
      multipleSelection: [],
      pickerOptions: {
        disabledDate: (time) => {
          if (time.getTime() > Date.now()) {
            return true
          }
        }
      }
    }
  },
  watch: {
    model_type(val) {
      if (val == 1) {
        this.group_set_ok()
      } else if (val == 2) {
        this.group_set_nook()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatNum(value) {
      if (!value && value !== 0) return 0
      const str = value.toString()
      const reg =
        str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g
      return str.replace(reg, '$1,')
    },
    formatDate(type, data) {
      const d = new Date(data)
      const b = new Date()
      if (type == 'm') {
        return d.getFullYear() + '-' + this.p(d.getMonth() + 1) + '-' + this.p(d.getDate())
      } else if (type == 'm2') {
        return d.getFullYear() + '-' + this.p(d.getMonth() + 1)
      } {
        return d.getFullYear()
      }

      // return d.getFullYear() + '-' + this.p((d.getMonth() + 1)) + '-' + this.p(d.getDate())
    },
    p(s) {
      return s < 10 ? '0' + s : s
    },
    group_set_ok() {
      if (this.multipleSelection.length == 0) {
        this.$message({
          message: '请选择数据',
          type: 'error'
        })
        this.model_type = ''
        return
      }
      var idarr = new Array()
      var ifok = true
      this.multipleSelection.forEach((element, index) => {
        if (element.status !== 1) {
          ifok = false
        } else {
          idarr.push(element.id)
        }
      })
      if (ifok !== true) {
        this.$message({
          message: '请选择状态为处理中的数据',
          type: 'error'
        })
        this.model_type = ''
        return
      }
      this.$confirm('确定要将选中的数据设置为已成功?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          setracharge_ok({ status: 2, ids: idarr.toString() }).then(response => {
            if (response.code == 200) {
              this.$message({
                message: '设置成功',
                type: 'success'
              })
            }
            this.getList()
            this.model_type=''
          }).catch(err => {
            // this.openFullScreen2()
            console.log(err)
          })
        })
        .catch(() => {
          this.toggleSelection()
        })
    },
    group_set_nook() {
      if (this.multipleSelection.length == 0) {
        this.$message({
          message: '请选择数据',
          type: 'error'
        })
        this.model_type = ''
        return
      }
      var idarr = new Array()
      var ifok = true
      this.multipleSelection.forEach((element, index) => {
        if (element.status !== 1) {
          ifok = false
        } else {
          idarr.push(element.id)
        }
      })
      if (ifok !== true) {
        this.$message({
          message: '请选择状态为处理中的数据',
          type: 'error'
        })
        this.model_type = ''
        return
      }
      this.$confirm('确定要该条列表数据设置为失败?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          setracharge_ok({ status: 3, ids: idarr.toString() }).then(response => {
            if (response.code == 200) {
              this.$message({
                message: '设置成功',
                type: 'success'
              })
            }
            this.model_type=''
            this.getList()
          }).catch(err => {
            // this.openFullScreen2()
            console.log(err)
          })
        })
        .catch(() => {
          this.toggleSelection()
        })
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.table2.toggleRowSelection(row)
        })
      } else {
        this.$refs.table2.clearSelection()
      }
    },
    see_img(url) {
      this.see_img_dialog = true
      this.dialog_img = url
    },
    handleSelection(val) {
      this.multipleSelection = val
    },
    getList() {
      this.listLoading = true
      this.listQuery.time = this.listQuery.time !== '' ? this.formatDate('m', this.listQuery.time) : ''
      fetchrechargelist(this.listQuery).then(response => {
        if (response.code == 200) {
          this.list = response.data.data
          this.total = response.data.total
        }
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.pagesize = 10
      this.listQuery.time = this.listQuery.time !== '' ? this.formatDate('m', this.listQuery.time) : ''

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
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
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
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
