# Helm chart (V3) - blender

## blender

[Blender](https://www.blender.org/) is a free and open-source 3D computer graphics software toolset used for creating animated films, visual effects, art, 3D printed models, motion graphics, interactive 3D applications, virtual reality, and computer games. **This image does not support GPU rendering out of the box only accelerated workspace experience**

The the docker image is part of the the [`linuxserver.io`](https://www.linuxserver.io/) collection, it has a great [documentation](https://github.com/linuxserver/docker-blender) that cover all the image features.

## About

This chart was created with [Node.JS script](https://ekavallieri.github.io/public-helm-charts//scripts/nodejs), and relay on [`base-chart`](https://ekavallieri.github.io/public-helm-charts//base-chart) dependency for templates functionally - allowing the use of highly flexible single `value.yaml` file for describing the chart. Please refer to `base-chart` documentation for a full API description. The script scrape the [docker-documentation](https://github.com/linuxserver/docker-documentation) repository, that contains the documentation for all the `linuxserver.io` images.

The the default values for the script are set to my local network configuration - [`k3s`](https://k3s.io/) cluster on raspberry pi 4 and NFS server on `192.168.1.10`, you can use the script [configuration](https://ekavallieri.github.io/public-helm-charts//scripts/nodejs/config.js) to generate charts that fit your configuration.


## Usage

### Helm install

```bash
helm install blender blender
```

### Caveats

Don't expect everything to work out of the box!
