<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>
<script>
import axios from 'axios'
import { mapState } from 'vuex'
import map from '../../public/static/map/china.json'
import { getProvinceMapInfo } from '@/utils/map_utils'
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      mapData: {}
    }
  },
  created() {
    // 组件创建完成后 进行回调函数的注册
    this.$socket.registerCallBack('mapData', this.getData)
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
      socketType: 'mapData',
      chartName: 'map',
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
    this.$socket.unRegisterCallBack('mapData')
  },
  methods: {
    async initChart() {
      // 初始化echartInstance对象
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      // const res = await axios.get('http://localhost:8080/static/map/china.json')
      // console.log(map)
      this.$echarts.registerMap('china', map)
      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '▎商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2e72bf',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          // 图例方向
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('click', async (arg) => {
        // arg.name 获取点击的省份
        const provinceInfo = getProvinceMapInfo(arg.name)
        // 获取相关省份的地图矢量数据
        // 判断当前所点击的这个省份地图矢量数据在mapData中是否存在

        if (!this.mapData[provinceInfo.key]) {
          const res = await axios.get(
            'http://localhost:8080' + provinceInfo.path
          )
          this.mapData[provinceInfo.key] = res.data
          // console.log(res);
          this.$echarts.registerMap(provinceInfo.key, res.data)
        }

        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },
    // 获取服务器的数据
    getData(ret) {
      // const { data: res } = await this.$http.get('map')
      // console.log(res)
      this.allData = ret
      this.updateChart()
      // 启动定时器
    },
    // 更新图表
    updateChart() {
      const legendArr = this.allData.map((item) => item.name)
      const seriesArr = this.allData.map((item) => {
        // return的这个对象就代表的是一个类别下的所有散点数据
        // 如果需要在地图中显示散点的数据，所以我们需要给散点的图标增加一个配置，coordinateSystem:geo
        return {
          // 涟漪效果
          type: 'effectScatter',

          rippleEffect: {
            // 空心的涟漪效果
            scale: 5,

            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo'
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },

    // 当浏览器的大小发生变化的时候, 会调用的方法, 来完成屏幕的适配
    screenAdapter() {
      // 获取字体大小，根据屏幕大小自适应
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }

      this.chartInstance.setOption(adapterOption)
      // 手动的调用图表对象的resize 才能产生效果
      this.chartInstance.resize()
    },
    revertMap() {
      const revertOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertOption)
    }
  }
}
</script>
<style lang="scss" scoped></style>
