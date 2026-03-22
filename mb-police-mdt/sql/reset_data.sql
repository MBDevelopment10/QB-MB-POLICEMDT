SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE `mdt_reports`;
TRUNCATE TABLE `mdt_warrants`;
TRUNCATE TABLE `mdt_bolos`;
TRUNCATE TABLE `mdt_citizens`;
TRUNCATE TABLE `mdt_vehicle_flags`;
TRUNCATE TABLE `mdt_citizen_records`;
TRUNCATE TABLE `mdt_license_logs`;
TRUNCATE TABLE `mdt_audit_logs`;
SET FOREIGN_KEY_CHECKS=1;

-- Bygg sedan upp medborgarindex ENDAST från riktiga karaktärer i players-tabellen
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
