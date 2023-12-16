<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyword" style="width: 260px; margin-right: 10px" class="filter-item"
        placeholder="输入关键字搜索，如:会员名,订单号" />
      <el-date-picker v-model="listQuery.time" type="date" :clearable="false" :picker-options="pickerOptions"
        class="filter-item" placeholder="选择投注日期" />

      <el-select v-model="listQuery.is_kill" placeholder="选择状态类型" class="filter-item"
        style="width: 130px; margin-left: 10px">
        <el-option label="已被杀" :value="1" />
        <el-option label="未被杀" :value="0" />
      </el-select>
      <el-select v-model="listQuery.is_win" placeholder="选择状态类型" class="filter-item"
        style="width: 130px; margin-left: 10px">
        <el-option label="中奖" :value="1" />
        <el-option label="未中奖" :value="0" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" style="margin-left: 10px" icon="el-icon-search"
        @click="handleFilter">
        {{ $t("table.search") }}
      </el-button>
    </div>

    <el-table :key="tableKey" v-loading="listLoading" :data="list" stripe fit highlight-current-row style="width: 100%"
      :default-sort="{ prop: 'create_time', order: 'descending' }">
      <el-table-column label="操作" width="90">
        <template slot-scope="scope">
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.is_kill == 0 && scope.row.is_open == 0"
            @click="kill_record(1, scope.row)">杀他</span>
          <span style="color: #3e3ef7; cursor: pointer" v-if="scope.row.is_kill == 1 && scope.row.is_open == 0"
            @click="kill_record(2, scope.row)">放弃杀他</span>

          <span style="color: #97a8be" v-if="scope.row.is_kill == 0 && scope.row.is_open == 1">杀他</span>
          <span style="color: #97a8be" v-if="scope.row.is_kill == 1 && scope.row.is_open == 1">放弃杀他</span>
        </template>
      </el-table-column>
      <el-table-column label="开奖期数" min-width="120" prop="open_no">
      </el-table-column>
      <el-table-column label="订单号" min-width="140" prop="order_no">
      </el-table-column>
      <el-table-column label="所属大房间" min-width="110" prop="room_name">
      </el-table-column>
      <el-table-column label="所属小房间" min-width="110" prop="room_sub_name">
      </el-table-column>
      <el-table-column label="会员号" min-width="120" prop="user_login">
      </el-table-column>
      <el-table-column label="是否被杀" prop="username">
        <template slot-scope="scope">
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.is_kill == 1">已被杀</span>
          <span style="color: #53d6c4; cursor: pointer" v-else>未被杀</span>
        </template>
      </el-table-column>

      <el-table-column label="投注号码" min-width="110" prop="multiple_name" />
      <el-table-column label="投注金额" prop="price" min-width="90">
        <template slot-scope="scope">
          {{ formatNum(scope.row.amount) }}
        </template>
      </el-table-column>

      <el-table-column label="收益" prop="winmoney">
        <template slot-scope="scope">
          <span v-if="Number(scope.row.win_amount) == 0">-</span>
          <span v-else>{{ formatNum(scope.row.win_amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收益状态" prop="zhi_wintype">
        <template slot-scope="scope">
          <span v-if="scope.row.is_open == 0">-</span>
          <span style="color: #ff643a; cursor: pointer"
            v-if="Number(scope.row.win_amount) > 0 && scope.row.is_open == 1">中奖</span>
          <span style="color: #53d6c4; cursor: pointer"
            v-if="Number(scope.row.win_amount) == 0 && scope.row.is_open == 1">未中奖</span>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span style="color: #ff643a; cursor: pointer" v-if="scope.row.is_open == 1">已开奖</span>
          <span style="color: #53d6c4; cursor: pointer" v-if="scope.row.is_open == 0">进行中</span>
        </template>
      </el-table-column>
      <el-table-column label="投注时间" width="140" prop="create_time" />
      
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pagesize"
      @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px"
        style="width: 400px; margin-left: 50px">
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
import { fetorderlist, kill_user } from "@/api/room_sys";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 1, display_name: "20210413001" },
  { key: 2, display_name: "20210413002" },
  { key: 3, display_name: "20210413003" },
  { key: 4, display_name: "20210413004" },
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
      tableKey: 0,
      form: {
        keyword: "",
        date: new Date(),
        qihao: "",
        ifwin: "",
        ifkill: "",
      },
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: "",
        time: new Date(),
        is_win: "",
        is_kill: "",
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
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        type: "",
        status: "published",
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
        type: [
          { required: true, message: "type is required", trigger: "change" },
        ],
        timestamp: [
          {
            type: "date",
            required: true,
            message: "timestamp is required",
            trigger: "change",
          },
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" },
        ],
      },
      downloadLoading: false,
      multipleSelection: [],
      dialogSet: false,
      pickerOptions: {
        disabledDate: (time) => {
          if (time.getTime() > Date.now()) {
            return true;
          }
        },
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    kill_record(type, data) {
      if (type == 1) {
        this.$confirm(
          "是否需要杀掉当前账户：" +
          data.user_login +
          " 在本期:" +
          data.open_no +
          " 的这条投注记录（即开奖结果绕开该用户的这条投注）?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            kill_user({
              is_kill: 1,
              open_no: data.open_no,
              order_id:data.id,
              room_id:data.room_id,
              room_sub_id:data.room_sub_id,
            }).then((response) => {
              if (response.code == 200) {
                this.$message({
                  message: "设置成功",
                  type: "success",
                });
              }
            });
          })
          .catch(() => { });
      } else {
        this.$confirm(
          "是否需要取消杀掉当前账户：" +
          data.user_login +
          " 在本期:" +
          data.open_no +
          " 的所有投注记录?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            kill_user({
              is_kill: 0,
              open_no: data.open_no,
              order_id:data.id,
              room_id:data.room_id,
              room_sub_id:data.room_sub_id,
            }).then((response) => {
              if (response.code == 200) {
                this.$message({
                  message: "已取消设置成功",
                  type: "success",
                });
              }
            });
          })
          .catch(() => { });
      }
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
    formatNum(value) {
      if (!value && value !== 0) return 0
      const str = value.toString()
      const reg =
        str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g
      return str.replace(reg, '$1,')
    },
    handleSet() {
      this.dialogSet = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleSelection(val) {
      this.multipleSelection = val;
    },
    getList() {
      this.listLoading = true;
      this.listQuery.time =
        this.listQuery.time !== ""
          ? this.formatDate("m", this.listQuery.time)
          : "";
      fetorderlist(this.listQuery).then((response) => {
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
        id: undefined,
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        status: "published",
        type: "",
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
      this.temp = Object.assign({}, row); // copy obj
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
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex((v) => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "成功",
              message: "更新成功",
              type: "success",
              duration: 2000,
            });
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
