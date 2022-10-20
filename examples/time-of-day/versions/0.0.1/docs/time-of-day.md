# time-of-day

## Summary

This workflow is an example of a pipeline that checks to see if the current time is within a specified time window. Depending on the result, the workflow can then fork. This can be used, for example, to ensure that production deployments are limited to specific days of the week and times of the day; to limit notification methods depending on the time of day etc

## Inputs

### time-of-day-check-template
* EARLY - The beginning (earliest, in the same day) time of the specificed window. In 24 hour time, given as HH:MM
* LATE - The end time of the specified window, also in 24 hour time, given as HH:MM
* DAYS - A whitelist of days of the week for an initial check. The current day (eg 'Monday') is checked to see if it exists in the list, and if not, the step will exit. This can be used to limit the time of day check to only weekdays, weekends or any other pattern of days in a week.
* TIMEZONE - A GNU 'date' compatible timezone, eg 'UTC', 'Pacific/Auckland' etc.
* INVERTED - If set to true, the time window for the day gets inverted, and the step will then only pass if 'now' is outside the EARLY to LATE window. The DAYS filter behavior does not change.

## Outputs

No outputs
