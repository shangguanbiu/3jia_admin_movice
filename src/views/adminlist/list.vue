<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.account" placeholder="请输入关键字,昵称、用户名" style="width: 200px" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px" icon="el-icon-search"
        @click="handleFilter">
        {{ $t("table.search") }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t("table.add") }}
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%"
      @sort-change="sortChange" @selection-change="handleSelection">
      <el-table-column label="用户名" min-width="120" prop="title">
        <template slot-scope="scope">
          {{ scope.row.account }}
        </template>
      </el-table-column>
      <el-table-column label="昵称" min-width="120" prop="title">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column label="所属类别" prop="type">
        <template slot-scope="scope">
          
          <span v-if="Number(scope.row.role_id)==1">超级管理员</span>
          <span v-if="Number(scope.row.role_id)==2">编辑人员</span>
          <span v-if="Number(scope.row.role_id)==3">运营(代理商)人员</span>
        </template>
      </el-table-column>

      <el-table-column label="上一次登陆ip" min-width="120" prop="title">
        <template slot-scope="scope">
          {{ scope.row.last_login_ip }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status">
        <template slot-scope="scope">
          <span style="color: #53d6c4; cursor: pointer" v-if="scope.row.status == 1">启用</span>
          <span style="color: #ff643a; cursor: pointer" v-else>禁用</span>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" min-width="130" prop="create_time">
      </el-table-column>
      <el-table-column label="操作" prop="statue">
        <template slot-scope="scope">
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.role_id!=='1'" @click="del_row(scope.row.id)">删除  |</span>
         
          <span style="color: #1890ff; cursor: pointer" @click="edit_row(scope.row)">编辑</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px">
        <div style="width: 400px; margin-left: 50px">
          <el-form-item label="用户名" prop="account">
            <el-input v-model="temp.account" :readonly="ifedit" />
            <span v-show="ifedit" style="color: #ff643a;">用户名不可更改</span>
          </el-form-item>

          <el-form-item label="登陆密码" v-if="!ifedit" prop="newpassword">
            <el-input v-model="temp.newpassword" />
          </el-form-item>
          <el-form-item label="登陆密码" v-if="ifedit">
            <el-input v-model="temp.newpassword" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="temp.nickname" />
          </el-form-item>
          <el-form-item label="头像地址" >
            <el-input v-model="temp.msg" />
          </el-form-item>
          <el-form-item label="电话" >
            <el-input v-model="temp.msg" />
          </el-form-item>
          <el-form-item label="邮箱" >
            <el-input v-model="temp.msg" />
          </el-form-item>

          <el-form-item label="所属角色">
            <el-select v-model="temp.role_id" class="filter-item" style="width: 100%" placeholder="Please select">
              <el-option label="超级管理员" :value="1" />
              <el-option label="编辑人员" :value="2" />
              <el-option label="运营(代理商)人员" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
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
  </div>
</template>

<script>
import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle,
} from "@/api/article";
import { fetchadminlist, deladminlist, addadminlist } from "@/api/room_sys";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import Tinymce from "@/components/Tinymce";
const calendarTypeOptions = [];

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  name: "ComplexTable",
  components: { Pagination, Tinymce },
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
      tableKey: 0,
      ifedit: false,
      dialog_img: "",
      see_img_dialog: false,
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        pagesize: 10,
        account: null,
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],

      showReviewer: false,
      temp: {
        id: undefined,
        account: "",
        role_id: 3,
        status: 1,
        newpassword: "",
        msg:''
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
        account: [
          { required: true, message: "用户名名为必填项", trigger: "blur" },
        ],
        newpassword: [
          { required: true, message: "登陆密码为必填项", trigger: "blur" },
        ],
        nickname: [
          { required: true, message: "昵称为必填项", trigger: "blur" },
        ],
      },
      downloadLoading: false,
      multipleSelection: [],
      fileList: [
        {
          name: "food.jpeg",
          url: "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleFilter() {
      this.listQuery.page = 1;
      this.listQuery.pagesize = 10;

      this.getList();
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleSelection(val) {
      this.multipleSelection = val;
    },
    see_img(url) {
      this.see_img_dialog = true;
      this.dialog_img = url;
    },
    getList() {
      this.listLoading = true;
      fetchadminlist(this.listQuery).then((response) => {
        if (response.code == 200) {
          this.list = response.data.list;
          this.total = response.data.total;
        }
        this.listLoading = false;
        // Just to simulate the time of the request
      });
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

    resetTemp() {
      this.temp = {
        id: undefined,
        account: "",
        role_id: 3,
        status: 1,
        newpassword: "",
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
    del_row(del_id) {
      this.$confirm("确定要删除该数据记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deladminlist({ id: del_id })
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
    edit_row(edit_data) {
      this.dialogStatus = "update";
      this.ifedit = true
      this.temp.id = edit_data.id;
      this.temp.account = edit_data.account.trim();
      this.temp.nickname = edit_data.nickname;

      this.temp.role_id = Number(edit_data.role_id);
      this.temp.status = edit_data.status;

      this.dialogFormVisible = true;
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.temp.account = this.temp.account.trim();
          addadminlist(this.temp).then((res) => {

            this.dialogFormVisible = false;
            if (res.code == 200) {
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000,
              });
            }

            this.getList();
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.role_id=Number(row.role_id)
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.temp.newpassword2 = this.temp.newpassword;
          this.temp.account = this.temp.account.trim();
          const tempData = Object.assign({}, this.temp);

          addadminlist(tempData).then((res) => {
            this.dialogFormVisible = false;
            if (res.code == 200) {
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000,
              });
            }

            this.getList();
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
<style></style>
