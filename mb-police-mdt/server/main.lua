local QBCore = exports['qb-core']:GetCoreObject()

local function trim(s)
    s = tostring(s or '')
    return (s:gsub('^%s+', ''):gsub('%s+$', ''))
end

local function lower(s)
    return string.lower(trim(s))
end

local function jsonDecode(v, fallback)
    if type(v) == 'table' then return v end
    if type(v) ~= 'string' or v == '' then return fallback end
    local ok, data = pcall(json.decode, v)
    if ok and data ~= nil then return data end
    return fallback
end

local function jsonEncode(v)
    local ok, data = pcall(json.encode, v)
    if ok then return data end
    return '[]'
end

local function getPlayer(src)
    return QBCore.Functions.GetPlayer(src)
end

local function getOfficerIdentity(src)
    local ply = getPlayer(src)
    if not ply then return nil, 'Unknown', 'Unknown' end
    local pData = ply.PlayerData or {}
    local charinfo = pData.charinfo or {}
    local name = trim(((charinfo.firstname or '') .. ' ' .. (charinfo.lastname or '')))
    if name == '' then name = pData.name or ('Player '.. tostring(src)) end
    return ply, pData.citizenid or '', name
end

local function hasAccess(src)
    if not Config.RequirePoliceJob then return true end
    local ply = getPlayer(src)
    if not ply then return false end
    local job = ply.PlayerData and ply.PlayerData.job or nil
    if not job or not Config.AllowedJobs[job.name] then return false end
    if Config.RequireOnDuty and not job.onduty then return false end
    return true
end

local function audit(src, action, entity, entityId, details)
    if not Config.EnableAuditLog then return end
    local _, cid, name = getOfficerIdentity(src)
    MySQL.insert('INSERT INTO mdt_audit_logs (actor_cid, actor_name, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)', {
        cid, name, tostring(action or ''), tostring(entity or ''), tostring(entityId or ''), jsonEncode(details or {})
    })
end

local function splitName(fullname)
    fullname = trim(fullname)
    if fullname == '' then return '', '' end
    local first, last = fullname:match('^(%S+)%s+(.+)$')
    return first or fullname, last or ''
end

local function normalizeCitizenRow(row)
    if not row then return nil end
    local name = trim((row.fullname or '') ~= '' and row.fullname or (((row.firstname or '') .. ' ' .. (row.lastname or ''))))
    if name == '' then name = row.citizenid or 'Unknown' end
    return {
        citizenid = row.citizenid,
        firstname = row.firstname,
        lastname = row.lastname,
        name = name,
        dob = row.birthdate,
        phone = row.phone,
        gender = row.gender,
        nationality = row.nationality,
    }
end

local function getCharField(obj, key)
    if type(obj) ~= 'table' then return nil end
    if obj[key] ~= nil then return obj[key] end
    return nil
end

local function playerRowToCitizen(row)
    if not row then return nil end
    local charinfo = jsonDecode(row.charinfo, {}) or {}
    local first = getCharField(charinfo, 'firstname') or ''
    local last = getCharField(charinfo, 'lastname') or ''
    local fullname = trim(((first or '') .. ' ' .. (last or '')))
    if fullname == '' then fullname = row.name or row.citizenid end
    return {
        citizenid = row.citizenid,
        firstname = first,
        lastname = last,
        fullname = fullname,
        birthdate = getCharField(charinfo, 'birthdate') or getCharField(charinfo, 'dob') or '',
        phone = getCharField(charinfo, 'phone') or '',
        gender = tostring(getCharField(charinfo, 'gender') or ''),
        nationality = getCharField(charinfo, 'nationality') or ''
    }
end

local function purgeOrphanedCitizenIndexRows()
    pcall(function()
        MySQL.query.await([[
            DELETE mc FROM mdt_citizens mc
            LEFT JOIN players p ON p.citizenid = mc.citizenid
            WHERE p.citizenid IS NULL
        ]], {})
    end)
end

local function rebuildCitizenIndex()
    purgeOrphanedCitizenIndexRows()
    local players = MySQL.query.await('SELECT citizenid, charinfo, name FROM players', {}) or {}
    local seen = {}
    for _, row in ipairs(players) do
        local c = playerRowToCitizen(row)
        if c and c.citizenid and c.citizenid ~= '' and not seen[c.citizenid] then
            seen[c.citizenid] = true
            MySQL.insert.await([[
                INSERT INTO mdt_citizens (citizenid, firstname, lastname, fullname, birthdate, phone, gender, nationality)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    firstname = VALUES(firstname), lastname = VALUES(lastname), fullname = VALUES(fullname),
                    birthdate = VALUES(birthdate), phone = VALUES(phone), gender = VALUES(gender), nationality = VALUES(nationality)
            ]], { c.citizenid, c.firstname, c.lastname, c.fullname, c.birthdate, c.phone, c.gender, c.nationality })
        end
    end
end

local function fetchCitizensFromPlayers(q, limit)
    limit = tonumber(limit) or Config.SearchLimit or 50
    local rows = {}
    if q == '' then
        rows = MySQL.query.await('SELECT citizenid, charinfo, name FROM players ORDER BY citizenid DESC LIMIT ' .. limit, {}) or {}
    else
        local like = '%' .. q .. '%'
        rows = MySQL.query.await([[
            SELECT citizenid, charinfo, name
            FROM players
            WHERE citizenid LIKE ? OR charinfo LIKE ? OR name LIKE ?
            ORDER BY citizenid DESC LIMIT ]] .. limit, { like, like, like }) or {}
    end

    local out, seen = {}, {}
    for _, row in ipairs(rows) do
        local c = playerRowToCitizen(row)
        if c and c.citizenid and c.citizenid ~= '' and not seen[c.citizenid] then
            seen[c.citizenid] = true
            out[#out+1] = c
            MySQL.insert.await([[
                INSERT INTO mdt_citizens (citizenid, firstname, lastname, fullname, birthdate, phone, gender, nationality)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    firstname = VALUES(firstname), lastname = VALUES(lastname), fullname = VALUES(fullname),
                    birthdate = VALUES(birthdate), phone = VALUES(phone), gender = VALUES(gender), nationality = VALUES(nationality)
            ]], { c.citizenid, c.firstname, c.lastname, c.fullname, c.birthdate, c.phone, c.gender, c.nationality })
        end
    end
    return out
end

local function ensureCitizenIndex()
    purgeOrphanedCitizenIndexRows()
    local row = MySQL.single.await('SELECT COUNT(*) as c FROM mdt_citizens', {})
    local count = row and tonumber(row.c) or 0
    if count == 0 and Config.CitizenIndex and Config.CitizenIndex.AutoRebuildIfEmpty then
        rebuildCitizenIndex()
    end
end

local function upsertCitizenFromPlayerByCid(citizenid)
    local row = MySQL.single.await('SELECT citizenid, charinfo, name FROM players WHERE citizenid = ? LIMIT 1', { citizenid })
    local c = playerRowToCitizen(row)
    if c and c.citizenid then
        MySQL.insert.await([[
            INSERT INTO mdt_citizens (citizenid, firstname, lastname, fullname, birthdate, phone, gender, nationality)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                firstname = VALUES(firstname), lastname = VALUES(lastname), fullname = VALUES(fullname),
                birthdate = VALUES(birthdate), phone = VALUES(phone), gender = VALUES(gender), nationality = VALUES(nationality)
        ]], { c.citizenid, c.firstname, c.lastname, c.fullname, c.birthdate, c.phone, c.gender, c.nationality })
    end
end

local function getPlayerByCitizenId(citizenid)
    for _, id in pairs(QBCore.Functions.GetPlayers() or {}) do
        local p = QBCore.Functions.GetPlayer(id)
        if p and p.PlayerData and p.PlayerData.citizenid == citizenid then
            return p
        end
    end
    return nil
end

local function getCitizenProfile(citizenid)
    upsertCitizenFromPlayerByCid(citizenid)
    local idx = MySQL.single.await('SELECT * FROM mdt_citizens WHERE citizenid = ? LIMIT 1', { citizenid })
    local base = normalizeCitizenRow(idx) or { citizenid = citizenid, name = citizenid }
    local playerRow = MySQL.single.await('SELECT citizenid, charinfo, job, metadata, name FROM players WHERE citizenid = ? LIMIT 1', { citizenid })
    local metadata, job, charinfo = {}, {}, {}
    if playerRow then
        metadata = jsonDecode(playerRow.metadata, {}) or {}
        job = jsonDecode(playerRow.job, {}) or {}
        charinfo = jsonDecode(playerRow.charinfo, {}) or {}
        if (base.name or '') == citizenid then
            base.name = trim(((charinfo.firstname or '') .. ' ' .. (charinfo.lastname or '')))
        end
        base.phone = base.phone ~= '' and base.phone or (charinfo.phone or '')
        base.dob = base.dob ~= '' and base.dob or (charinfo.birthdate or charinfo.dob or '')
        base.gender = base.gender ~= '' and base.gender or tostring(charinfo.gender or '')
        base.nationality = base.nationality ~= '' and base.nationality or (charinfo.nationality or '')
    end

    local live = getPlayerByCitizenId(citizenid)
    if live and live.PlayerData then
        local pd = live.PlayerData
        metadata = pd.metadata or metadata
        job = pd.job or job
        local ci = pd.charinfo or {}
        if ci.firstname or ci.lastname then
            base.name = trim(((ci.firstname or '') .. ' ' .. (ci.lastname or '')))
        end
        base.phone = ci.phone or base.phone
        base.dob = ci.birthdate or ci.dob or base.dob
        base.gender = tostring(ci.gender or base.gender or '')
        base.nationality = ci.nationality or base.nationality
    end

    local warrants = MySQL.query.await('SELECT id, reason, issued_by_name, created_at, expires_at FROM mdt_warrants WHERE target_cid = ? AND active = 1 ORDER BY created_at DESC', { citizenid }) or {}
    local records = MySQL.query.await('SELECT id, created_at, record_type, title, details, officer_name FROM mdt_citizen_records WHERE citizenid = ? AND active = 1 ORDER BY created_at DESC', { citizenid }) or {}
    local reports = MySQL.query.await('SELECT id, created_at, author_name, category, title, content FROM mdt_reports WHERE involved_cids LIKE ? ORDER BY created_at DESC LIMIT 50', { '%' .. citizenid .. '%' }) or {}

    local licenses = metadata.licences or metadata.licenses or {}
    if type(licenses) ~= 'table' then licenses = {} end

    return {
        ok = true,
        citizenid = citizenid,
        name = base.name,
        phone = base.phone,
        dob = base.dob,
        gender = base.gender,
        nationality = base.nationality,
        job = job,
        callsign = metadata.callsign or ((job and job.grade and job.grade.name) or nil),
        licenses = {
            driver = licenses.driver == true,
            weapon = licenses.weapon == true
        },
        warrants = warrants,
        records = records,
        reports = reports,
    }
end

local function normalizeVehicleRow(row)
    if not row then return nil end
    local owner = row.citizenid or row.owner or row.cid or ''
    local veh = row.vehicle or row.model or row.hash or 'Fordon'
    return {
        plate = row.plate,
        citizenid = owner,
        vehicle = veh,
    }
end

local function fetchVehicleByPlate(plate)
    local queries = {
        'SELECT plate, citizenid, vehicle, mods FROM player_vehicles WHERE plate = ? LIMIT 1',
        'SELECT plate, citizenid, vehicle FROM player_vehicles WHERE plate = ? LIMIT 1',
        'SELECT plate, citizenid, mods FROM player_vehicles WHERE plate = ? LIMIT 1',
        'SELECT plate, owner as citizenid, model as vehicle FROM player_vehicles WHERE plate = ? LIMIT 1',
    }
    for _, q in ipairs(queries) do
        local ok, res = pcall(function() return MySQL.single.await(q, { plate }) end)
        if ok and res and res.plate then return res end
    end
    return nil
end

local function searchVehicleRows(q, limit)
    limit = tonumber(limit) or Config.SearchLimit or 50
    local queries = {
        'SELECT plate, citizenid, vehicle FROM player_vehicles WHERE plate LIKE ? ORDER BY plate ASC LIMIT ' .. limit,
        'SELECT plate, citizenid, mods FROM player_vehicles WHERE plate LIKE ? ORDER BY plate ASC LIMIT ' .. limit,
        'SELECT plate, owner as citizenid, model as vehicle FROM player_vehicles WHERE plate LIKE ? ORDER BY plate ASC LIMIT ' .. limit,
    }
    for _, sql in ipairs(queries) do
        local ok, res = pcall(function() return MySQL.query.await(sql, { '%' .. q .. '%' }) end)
        if ok and res then return res end
    end
    return {}
end

local function getWantedRow(plate)
    return MySQL.single.await('SELECT * FROM mdt_vehicle_flags WHERE plate = ? LIMIT 1', { plate })
end

local function getLatestWantedVehicles(limit)
    limit = tonumber(limit) or 5
    local queries = {
        'SELECT vf.plate, vf.reason, vf.created_by_name, vf.created_at, pv.citizenid, pv.vehicle FROM mdt_vehicle_flags vf LEFT JOIN player_vehicles pv ON pv.plate = vf.plate WHERE vf.wanted = 1 AND vf.active = 1 ORDER BY vf.created_at DESC LIMIT ' .. limit,
        'SELECT vf.plate, vf.reason, vf.created_by_name, vf.created_at, pv.citizenid, pv.model as vehicle FROM mdt_vehicle_flags vf LEFT JOIN player_vehicles pv ON pv.plate = vf.plate WHERE vf.wanted = 1 AND vf.active = 1 ORDER BY vf.created_at DESC LIMIT ' .. limit,
        'SELECT plate, reason, created_by_name, created_at FROM mdt_vehicle_flags WHERE wanted = 1 AND active = 1 ORDER BY created_at DESC LIMIT ' .. limit,
    }
    for _, q in ipairs(queries) do
        local ok, res = pcall(function() return MySQL.query.await(q, {}) end)
        if ok and res then return res end
    end
    return {}
end

local function setPlayerLicense(citizenid, key, status)
    local live = getPlayerByCitizenId(citizenid)
    if live and live.PlayerData then
        local metadata = live.PlayerData.metadata or {}
        metadata.licences = metadata.licences or metadata.licenses or {}
        metadata.licences[key] = status == true
        metadata.licenses = metadata.licences
        live.Functions.SetMetaData('licences', metadata.licences)
        live.Functions.SetMetaData('licenses', metadata.licenses)
        return true
    end

    local row = MySQL.single.await('SELECT metadata FROM players WHERE citizenid = ? LIMIT 1', { citizenid })
    if not row then return false end
    local metadata = jsonDecode(row.metadata, {}) or {}
    metadata.licences = metadata.licences or metadata.licenses or {}
    metadata.licences[key] = status == true
    metadata.licenses = metadata.licences
    MySQL.update.await('UPDATE players SET metadata = ? WHERE citizenid = ?', { jsonEncode(metadata), citizenid })
    return true
end

local function registerUsableItem()
    if Config.TabletItem and Config.TabletItem ~= '' then
        QBCore.Functions.CreateUseableItem(Config.TabletItem, function(source)
            TriggerClientEvent('qb-police-mdt:client:useTablet', source)
        end)
    end
end

AddEventHandler('onResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    Wait(500)
    if Config.CitizenIndex and Config.CitizenIndex.ForceRebuildOnStart then
        rebuildCitizenIndex()
    else
        ensureCitizenIndex()
    end
    registerUsableItem()
end)

RegisterCommand('mdt_reindex_citizens', function(source)
    if source ~= 0 and not hasAccess(source) then return end
    rebuildCitizenIndex()
    if source ~= 0 then
        TriggerClientEvent('QBCore:Notify', source, 'MDT medborgarindex uppdaterat', 'success')
    else
        print('[MB Development][qb-police-mdt] citizen index rebuilt')
    end
end, false)

RegisterNetEvent('qb-police-mdt:server:touch', function()
    local src = source
    if not hasAccess(src) then return end
    audit(src, 'touch', 'mdt', nil, { action = 'open' })
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:getDashboard', function(source, cb)
    if not hasAccess(source) then cb({ ok = false }) return end
    local reports = MySQL.single.await('SELECT COUNT(*) as c FROM mdt_reports WHERE DATE(created_at) = CURRENT_DATE()', {})
    local warrants = MySQL.single.await('SELECT COUNT(*) as c FROM mdt_warrants WHERE active = 1', {})
    local bolos = MySQL.single.await('SELECT COUNT(*) as c FROM mdt_bolos WHERE active = 1', {})
    local wantedVehicles = MySQL.single.await('SELECT COUNT(*) as c FROM mdt_vehicle_flags WHERE wanted = 1 AND active = 1', {})
    local latestReports = MySQL.query.await('SELECT id, title, category, author_name, created_at FROM mdt_reports ORDER BY created_at DESC LIMIT 5', {}) or {}
    local latestWarrants = MySQL.query.await('SELECT id, target_name, target_cid, reason, issued_by_name, created_at, expires_at FROM mdt_warrants WHERE active = 1 ORDER BY created_at DESC LIMIT 5', {}) or {}
    local latestWantedVehicles = getLatestWantedVehicles(5)
    cb({
        ok = true,
        reports = tonumber(reports and reports.c or 0),
        warrants = tonumber(warrants and warrants.c or 0),
        bolos = tonumber(bolos and bolos.c or 0),
        wantedVehicles = tonumber(wantedVehicles and wantedVehicles.c or 0),
        latestReports = latestReports,
        latestWarrants = latestWarrants,
        latestWantedVehicles = latestWantedVehicles,
    })
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:searchCitizens', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false, results = {} }) return end
    ensureCitizenIndex()
    local q = trim(payload and payload.query or '')
    local limit = tonumber(payload and payload.limit) or Config.SearchLimit or 50
    local indexed = {}
    if q == '' then
        indexed = MySQL.query.await('SELECT citizenid, firstname, lastname, fullname, birthdate, phone, gender, nationality FROM mdt_citizens ORDER BY fullname ASC LIMIT ' .. limit, {}) or {}
    else
        local like = '%' .. q .. '%'
        indexed = MySQL.query.await([[SELECT citizenid, firstname, lastname, fullname, birthdate, phone, gender, nationality
            FROM mdt_citizens
            WHERE citizenid LIKE ? OR fullname LIKE ? OR firstname LIKE ? OR lastname LIKE ? OR phone LIKE ?
            ORDER BY fullname ASC LIMIT ]] .. limit, { like, like, like, like, like }) or {}
    end

    local out, seen = {}, {}
    for _, row in ipairs(indexed) do
        local c = normalizeCitizenRow(row)
        if c and c.citizenid and not seen[c.citizenid] then
            seen[c.citizenid] = true
            out[#out+1] = c
        end
    end

    local playerRows = fetchCitizensFromPlayers(q, limit)
    for _, row in ipairs(playerRows) do
        local c = normalizeCitizenRow(row)
        if c and c.citizenid and not seen[c.citizenid] then
            seen[c.citizenid] = true
            out[#out+1] = c
        end
    end

    table.sort(out, function(a, b)
        return lower(a.name or a.citizenid or '') < lower(b.name or b.citizenid or '')
    end)

    while #out > limit do table.remove(out) end
    audit(source, 'search', 'citizen', q, { count = #out })
    cb({ ok = true, results = out })
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:suggestCitizens', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false, results = {} }) return end
    payload = payload or {}
    ensureCitizenIndex()
    local q = trim(payload.query or '')
    local limit = tonumber(payload.limit) or 8
    if q == '' then cb({ ok = true, results = {} }) return end
    local like = '%' .. q .. '%'
    local rows = MySQL.query.await([[SELECT citizenid, firstname, lastname, fullname, birthdate, phone, gender, nationality
        FROM mdt_citizens
        WHERE citizenid LIKE ? OR fullname LIKE ? OR firstname LIKE ? OR lastname LIKE ? OR phone LIKE ?
        ORDER BY fullname ASC LIMIT ]] .. limit, { like, like, like, like, like }) or {}
    local out, seen = {}, {}
    for _, row in ipairs(rows) do
        local c = normalizeCitizenRow(row)
        if c and c.citizenid and not seen[c.citizenid] then
            seen[c.citizenid] = true
            out[#out+1] = { citizenid = c.citizenid, name = c.name }
        end
    end
    local playerRows = fetchCitizensFromPlayers(q, limit)
    for _, row in ipairs(playerRows) do
        local c = normalizeCitizenRow(row)
        if c and c.citizenid and not seen[c.citizenid] and #out < limit then
            seen[c.citizenid] = true
            out[#out+1] = { citizenid = c.citizenid, name = c.name }
        end
    end
    cb({ ok = true, results = out })
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:getCitizen', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false }) return end
    local citizenid = trim(payload and payload.citizenid or '')
    if citizenid == '' then cb({ ok = false }) return end
    local data = getCitizenProfile(citizenid)
    audit(source, 'open', 'citizen', citizenid, {})
    cb(data)
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:getCitizenRecords', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false, records = {} }) return end
    local citizenid = trim(payload and payload.citizenid or '')
    local q = lower(payload and payload.query or '')
    if citizenid == '' then cb({ ok = false, records = {} }) return end
    local rows = MySQL.query.await('SELECT id, created_at, record_type, title, details, officer_name FROM mdt_citizen_records WHERE citizenid = ? AND active = 1 ORDER BY created_at DESC', { citizenid }) or {}
    if q ~= '' then
        local filtered = {}
        for _, r in ipairs(rows) do
            local blob = lower((r.record_type or '') .. ' ' .. (r.title or '') .. ' ' .. (r.details or '') .. ' ' .. (r.officer_name or ''))
            if blob:find(q, 1, true) then filtered[#filtered+1] = r end
        end
        rows = filtered
    end
    cb({ ok = true, records = rows })
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:getLicenseLogs', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false, logs = {} }) return end
    local citizenid = trim(payload and payload.citizenid or '')
    local q = lower(payload and payload.query or '')
    if citizenid == '' then cb({ ok = false, logs = {} }) return end
    local rows = MySQL.query.await('SELECT id, citizenid, license_key, new_status, action, reason, officer_cid, officer_name, created_at FROM mdt_license_logs WHERE citizenid = ? ORDER BY created_at DESC LIMIT 100', { citizenid }) or {}
    if q ~= '' then
        local filtered = {}
        for _, r in ipairs(rows) do
            local blob = lower((r.license_key or '') .. ' ' .. (r.action or '') .. ' ' .. (r.reason or '') .. ' ' .. (r.officer_name or ''))
            if blob:find(q, 1, true) then filtered[#filtered+1] = r end
        end
        rows = filtered
    end
    cb({ ok = true, logs = rows })
end)

RegisterNetEvent('qb-police-mdt:server:addCitizenRecord', function(payload)
    local src = source
    if not hasAccess(src) then return end
    payload = payload or {}
    local citizenid = trim(payload.citizenid or '')
    local title = trim(payload.title or '')
    if citizenid == '' or title == '' then return end
    local _, officerCid, officerName = getOfficerIdentity(src)
    MySQL.insert('INSERT INTO mdt_citizen_records (citizenid, record_type, title, details, officer_cid, officer_name, active) VALUES (?, ?, ?, ?, ?, ?, 1)', {
        citizenid,
        trim(payload.record_type or payload.type or 'ARANDE'),
        title,
        trim(payload.details or payload.content or ''),
        officerCid,
        officerName
    })
    audit(src, 'create', 'citizen_record', citizenid, payload)
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:setLicenseStatusCb', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false }) return end
    payload = payload or {}
    local citizenid = trim(payload.citizenid or '')
    local license = trim(payload.license or '')
    local status = payload.status == true
    if citizenid == '' or (license ~= 'driver' and license ~= 'weapon') then cb({ ok = false }) return end
    local ok = setPlayerLicense(citizenid, license, status)
    if ok then
        local _, officerCid, officerName = getOfficerIdentity(source)
        MySQL.insert('INSERT INTO mdt_license_logs (citizenid, license_key, new_status, action, reason, officer_cid, officer_name) VALUES (?, ?, ?, ?, ?, ?, ?)', {
            citizenid, license, status and 1 or 0, status and 'restore' or 'revoke', trim(payload.reason or ''), officerCid, officerName
        })
        audit(source, 'license_' .. (status and 'restore' or 'revoke'), 'citizen', citizenid, { license = license, reason = payload.reason or '' })
    end
    cb({ ok = ok })
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:searchVehicles', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false, results = {} }) return end
    local q = trim(payload and payload.query or '')
    if q == '' then cb({ ok = true, results = {} }) return end
    local rows = searchVehicleRows(q, payload and payload.limit)
    local out = {}
    for _, row in ipairs(rows) do
        local v = normalizeVehicleRow(row)
        if v and v.plate then
            local wanted = getWantedRow(v.plate)
            v.wanted = wanted and wanted.wanted or 0
            out[#out+1] = v
        end
    end
    audit(source, 'search', 'vehicle', q, { count = #out })
    cb({ ok = true, results = out })
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:getVehicle', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false }) return end
    local plate = trim(payload and payload.plate or '')
    if plate == '' then cb({ ok = false }) return end
    local row = fetchVehicleByPlate(plate)
    if not row then cb({ ok = false }) return end
    local v = normalizeVehicleRow(row)
    local owner = v.citizenid ~= '' and getCitizenProfile(v.citizenid) or nil
    cb({
        ok = true,
        plate = v.plate,
        citizenid = v.citizenid,
        owner_name = owner and owner.name or 'Unknown',
        vehicle = v.vehicle,
        wanted = getWantedRow(v.plate)
    })
end)

RegisterNetEvent('qb-police-mdt:server:setVehicleWanted', function(payload)
    local src = source
    if not hasAccess(src) then return end
    payload = payload or {}
    local plate = trim(payload.plate or '')
    local reason = string.sub(trim(payload.reason or ''), 1, tonumber(Config.VehicleFlags and Config.VehicleFlags.MaxReasonLength or 255))
    if plate == '' or reason == '' then return end
    local _, officerCid, officerName = getOfficerIdentity(src)
    MySQL.insert.await([[
        INSERT INTO mdt_vehicle_flags (plate, wanted, reason, created_by_cid, created_by_name, active)
        VALUES (?, 1, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE wanted = VALUES(wanted), reason = VALUES(reason), created_by_cid = VALUES(created_by_cid), created_by_name = VALUES(created_by_name), active = 1, created_at = CURRENT_TIMESTAMP
    ]], { plate, reason, officerCid, officerName })
    audit(src, 'set_wanted', 'vehicle', plate, { reason = reason })
end)

RegisterNetEvent('qb-police-mdt:server:clearVehicleWanted', function(payload)
    local src = source
    if not hasAccess(src) then return end
    local plate = trim(payload and payload.plate or '')
    if plate == '' then return end
    MySQL.update('UPDATE mdt_vehicle_flags SET wanted = 0, active = 0 WHERE plate = ?', { plate })
    audit(src, 'clear_wanted', 'vehicle', plate, {})
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:listReports', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false, results = {} }) return end
    local limit = tonumber(payload and payload.limit) or 50
    local rows = MySQL.query.await('SELECT id, created_at, author_cid, author_name, category, title, content, involved_cids, involved_plates FROM mdt_reports ORDER BY created_at DESC LIMIT ' .. limit, {}) or {}
    cb({ ok = true, results = rows })
end)

RegisterNetEvent('qb-police-mdt:server:addReport', function(payload)
    local src = source
    if not hasAccess(src) then return end
    payload = payload or {}
    local category = trim(payload.category or 'Other')
    local title = trim(payload.title or '')
    local content = trim(payload.content or '')
    if title == '' or content == '' then return end
    local _, officerCid, officerName = getOfficerIdentity(src)
    local people = payload.involved_people or payload.involved_cids or {}
    local plates = payload.involved_plates or {}
    if type(people) ~= 'table' then people = {} end
    if type(plates) ~= 'table' then plates = {} end
    MySQL.insert('INSERT INTO mdt_reports (author_cid, author_name, category, title, content, involved_cids, involved_plates) VALUES (?, ?, ?, ?, ?, ?, ?)', {
        officerCid, officerName, category, title, content, jsonEncode(people), jsonEncode(plates)
    })
    audit(src, 'create', 'report', title, { category = category, involved_people = people, involved_plates = plates })
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:getReport', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false }) return end
    local id = tonumber(payload and payload.id or 0)
    if id <= 0 then cb({ ok = false }) return end
    local row = MySQL.single.await('SELECT * FROM mdt_reports WHERE id = ? LIMIT 1', { id })
    if not row then cb({ ok = false }) return end
    row.ok = true
    row.involved_cids = jsonDecode(row.involved_cids, {}) or {}
    row.involved_plates = jsonDecode(row.involved_plates, {}) or {}
    cb(row)
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:listWarrants', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false, results = {} }) return end
    payload = payload or {}
    local limit = tonumber(payload.limit) or 100
    local sql = 'SELECT id, created_at, expires_at, issued_by_cid, issued_by_name, target_cid, target_name, reason, active FROM mdt_warrants'
    if payload.onlyActive then sql = sql .. ' WHERE active = 1' end
    sql = sql .. ' ORDER BY created_at DESC LIMIT ' .. limit
    cb({ ok = true, results = MySQL.query.await(sql, {}) or {} })
end)

RegisterNetEvent('qb-police-mdt:server:addWarrant', function(payload)
    local src = source
    if not hasAccess(src) then return end
    payload = payload or {}
    local targetCid = trim(payload.target_cid or '')
    local targetName = trim(payload.target_name or '')
    local reason = trim(payload.reason or '')
    if targetCid == '' or reason == '' then return end
    if targetName == '' then
        local prof = getCitizenProfile(targetCid)
        targetName = prof and prof.name or targetCid
    end
    local _, officerCid, officerName = getOfficerIdentity(src)
    local expires = trim(payload.expires_at or '')
    if expires == '' then expires = nil end
    MySQL.insert('INSERT INTO mdt_warrants (expires_at, issued_by_cid, issued_by_name, target_cid, target_name, reason, active) VALUES (?, ?, ?, ?, ?, ?, 1)', {
        expires, officerCid, officerName, targetCid, targetName, reason
    })
    audit(src, 'create', 'warrant', targetCid, { target_name = targetName, reason = reason, expires_at = expires })
end)

RegisterNetEvent('qb-police-mdt:server:clearWarrant', function(payload)
    local src = source
    if not hasAccess(src) then return end
    local id = tonumber(payload and payload.id or 0)
    if id <= 0 then return end
    MySQL.update('UPDATE mdt_warrants SET active = 0 WHERE id = ?', { id })
    audit(src, 'clear', 'warrant', id, {})
end)

QBCore.Functions.CreateCallback('qb-police-mdt:server:listBolos', function(source, cb, payload)
    if not hasAccess(source) then cb({ ok = false, results = {} }) return end
    payload = payload or {}
    local limit = tonumber(payload.limit) or 100
    local sql = 'SELECT id, created_at, created_by_cid, created_by_name, type, description, last_seen, plate, active FROM mdt_bolos'
    if payload.onlyActive then sql = sql .. ' WHERE active = 1' end
    sql = sql .. ' ORDER BY created_at DESC LIMIT ' .. limit
    cb({ ok = true, results = MySQL.query.await(sql, {}) or {} })
end)

RegisterNetEvent('qb-police-mdt:server:addBolo', function(payload)
    local src = source
    if not hasAccess(src) then return end
    payload = payload or {}
    local typ = trim(payload.type or 'PERSON')
    if typ ~= 'VEHICLE' then typ = 'PERSON' end
    local description = trim(payload.description or '')
    if description == '' then return end
    local _, officerCid, officerName = getOfficerIdentity(src)
    MySQL.insert('INSERT INTO mdt_bolos (created_by_cid, created_by_name, type, description, last_seen, plate, active) VALUES (?, ?, ?, ?, ?, ?, 1)', {
        officerCid, officerName, typ, description, trim(payload.last_seen or ''), trim(payload.plate or '')
    })
    audit(src, 'create', 'bolo', typ, payload)
end)

RegisterNetEvent('qb-police-mdt:server:clearBolo', function(payload)
    local src = source
    if not hasAccess(src) then return end
    local id = tonumber(payload and payload.id or 0)
    if id <= 0 then return end
    MySQL.update('UPDATE mdt_bolos SET active = 0 WHERE id = ?', { id })
    audit(src, 'clear', 'bolo', id, {})
end)
