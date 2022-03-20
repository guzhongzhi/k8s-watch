<template>
  <div v-if="options.title">
    <v-chart :options="options" style="width: 100%"/>
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
          text: '网络'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Email',
            type: 'line',
            stack: 'Total',
            data: [0, 0, 0, 0, 0, 0, 0]
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
        let t = moment(i[0]*1000).format("hh:mm:ss")
        this.options.xAxis.data.push(t)
        let v = parseFloat(i[1])

        switch (n.type) {
          case "pod_cpu_usage":
            v =v * 1000;
            break;
            case   "pod_memory_usage_wo_cache":
              v = v / 1024 / 1024;
              break;
        }
        this.options.series[0].data.push(v)
      })
    }
  }
}
</script>

<style scoped>

</style>
