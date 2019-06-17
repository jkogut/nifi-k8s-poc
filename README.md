# nifi-k8s-poc
PoC for nifi on k8s with pulumi

### Prereq:

* Helm
```js
$ sudo snap install helm --classic
$ helm init --client-only
$ helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com/
```


```js
$ gcloud container clusters create nifi-poc --num-nodes=3
$ pulumi up
```

### Installs:

* 3 node Zookeeper cluster 
* 3 broker Kafka
* 1 node of NiFi
* 1 node grafana
* 1 node kafka burrow 


### Testing:

* testing zk deployment:
```js
for i in 0 1 2; do kubectl exec zookeeper-$i -- hostname -f; done
```

### Cleanup
```js
gcloud container clusters delete nifi-poc
```