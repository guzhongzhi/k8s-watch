<template>
  <div v-if="options.title">
    <v-chart :options="options" style="width: 100%; height: 200px;"/>
  </div>

</template>

<script>

import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/polar'
import moment from "moment";
export default {
  components: {
    'v-chart': ECharts
  },
  name: "Chart",
  props: {
    data:{
      type: Object
    }
  },
  data() {
    return {
      options:{
        title: {
          text: ''
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['pod_cpu_usage']
        },
        grid: {
          left: '2%',
          right: '2%',
          bottom: '0',
          containLabel: true
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          //type: 'time',
          boundaryGap: true,
          data:[],
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'pod_cpu_usage',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: []
          },
        ]
      },
    }
  },
  watch:{
    data(n,o) {
      this.options.title.text = o.title;
      this.options.xAxis.data.splice(0)
      this.options.series[0].data.splice(0)
      n.items.map((i)=>{
        let t = moment(i[0]*1000).format("HH:mm:ss")
        this.options.xAxis.data.push(t)
        let v = parseFloat(i[1])

        switch (n.type) {
          case "pod_cpu_usage":
            v =v * 1000;
            break;
          case   "pod_memory_usage_wo_cache":
             v = v / 1024 / 1024;
             break;
          case "pod_net_bytes_received":
          case "pod_net_bytes_transmitted":
            if(v > 0) {
              v= v * 0.007648; //不知道怎么来的，　ks后台算出来是这个值
            }
            break;
        }

        this.options.series[0].data.push(v)
        // this.options.series[0].data.push({
        //   name: t,
        //   value:[t,v]
        // })
      })
      console.log(this.options)
    }
  }
}
</script>

<style scoped>

</style>
