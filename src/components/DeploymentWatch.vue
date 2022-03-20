<template>
<div style="border: solid 1px #e1e1e1; margin-bottom: 10px;">
  <div style="font-size:16px;font-weight: bold;background: #e1e1e1;padding: 8px;">
    {{namespace+' -> '+deployment.name}} (共{{pods.length}}个Pods) &nbsp;&nbsp; CPU限制：&nbsp;&nbsp; 内存限制:  &nbsp;&nbsp; 容器数量:
  </div>
  <div v-for="pod in pods" style="margin-bottom: 10px; text-align: left;padding: 10px;">
    <div style="font-weight: bold;color:#014b49;background: #bfe9ff;padding: 4px 6px;">
      {{pod.metadata.name}} - {{pod.status.podIP}}
    </div>
    <div v-for="witem in watchItems">
      <div style="color:red;padding: 4px 0px;margin-top: 20px;"><strong>{{witem.title}}</strong></div>
      <chart style="margin-top:-40px;" :data="{items:getWatchData(pod.watchData,witem.name),type:witem.name,title:witem.title}"/>
    </div>
  </div>
</div>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/polar'
import Chart from "./Chart";
export default {
  name: "DeploymentWatch",
  components: {
    Chart,
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
    return {
      pods:[],
      watchItems:[
        {
          name:"pod_net_bytes_transmitted",
          title:"网络发送 (kbps 每秒千比特)",
        },
        {
          name:"pod_net_bytes_received",
          title:"网络接收 (kbps 每秒千比特)",
        },
        {
          name:"pod_cpu_usage",
          title:"CPU使用 (m)",
        },
        {
          name:"pod_memory_usage_wo_cache",
          title:"内存 (Mi)",
        }
      ],
    }
  },
  methods:{
    getNetworkOptions(data) {

    },
    getWatchData(items,code){
      let v =  items.find(m=>{
        return m['metric_name'] == code;
      })
      if(v && v.data && v.data.result && v.data.result.length > 0) {
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
          this.serialize(q,"&")+"&step=30s&times=10&metrics_filter=pod_cpu_usage%7Cpod_memory_usage_wo_cache%7Cpod_net_bytes_transmitted%7Cpod_net_bytes_received%24";
        this.$http.get(url).then(res=>{
          pod.watchData=res.data.results;
        })
      })
      setTimeout(()=>{
        this.watch();
      },5000);
    },
    serialize:function(obj,sp=",") {
      var str = [];
      for (var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push((p) + "=" + (obj[p]));
        }
      return str.join(sp);
    },
  },
  mounted() {
    console.log(this.deployment);
    let q = this.serialize(this.deployment.matchLabels);
    console.log(q)
    let url = "/kapis/resources.kubesphere.io/v1alpha3/namespaces/"+encodeURIComponent(this.namespace)+
      "/pods?limit=10&ownerKind=ReplicaSet&labelSelector=" + encodeURIComponent(q)+"&sortBy=startTime";


    this.$http.get(url).then(res=>{
      let pods = res.data.items;
      pods.map(pod=>{
        pod.watchData = [];
      })
      this.pods = pods;
      setTimeout(()=>{
        this.watch();
      },1000);
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
