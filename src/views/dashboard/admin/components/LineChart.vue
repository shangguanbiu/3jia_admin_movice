<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { home_line, } from "@/api/room_sys"
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
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      data_arr: {}
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
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
      home_line().then((response) => {
        if (response.code == 200) {
          this.data_arr = response.data
         
          this.initChart()
        }

      });
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions({ expectedData, actualData } = {}) {
      var _this = this
      this.chart.setOption({
        xAxis: {
          data: _this.data_arr.date !== undefined ? _this.data_arr.date : [],
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['代理商1', '代理商2', '代理商3', '代理商4', '代理商5']
        },
        series: [{
          name: '代理商1', itemStyle: {
            normal: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2
              }
            }
          },
          smooth: true,
          type: 'line',
          data: _this.data_arr.chongzhi !== undefined ? _this.data_arr.chongzhi : [],
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: '代理商2',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#3888fa',
              lineStyle: {
                color: '#3888fa',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: _this.data_arr.tixian !== undefined ? _this.data_arr.tixian : [],
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '代理商3',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#3e3ef7',
              lineStyle: {
                color: '#3e3ef7',
                width: 2
              },
              areaStyle: {
                color: '#3e3ef7'
              }
            }
          },
          data: _this.data_arr.tixian !== undefined ? _this.data_arr.tixian : [],
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '代理商4',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#ef5207fa',
              lineStyle: {
                color: '#ef5207fa',
                width: 2
              },
              areaStyle: {
                color: '#ef5207fa'
              }
            }
          },
          data: _this.data_arr.tixian !== undefined ? _this.data_arr.tixian : [],
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '代理商5',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#FFAD3E',
              lineStyle: {
                color: '#FFAD3E',
                width: 2
              },
              areaStyle: {
                color: '#FFAD3E'
              }
            }
          },
          data: _this.data_arr.tixian !== undefined ? _this.data_arr.tixian : [],
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        }]
      })
    }
  }
}
</script>
