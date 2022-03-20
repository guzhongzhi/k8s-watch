<template>
  <div class="hello">
    <div style="padding:10px;">



      <Form ref="formInline" inline v-model="formInline">
        <FormItem prop="user">
          <Input type="text" v-model="formInline.username" placeholder="Username">
            <Icon type="ios-person-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem prop="password">
          <Input type="password" v-model="formInline.password" placeholder="Password">
            <Icon type="ios-lock-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formInline')">Sign in</Button>
        </FormItem>
      </Form>



    <div>
          <div style="float: left;width:200px;margin-right: 10px;margin-left: 10px;" v-for="item in watchItems">
            <deployment-watch :namespace="item.namespace" :deployment="item.deployment"></deployment-watch>
          </div>
      <div style="clear: both"></div>
    </div>
    </div>
    <div>
      {{namespaces}}
    </div>
  </div>
</template>

<script>
  import DeploymentWatch from "../components/DeploymentWatch";

  export default {
    components: {DeploymentWatch},
    data () {
      return {
        formInline:{
          username:"admin",
          encrypt:"MDAwMTAwMTAxMTAw@^fgofbioiKKJ",
        },
        namespaces:[],
        pods:[],
        deployments:[],
        watchItems:[
          {
            namespace:"default",
            cluster:"default",
            deployment: {
              name:"test-go",
              matchLabels:{
                app:"test-go"
              },
            }
          },
          {
            namespace:"weave",
            cluster:"default",
            deployment: {
              name:"weave-scope-app",
              matchLabels:{
                app: "weave-scope",
                name: "weave-scope-app",
                "weave-cloud-component": "scope",
                "weave-scope-component": "app",
              },
            }
          }
        ],
      }
    },
    mounted() {
      this.getNamespaces().then(res=>{
        this.namespaces = res;
      })
      this.getDeployments().then(res=>{
        this.deployments = res;
      })
      this.$http.get("/kapis/monitoring.kubesphere.io/v1alpha3/namespaces/default/pods?cluster=default&ownerKind=ReplicaSet&labelSelector=app%3Dtest-go&resources_filter=test-go-79566bc5-fl458%7Ctest-go-79566bc5-dhtkf%24&metrics_filter=pod_cpu_usage%7Cpod_memory_usage_wo_cache%24").then(res=>{
        console.log(res);
      })
    },
    methods:{
      handleSubmit(name) {
        this.$http.post("/login",this.formInline).then(res=>{
          console.log(res)
        })
      },
      getPods(namespace,deployment) {
        return new Promise((resolve,reject)=>{
          this.$http.get("/kapis/resources.kubesphere.io/v1alpha3/namespaces/"+namespace+"/pods?limit=100&ownerKind=ReplicaSet&labelSelector="+encodeURIComponent(deployment)+"&sortBy=startTime").then(res=>{
            if(resolve) {
              resolve(res.data);
            }
          })
        })
      },
      getDeployments(namespace = null) {
        return new Promise((resolve,reject)=>{
          this.$http.get("/kapis/resources.kubesphere.io/v1alpha3/deployments?sortBy=updateTime&limit=1000").then(res=>{
            if(resolve) {
              resolve(res.data.items)
            }
          })
        })
      },
      getNamespaces() {
        return new Promise((resolve,reject)=>{
          this.$http.get("/kapis/resources.kubesphere.io/v1alpha3/namespaces").then(res=>{
            console.log(res);
            if(resolve) {
              resolve(res.data.items);
            }
          })
        })
      }
    }
  }
</script>
