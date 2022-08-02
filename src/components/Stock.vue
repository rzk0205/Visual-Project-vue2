<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0,
      timerId: null
    }
  },
  created() {
    // 组件创建完成后 进行回调函数的注册
    this.$socket.registerCallBack('stockData', this.getData)
  },
  mounted() {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
    // 监听window窗口大小发生改变时调用this.screenAdapter
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  deactivated() {
    clearInterval(this.timerId)
    // 销毁时再次调用this.screenAdapter
    window.removeEventListener('resize', this.screenAdapter)
    // 组件销毁的时候 进行回调函数的取消
    this.$socket.unRegisterCallBack('stockData')
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
  methods: {
    initChart() {
      // 初始化echartInstance对象
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
      // 对图表初始化配置的控制
      const initOptino = {
        title: {
          text: '▎库存和销量分析',
          left: 20,
          top: 20
        }
      }
      this.chartInstance.setOption(initOptino)
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器的数据
    getData(ret) {
      // http://127.0.0.1:8888/api/seller
      // const { data: res } = await this.$http.get('stock')
      // console.log(res)
      this.allData = ret
      this.updateChart()
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          // radius: [115, 100],
          center: centerArr[index],
          hoverAnimation: false, // 关闭输入移入饼图时的动画效果
          labelLine: {
            show: false
          },
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          data: [
            {
              name: item.name + '\n\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },

    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter() {
      const titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6
      const innerRadius = titleFontSize * 2.8
      const outterRadius = innerRadius * 1.125
      let config = {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize / 2
        }
      }

      let ret = []
      for (let index = 0; index < 5; index++) {
        ret.push(config)
      }
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: ret
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    },
    startInterval() {
      this.timerId && clearInterval(this.timerId)
      this.timerId = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>
<style lang="scss" scoped></style>
