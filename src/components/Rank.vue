<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      startValue: 0,
      endValue: 9,
      timeId: null
    }
  },
  created() {
    // 组件创建完成后 进行回调函数的注册
    this.$socket.registerCallBack('rankData', this.getData)
  },
  computed: {
    ...mapState(['theme'])
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
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
    // 监听window窗口大小发生改变时调用this.screenAdapter
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  deactivated() {
    clearInterval(this.timeId)
    // 销毁时再次调用this.screenAdapter
    window.removeEventListener('resize', this.screenAdapter)
    // 组件销毁的时候 进行回调函数的取消
    this.$socket.unRegisterCallBack('rankData')
  },
  methods: {
    initChart() {
      // 初始化echartInstance对象
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
      // 对图表初始化配置的控制
      const initOptino = {
        title: {
          text: '▎地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          // 坐标轴的大小是否包含坐标轴上的文字
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'bar'
          }
        ]
      }
      this.chartInstance.setOption(initOptino)
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    getData(ret) {
      // http://127.0.0.1:8888/api/seller
      // const { data: res } = await this.$http.get('rank')
      // console.log(res)
      this.allData = ret
      this.allData.sort((a, b) => b.value - a.value)
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      const colorArr = [
        ['#0ba82c', '#4ff778'],
        ['#2e72bf', '#23e5e5'],
        ['#5052ee', '#ab6ee5']
      ]
      const provinceArr = this.allData.map((item) => item.name)
      const ValueArr = this.allData.map((item) => item.value)
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: ValueArr,
            itemStyle: {
              color: (arg) => {
                let arggetColorArr = null
                if (arg.value > 300) {
                  arggetColorArr = colorArr[0]
                } else if (arg.value > 200) {
                  arggetColorArr = colorArr[1]
                } else {
                  arggetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: arggetColorArr[0]
                  },
                  {
                    offset: 1,
                    color: arggetColorArr[1]
                  }
                ])
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },

    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter() {
      const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: {
          barWidth: titleFontSize,
          itemStyle: {
            barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    },
    startInterval() {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.allData.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>
<style lang="scss" scoped></style>
