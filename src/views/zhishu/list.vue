<template>
  <div class="app-container">
    <div class="filter-container">
     
      <el-date-picker v-model="listQuery.datetime" type="datetime" class="filter-item" placeholder="选择适用时间点" />

      <el-select v-model="listQuery.type" :placeholder="$t('table.type')" clearable class="filter-item"
        style="width: 130px;margin-left: 10px;">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name"
          :value="item.key" />
      </el-select>

      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px;" icon="el-icon-search"
        @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-s-tools" @click="handleSet">
        设置
      </el-button>


    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%;"
      @sort-change="sortChange" @selection-change="handleSelection">

      <el-table-column label="序号" sortable  min-width="80" prop="id">
      </el-table-column>
      <el-table-column label="所属类别"  min-width="110" prop="typename">
      </el-table-column>
      <el-table-column label="数值" prop="value" min-width="90" >
      </el-table-column>
      <el-table-column label="适用时间点" min-width="140" prop="forTime">
      </el-table-column>
      <el-table-column label="值类型"  prop="valueType">
      </el-table-column>
      <el-table-column label="指数涨幅方式"   min-width="120" prop="zhi_typename">
      </el-table-column>
      <el-table-column label="涨幅类型"  prop="zhi_wintype">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.zhi_wintype == 1">{{scope.row.zhi_wintypename}}</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.zhi_wintype == 2">{{ scope.row.zhi_wintypename }}</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.zhi_wintype == 0">-</span>
        </template>
        
      </el-table-column>
      <el-table-column label="涨幅百分比"   min-width="120" prop="zhi_winvalue">
        <template slot-scope="scope">
          {{ scope.row.zhi_winvalue !==''?scope.row.zhi_winvalue+'%':'-' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间"  min-width="140" prop="createTime">
      </el-table-column>
      <el-table-column label="操作"  min-width="100">
        <template slot-scope="scope">
          <span style="color:#3E3EF7;cursor: pointer;" @click="handleUpdate(row)">编辑</span>
         
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px"
        style="width: 400px; margin-left:50px;">
        <el-form-item label="所属类别" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用时间点" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="值" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="涨跌方式" prop="type">
          <el-select v-model="temp.uptype" class="filter-item" placeholder="Please select">
            <el-option label="正常" value="0" />
            <el-option label="上涨" value="1" />
            <el-option label="下跌" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="百分比" prop="title">
          <el-input v-model="temp.title" />输入小数点数字
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogSet">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px"
        style="width: 400px; margin-left:50px;">
        <el-form-item label="所属类别" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用时间范围" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetimerange" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="涨跌方式" prop="type">
          <el-select v-model="temp.uptype" class="filter-item" placeholder="Please select">
            <el-option label="正常" value="0" />
            <el-option label="上涨" value="1" />
            <el-option label="下跌" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="百分比" prop="title">
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
  </div>
</template>
  
<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 1, display_name: '美元/人民币' },
  { key: 2, display_name: '欧元/美元' },
  { key: 3, display_name: '英镑/美元' },
  { key: 4, display_name: '美元/日元' }
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
      list: [{
        id: 1,
        type:1,
        typename:'美元/人民币',
        value: 6.5,
        valueType:'系统接口',
        forTime:'2023-03-02 00:01',

        zhi_type:1,
        zhi_typename:'正常',
        zhi_wintype:0,
        zhi_wintypename:'',
        zhi_winvalue:'',

        createTime: '2023-03-01 00:01',
        
      },{
        id: 2,
        type:1,
        typename:'美元/人民币',
        value: 6.66,
        valueType:'人工设置',
        forTime:'2023-03-02 00:01',
        zhi_typename:'按比例',
        zhi_wintype:2,
        zhi_wintypename:'下跌',
        zhi_winvalue:3,
        createTime: '2023-03-01 00:01',
        
      },{
        id: 3,
        type:1,
        typename:'美元/人民币',
        value: 6.66,
        valueType:'人工设置',
        forTime:'2023-03-02 00:03',
        zhi_type:1,
        zhi_typename:'正常',
        zhi_wintype:1,
        zhi_wintypename:'上涨',
        zhi_winvalue:'2',
        createTime: '2023-03-01 00:01',
        
      }],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',
        datetime:undefined,
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
      multipleSelection:[],
      dialogSet:false,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleSet(){
     
      this.dialogSet= true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleSelection(val) {
      this.multipleSelection = val;
      
    },
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
    getSortClass: function (key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
  