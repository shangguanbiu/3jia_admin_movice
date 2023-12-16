<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t("table.add") }}
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%"
      @sort-change="sortChange">
      <el-table-column label="分类名称" min-width="120" prop="name">
      </el-table-column>
      <el-table-column label="是否启用" min-width="80" prop="statue">
        <template slot-scope="scope">
          <span style="color: #53d6c4; cursor: pointer" v-if="scope.row.status == 1">启用</span>
          <span style="color: #ff643a; cursor: pointer" v-else>禁用</span>
        </template>
      </el-table-column> 
      <el-table-column label="记录条数" min-width="120" prop="count">
      </el-table-column>
      
      <el-table-column label="创建时间" min-width="130" prop="create_time">
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <span style="color: #ff643a; cursor: pointer" @click="del_row(scope.row.id)">删除</span>
          |
          <span style="color: #3e3ef7; cursor: pointer" @click="handleUpdate(scope.row)">编辑</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px"
        style="width: 100%; margin-left: 50px">
        <div style="width: 500px;">
          <el-form-item label="编号" prop="code">
            <el-input v-model="temp.code" />
          </el-form-item>
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="temp.name" />
          </el-form-item>
          <!-- <el-form-item label="分类名称2">
            <el-input v-model="temp.name_2" />
          </el-form-item>
          <el-form-item label="分类名称3">
            <el-input v-model="temp.name_3" />
          </el-form-item> -->
          <el-form-item label="是否启用">
            <el-radio v-model="temp.status" :label="1">启用</el-radio>
            <el-radio v-model="temp.status" :label="0">禁用</el-radio>
          </el-form-item>

        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t("table.cancel") }}
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          {{ $t("table.confirm") }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{
          $t("table.confirm")
        }}</el-button>
      </span>
    </el-dialog>
    <el-dialog title="图片详情" :visible.sync="see_img_dialog" center>
      <el-image :src="dialog_img"> </el-image>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchPv
} from "@/api/article";
import { fetchbigroomlist, addbigroom, delbigroom,movice_type,movice_type_edit,movice_type_del } from "@/api/room_sys";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import WangEditor from '@/components/WangEditor'
const calendarTypeOptions = [
  { key: 1, code: "VIP1", display_name: "大房间1", img: "" },
  { key: 2, code: 10002, display_name: "欧元/美元" },
  { key: 3, code: 10003, display_name: "英镑/美元" },
  { key: 4, code: 10004, display_name: "美元日元" },
];

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  name: "ComplexTable",
  components: { Pagination,WangEditor },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger",
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    },
  },
  data() {
    return {
      
      disabled: false,
      card_img: '',
      isedit2: false,
      disabled2: false,
      card_img2: '',

     
      disabled2: false,
     

      dialogImageUrl: '',
      dialogVisible: false,
      tableKey: 0,
      dialog_img: "",
      see_img_dialog: false,
      dialog_img: "",
      see_img_dialog: false,
      tableKey: 0,
      list: [],
      isedit: false,
      card_img: "",
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        pagesize: 10
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],
      if_sel_img: false,
      if_sel_img2: false,
      showReviewer: false,
      temp: {
        id: undefined,
        code: "",
        name: "",
        name_2: '',
        name_3: '',
        status: 0,
        
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        code: [
          { required: true, message: "请输入房间代码", trigger: "change" },
        ],
        name: [
          {

            required: true,
            message: "请输入房间名称",
            trigger: "change",
          },
        ],
        member_level_limit: [
          {
            required: true,
            message: "请输入选择进入房间最低等级",
            trigger: "change",
          },
        ],
      },
      downloadLoading: false,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    get_img(file, fileList) {
      this.if_sel_img = true
      this.temp.img = file.raw
      this.card_img = file.url
      //this.fileList.push({ name: file.name, url: file.url })
      //   let formData = new FormData();
      //  formData.append("file", file.raw);

    },
    get_img2(file, fileList) {
      this.if_sel_img2 = true
      this.temp.big_img = file.raw
      this.card_img2 = file.url
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
      this.dialog_img = url;
    },
    getList() {
      this.listLoading = true;
      movice_type(this.listQuery).then((response) => {
        if (response.code == 200) {
          this.list = response.data.list;
          this.total = response.data.total;
        }
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.listQuery.pagesize = 10;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作成功",
        type: "success",
      });
      row.status = status;
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        id:null,

        code: "",
        name: "",
        name_2: '',
        name_3: '',
        status: 0,
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          let formData = new FormData();
          
          formData.append("code", this.temp.code);
          formData.append("name", this.temp.name);
          formData.append("name_2", this.temp.name);
          formData.append("name_3", this.temp.name);
          formData.append("status", this.temp.status);
          

          movice_type_edit(formData).then((res) => {
            this.dialogFormVisible = false;
            if (res.code == 200) {
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 1000,
              });
            }
           
            this.getList();
          });
        }
      });
    },
    room_zi(data) {
      this.$router.push({
        path: "/room/zi_roomlist",
        query: { id: data.row.id },
      });
    },
    del_row(del_id) {
      this.$confirm("确定要删除该数据记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          movice_type_del({ id: del_id })
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
    handleUpdate(row) {
      // this.temp = Object.assign({}, row); // copy obj
      // this.temp.member_level_limit=Number( this.temp.member_level_limit)
      this.isedit = true
      this.isedit2 = true
      this.card_img = row.img;
      this.card_img2 = row.big_img;

      this.temp.id = row.id
      this.temp.code = row.code
      this.temp.name = row.name
      this.temp.name_2 = row.name
      this.temp.name_3 = row.name
     
      this.temp.status = row.status
     
      
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          let formData = new FormData();
          
          
          formData.append("id", this.temp.id);
          formData.append("code", this.temp.code);
          formData.append("name", this.temp.name);
          formData.append("name_2", this.temp.name_2);
          formData.append("name_3", this.temp.name_3);
          formData.append("status", this.temp.status);
          

          movice_type_edit(formData).then((res) => {

            this.dialogFormVisible = false;
            if (res.code == 200) {
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000,
              });
            }
            this.getList()
            
            this.if_sel_img = false
            
          });
        }
      });
    },
    handleDelete(row, index) {
      this.$notify({
        title: "成功",
        message: "删除成功",
        type: "success",
        duration: 2000,
      });
      this.list.splice(index, 1);
    },
    handleFetchPv(pv) {
      fetchPv(pv).then((response) => {
        this.pvData = response.data.pvData;
        this.dialogPvVisible = true;
      });
    },
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["timestamp", "title", "type", "importance", "status"];
        const filterVal = [
          "timestamp",
          "title",
          "type",
          "importance",
          "status",
        ];
        const data = this.formatJson(filterVal);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "table-list",
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending";
    },
  },
};
</script>
