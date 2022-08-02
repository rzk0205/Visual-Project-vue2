<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      chartInstance: null,
      // 服务器返还的数据
      allData: null,
      // 当前显示的页数
      currentPage: 1,
      // 一共多少页
      totalPage: 0,
      // 定时器表示
      timerId: null
    }
  },
  created() {
    // 组件创建完成后 进行回调函数的注册
    this.$socket.registerCallBack('sellerData', this.getData)
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
      socketType: 'sellerData',
      chartName: 'seller',
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
    this.$socket.unRegisterCallBack('sellerData')
  },
  methods: {
    initChart() {
      // 初始化echartInstance对象
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      // 对图表初始化配置的控制
      const initOptino = {
        title: {
          text: '▎商家销售统计',

          left: 20,
          top: 20
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true // 距离是包含坐标轴上的文字
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              type: 'solid',

              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',

            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              // 指明颜色渐变的方向
              // 指明不同百分比之下颜色的值
              barBorderRadius: [0, 30, 30, 0],
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#5052EE' },
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
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
      // const { data: res } = await this.$http.get('seller')
      this.allData = ret
      this.allData.sort((element1, element2) => {
        return element1.value - element2.value
      })
      // 每5个元素显示一页
      this.totalPage =
        this.allData.length % 5 === 0
          ? this.allData.length / 5
          : this.allData.length / 5 + 1
      this.updateChart()
      // 启动定时器
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      const showData = this.allData.slice(start, end)
      const sellerName = showData.map((item) => item.name)
      const sellerValue = showData.map((item) => item.value)
      const dataOption = {
        yAxis: {
          data: sellerName
        },

        series: [
          {
            data: sellerValue
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    startInterval() {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 4000)
    },
    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter() {
      // this.$refs.seller_ref.offsetWidth
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },

        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    }
  }
}
</script>
<style lang="scss" scoped></style>
