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
      <div v-for="item in watchItems" style="border:solid 1px #e1e1e1;text-align: left;margin-top:10px;padding: 6px;">
        <Form ref="formInline" inline>
          <FormItem label="cluster">
            <Input v-model="item.cluster"></Input>
          </FormItem>
          <FormItem label="namespace">
            <Input v-model="item.namespace"></Input>
          </FormItem>
          <FormItem label="deployment">
            <Input v-model="item.deployment.name"></Input>
          </FormItem>
          <FormItem label="matchLabels" style="text-align: left;width: 400px">
            <div v-if="item.deployment.matchLabels" style="width: 100%;clear: both">
            <div v-for="key in Object.keys(item.deployment.matchLabels)">
              <table style="text-align: left">
                <tr>
                  <td width="50%">{{key}}:</td>
                  <td><Input v-model="item.deployment.matchLabels[key]"></Input></td>
                  <td><Button type="error">删除</Button></td>
                </tr>
              </table>
            </div>
            </div>
          </FormItem>
        </Form>
      </div>

      <div style="border:solid 1px #e1e1e1;text-align: left;margin-top:10px;padding: 6px;">
        <Form ref="formInline" inline>
          <FormItem label="cluster">
            <Input v-model="newWatchItem.cluster"></Input>
          </FormItem>
          <FormItem label="namespace">
            <Input v-model="newWatchItem.namespace"></Input>
          </FormItem>
          <FormItem label="deployment">
            <Input v-model="newWatchItem.deployment.name"></Input>
          </FormItem>
          <FormItem label="matchLabels" style="width:400px;">
            <div v-if="newWatchItem.deployment.matchLabels">
              <div v-for="key in Object.keys(newWatchItem.deployment.matchLabels)">
                <table>
                  <tr>
                    <td>{{key}}:</td>
                    <td><Input v-model="newWatchItem.deployment.matchLabels[key]"></Input></td>
                    <td><Button type="error">删除</Button></td>
                  </tr>
                </table>
              </div>
            </div>
            <Input v-model="newWatchItem.newMatchLabel"></Input>
            <Button type="warning">添加match label</Button>
          </FormItem>
        </Form>
        <Button type="success">添加监控主机</Button>
      </div>
    <div style="margin-top: 10px;">
          <div style="float: left;width:48%;margin-left: 10px;" v-for="item in watchItems">
            <deployment-watch :namespace="item.namespace" :deployment="item.deployment"></deployment-watch>
          </div>
      <div style="clear: both"></div>
    </div>
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
        newWatchItem:{
          namespace:"default",
          cluster:"default",
          deployment: {
            name:"",
            matchLabels:{

            },
          },
          newMatchLabel:"",
        },
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
