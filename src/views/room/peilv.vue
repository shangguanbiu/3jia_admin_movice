<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" icon="el-icon-back" @click="handleBack">
        返回
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>


      <el-select v-model="listQuery.type_id" placeholder="选择类型" class="filter-item"
        style="width: 130px;margin-left: 10px;">
        <el-option label="大小单双" :value="1" />
        <el-option label="数字压注" :value="2" />
        <el-option label="特殊投法" :value="3" />
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search"
        @click="handleFilter">
        查找
      </el-button>
    </div>
    <div></div>
    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column label="序号" width="80" prop="id">
      </el-table-column>

      <el-table-column label="类型">
        <template slot-scope="scope">
          <span style="color:#53d6c4;cursor: pointer;" v-if="scope.row.type_id == 1">大小单双</span>
          <span style="color:#3E3EF7;cursor: pointer;" v-if="scope.row.type_id == 2">数字压注</span>
          <span style="color:#ff643a;cursor: pointer;" v-if="scope.row.type_id == 3">特殊投法</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="statue">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="赔率" prop="statue">
        <template slot-scope="scope">
          {{ scope.row.multiple }}
        </template>
      </el-table-column>

      <el-table-column label="创建时间" min-width="120" prop="create_time">
      </el-table-column>
      <el-table-column label="操作" width="110">
        <template slot-scope="scope">
          
          <span style="color:#ff643a;cursor: pointer;" @click="del_row(scope.row.id)">删除</span> |
          <span style="color:#3E3EF7;cursor: pointer;" @click="handleUpdate(scope.row)">编辑</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px"
        style="width: 80%; margin-left:50px;">

        <el-form-item label="类型" prop="type_id">
          <el-select v-model="temp.type_id" @change="get_type(temp.type_id)" class="filter-item" style="width:100%" placeholder="请选择类型">
            <el-option label="大小单双" :value="1" />
            <el-option label="数字压注" :value="2" />
            <el-option label="特殊投法" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-select v-model="temp.name" class="filter-item" filterable style="width:100%" placeholder="请选择">
            <el-option :label="selectitem" :value="selectitem" v-for="(selectitem,indexd) in sel_name" :key="indexd" />
            
          </el-select>
        </el-form-item>
        <el-form-item label="赔率" prop="multiple">
          <el-input v-model="temp.multiple" />
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
import { fetchpeilvlist, addpeilv, delpeilv } from '@/api/room_sys'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 1, code: 'VIP1', display_name: '大房间1', img: '' },
  { key: 2, code: 10002, display_name: '欧元/美元' },
  { key: 3, code: 10003, display_name: '英镑/美元' },
  { key: 4, code: 10004, display_name: '美元日元' }
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
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
        room_id: null,
        room_sub_id: null,
        type_id: ''
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],

      showReviewer: false,
      temp: {
        id: undefined,

        room_id: '',
        room_sub_id: '',
        type_id: '',
        name: '',
        multiple: '',


      },
      id: '',
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type_id: [{ required: true, message: '请选择类型', trigger: 'change' }],
        name: [{ required: true, message: '请输入名称', trigger: 'change' }],
        multiple: [{ required: true, message: '请输入赔率', trigger: 'change' }]
      },
      downloadLoading: false,
      sel_name:[],
      dzds_zidian:['大','小','單','雙','大單','小單','大雙','小雙'],
      number_zidian:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27],
      teshu_zidian:['豹子','順子','對子']
    }
  },
  created() {

    this.listQuery.room_id = Number(this.$route.query.room_id)
    this.listQuery.room_sub_id = Number(this.$route.query.room_sub_id)

    this.getList()
  },
  methods: {
    get_type(type){
      this.sel_name=[]
      this.temp.name=''
      if(type==1){
        this.sel_name=this.dzds_zidian
      }else if(type==2){
        this.sel_name=this.number_zidian
      }else if(type==3){
        this.sel_name=this.teshu_zidian
      }
    },
    handleBack() {
      this.$router.push({
        path: "/room/zi_roomlist", query: {id:this.listQuery.room_id}
      })
    },
    get_img(file, fileList) {
      let formData = new FormData();
      formData.append("file", fileList[0].raw);
      upload_img(formData, '图片', this.img_id).then(response => {
        if (response.code == 200) {
          this.$message({
            message: '上传成功',
            type: 'success'
          })
          this.zhengjian.card_img = response.data
          this.img_id = response.data

          this.card_img = file.url


        }
        //this.handleRemoveimg(1,file)

      }).catch(err => {
        console.log(err)
      })
    },
    getList() {
      this.listLoading = true
      fetchpeilvlist(this.listQuery).then(response => {

        if (response.code == 200) {
          this.list = response.data.data
          this.total = response.data.total
        }
        // Just to simulate the time of the request

        this.listLoading = false

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
        type_id: '',
        name: '',
        multiple: '',
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
          this.temp.room_id = this.listQuery.room_id
          this.temp.room_sub_id = this.listQuery.room_sub_id
          addpeilv(this.temp).then((res) => {
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
      this.temp = Object.assign({}, row) // copy obj

      if(this.temp.type_id==1){
        this.sel_name=this.dzds_zidian
      }else if(this.temp.type_id==2){
        this.sel_name=this.number_zidian
      }else if(this.temp.type_id==3){
        this.sel_name=this.teshu_zidian
      }

      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    del_row(del_id) {
      this.$confirm("确定要删除该数据记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delpeilv({ id: del_id })
            .then((response) => {
              if (response.code == 200) {
                this.$message({
                  message: "删除成功",
                  type: "success",
                });
              }
              this.getList();
            })
            .catch((err) => { });
        })
        .catch(() => { });
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.room_id = this.listQuery.room_id
          this.temp.room_sub_id = this.listQuery.room_sub_id
          const tempData = Object.assign({}, this.temp)

          addpeilv(tempData).then((response) => {
            if (response.code == 200) {
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
  