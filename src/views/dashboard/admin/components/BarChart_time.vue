<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { home_zhu, } from "@/api/room_sys"
const animationDuration = 6000

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null,
      data_arr:{},
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getList()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    getList() {
      home_zhu().then((response) => {
        if (response.code == 200) {
          this.data_arr = response.data
          console.log('ffff', this.data_arr)
          this.initChart()
        }

      });
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      var _this = this
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: function (params) {
            return  '当天投注总数：' + params[0].data
            
          }
        },
        grid: {
          top: 10,
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: _this.data_arr.date !== undefined ? _this.data_arr.date : [],
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          }
        }],
        series: [{
          name: 'pageA',
          type: 'bar',
         
          barWidth: '20%',
          data:_this.data_arr.order !== undefined ? _this.data_arr.order : [],
          animationDuration
        }]
      })
    }
  }
}
</script>
