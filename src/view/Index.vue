<template>
  <div class="hello">
    <div style="padding:10px;">
      <Form ref="formInline" inline v-model="formInline">
        <FormItem prop="user">
          <Input type="text" v-model="formInline.username" placeholder="Username">
            <Icon type="ios-person-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem prop="password" style="width: 400px;">
          <Input type="text" v-model="formInline.encrypt" placeholder="Password">
            <Icon type="ios-lock-outline" slot="prepend"></Icon>
          </Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formInline')">Sign in</Button>
        </FormItem>
      </Form>
      <div v-for="(item,itemIdx) in watchItems" style="border:solid 1px #e1e1e1;text-align: left;margin-top:10px;padding: 6px;">
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
                </tr>
              </table>
            </div>
            </div>
          </FormItem>
          <FormItem>
            <Button type="warning" @click="deleteWatchItem(itemIdx)">删除主机</Button>
          </FormItem>
        </Form>
      </div>

      <div style="border:solid 1px #e1e1e1;text-align: left;margin-top:10px;padding: 6px;">
        <Form ref="formInline" inline>
          <FormItem label="cluster">
            <Input v-model="newWatchItem.cluster"></Input>
          </FormItem>
          <FormItem label="namespace">
            <Select v-model="newWatchItem.namespace" style="width:200px" @on-change="namespaceChanged">
              <Option v-for="item in namespacesOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="deployment">
            <Select v-model="newWatchItem.deployment.name" style="width:200px" @on-change="deploymentChanged">
              <Option v-for="item in deploymentsOptions" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="matchLabels" style="width:400px;">
            <div v-if="newWatchItem.deployment.matchLabels" style="clear: both">
              <div v-for="key in Object.keys(newWatchItem.deployment.matchLabels)">
                <table>
                  <tr>
                    <td width="50%">{{key}}:</td>
                    <td><Input v-model="newWatchItem.deployment.matchLabels[key]"></Input></td>
                    <td><Button type="error">删除</Button></td>
                  </tr>
                </table>
              </div>
            </div>
            <Input v-model="newWatchItem.newMatchLabel"></Input>
            <Button type="warning" @click="newWatchItemAddMatchLabel">添加match label</Button>
          </FormItem>
        </Form>
        <div style="text-align: center">
        <Button type="success" @click="addWatchDeployment">添加监控主机</Button>
        </div>
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
    computed:{
      deploymentsOptions() {
        let x = [];
        this.deployments.map(v=>{
          x.push({
            label:v.metadata.name,
            value:v.metadata.name,
            ins: v,
          })
        })
        return x
      },
      namespacesOptions() {
        let x = [];
        this.namespaces.map(v=>{
          x.push({
            label:v.metadata.name,
            value:v.metadata.name,
            ins: v,
          })
        })
        return x
      }
    },
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
          namespace:"",
          cluster:"default",
          deployment: {
            name:"",
            matchLabels:{

            },
          },
          newMatchLabel:"",
        },
        watchItems:[
          // {
          //   namespace:"default",
          //   cluster:"default",
          //   deployment: {
          //     name:"test-go",
          //     matchLabels:{
          //       app:"test-go"
          //     },
          //   }
          // }
        ],
      }
    },
    mounted() {
      this.getNamespaces().then(res=>{
        this.namespaces = res;
      })
    },
    methods:{
      deleteWatchItem(idx){
        this.watchItems.splice(idx,1)
      },
      addWatchDeployment()  {
        let e = false
        this.watchItems.map((i)=>{
          if(i.deployment.name == this.newWatchItem.deployment.name) {
            e = true
          }
        })
        if(e) {
          this.$Message.error("该对象已经存在")
          return
        }
        if(this.newWatchItem.namespace=="" || this.newWatchItem.deployment.name == "") {
          this.$Message.error("请选择要监控的主机")
          return
        }
        this.watchItems.push(JSON.parse(JSON.stringify(this.newWatchItem)))
        this.newWatchItem.deployment.name = "";
        Object.keys(this.newWatchItem.deployment.matchLabels).map(k=>{
          this.$delete(this.newWatchItem.deployment.matchLabels,k)
        })
      },
      newWatchItemAddMatchLabel() {
        if(this.newWatchItem.newMatchLabel == "") {
          this.$Message.error('匹配项目名不能为空');
          return
        }
        let lines = this.newWatchItem.newMatchLabel.split(",")
        lines.map(line=>{
          let x = line.split("=")
          if(x.length==1) {
            x = line.split(":")
          }
          this.$set(this.newWatchItem.deployment.matchLabels,x[0].trim(),x.length>1?x[1].trim():"")
        })
        this.newWatchItem.newMatchLabel = ""
      },
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
      namespaceChanged(v) {
        this.namespaces.map((n)=>{
          console.log(n.metadata.name,v)
          if(n.metadata.name == v) {
            this.getDeployments(v).then(dp=>{
              console.log(dp)
              this.deployments = dp;
            })
          }
        })
      },
      deploymentChanged(v) {
        this.deployments.map(d=>{
          if(v != d.metadata.name) {
            return
          }
          Object.assign(this.newWatchItem.deployment.matchLabels,d.spec.selector.matchLabels);
        })
      },
      getDeployments(namespace = null) {
        let url = "/kapis/resources.kubesphere.io/v1alpha3/namespaces/"+encodeURIComponent(namespace)+"/deployments?sortBy=updateTime&limit=100";
        if(!namespace) {
          url = "/kapis/resources.kubesphere.io/v1alpha3/deployments?sortBy=updateTime&limit=1000";
        }
        return new Promise((resolve,reject)=>{
          this.$http.get(url).then(res=>{
            if(resolve) {
              resolve(res.data.items)
            }
          })
        })
      },
      getDaemonsets(namespace = null) {
        let url = "/kapis/resources.kubesphere.io/v1alpha3/namespaces/"+encodeURIComponent(namespace)+"/daemonsets?sortBy=updateTime&limit=100";
        if(!namespace) {
          url = "/kapis/resources.kubesphere.io/v1alpha3/daemonsets?sortBy=updateTime&limit=1000";
        }
        return new Promise((resolve,reject)=>{
          this.$http.get(url).then(res=>{
            if(resolve) {
              resolve(res.data.items)
            }
          })
        })
      },
      getStatefulsets(namespace = null) {
        let url = "/kapis/resources.kubesphere.io/v1alpha3/namespaces/"+encodeURIComponent(namespace)+"/statefulsets?sortBy=updateTime&limit=100";
        if(!namespace) {
          url = "/kapis/resources.kubesphere.io/v1alpha3/statefulsets?sortBy=updateTime&limit=1000";
        }
        return new Promise((resolve,reject)=>{
          this.$http.get(url).then(res=>{
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
