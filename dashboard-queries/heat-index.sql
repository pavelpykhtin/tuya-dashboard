with temperature as (
  select deviceId, value, timestamp
  from "telemetry2"
  where key = 'temperature' and ( timestamp  >= $__fromTime AND timestamp <= $__toTime )
),
humidity as (
  select deviceId, value, timestamp
  from "telemetry2"
  where key = 'humidity' and ( timestamp  >= $__fromTime AND timestamp <= $__toTime )
)

select
  temperature.timestamp,
  temperature.deviceId,
  (
    -8.78469475556
    + 1.61139411 * temperature.value
    + 2.33854883889 * humidity.value
    - 0.14611605 * temperature.value * humidity.value
    -0.012308094 * temperature.value*temperature.value
    - 0.0164248277778 * humidity.value*humidity.value
    + 0.002211732 * temperature.value*temperature.value * humidity.value
    + 0.00072546 * temperature.value * humidity.value*humidity.value
    - 0.000003582 * temperature.value*temperature.value * humidity.value*humidity.value) as value
from temperature
inner join humidity on humidity.timestamp = temperature.timestamp and humidity.deviceId = temperature.deviceId
order by timestamp
