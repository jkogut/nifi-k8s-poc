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

// nifi container, replicated 1 time.
const appName = "nifi";
const appLabels = { app: appName, tier: "backend", track: "stable"};

const nifiDep = new k8s.apps.v1beta1.Deployment(appName, {
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [
                        { 
                            name: appName, 
                            image: "apache/nifi:latest",
                            //resources: { requests: { cpu: "50m", memory: "100Mi" } },
                            ports: [{ containerPort: 8080 }]
                        }]
                    }
        }
    }
});
