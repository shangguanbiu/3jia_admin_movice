<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t("table.add") }}
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%"
      @sort-change="sortChange" @selection-change="handleSelection" :default-sort = "{prop: 'create_time', order: 'descending'}">
      <el-table-column label="所属类别" prop="type">
        <template slot-scope="scope">
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.type_id == 1">支付宝</span>
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.type_id == 2">微信</span>
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.type_id == 3">银行卡</span>
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.type_id == 4">USDT</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="title"> </el-table-column>
      <el-table-column label="收款账号" prop="account_number">
      </el-table-column>
      <el-table-column label="最低充值金额" prop="min_amount">
      </el-table-column>
      <el-table-column label="最高充值金额" prop="max_amount">
      </el-table-column>
      <el-table-column label="缩略图" prop="money">
        <template slot-scope="scope">
          <el-image style="width: 50px; height: 50px" @click="see_img(scope.row.img)" :src="scope.row.img" fit="cover"
            lazy>
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline" style="font-size: 330%"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>

      <el-table-column label="状态" prop="statue">
        <template slot-scope="scope">
          <span style="color: #53d6c4; cursor: pointer" v-if="scope.row.status == 1">启用</span>
          <span style="color: #ff643a; cursor: pointer" v-else>禁用</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="120" prop="remark">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.remark">
            <span v-if="scope.row.remark ? scope.row.remark.length > 5 : false">
              {{ scope.row.remark.slice(0, 4) }}...
            </span>
            <span v-else> {{ scope.row.remark }} </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="120" prop="create_time">
      </el-table-column>
      <el-table-column label="操作" prop="statue">
        <template slot-scope="scope">
          <span style="color: #ff643a; cursor: pointer" @click="del_row(scope.row.id)">删除</span>
          |
          <span style="color: #1890ff; cursor: pointer" @click="edit_row(scope.row)">编辑</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px"
        style="width: 100%; margin-left: 50px">
        <div style="width: 500px;">
          <el-form-item label="所属类别" prop="type_id">
            <el-select v-model="temp.type_id" style="width: 100%" class="filter-item" placeholder="请选择所属类别">
              <el-option label="支付宝" :value="1" />
              <el-option label="微信" :value="2" />
              <el-option label="银行卡" :value="3" />
              <el-option label="USDT" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="名称" prop="title">
            <el-input v-model="temp.title" />
          </el-form-item>
          <el-form-item label="收款账号" prop="account_number">
            <el-input v-model="temp.account_number" />
          </el-form-item>
          <el-form-item label="最低充值金额" prop="min_amount">
            <el-input v-model="temp.min_amount" type="number" />
          </el-form-item>
          <el-form-item label="最高充值金额" prop="max_amount">
            <el-input v-model="temp.max_amount" type="number" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio v-model="temp.status" :label="1">启用</el-radio>
            <el-radio v-model="temp.status" :label="0">禁用</el-radio>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="temp.remark" type="textarea" placeholder="请输入内容" maxlength="30" show-word-limit />
          </el-form-item>
        </div>
        <el-form-item label="图片">
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
    <el-dialog title="图片详情" :visible.sync="see_img_dialog" center>
      <el-image :src="dialog_img"> </el-image>
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
import { fetchpaylist, addpaylist, delpaylist } from "@/api/room_sys";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 1, display_name: "美元/人民币" },
  { key: 2, display_name: "欧元/美元" },
  { key: 3, display_name: "英镑/美元" },
  { key: 4, display_name: "美元日元" },
];

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  name: "ComplexTable",
  components: { Pagination },
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
      isedit: false,
      disabled: false,
      card_img: '',
      dialogImageUrl: '',
      dialogVisible: false,
      tableKey: 0,
      dialog_img: "",
      see_img_dialog: false,
      tableKey: 0,
      dialog_img: "",
      see_img_dialog: false,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
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
        title: "",
        type_id: "",
        account_number: "",
        min_amount: 0,
        max_amount: 0,
        remark: "",
        status: 1,
        img: '',
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
        title: [{ required: true, message: "请输入标题", trigger: "change" }],
        type_id: [{ required: true, message: "请选择类型", trigger: "change" }],
        account_number: [
          { required: true, message: "请输入收款账号/地址", trigger: "change" },
        ],
        min_amount: [
          { required: true, message: "请输入最低充值金额", trigger: "change" },
        ],
        max_amount: [
          { required: true, message: "请输入最高充值金额", trigger: "change" },
        ],
      },
      downloadLoading: false,
      multipleSelection: [],
      if_sel_img: false,
      fileList: [
        {
          name: "food2.jpeg",
          url: "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100",
        },
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleSelection(val) {
      this.multipleSelection = val;
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
      this.dialog_img = url;
    },
    getList() {
      this.listLoading = true;
      fetchpaylist(this.listQuery).then((response) => {
        if (response.code == 200) {
          this.list = response.data.list;
          this.total = response.data.total;
        }
        this.listLoading = false;

        // Just to simulate the time of the request
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
        id: undefined,
        title: "",
        type_id: "",
        account_number: "",
        min_amount: 0,
        max_amount: 0,
        remark: "",
        status: 1,
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
          if (this.if_sel_img == true) {
            formData.append("img", this.temp.img);
          } else {
            formData.append("img", '');
          }
          formData.append("title", this.temp.title);
          formData.append("type_id", this.temp.type_id);
          formData.append("account_number", this.temp.account_number);
          formData.append("min_amount", Number(this.temp.min_amount));
          formData.append("max_amount", Number(this.temp.max_amount));
          formData.append("remark", this.temp.remark);

          formData.append("status", this.temp.status);

          addpaylist(formData).then((res) => {
            if (res.code == 200) {
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000,
              });
            }
            this.$refs.fileupload1.clearFiles();
            this.if_sel_img = false
            this.dialogFormVisible = false;
            this.getList();
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.temp.min_amount = Number(this.temp.min_amount);
      this.temp.max_amount = Number(this.temp.max_amount);
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
          const tempData = Object.assign({}, this.temp);
          let formData = new FormData();
          if (this.if_sel_img == true) {
            formData.append("img", this.temp.img);
          } else {
            formData.append("img", '');
          }
          formData.append("id", this.temp.id);
          formData.append("title", this.temp.title);
          formData.append("type_id", this.temp.type_id);
          formData.append("account_number", this.temp.account_number);
          formData.append("min_amount", Number(this.temp.min_amount));
          formData.append("max_amount", Number(this.temp.max_amount));
          formData.append("remark", this.temp.remark);
          formData.append("img", this.temp.img);
          formData.append("status", this.temp.status);

          addpaylist(formData).then((res) => {
            if (res.code == 200) {
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000,
              });
            }
            this.$refs.fileupload1.clearFiles();
            this.if_sel_img = false
            this.dialogFormVisible = false
            this.getList()
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
    del_row(del_id) {
      this.$confirm("确定要删除该数据记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delpaylist({ id: del_id })
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
      this.isedit = true
      this.card_img = edit_data.img;
      this.temp.id = edit_data.id;
      this.temp.title = edit_data.title;
      this.temp.type_id = edit_data.type_id;
      this.temp.account_number = edit_data.account_number;
      this.temp.min_amount = edit_data.min_amount;
      this.temp.max_amount = edit_data.max_amount;
      this.temp.remark = edit_data.remark;
      this.temp.status = edit_data.status;

      this.dialogFormVisible = true;
    },
  },
};
</script>
<style></style>
