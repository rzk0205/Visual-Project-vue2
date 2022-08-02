<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '▎ ' + showTitle }}</span>
      <span class="iconfont" @click="showChoice = !showChoice" :style="comStyle"
        >&#xe6eb;</span
      >
      <div class="select-con" v-show="showChoice">
        <div
          class="select-item"
          :style="marginStyle"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handelSelect(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      showChoice: false,
      choiceType: 'map',
      titleFontSize: 0
    }
  },
  created() {
    // 组件创建完成后 进行回调函数的注册
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted() {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
    // 监听window窗口大小发生改变时调用this.screenAdapter
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  deactivated() {
    // 销毁时再次调用this.screenAdapter
    window.removeEventListener('resize', this.screenAdapter)
    // 组件销毁的时候 进行回调函数的取消
    this.$socket.unRegisterCallBack('trendData')
  },
  computed: {
    ...mapState(['theme']),
    selectTypes() {
      if (!this.allData) {
        return []
      } else {
        return this.allData.type.filter((item) => {
          return item.key !== this.choiceType
        })
      }
    },
    showTitle() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    marginStyle() {
      return {
        marginLeft: this.titleFontSize + 'px'
      }
    }
  },

  methods: {
    handelSelect(types) {
      this.choiceType = types
      this.updateChart()
      this.showChoice = false
    },
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      const initOption = {
        grid: {
          top: '30%',
          left: '3%',
          right: '4%',
          bottom: '2%',
          containLabel: true // 距离是包含坐标轴上的文字
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: '18%',
          left: 20,
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        }
      }
      this.chartInstance.setOption(initOption)
    },
    getData(ret) {
      // const { data: res } = await this.$http.get('trend')
      this.allData = ret
      console.log(ret)
      this.updateChart()
    },
    updateChart() {
      const colorArr1 = [
        'rgba(11, 168, 44, 0.5)',
        'rgba(44, 110, 255, 0.5)',
        'rgba(22, 242, 217, 0.5)',
        'rgba(254, 33, 30, 0.5)',
        'rgba(250, 105, 0, 0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11, 168, 44, 0)',
        'rgba(44, 110, 255, 0)',
        'rgba(22, 242, 217, 0)',
        'rgba(254, 33, 30, 0)',
        'rgba(250, 105, 0, 0)'
      ]
      const timerXarr = this.allData.common.month
      const valueArr = this.allData[this.choiceType].data
      const legendArr = valueArr.map((item) => item.name)
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: 'map',
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorArr1[index] },
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })
      const dataOption = {
        xAxis: {
          data: timerXarr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    // 屏幕大小发生变化
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    }
  },
  watch: {
    theme() {
      // 当前图表销毁
      this.chartInstance.dispose()
      // 以最新的主题初始化图表对象
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 更新图表的展示
      this.updateChart()
    }
  }
}
</script>
<style lang="scss" scoped>
.title {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 9;
  color: #ffffff;
  // font-size: 30px;
  .iconfont {
    margin-left: 5px;
    cursor: pointer;
    // font-size: 30px;
  }
  .select-con {
    background-color: #222733;
  }
}
</style>
