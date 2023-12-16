<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.type" style="width: 260px; margin-right: 10px;" class="filter-item" placeholder="输入关键字搜索，如:会员名,订单号" />
      <el-date-picker v-model="listQuery.datetime" type="datetime" class="filter-item" placeholder="选择创建时间" />

      <el-select v-model="listQuery.type"   class="filter-item"
        style="width: 130px;margin-left: 10px;" placeholder="选择类型">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.type" placeholder="选择收益状态类型"  class="filter-item"
        style="width: 130px;margin-left: 10px;">
        <el-option label="盈利" value="1" />
        <el-option label="亏损" value="2" />
        
      </el-select>
      <el-select v-model="listQuery.type" placeholder="选择订单状态类型"  class="filter-item"
        style="width: 130px;margin-left: 10px;">
        <el-option label="买入" value="1" />
        <el-option label="卖出" value="2" />
        <el-option label="强制平仓" value="3" />
      </el-select>

      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px;" icon="el-icon-search"
        @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      


    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%;"
      @sort-change="sortChange" @selection-change="handleSelection">
      
      <el-table-column label="订单号" min-width="120"  prop="orderid">
      </el-table-column>  
      <el-table-column label="会员号"  prop="username">
      </el-table-column>
      <el-table-column label="类别"  min-width="110"  prop="typename">
      </el-table-column>
      <el-table-column label="买入金额" prop="price" min-width="90">
        <template slot-scope="scope">
          {{ formatNum(scope.row.price)}}
        </template>
      </el-table-column>
      
      <el-table-column label="订单类型"  prop="uptypename">
        <template slot-scope="scope">
          {{ formatNum(scope.row.ordertype)}}
        </template>
      </el-table-column>
      <el-table-column label="类型"  prop="uptypename">
        <template slot-scope="scope">
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.uptype == 1">{{scope.row.uptypename}}</span>
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.uptype == 2">{{scope.row.uptypename}}</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.uptype == 3">{{scope.row.uptypename}}</span>
        </template>
      </el-table-column>
      <el-table-column label="入市价"  prop="buyprice">
        <template slot-scope="scope">
          {{ formatNum(scope.row.buyprice) }}
        </template>
      </el-table-column>
      <el-table-column label="卖出价"  prop="saleprice">
        <template slot-scope="scope">
          <span  v-if="scope.row.saleprice == 0">-</span>
          <span  v-else>{{ scope.row.saleprice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="担保金额"  prop="safeprice">
        <template slot-scope="scope">
          <span  v-if="scope.row.safeprice == 0">-</span>
          <span  v-else>{{ formatNum(scope.row.safeprice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平仓价"  prop="pingprice">
        <template slot-scope="scope">
          <span  v-if="scope.row.pingprice == 0">-</span>
          <span  v-else>{{ scope.row.pingprice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收益比例"  prop="winbili">
        <template slot-scope="scope">
          <span  v-if="scope.row.winbili == 0">-</span>
          <span  v-else>{{ scope.row.winbili }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="收益"  prop="winmoney">
        <template slot-scope="scope">
          <span  v-if="scope.row.winmoney == 0">-</span>
          <span  v-else>{{ formatNum(scope.row.winmoney)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="手续费"  prop="shouxufei">
        <template slot-scope="scope">
          
          {{ formatNum(scope.row.shouxufei)}}
        </template>
      </el-table-column>
      <el-table-column label="收益状态"  prop="zhi_wintype">
        <template slot-scope="scope">
          <span  v-if="scope.row.statue == 0">-</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.statue == 1">盈利</span>
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.statue == 2">亏损</span>
        </template>
      </el-table-column>
      <el-table-column label="状态"  >
        <template slot-scope="scope">
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.salestatue == 1">买入</span>
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.salestatue == 2">卖出</span>
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.salestatue == 3">强制平仓</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="140" prop="createTime">
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
        orderid:'202303120212235643243',
        username: 'user009',
        typeid: 1,
        typename: '美元/人民币',
        ordertypeid:1,
        ordertype:'普通交易',
        safeprice:0,
        pingprice:0,
        price: 9845,
        uptype: 3,
        uptypename: '实际汇率',
        buyprice: 6.7,
        saleprice: 0,
        winbili: 0,
        winmoney: 0,
        shouxufei: 5,
        statue: 0,
        salestatue:1,
        createTime: '2023-03-01 00:01',

      },{
        id: 11,
        orderid:'202303120212235643243',
        username: 'user009',
        typeid: 1,
        typename: '美元/人民币',
        ordertypeid:1,
        ordertype:'普通交易',
        safeprice:0,
        pingprice:0,
        price: 9845,
        uptype: 3,
        uptypename: '实际汇率',
        buyprice: 6.7,
        saleprice: 6.9,
        winbili: 1,
        winmoney: 200,
        shouxufei: 50,
        statue: 1,
        salestatue:2,
        createTime: '2023-03-01 00:01',

      },{
        id: 2,
        orderid:'202303120212235643252',
        username: 'user009',
        typeid: 1,
        typename: '美元/人民币',
        ordertypeid:2,
        ordertype:'合约交易',
        safeprice:3985,
        pingprice:6.4,
        price: 9845,
        uptype: 2,
        uptypename: '买跌',
        buyprice: 6.7,
        saleprice: 6.9,
        winbili: 3,
        winmoney: 270,
        shouxufei: 100,
        statue: 2,
        salestatue:2,
        createTime: '2023-03-01 00:01',

      },{
        id: 3,
        orderid:'202303120212235643261',
        username: 'user009',
        typeid: 1,
        typename: '美元/人民币',
        ordertypeid:2,
        ordertype:'合约交易',
        safeprice:4440,
        pingprice:5.0,
        price: 9845,
        uptype: 1,
        uptypename: '买涨',
        buyprice: 6.7,
        saleprice: 6.9,
        winbili: 3,
        winmoney: 270,
        shouxufei: 100,
        statue: 2,
        salestatue:3,
        createTime: '2023-03-01 00:01',

      },{
        id: 4,
        orderid:'202303120212235643261',
        username: 'user009',
        typeid: 2,
        typename: '美元/人民币',
        ordertypeid:2,
        ordertype:'合约交易',
        safeprice:4440,
        pingprice:5.0,
        price: 9845,
        uptype: 2,
        uptypename: '买跌',
        buyprice: 6.7,
        saleprice: 6.9,
        winbili: 3,
        winmoney: 270,
        shouxufei: 100,
        statue: 1,
        salestatue:2,
        createTime: '2023-03-01 00:01',

      },],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',
        datetime: undefined,
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
      multipleSelection: [],
      dialogSet: false,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatNum(value) {
      if (!value && value !== 0) return 0;
      let str = value.toString();
      let reg =
        str.indexOf(".") > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
      return str.replace(reg, "$1,");
    },
    handleSet() {

      this.dialogSet = true
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
  