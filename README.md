# helm chart repository (v3)

Builds on the work by [noygal](https://github.com/noygal) at this [repo](https://github.com/noygal/helm/).

This repository is a helm charts repository containing most of the [linuxserver.io](https://www.linuxserver.io/) community based docker images as helm chart. The `linuxserver.io` project is a very mature and well maintained, the standard documentation allow us to general all the charts automatically from a single repository - [docker-documentation](https://github.com/linuxserver/docker-documentation). This project is the result of my adaptation of the work created by [noygal](https://github.com/noygal) to my specific requirements. Mainly:

- I have modernized the scripts to run against some changes that have occured in the documentation of `linuxserver.io`
- Adapted the base-chart to use a stateful set
- Added the option to use static volume mappings to the pods

You can view a list off all the chart at: https://github.com/ekavallieri/helm-charts

- [helm chart repository (v3)](#helm-chart-repository-v3)
  - [Usage](#usage)
    - [1. Install](#1-install)
    - [2. Clone](#2-clone)
  - [Project Structure](#project-structure)
    - [`charts` folder](#charts-folder)
    - [`scripts` folder](#scripts-folder)
    - [`gen` folder](#gen-folder)
    - [`docs` folder](#docs-folder)
  - [Caveats](#caveats)
  - [Roadmap](#roadmap)

## Usage

### 1. Install

Adding registry to helm (single time):

```bash
helm repo add ekavallieri https://ekavallieri.github.io/public-helm-charts
```

Search registry:

```bash
helm search repo ekavallieri
```

Install chart:

```bash
helm install base-chart ekavallieri/base-chart
```

### 2. Clone

All the charts code generation is located under `script/nodejs`, it should be pretty straight forward to change the templates and configuration to produce personal version of this repository with defaults set to your personal setup.

## Project Structure

### `charts` folder

Contains the [base chart](https://github.com/ekavallieri/helm-charts/tree/master/charts/base-chart) for all the generated charts, also an usage [example](https://github.com/ekavallieri/helm-charts/tree/master/charts/exmple-dev-tools).

### `scripts` folder

Contains various maintenance scripts and the [Node.JS script](https://github.com/ekavallieri/helm-charts/tree/master/scripts/nodejs) that generate the linuxserver.io charts.

### `gen` folder

Contains the latest generated charts.

### `docs` folder

This folder is structured as helm registry and served by [GitHub Pages](https://pages.github.com/) allowing an easy serving of the registry, a setup guide can be found [here](https://medium.com/@mattiaperi/create-a-public-helm-chart-repository-with-github-pages-49b180dbb417).

## Caveats

All the charts are automatically generate and most of them are not tested at this stage, the ones that are tested running on a `RPi4 (arm64)` in `k3s` and NFS mounted volumes on the pods, this is not a production ready recipe to say the least...

## Roadmap

- Support for versions, following the linuxserver.io versions.
- CI/CD (github actions)
  - linuxserver.io docs site triggers
  - testing charts (k3s in docker)
  - registry validation
