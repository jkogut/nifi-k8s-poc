import * as k8s from "@pulumi/kubernetes";

// Create deployemnt in the nifi namespace
const nifiNs = new k8s.core.v1.Namespace("nifi2", { metadata: { name: "nifi2" } });

// !FIXME! Workaround for namespaces from Helm Charts:
// https://github.com/pulumi/pulumi-kubernetes/issues/217
function addNamespace(o: any) {
    if (o !== undefined) {
        if (o.metadata !== undefined) {
            o.metadata.namespace = "nifi2";
        } else {
            o.metadata = {namespace: "nifi2"}
        }
    }
}

// Deploy the latest version of the incubator/zookeeper chart.
const zookeeper = new k8s.helm.v2.Chart("zookeeper", {
    repo: "incubator",
    version: "1.2.0",
    chart: "zookeeper",
    transformations: [addNamespace],
    values: {
        persistence: { size : "1Gi" }
    }
});

// Deploy the latest version of the incubator/kafka chart.
const kafka = new k8s.helm.v2.Chart("kafka", {
    repo: "incubator",
    version: "0.13.11",
    chart: "kafka",
    transformations: [addNamespace],
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
const appLabels = { app: appName, tier: "backend" };

const nifiDep = new k8s.apps.v1beta1.Deployment(appName, {
    metadata: {
        name: appName,
        labels: appLabels,
        namespace: nifiNs.metadata.name
    },

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
                            ports: [{ name:"http", containerPort: 8080 }]
                        }]
                    }
        }
    }
});

// allocate an IP to the nifi Deployment
const nifiSvc = new k8s.core.v1.Service(appName, {
    metadata: {
        name: appName,
        // labels: appLabels,
        namespace: nifiNs.metadata.name
    },

    spec: {
        //type: "LoadBalancer",
        selector: appLabels,
        ports: [{ port: 8080, targetPort: "http" }]
    }
});
