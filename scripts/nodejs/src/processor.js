const fs = require("fs-extra");
const mustache = require("mustache");
const yaml = require("js-yaml");

const path = require("path");

const valuesTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/values.yaml.mustache"),
  "utf-8"
);
const chartTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/Chart.yaml.mustache"),
  "utf-8"
);
const readmeTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/README.md.mustache"),
  "utf-8"
);

const processDockerCompose = (dockerCompose) => {
  if (dockerCompose !== null) {
    return dockerCompose.split("\n").reduce(
      (acc, line) => {
        // Poor man's yaml parser - due to invalid yaml in docs
        // Container name matcher, ex: '  mariadb:'
        const matchContainerName = /^\s\s(?<containerName>[\w]+)/.exec(line);
        if (matchContainerName) {
          acc.currObj = matchContainerName.groups.containerName;
          acc.currArr = null;
          acc.result[acc.currObj] = {};
        }
        // Name/value matcher, ex: '    image: linuxserver/mariadb:latest'
        const matchNameValue =
          /^\s\s\s\s(?<name>[\w]+):\s(?<value>[\s\S]+)$/.exec(line);
        if (matchNameValue)
          acc.result[acc.currObj][matchNameValue.groups.name] =
            matchNameValue.groups.value;
        // Array name matcher, ex: '    environment:'
        const matchArrayName = /^\s\s\s\s(?<arrayName>[\w]+):[\s]*$/.exec(line);
        if (matchArrayName) {
          acc.currArr = matchArrayName.groups.arrayName;
          if (!acc.result[acc.currObj][acc.currArr])
            acc.result[acc.currObj][acc.currArr] = [];
        }
        // Array item matcher, ex: '      - MYSQL_DATABASE=codimd'
        const matchArrayItem = /^\s\s\s\s\s\s-\s(?<arrayItem>[\w\W]+)$/.exec(
          line
        );
        if (matchArrayItem)
          acc.result[acc.currObj][acc.currArr].push(
            matchArrayItem.groups.arrayItem
          );
        return acc;
      },
      { currObj: null, currArr: null, result: {} }
    ).result;
  }
  return {};
};

const mapContainer = ([name, { image, environment = [], ports = [] }]) => {
  const env = environment
    .filter(
      (el) =>
        !el.includes("#optional") &&
        !el.includes("PGID") &&
        !el.includes("PUID") &&
        !el.includes("TZ")
    )
    .map((el) => {
      const split = el.split("=");
      return {
        name: split[0],
        value: split[1],
      };
    });
  const processedPorts = ports.map((line) => {
    const port = line.replace(/"/g, "").split(":")[1].split("/")[0];
    const isUdp = line.toLowerCase().includes("udp");
    return {
      port,
      name: `p${port}-${isUdp ? "udp" : "tcp"}`,
      protocol: isUdp ? "UDP" : "TCP",
    };
  });
  return { name, image, ports: processedPorts, env };
};

const generateValues =
  (config) =>
  ({ name, ports, docker, volumes }) => {
    // Processing docker file
    // The render data for the template
    console.log("Processing DataSet name:", name);
    console.log("Processing DataSet port:", ports);
    const renderData = {
      name,
      ports: ports
        ? ports.dataSet.data.map(([port]) => {
            // Splitting port + udp handling
            const portNum = parseInt(port.split("/")[0]);
            const isUdp = port.toLowerCase().includes("udp");
            return {
              name: `p${portNum}-${isUdp ? "udp" : "tcp"}`,
              port: portNum,
              protocol: isUdp ? "UDP" : "TCP",
            };
          })
        : [],
      defaultEnv: config.chart.defaultEnv,
    };
    // Assume only one
    const uiPort = ports
      ? ports.dataSet.data.length === 1
        ? ports.dataSet.data[0]
        : ports.dataSet.data.find(([port, description]) =>
            description.toLowerCase().includes("ui")
          )
      : null;
    // If we have port add it to ingress
    if (uiPort)
      renderData.ingresses = {
        name,
        host: `${name}.${config.chart.host}`,
        rules: [
          {
            r_name: "p" + uiPort[0] + "-tcp",
            port: uiPort[0],
            host: `${name}.${config.chart.host}`,
          },
        ],
      };
    // Adding container data
    const containers = (renderData.containers =
      Object.entries(docker).map(mapContainer));
    // Apply override if needed
    const overrideEnv =
      config.chart.overrides &&
      config.chart.overrides.env &&
      config.chart.overrides.env[name];
    if (overrideEnv)
      renderData.containers = containers.map(({ env, ...rest }) => ({
        env: env.map((el) =>
          overrideEnv[el.name]
            ? { name: el.name, value: overrideEnv[el.name] }
            : el
        ),
        ...rest,
      }));
    // adding VolumeClaimTemplates
    renderData.volumeClaimTemplates = config.chart.volumeClaimTemplates;

    const output = mustache.render(valuesTemplate, renderData);
    return { name, output, renderData };
  };

const generateChart =
  ({ repository, versions: { chartVersion, appVersion, baseChartVersion } }) =>
  ({ name }) => ({
    output: mustache.render(chartTemplate, {
      name,
      description: `This chart deploys the '${name}' service, please refer to the documentation at: ${repository}/${name}`,
      chartVersion,
      appVersion,
      baseChartVersion,
      repository,
    }),
  });
const generateReadme =
  ({ repository }) =>
  ({ name, description }) => ({
    output: mustache.render(readmeTemplate, {
      name,
      description,
      repository,
    }),
  });

module.exports = {
  generateValues,
  generateChart,
  generateReadme,
  processDockerCompose,
};
