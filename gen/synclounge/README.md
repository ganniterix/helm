# Helm chart (V3) - synclounge

## synclounge

[Synclounge](https://github.com/samcm/synclounge) is a third party tool that allows you to watch Plex in sync with your friends/family, wherever you are.

The the docker image is part of the the [`linuxserver.io`](https://www.linuxserver.io/) collection, it has a great [documentation](https://github.com/linuxserver/docker-synclounge) that cover all the image features.

## About

This chart was created with [Node.JS script](https://ekavallieri.github.io/public-helm-charts//scripts/nodejs), and relay on [`base-chart`](https://ekavallieri.github.io/public-helm-charts//base-chart) dependency for templates functionally - allowing the use of highly flexible single `value.yaml` file for describing the chart. Please refer to `base-chart` documentation for a full API description. The script scrape the [docker-documentation](https://github.com/linuxserver/docker-documentation) repository, that contains the documentation for all the `linuxserver.io` images.

The the default values for the script are set to my local network configuration - [`k3s`](https://k3s.io/) cluster on raspberry pi 4 and NFS server on `192.168.1.10`, you can use the script [configuration](https://ekavallieri.github.io/public-helm-charts//scripts/nodejs/config.js) to generate charts that fit your configuration.


## Usage

### Helm install

```bash
helm install synclounge synclounge
```

### Caveats

Don't expect everything to work out of the box!
