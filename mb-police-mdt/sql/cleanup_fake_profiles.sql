-- Tar bort MDT-profiler som inte längre finns som riktiga karaktärer i players-tabellen
DELETE mc FROM `mdt_citizens` mc
LEFT JOIN `players` p ON p.citizenid = mc.citizenid
WHERE p.citizenid IS NULL;

-- Frivilligt: bygg om indexet helt från riktiga spelarkaraktärer
TRUNCATE TABLE `mdt_citizens`;
INSERT INTO `mdt_citizens` (`citizenid`,`firstname`,`lastname`,`fullname`,`birthdate`,`phone`,`gender`,`nationality`)
SELECT
  `citizenid`,
  JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.firstname')) AS `firstname`,
  JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.lastname')) AS `lastname`,
  TRIM(CONCAT(
    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.firstname')), ''),
    ' ',
    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.lastname')), '')
  )) AS `fullname`,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.birthdate')), JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.dob'))) AS `birthdate`,
  JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.phone')) AS `phone`,
  JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.gender')) AS `gender`,
  JSON_UNQUOTE(JSON_EXTRACT(`charinfo`, '$.nationality')) AS `nationality`
FROM `players`;
