SELECT deviceId, value, timestamp
FROM "telemetry2"
where key = 'temperature' and ( timestamp  >= $__fromTime AND timestamp <= $__toTime )
order by timestamp
