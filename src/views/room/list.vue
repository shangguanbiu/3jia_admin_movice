<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="请输入关键字" style="width: 200px; margin-right: 10px;"
        class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.type_id" placeholder="请选择分类" class="filter-item">
        <el-option label="全部" :value="null"></el-option>
        <el-option v-for="(item, iten_index) in type_list" :key="iten_index" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px;" icon="el-icon-search"
        @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>

      <el-button class="filter-item" style=" float: right;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>
    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column label="所属分类">
        <template slot-scope="scope">
          {{ scope.row.type_name }}
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="name">
      </el-table-column>
      <el-table-column label="是否启用">
        <template slot-scope="scope">
          <span style="color:#53d6c4;  cursor: pointer;" v-if="scope.row.status == 1">启用</span>
          <span style="color:#ff643a; cursor: pointer;" v-else>禁用</span>
        </template>
      </el-table-column>

      <el-table-column label="url地址" max-width="240">
        <template slot-scope="scope">
          {{ scope.row.url }}
        </template>
      </el-table-column>
      <el-table-column label="访问量" max-width="240">
        <template slot-scope="scope">
          {{ scope.row.view_count }}
        </template>
      </el-table-column>
      <el-table-column label="所属标签">
        <template slot-scope="scope">
          <span v-for="(tagsitem, ti) in scope.row.tags" :key="ti">
            <span v-if="tagsitem == 1"
              style="background:#53d6c4;color:#fff; padding: 3px; margin: 0 5px; cursor: pointer;">今日推荐</span>
            <span v-if="tagsitem == 2"
              style="background:#ff643a;color:#fff; padding: 3px;margin: 0 5px;cursor: pointer;">热门</span>
          </span>

        </template>
      </el-table-column>
      <el-table-column label="热门标签">
        <template slot-scope="scope">

          {{ scope.row.hot_tags }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="玩法说明" min-width="140" prop="content">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.remark">
            <span v-if="scope.row.remark ? scope.row.remark.length > 5 : false"> {{
              scope.row.remark.slice(0, 4)
            }}... </span>
            <span v-else> {{ scope.row.remark }} </span>
          </el-tooltip>
        </template>
      </el-table-column> -->
      <el-table-column label="缩略图">
        <template slot-scope="scope">

          <el-image style="width: 50px; height: 50px" @click="see_img(scope.row.img)" :src="scope.row.img" fit="cover"
            lazy>
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" style="font-size:330%"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="150" align="center" prop="create_time">
      </el-table-column>
      <el-table-column label="操作" width="250">
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
        style="width: 100%; margin-left:50px;">
        <div style="width: 500px;">
          <!-- <el-form-item label="代码" prop="code">
            <el-input v-model="temp.code" />
          </el-form-item> -->
          <el-form-item label="所属分类">
            <el-select v-model="temp.type_id" style="width: 100%;" placeholder="请选择分类" class="filter-item">

              <el-option v-for="(item, iten_index) in type_list" :key="iten_index" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="电影名称" prop="name">
            <el-input v-model="temp.name" />
          </el-form-item>
          <el-form-item label="简短描述">
            <el-input v-model="temp.desc" />
          </el-form-item>
          <el-form-item label="访问量" prop="view_count">
            <el-input v-model="temp.view_count" type="number" />
          </el-form-item>

          <el-form-item label="所属标签">
            <el-checkbox-group v-model="temp.tags">
              <el-checkbox label="1">今日推荐</el-checkbox>
              <el-checkbox label="2">热门</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="热门标签">
            <el-input v-model="temp.hot_tags" />
            <span>标签填写格式文字加英文逗号隔开如：好看,大片,好莱坞</span>
          </el-form-item>
          <!--<el-form-item label="最高下注" prop="max_amount">
            <el-input v-model="temp.max_amount" type="number" />
          </el-form-item><el-form-item label="入房最低金额" prop="limit_user_amount">
            <el-input v-model="temp.limit_user_amount" type="number" />
          </el-form-item> -->
          <el-form-item label="是否启用">
            <el-radio v-model="temp.status" :label="1">启用</el-radio>
            <el-radio v-model="temp.status" :label="0">禁用</el-radio>
          </el-form-item>
          <!-- <el-form-item label="交易说明">
            <el-input v-model="temp.remark" type="textarea" placeholder="请输入内容" />
          </el-form-item> -->
          <el-form-item label="url地址" prop="url">
            <el-input v-model="temp.url" />
          </el-form-item>
        </div>

        <el-form-item label="缩略图">
          <el-upload action="#" list-type="picture-card" :on-change="get_img" :limit="1" ref="fileupload1"
            :auto-upload="false" style="margin-bottom:20px;width: 100%;">
            <ul class="el-upload-list el-upload-list--picture-card" v-show="isedit">
              <li tabindex="0" class="el-upload-list__item is-ready">
                <div><img :src="card_img" alt="" class="el-upload-list__item-thumbnail">
                  <span class="el-upload-list__item-actions"><span class="el-upload-list__item-preview"><i
                        class="el-icon-plus" @click="isedit = false"></i></span></span>
                </div>
              </li>
            </ul>
            <i slot="default" class="el-icon-plus" v-show="!isedit"></i>
            <div slot="file" slot-scope="{file}" v-show="!isedit">
              <img class="el-upload-list__item-thumbnail" :src="card_img" alt="" />
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(1, file)">
                  <i class="el-icon-zoom-in"></i>
                </span>
                <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemoveimg(1, file)">
                  <i class="el-icon-delete"></i>
                </span>
              </span>
            </div>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible" z-index="999">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
        <div style="width: 70%;">
          <el-form-item label="电影简介">
            <!-- <el-input v-model="temp.remark" type="textarea" placeholder="请输入内容" /> -->
            <wang-editor v-model="temp.content" />
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
    <el-dialog title="图片详情" :visible.sync="see_img_dialog" center>
      <el-image :src="dialog_img">
      </el-image>
    </el-dialog>
  </div>
</template>
  
<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import { fetchxiaoroomlist, addxiaoroom, delxiaoroom, build_jiangqi, fetchbigroomlist, movice_list, movice_type, movice_list_edit, movice_list_del } from '@/api/room_sys'
import WangEditor from '@/components/WangEditor'
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
  components: { Pagination, WangEditor },
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
      checkList: [1],
      options: [],
      type_val: '',
      isedit: false,
      disabled: false,
      card_img: '',
      dialogImageUrl: '',
      dialogVisible: false,
      tableKey: 0,
      dialog_img: "",
      see_img_dialog: false,
      dialog_img: '',
      see_img_dialog: false,
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
        name: null,
        type_id: null

      },
      type_list: [],
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],

      showReviewer: false,
      temp: {
        id: undefined,
        type_id: '',
        name: '',
        desc: '',
        view_count: '',
        tags: ['1'],
        hot_tags: '',
        url: '',
        status: 1,
        content: '',
        img: ''

      },
      id: '',
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      if_sel_img: false,
      dialogPvVisible: false,
      isedit: false,
      card_img: '',
      pvData: [],
      rules: {

        name: [{ required: true, message: '请输入名称', trigger: 'change' }],
        url: [{ required: true, message: '请输入url地址', trigger: 'change' }],
        view_count: [{ required: true, message: '请输入访问量', trigger: 'change' }],
      },
      downloadLoading: false
    }
  },
  created() {


    this.get_type_List()
  },
  methods: {
    formatNum(value) {
      if (!value && value !== 0) return 0;
      let str = value.toString();
      let reg =
        str.indexOf(".") > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
      return str.replace(reg, "$1,");
    },
    handleBack() {
      this.$router.push({
        path: "/room/index", query: {}
      })
    },
    get_img(file, fileList) {
      this.if_sel_img = true
      this.temp.img = file.raw
      this.card_img = file.url
      //this.fileList.push({ name: file.name, url: file.url })
      //   let formData = new FormData();
      //  formData.append("file", file.raw);

    },
    handleRemoveimg(type, file) {
      this.temp.img = ''
      let uploadFiles
      if (type == 1) {
        uploadFiles = this.$refs['fileupload1'].uploadFiles;
      } else if (type == 2) {
        uploadFiles = this.$refs['fileupload2'].uploadFiles;
      } else if (type == 3) {
        uploadFiles = this.$refs['fileupload3'].uploadFiles;
      } else if (type == 4) {
        uploadFiles = this.$refs['fileupload4'].uploadFiles;
      }
      let index = uploadFiles.indexOf(file);
      uploadFiles.splice(index, 1);
    },
    handlePictureCardPreview(type, file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    see_img(url) {
      this.see_img_dialog = true;
      this.dialog_img = url
    },
    get_type_List() {
      this.listLoading = true;
      var listQuery = {
        page: 1
      }
      movice_type(listQuery).then((response) => {
        if (response.code == 200) {
          this.type_list = response.data.list;
          this.getList()

        }
        this.listLoading = false;
      });
    },
    getList() {
      this.listLoading = true
      movice_list(this.listQuery).then(response => {
        if (response.code == 200) {
          this.list = response.data.list
          this.total = response.data.total

          for (var i = 0; i < this.list.length; i++) {
            for (var k = 0; k < this.type_list.length; k++) {
              if (this.list[i].type_id == this.type_list[k].id) {
                this.$set(this.list[i], 'type_name', this.type_list[k].name)

              } 
            }
          }

          //type_list
        }
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.pagesize = 1
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
        id: null,
        type_id: '',
        name: '',
        desc: '',
        tags: ['1'],
        hot_tags: '好看,',
        url: '',
        status: 1,
        content: ''
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

          let formData = new FormData();
          if (this.if_sel_img == true) {
            formData.append("img", this.temp.img);
          } else {
            formData.append("img", '');
          }
          formData.append("type_id", this.temp.type_id);
          formData.append("name", this.temp.name);
          formData.append("desc", this.temp.desc);
          formData.append("view_count", this.temp.view_count);
          formData.append("hot_tags", this.temp.hot_tags);

          formData.append("tags", this.temp.tags);
          formData.append("status", this.temp.status);
          formData.append("url", this.temp.url);
          formData.append("content", this.temp.content);

          movice_list_edit(formData).then((res) => {
            if (res.code == 200) {
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            }
            this.resetTemp()
            this.$refs.fileupload1.clearFiles();
            
            this.isedit = true
            this.if_sel_img = false
            this.dialogFormVisible = false
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      console.log('dddddd',this.temp)
      this.isedit = true
      this.card_img = row.img;
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.temp.tags = row.tags.split(',')
      this.temp.content = this.$utils.unescape(row.content);
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
          movice_list_del({ id: del_id })
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
    build_jiangqi(sub_id) {
      build_jiangqi({ room_id: this.temp.room_id, room_sub_id: sub_id })
        .then((response) => {
          if (response.code == 200) {
            this.$message({
              message: "生成成功",
              type: "success",
            });
          }
          this.getList();
        })
        .catch((err) => { });
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.type_id = this.temp.type_id
          const tempData = Object.assign({}, this.temp)

          let formData = new FormData();
          if (this.if_sel_img == true) {
            formData.append("img", this.temp.img);
          } else {
            formData.append("img", '');
          }
          formData.append("id", this.temp.id);
          formData.append("type_id", this.temp.type_id);

          formData.append("name", this.temp.name);
          formData.append("desc", this.temp.desc);
          formData.append("view_count", this.temp.view_count);
          formData.append("tags", this.temp.tags);
          formData.append("hot_tags", this.temp.hot_tags);
          formData.append("status", this.temp.status);
          formData.append("url", this.temp.url);
          formData.append("content", this.temp.content);

          movice_list_edit(formData).then((res) => {
            if (res.code == 200) {
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            }
            this.isedit = true
            this.resetTemp()
            this.$refs.fileupload1.clearFiles();
            this.if_sel_img = false
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
    room_peilv(data) {

      this.$router.push({
        path: "/room/peilvlist", query: { room_id: data.pid, room_sub_id: data.id }
      })
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
  