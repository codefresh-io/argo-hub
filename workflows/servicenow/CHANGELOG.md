# Changelog

## v1.4.0 (Mar 27, 2025)
### Added
* ability to create a Standard Change passing the template name
 in the `STD_CR_TEMPLATE` variable.

## v1.3.1 (Oct 29, 2024)
### Changed
* Make CR_SYSID and CR_NUMBER global output parameters so they can be passed between pre and post actions in promotion workflows.

## v1.3.0 (Feb 8, 2024)
### Added
* additional parameters to support resuming and terminating workflow. See examples for complete description

## v1.0.0 (Feb 2, 2022)

Initial port with 3 actions:

* Create CR
* Update CR
* Close CR

**Note:** v1.0.0 does not include yet the resume/kill of the original workflow
