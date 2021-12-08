<p align="center"><img src="./utils/icons/logo.png" alt="Codefresh"></p>

# Codefresh Hub for Argo

Share and Reuse Your Argo Workflows with the Codefresh Argo Hub.

## Motivation
Anyone who builds a lot of Argo workflows knows that after a while you end up reusing the same basic steps over and over again. While Argo Workflows has a great mechanism to prevent duplicate work, with templates, these templates have mostly stayed in people’s private repositories and haven’t been shared with the broader community.

## Goals
* Allow people to find easily useful steps and flows for building even more awesome workflow
* Offer the confidence that a template is safe to use
* Enable all organizations to share their templates with the community
* Help the Argo community grow faster by knowledge reuse

## Table of Contents
* [Main features](#Main-Features)
* [Installation and Usage](#Installation-and-Usage)
* [How to Contribute](#How-to-Contribute)
* [Ask for a new Workflow](#Ask-for-a-new-Workflow)

## Main Features
* [Extensive ui for visualization and navigation](#Extensive-ui-for-visualization-and-navigation) 
* [WorkflowTemplate and inner template breakdown](#WorkflowTemplate-and-inner-template-breakdown)
* [WorkflowTemplate manifest conventions](#WorkflowTemplate-manifest-conventions)
* [Hub file system Structure](#Hub-file-system-Structure)
* [Versioning](#Versioning)
* [Full release life cycle](#Full-release-life-cycle)
* [Automatic image building and security scanning](#Automatic-image-building-and-security-scanning)
* [Pods security](#Pods-security)
* [Easily write custom scripts with your favorite language](#Easily-write-custom-scripts-with-your-favorite-language)

### Extensive ui for visualization and navigation
You can access a fully featured visualized experience here https://codefresh.io/argo/hub/

### WorkflowTemplate manifest conventions
* Every workflow template will have a name that follows the pattern `argo-hub.{NAME}.{VERSION}`
* every template inside the workflowTempalte must reference the service account that is declared in the rbac.yaml manifest

In order to be able to build an extensive ui but still making use of the original kuberntes manifest we are leverging annotations

#### WorkflowTemplate annotations
* `argo-hub/version` - sem version (0.0.2)
* `argo-hub/description` - description to be shown
* `argo-hub/license` - license (MIT)
* `argo-hub/owner_name` - github user name to appear in the site
* `argo-hub/owner_email` - email for contact
* `argo-hub/owner_avatar` - github user avatar icon
* `argo-hub/owner_url` - github user profile
* `argo-hub/categories` - categories to appear in the site
* `argo-hub/icon_url` - svg (only) icon
* `argo-hub/icon_background` - background color for the icon

#### Inner template annotations
* `argo-hub-template/description` - description for specific template
* `argo-hub-template/icon_url` - icon for specific template
* `argo-hub-template/icon_background` - background for icon 


### Hub file system Structure
The argo hub repository main folder is `workflows` <br>
Each folder represents a workflowTemplate (group of templates) and will appear as a unique item in the main list of argo hub site <br>

* the file names are important and must be followed

Inside every workflowTempalte folder you will find the following structure and files <br>
* `CHANGELOG.md` - a shared changelog md file between all the versions
* `assets` folder - in which you can store your icons to reference inside the workflowTemplate
* `versions` folder - a folder that will contain all supported versions

Inside each version folder you will find the following structure and files <br>
* `workflowTemplate.yaml` - the main manifest that follows the [conventions](#WorkflowTemplate-manifest-conventions)
* `rbac.yaml` - a single file with 3 required manifests that will provide the permissions for workflow template
* `images` folder - each sub folder will cause a docker build according to the inner Dockerfile and will be automatically built scanned and pushed to argo-hub registry: `quay.io/codefreshplugins/argo-hub-workflows-{NAME}-versions-${VERSION}-${IMAGE_FOLDER_NAME}:main`
* `docs` folder - contains documentation for every template inside the workflowTemplate (name must follow exactly the template name)

### Versioning
Each workflow template is versioned and can be referenced by specific versions. The Codefresh Hub provides a clear structure for both owners and consumers to pick and use the versions that make sense for their use cases. Users can also use multiple versions to test changes without fully upgrading.
Checkout the [file system structure](#Hub-file-system-Structure) and the [workflow template conventions](#WorkflowTemplate-manifest-conventions)

### Full release life cycle
A full release life cycle has been built to do the following:
* validate that the changes adhere the conventions (coming soon for now manually by reviewer)
* build all images defined in the `image` folder (#Automatic-image-building-and-security-scanning)
* scan the built images
* push the images into public quay registry

### Automatic image building and security scanning
X

### Pods security
X

### Easily write custom scripts with your favorite language
X


## Installation and Usage
X

### Applying a workflow template directly to your kubernetes cluster
X

### Using Argo CD
You can easily get the entire argo hub by getting it automatically applied to your cluster using the GitOps approach using Argo CD. <br>

Using Argo CD app
```
sd

```

Using Argo CD application set with following config file
```
{
  "appName": "marketplace-git-source",
  "userGivenName": "marketplace-git-source",
  "destNamespace": "codefresh-v2-production",
  "destServer": "https://kubernetes.default.svc",
  "srcPath": ".",
  "srcRepoURL": "https://github.com/codefresh-io/argo-hub.git",
  "srcTargetRevision": "",
  "labels": { "codefresh_io_entity": "git-source" },
  "exclude": "**/images/**/*",
  "include": "workflows/**/*.yaml"
}
```

##

## How to Contribute
X

### Enhancing existing workflows
X

### Writing a new Workflow
X

## Ask for a new Workflow

Please fill a github issue or thumb up an existing one




