{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "base-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "base-chart.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "base-chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "base-chart.labels" -}}
helm.sh/chart: {{ include "base-chart.chart" . }}
{{ include "base-chart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "base-chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "base-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "base-chart.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
  {{ default (include "base-chart.fullname" .) .Values.serviceAccount.name }}
{{- else -}}
  {{ default "default" .Values.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/* Prepare volume mounts from static mounts*/}}
{{ define "mapper.staticpvcmounts"}}
{{- $releasename := default "rl-test" .Release.Name -}}
{{- $namespace := default "ns-test" .Release.Namespace -}}
volumeMounts:
{{-   range .Values.static_volumes | default list }}
- name: {{ $releasename }}-{{ $namespace }}-{{ .name }}-pv
  mountPath: {{ .volumeMount.mountPath }}
  {{- if .volumeMount.subPath }}
  subPath: {{ .volumeMount.subPath }}
  {{- end }}
{{    end}}
{{-   range .Values.statefulset.volumes }}
- name: {{ .name }}
{{ toYaml .volumeMount | indent 2 }}
{{-   end }}
{{-   range .Values.statefulset.volumeClaimTemplates }}
- name: {{ .volumeClaimTemplate.metadata.name }}
{{ toYaml .volumeMount | indent 2 }}
{{-   end }}
{{ end }}

{{/*
Map a container values to a container template
Reference: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#container-v1-core
*/}}
{{ define "mapper.containers" }}
{{- $sharedValues := .Values.statefulset.sharedValues | default dict }}
{{- $sharedEnv := .Values.statefulset.sharedEnv | default list }}
{{- $staticpvcmounts := fromYaml (include "mapper.staticpvcmounts" .) }}
containers:
{{- range .Values.statefulset.containers }}
  {{- $container := (merge . $sharedValues) }}
  {{- $env := concat $sharedEnv (.env | default list) | default list }}
  {{- $_ := unset $container "env" }}
  - env: {{ toYaml $env | nindent 6 -}}
{{ toYaml $staticpvcmounts | nindent 4 }}
{{ toYaml $container | indent 4 }}
{{- end }}
{{ end }}

{{/*
Create a map with the static volumes and other defined volumes
*/}}
{{- define "mapper.volumes" -}}
{{- $releasename := default "rl-test" .Release.Name -}}
{{- $namespace := default "ns-test" .Release.Namespace -}}
{{- range .Values.static_volumes }}
- name: {{ $releasename }}-{{ $namespace }}-{{ .name }}-pv
  persistentVolumeClaim:
    claimName: {{ $releasename }}-{{ $namespace }}-{{ .name }}-pvc
{{- end }}
{{- range .Values.statefulset.volumes }}
- name: {{ .name }}
{{ toYaml .volume | indent 2 }}
{{- end }}
{{- end -}}

{{- define "mapper.volumeClaims" }}
{{- $templatesList := list }}
{{-   range .Values.statefulset.volumeClaimTemplates }}
{{- $templatesList = append $templatesList .volumeClaimTemplate }}
{{-   end}}
{{- $output := dict "volumeClaimTemplates" $templatesList }}
{{ toYaml $output | nindent 0 }}
{{- end }}
