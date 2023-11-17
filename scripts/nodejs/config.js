const path = require("path");
const workingFolder = path.join(__dirname, ".temp");

module.exports = {
  // The temporary working folder
  workingFolder,
  // The output folder for the charts
  outputFolder: path.join(__dirname, "../../gen"),
  // The helm chart repository
  repository: "https://ekavallieri.github.io/public-helm-charts/",
  // Git related settings
  git: {
    repository: "https://github.com/linuxserver/docker-documentation",
    imagesFolder: path.join(
      workingFolder,
      "docker-documentation",
      "docs/images"
    ),
  },
  files: {
    // The files are filtered by the first line of the file, the current regex filtering
    // only valid readme files (the other are internal or deprecated).
    // We can use this regex to filter only specific files (cloud9 and code-server), like so:
    // firstLineRegexFilter: /^# \[linuxserver\/(cloud9|code-server)\]\(https:\/\/github\.com\/linuxserver\/.+\)$/,
    firstLineRegexFilter:
      /^# \[linuxserver\/.+\]\(https:\/\/github\.com\/linuxserver\/.+\)$/,
    descriptionsMap: {
      doublecommander: "double commander",
      foldingathome: "folding@home",
      "mysql-workbench": "mysql workbench",
      wireguard: "wireguard®",
    },
  },
  versions: {
    chartVersion: "0.2.3",
    appVersion: "0.2.3",
    baseChartVersion: "0.4.1",
  },
  chart: {
    host: "e-kavallieri.com",
    defaultVolumes: [
      {
        name: "appdata",
        nfs: {
          server: "192.168.1.10",
          path: "/appdata",
        },
      },
    ],
    volumeClaimTemplates: [
      {
        volumeClaimTemplate: {
          metadata: {
            name: "pvc-config",
          },
          spec: {
            storageClassName: "ceph-block",
            accessModes: ["ReadWriteOnce"],
            resources: {
              requests: {
                storage: "20Gi",
              },
            },
          },
        },
        volumeMount: {
          mountPath: "/config",
        },
      },
    ],
    defaultEnv: [
      {
        name: "GUID",
        value: '"1000"',
      },
      {
        name: "PUID",
        value: '"1000"',
      },
      {
        name: "TZ",
        value: "Etc/UTC",
      },
    ],
    defaultValues: {
      imagePullPolicy: "IfNotPresent",
    },
    overrides: {
      env: {
        bookstack: {
          DB_HOST: "localhost",
        },
        codimd: {
          DB_HOST: "localhost",
        },
        diskover: {
          REDIS_HOST: "localhost",
          ES_HOST: "localhost",
        },
        "snipe-it": {
          MYSQL_PORT_3306_TCP_ADDR: "localhost",
        },
      },
    },
  },
};
