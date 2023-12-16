<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-button class="filter-item" style="margin-left: 10px;" icon="el-icon-back" @click="handleBack">
        返回
      </el-button> -->
      <!-- <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button> -->

      <el-select v-model="listQuery.room_id" @change="getxiaoroom(listQuery.room_id)" placeholder="选择大房间"
        class="filter-item" style="width: 130px; margin-left: 10px">
        <el-option :label="roomitem.name" :value="roomitem.id" v-for="(roomitem, indexrm) in room_list"
          :key="'r' + indexrm" />
      </el-select>
      <el-select v-model="listQuery.room_sub_id" placeholder="选择小房间" class="filter-item"
        style="width: 130px; margin-left: 10px">
        <el-option :label="xroomitem.name" :value="xroomitem.id" v-for="(xroomitem, indexrmx) in xiaoroom_list"
          :key="'x' + indexrmx" />
      </el-select>
      <el-date-picker v-model="listQuery.time" type="date" :picker-options="pickerOptions" :clearable="false"
        class="filter-item" style="margin-left: 10px" placeholder="请选择开奖日期" />
      <el-select v-model="listQuery.open_no" placeholder="选择期数" class="filter-item"
        style="width: 150px; margin-left: 10px">
        <el-option label="全部" value="" />
        <el-option :label="qishuitem" :value="qishuitem" v-for="(qishuitem, indexq) in qishu_list" :key="'q' + indexq" />
      </el-select>
      <el-select v-model="listQuery.is_open" placeholder="选择状态" class="filter-item"
        style="width: 130px; margin-left: 10px">
        <el-option label="已开奖" :value="1" />
        <el-option label="未开奖" :value="0" />
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
      </el-button>
    </div>
    <div></div>
    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%"
      @sort-change="sortChange">
      <el-table-column label="所属期数" min-width="120">
        <template slot-scope="scope">
          {{ scope.row.open_no }}
        </template>
      </el-table-column>
      <el-table-column label="所属大房间" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.room_name }}
        </template>
      </el-table-column>
      <el-table-column label="所属小房间" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.sub_room_name }}
        </template>
      </el-table-column>
      <el-table-column label="开奖数字" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.number }}
        </template>
      </el-table-column>
      <el-table-column label="总和">
        <template slot-scope="scope">
          {{ scope.row.number_sum }}
        </template>
      </el-table-column>
      <el-table-column label="大小单双">
        <template slot-scope="scope">

          <span v-if="scope.row.number_sum < 13 || scope.row.number_sum == 13" style="color: #ff643a;padding-right:10px">小</span>
          <span v-if="scope.row.number_sum > 14 || scope.row.number_sum == 14" style="color: #53d6c4;padding-right:10px">大</span>
          <span v-if="scope.row.number_sum % 2 === 1" style="color: #ff643a;">单</span>
          <span v-if="scope.row.number_sum % 2 === 0" style="color: #53d6c4">双</span>
        </template>
      </el-table-column>
      <el-table-column label="是否开奖">
        <template slot-scope="scope">
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.is_open == 1">已开奖</span>
          <span style="color: #53d6c4; cursor: pointer" v-else>未开奖</span>
        </template>
      </el-table-column>
      <el-table-column label="开奖时间" min-width="130">
        <template slot-scope="scope">
          {{ scope.row.open_time }}
        </template>
      </el-table-column>

      <el-table-column label="创建时间" min-width="130" prop="create_time">
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <span style="color: #3e3ef7; cursor: pointer" v-if="scope.row.is_open == 0"
            @click="handleUpdate(scope.row)">编辑</span>
          <span style="color: #97a8be" v-else>编辑</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px"
        style="width: 400px; margin-left: 50px">
        <el-form-item label="所属大房间">
          <el-input v-model="temp.room_name" readonly />
        </el-form-item>
        <el-form-item label="所属小房间">
          <el-input v-model="temp.room_sub_name" readonly />
        </el-form-item>
        <el-form-item label="第一个数">
          <el-input v-model="temp.num1" @input="changes(1,temp.num1)"  type="number" />
        </el-form-item>
        <el-form-item label="第二个数">
          <el-input v-model="temp.num2" @input="changes(2,temp.num2)" type="number" />
        </el-form-item>
        <el-form-item label="第三个数">
          <el-input v-model="temp.num3" @input="changes(3,temp.num3)" type="number" />
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

  </div>
</template>

<script>
import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle,
} from "@/api/article";
import {
  fetchjiangqilist,
  fetchbigroomlist,
  fetchxiaoroomlist,
  fetchqishu, editjiangqi
} from "@/api/room_sys";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

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
  watch: {
    "listQuery.time"(newVal, oldVal) {
      this.getqishu();
    },
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      xiaoroom_list: [],
      qishu_list: [],
      room_list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        pagesize: 10,
        room_id: null,
        room_sub_id: null,
        time:'',
        open_no: '',
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],

      showReviewer: false,
      form: {
        bigroom: "",
        smailroom: "",
        date: new Date(),
        qishu: "",
      },
      temp: {
        id: undefined,
        room_name: "",
        room_sub_name: "",
        num1: "",
        num2: "",
        num3: "",
      },
      id: "",
      max: 9,
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {

        num2: [
          { required: true, message: "请输入第二个数", trigger: "change" },
        ],
        num3: [
          { required: true, message: "请输入第三个数", trigger: "change" },
        ],
        num1: [{ required: true, message: "请输入第一个数", trigger: "change" }],
      },
      downloadLoading: false,
      pickerOptions: {
        disabledDate: (time) => {
          if (time.getTime() > Date.now()) {
            return true;
          }
        },
      },
    };
  },
  watch: {
    'listQuery.time'(newVal, oldVal) {
      this.getqishu()
    }
  },
  created() {
    this.id = this.$route.query.id;
    this.getList();
    this.getbigroom();
  },
  methods: {
    changes(type, value) {
      if (type == 1) {
        if (value > this.max) {
          this.temp.num1 = this.max
        }
      }else if(type == 2){
        if (value > this.max) {
          this.temp.num2 = this.max
        }
      }else{
        if (value > this.max) {
          this.temp.num3 = this.max
        }
      }

    },
    handleBack() {
      this.$router.push({
        path: "/room/index",
        query: {},
      });
    },
    get_img(file, fileList) {
      let formData = new FormData();
      formData.append("file", fileList[0].raw);
      upload_img(formData, "图片", this.img_id)
        .then((response) => {
          if (response.code == 200) {
            this.$message({
              message: "上传成功",
              type: "success",
            });
            this.zhengjian.card_img = response.data;
            this.img_id = response.data;

            this.card_img = file.url;
          }
          //this.handleRemoveimg(1,file)
        })
        .catch((err) => {
          console.log(err);
        });
    },
    formatDate(type, data) {
      const d = new Date(data);
      const b = new Date();
      if (type == "m") {
        return (
          d.getFullYear() +
          "-" +
          this.p(d.getMonth() + 1) +
          "-" +
          this.p(d.getDate())
        );
      } else if (type == "m2") {
        return d.getFullYear() + "-" + this.p(d.getMonth() + 1);
      }
      {
        return d.getFullYear();
      }

      // return d.getFullYear() + '-' + this.p((d.getMonth() + 1)) + '-' + this.p(d.getDate())
    },
    p(s) {
      return s < 10 ? '0' + s : s
    },
    getbigroom() {
      fetchbigroomlist(this.listQuery).then((response) => {
        if (response.code == 200) {
          this.room_list = response.data.list;
        }
      });
    },
    getxiaoroom(id) {
      fetchxiaoroomlist({ page: 1, pagesize: 10, pid: id }).then((response) => {
        if (response.code == 200) {
          this.xiaoroom_list = response.data.list;
        }
      });
    },
    getqishu() {
      var param = {
        room_id: "",
        room_sub_id: "",
        time: "",
      };
      param.room_id = this.listQuery.room_id;
      param.room_sub_id = this.listQuery.room_sub_id;
      param.time =
        this.listQuery.time !== ""
          ? this.formatDate("m", this.listQuery.time)
          : "";
      fetchqishu(param).then((response) => {
        if (response.code == 200) {
          this.qishu_list = response.data;
        }
      });
    },
    getList() {
      this.listLoading = true;
      this.listQuery.time =
        this.listQuery.time !== ""
          ? this.formatDate("m", this.listQuery.time)
          : "";

      fetchjiangqilist(this.listQuery).then((response) => {
        if (response.code == 200) {
          this.list = response.data.data;
          this.total = response.data.total;
        }
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.listQuery.pagesize = 10;
      this.listQuery.time =
        this.listQuery.time !== ""
          ? this.formatDate("m", this.listQuery.time)
          : "";
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
        code: "",
        name: "",
        isOpen: true,
        img: "",
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
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "创建成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleUpdate(row) {
      // this.temp = Object.assign({}, row); // copy obj
      var numberlist = row.number.split(",");
      this.temp.room_name = row.room_name;
      this.temp.room_sub_name = row.sub_room_name;
      this.temp.num1 = Number(numberlist[0])
      this.temp.num2 = Number(numberlist[1])
      this.temp.num3 = Number(numberlist[2])
      this.temp.id = row.id

      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      // this.$nextTick(() => {
      //   this.$refs["dataForm"].clearValidate();
      // });
    },
    updateData() {
      this.temp.num1 = Number(this.temp.num1)
      this.temp.num2 = Number(this.temp.num2)
      this.temp.num3 = Number(this.temp.num3)
      const tempData = Object.assign({}, this.temp);

      editjiangqi(tempData).then((res) => {
        if (res.code == 200) {
          this.$notify({
            title: "成功",
            message: "更新成功",
            type: "success",
            duration: 2000,
          });
        }

        this.dialogFormVisible = false;
        this.getList();
      });
      return;
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {

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
