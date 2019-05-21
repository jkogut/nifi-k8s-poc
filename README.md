# nifi-k8s-poc
PoC for nifi on k8s with pulumi

#Installs:

* 3 node Zookeeper cluster 
* 3 broker Kafka
* 1 node of NiFi


#Testing:

* testing zk deployment:
```js
for i in 0 1 2; do kubectl exec zookeeper-$i -- hostname -f; done
```
