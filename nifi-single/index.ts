import * as k8s from "@pulumi/kubernetes";

// Deploy the latest version of the incubator/zookeeper chart.
const zookeeper = new k8s.helm.v2.Chart("zookeeper", {
    repo: "incubator",
    version: "1.2.0",
    chart: "zookeeper",
    values: {
        persistence: { size : "1Gi" }
    }
});

// Deploy the latest version of the incubator/kafka chart.
const kafka = new k8s.helm.v2.Chart("kafka", {
    repo: "incubator",
    version: "0.13.11",
    chart: "kafka",
    values: {
        topics: [{
            name: "test-topic",
            partitions: 8,
            replicationFactor: 3,
            defaultConfig: "segment.bytes,segment.ms",
        },
        {   
            name: "nifi-topic",
            partitions: 8,
            replicationFactor: 3
        }   
    ],  // zookeeper config for kafka brokers
        zookeeper: { 
            enabled: false,
            url: "zookeeper"
        }
    }
});
