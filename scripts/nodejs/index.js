const path = require("path");
const fs = require("fs-extra");
const config = require("./config");
const { getImageDocsFiles } = require("./src/git");
const { mapFile } = require("./src/files");
const processor = require("./src/processor");
const logger = console;

fs.ensureDir(config.workingFolder);
fs.ensureDir(config.outputFolder);

console.log(config.outputFolder);

const cleanup = () => fs.remove(config.workingFolder);

const logWrap =
  (logFun) =>
  (...props) => {
    logFun(...props);
    return props[0];
  };

const getFirstLine = (file) =>
  file.content.split("\n").find((line) => line.startsWith("#"));

const preprocessFiles = (config) => (files) =>
  files
    .map(
      logWrap((file, i) => logger.log(`${i} - Found file: ${file.fileName}`))
    )
    // Filtering only valid files
    .filter((file) =>
      config.files.firstLineRegexFilter.test(getFirstLine(file))
    )
    // Main mapper
    .map(mapFile(config))
    // Filter data without description ('tester' file use case)
    .filter((data) => data.description)
    .map(
      logWrap((data, i) =>
        logger.log(
          `${i} - Data populates from file: ${data.fileName}, name: ${data.name}`
        )
      )
    );

const processData = (config) => (data) =>
  Promise.all(
    data.map(
      async ({
        name,
        fileName,
        fullPath,
        description,
        ports,
        env,
        volumes,
        devices,
        arch,
        dockerCompose,
      }) => {
        console.log("name:", name);
        console.log("fileName:", fileName);
        console.log("fullPath:", fullPath);
        console.log("description:", description);
        console.log("ports:", ports);
        console.log("env:", env);
        console.log("volumes:", volumes);
        console.log("devices:", devices);
        console.log("arch:", arch);
        console.log("dockerCompose:", dockerCompose);
        const docker = processor.processDockerCompose(dockerCompose);
        console.log("docker:", docker);
        const values = processor.generateValues(config)({
          name,
          ports,
          docker,
          volumes,
        });
        console.log("values:", values);
        const chart = processor.generateChart(config)({ name });
        console.log("chart:", chart);
        const readme = processor.generateReadme(config)({ name, description });
        console.log("readme:", readme);
        return { name, values, chart, readme };
      }
    )
  );

const writeFile =
  ({ outputFolder }) =>
  ({ name, values, chart, readme }) => {
    console.log("output folder:", outputFolder, "/", name);

    return fs
      .ensureDir(path.join(outputFolder, name))
      .then(() =>
        Promise.all([
          fs.writeFile(
            path.join(outputFolder, name, "values.yaml"),
            values.output
          ),
          fs.writeFile(
            path.join(outputFolder, name, "Chart.yaml"),
            chart.output
          ),
          fs.writeFile(
            path.join(outputFolder, name, "README.md"),
            readme.output
          ),
        ])
      );
  };

getImageDocsFiles(config)
  .then(preprocessFiles(config))
  .then(processData(config))
  // .then((results) =>
  //   console.log(
  //     require("util").inspect(
  //       results.find((el) => !el.dockerCompose),
  //       { showHidden: false, depth: null }
  //     )
  //   )
  // )
  // .then((results) =>
  //   console.log(
  //     require("util").inspect(results[85], { showHidden: false, depth: null })
  //   )
  // )
  // .then(results => Promise.all(results.map(({name, output}))))
  // .then(console.log)
  .then((data) => Promise.all(data.map(writeFile(config))))
  // .then((results) => console.log("hallo werld"))
  // .then((data) => writeFile(config)(data[0]))
  .catch(console.error)
  .then(cleanup);
