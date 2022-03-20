<template>
<div style="border: solid 1px #e1e1e1">
  {{namespace+' '+deployment.name}}
  <div v-for="pod in pods" style="margin-bottom: 10px; text-align: left;padding: 10px;">
    {{pod.metadata.name}}<br/>
    {{pod.status.podIP}}<br/>

    <div v-for="witem in watchItems">
      {{witem.title}}:
      {{getWatchData(pod.watchData,witem.name)}}
    </div>
  </div>
  <v-chart :options="polar"/>

</div>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/polar'
export default {
  name: "DeploymentWatch",
  components: {
    'v-chart': ECharts
  },
  props:{
    namespace: {
      type:String
    },
    deployment: {
      type:Object,
      default:()=>{
        return {
          name:"",
          matchLabels:{},
        }
      }
    }
  },
  data() {
    let data = []

    for (let i = 0; i <= 360; i++) {
      let t = i / 180 * Math.PI
      let r = Math.sin(2 * t) * Math.cos(2 * t)
      data.push([r, i])
    }
    return {
      polar: {
        title: {
          text: '极坐标双数值轴'
        },
        legend: {
          data: ['line']
        },
        polar: {
          center: ['50%', '54%']
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        angleAxis: {
          type: 'value',
          startAngle: 0
        },
        radiusAxis: {
          min: 0
        },
        series: [
          {
            coordinateSystem: 'polar',
            name: 'line',
            type: 'line',
            showSymbol: false,
            data: data
          }
        ],
        animationDuration: 2000
      },
      exampleChart: null,
      pods:[],
      watchItems:[
        {
          name:"pod_net_bytes_transmitted",
          title:"网络发送",
        },
        {
          name:"pod_net_bytes_received",
          title:"网络接收",
        },
        {
          name:"pod_cpu_usage",
          title:"CPU使用",
        },
        {
          name:"pod_memory_usage_wo_cache",
          title:"内存",
        }
      ],
    }
  },
  methods:{
    drawExampleChart: function () {
    },
    getWatchData(items,code){
      let v =  items.find(m=>{
        return m['metric_name'] == code;
      })
      if(v) {
        return v.data.result[0].values;
      }
      return  [];
    },
    watch() {
      this.pods.map(pod=>{
        let q = {
          start:parseInt(this.$moment.now()/1000)-600,
          end:parseInt(this.$moment.now()/1000),
        }
        let url = "/kapis/monitoring.kubesphere.io/v1alpha3/namespaces/"+this.namespace+"/pods/"+pod.metadata.name+"?cluster=default&"+
          this.serialize(q,"&")+"&step=300s&times=60&metrics_filter=pod_cpu_usage%7Cpod_memory_usage_wo_cache%7Cpod_net_bytes_transmitted%7Cpod_net_bytes_received%24";
        this.$http.get(url).then(res=>{
          pod.watchData=res.data.results;
        })
      })
    },
    serialize:function(obj,sp=",") {
      var str = [];
      for (var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join(sp);
    },
  },
  mounted() {
    let url = "/kapis/resources.kubesphere.io/v1alpha3/namespaces/"+encodeURIComponent(this.namespace)+
      "/pods?limit=10&ownerKind=ReplicaSet&labelSelector=" + encodeURIComponent(this.serialize(this.deployment.matchLabels))+"&sortBy=startTime";
    this.$http.get(url).then(res=>{
      let pods = res.data.items;
      pods.map(pod=>{
        pod.watchData = [];
      })
      this.pods = pods;
      setTimeout(()=>{
        this.watch();
      },2000);
    })

    return
      let socket = new WebSocket("ws://localhost:8080/api/v1/watch/namespaces/default/pods?labelSelector=app=test-go");

    socket.onopen = function(e) {
      console.log("[open] Connection established");
      console.log("Sending to server");
      socket.send("My name is John");
    };

    socket.onmessage = function(event) {
     // console.log(`[message] Data received from server: ${event.data}`);
    };

    socket.onclose = function(event) {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // 例如服务器进程被杀死或网络中断
        // 在这种情况下，event.code 通常为 1006
        console.log('[close] Connection died');
      }
    };

    socket.onerror = function(error) {
      console.log(`[error] ${error.message}`);
    };
  }
}
</script>

<style scoped>

</style>
