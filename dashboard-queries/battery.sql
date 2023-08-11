select deviceId, "value"
from (
  SELECT deviceId, "value", row_number() over (partition by deviceId order by timestamp desc) as rn
  FROM "telemetry2"
  where "key" = 'battery')
where rn = 1
