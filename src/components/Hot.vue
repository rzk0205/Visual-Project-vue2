<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle"
      >&#xe6ef;</span
    >
    <span class="iconfont arr-right" @click="toRight" :style="comStyle"
      >&#xe6ed;</span
    >
    <span class="cat-name">{{ catName }}</span>
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
      currentIndex: 0,
      titleFontSize: 0
    }
  },
  created() {
    // 组件创建完成后 进行回调函数的注册
    this.$socket.registerCallBack('hotData', this.getData)
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
  },
  mounted() {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hot',
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
    this.$socket.unRegisterCallBack('hotData')
  },
  computed: {
    ...mapState(['theme']),
    catName() {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    }
  },
  methods: {
    initChart() {
      // 初始化echartInstance对象
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      // 对图表初始化配置的控制
      const initOptino = {
        title: {
          text: '▎热销商品占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '10%',
          icon: 'circle'
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const thirdCategory = arg.data.children
            let total = 0
            thirdCategory.forEach((item) => {
              total += item.value
            })
            let retSer = ''
            thirdCategory.forEach((item) => {
              retSer += `${item.name}:${
                ((item.value / total) * 100).toFixed(2) + '%'
              }<br>`
            })
            return retSer
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            // 饼图处于高亮状态情况下，应用的一些样式
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(initOptino)
      // 对图表对象进行鼠标事件的监听
    },
    // 获取服务器的数据
    getData(ret) {
      // http://127.0.0.1:8888/api/seller
      // const { data: res } = await this.$http.get('hotproduct')
      // console.log(res)
      this.allData = ret
      this.updateChart()
    },
    // 更新图表
    updateChart() {
      const legendArr = this.allData[this.currentIndex].children.map(
        (item) => item.name
      )
      const seriesData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children
          }
        }
      )
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: {
          data: seriesData
        }
      }
      this.chartInstance.setOption(dataOption)
    },

    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: {
          radius: this.titleFontSize * 4.5,
          center: ['50%', '60%']
        }
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    },
    toLeft() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    toRight() {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>
<style lang="scss" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}

.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}
</style>
