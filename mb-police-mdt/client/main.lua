local QBCore = exports['qb-core']:GetCoreObject()
local isOpen = false
local tabletProp = nil
local lockedThreadRunning = false

local function hasAccess()
    if not Config.RequirePoliceJob then return true end
    local PlayerData = QBCore.Functions.GetPlayerData()
    if not PlayerData or not PlayerData.job then return false end
    if not Config.AllowedJobs[PlayerData.job.name] then return false end
    if Config.RequireOnDuty and not PlayerData.job.onduty then return false end
    return true
end


local function startTabletAnim()
    if not Config.TabletAnim or not Config.TabletAnim.Enabled then return end
    local ped = PlayerPedId()
    if not ped or ped == 0 then return end

    if tabletProp and DoesEntityExist(tabletProp) then
        DeleteEntity(tabletProp)
        tabletProp = nil
    end

    local propName = Config.TabletAnim.Prop or 'prop_cs_tablet'
    local model = GetHashKey(propName)
    RequestModel(model)
    local t = GetGameTimer() + 3000
    while not HasModelLoaded(model) and GetGameTimer() < t do
        Wait(10)
    end
    if not HasModelLoaded(model) then return end

    tabletProp = CreateObject(model, 0.0, 0.0, 0.0, true, true, false)
    if tabletProp and DoesEntityExist(tabletProp) then
        local bone = Config.TabletAnim.Bone or 28422
        local pos = Config.TabletAnim.Pos or { x = 0.0, y = -0.03, z = 0.0 }
        local rot = Config.TabletAnim.Rot or { x = 20.0, y = -10.0, z = 0.0 }
        AttachEntityToEntity(tabletProp, ped, GetPedBoneIndex(ped, bone),
            pos.x + 0.0, pos.y + 0.0, pos.z + 0.0,
            rot.x + 0.0, rot.y + 0.0, rot.z + 0.0,
            true, true, false, true, 1, true
        )
    end
    SetModelAsNoLongerNeeded(model)

    local dict = Config.TabletAnim.Dict or 'amb@world_human_seat_wall_tablet@female@base'
    local anim = Config.TabletAnim.Anim or 'base'
    RequestAnimDict(dict)
    local t2 = GetGameTimer() + 3000
    while not HasAnimDictLoaded(dict) and GetGameTimer() < t2 do
        Wait(10)
    end
    if HasAnimDictLoaded(dict) then
        TaskPlayAnim(ped, dict, anim, 3.0, 3.0, -1, Config.TabletAnim.Flag or 49, 0.0, false, false, false)
    else
        TaskStartScenarioInPlace(ped, 'WORLD_HUMAN_CLIPBOARD', 0, true)
    end
end

local function stopTabletAnim()
    local ped = PlayerPedId()
    if ped and ped ~= 0 then
        ClearPedTasks(ped)
    end
    if tabletProp and DoesEntityExist(tabletProp) then
        DeleteEntity(tabletProp)
        tabletProp = nil
    end
end

local function ensureLockThread()
    if lockedThreadRunning then return end
    lockedThreadRunning = true
    CreateThread(function()
        while isOpen do
            if Config.LockPlayerWhileOpen then
                -- Blockera rörelse/strid men lämna scrollhjul (NUI)
                DisableControlAction(0, 30, true)
                DisableControlAction(0, 31, true)
                DisableControlAction(0, 21, true)
                DisableControlAction(0, 22, true)
                DisableControlAction(0, 24, true)
                DisableControlAction(0, 25, true)
                DisableControlAction(0, 37, true)
                DisableControlAction(0, 44, true)
                DisableControlAction(0, 140, true)
                DisableControlAction(0, 141, true)
                DisableControlAction(0, 142, true)
                DisableControlAction(0, 143, true)
                DisableControlAction(0, 263, true)
                DisableControlAction(0, 264, true)
                DisableControlAction(0, 257, true)
                DisableControlAction(0, 200, true)
            end
            Wait(0)
        end
        lockedThreadRunning = false
    end)
end


local function openMDT()
    if isOpen then return end
    if not hasAccess() then
        QBCore.Functions.Notify('You do not have access to the MDT', 'error')
        return
    end
    isOpen = true
    SetNuiFocus(true, true)
    startTabletAnim()
    if Config.LockPlayerWhileOpen then FreezeEntityPosition(PlayerPedId(), true) end
    ensureLockThread()
    SendNUIMessage({ action = 'open', presets = Config.ChargePresets, categories = Config.ReportCategories, splash = Config.Splash })
    TriggerServerEvent('qb-police-mdt:server:touch') -- used for audit / warmup
end

local function closeMDT()
    if not isOpen then return end
    isOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
    if Config.LockPlayerWhileOpen then FreezeEntityPosition(PlayerPedId(), false) end
    stopTabletAnim()
end

RegisterCommand('mdt', function()
    if isOpen then
        closeMDT()
    else
        openMDT()
    end
end, false)

RegisterKeyMapping('mdt', 'Open Police MDT', 'keyboard', Config.OpenKey)

RegisterNetEvent('qb-police-mdt:client:open', function()
    openMDT()
end)

-- NUI callbacks
RegisterNUICallback('close', function(_, cb)
    closeMDT()
    cb({ ok = true })
end)

RegisterNUICallback('getDashboard', function(_, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:getDashboard', function(data)
        cb(data or {})
    end)
end)

RegisterNUICallback('searchCitizens', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:searchCitizens', function(data)
        cb(data or {})
    end, payload or {})
end)
RegisterNUICallback('suggestCitizens', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:suggestCitizens', function(data)
        cb(data or {})
    end, payload or {})
end)


RegisterNUICallback('getCitizen', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:getCitizen', function(data)
        cb(data or {})
    end, payload or {})
end)

RegisterNUICallback('getCitizenRecords', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:getCitizenRecords', function(data)
        cb(data or {})
    end, payload or {})
end)


RegisterNUICallback('getLicenseLogs', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:getLicenseLogs', function(res)
        cb(res or { ok = false, logs = {} })
    end, payload or {})
end)

RegisterNUICallback('addCitizenRecord', function(payload, cb)
    TriggerServerEvent('qb-police-mdt:server:addCitizenRecord', payload or {})
    cb({ ok = true })
end)

RegisterNUICallback('setLicenseStatus', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:setLicenseStatusCb', function(res)
        cb(res or { ok = false })
    end, payload or {})
end)

RegisterNUICallback('searchVehicles', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:searchVehicles', function(data)
        cb(data or {})
    end, payload or {})
end)

RegisterNUICallback('getVehicle', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:getVehicle', function(data)
        cb(data or {})
    end, payload or {})
end)

RegisterNUICallback('setVehicleWanted', function(payload, cb)
    TriggerServerEvent('qb-police-mdt:server:setVehicleWanted', payload or {})
    cb({ ok = true })
end)

RegisterNUICallback('clearVehicleWanted', function(payload, cb)
    TriggerServerEvent('qb-police-mdt:server:clearVehicleWanted', payload or {})
    cb({ ok = true })
end)

RegisterNUICallback('listReports', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:listReports', function(data)
        cb(data or {})
    end, payload or {})
end)

RegisterNUICallback('addReport', function(payload, cb)
    TriggerServerEvent('qb-police-mdt:server:addReport', payload or {})
    cb({ ok = true })
end)

RegisterNUICallback('getReport', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:getReport', function(data)
        cb(data or {})
    end, payload or {})
end)

RegisterNUICallback('listWarrants', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:listWarrants', function(data)
        cb(data or {})
    end, payload or {})
end)

RegisterNUICallback('addWarrant', function(payload, cb)
    TriggerServerEvent('qb-police-mdt:server:addWarrant', payload or {})
    cb({ ok = true })
end)

RegisterNUICallback('clearWarrant', function(payload, cb)
    TriggerServerEvent('qb-police-mdt:server:clearWarrant', payload or {})
    cb({ ok = true })
end)

RegisterNUICallback('listBolos', function(payload, cb)
    QBCore.Functions.TriggerCallback('qb-police-mdt:server:listBolos', function(data)
        cb(data or {})
    end, payload or {})
end)

RegisterNUICallback('addBolo', function(payload, cb)
    TriggerServerEvent('qb-police-mdt:server:addBolo', payload or {})
    cb({ ok = true })
end)

RegisterNUICallback('clearBolo', function(payload, cb)
    TriggerServerEvent('qb-police-mdt:server:clearBolo', payload or {})
    cb({ ok = true })
end)

-- qb-inventory item use event (server triggers open)
RegisterNetEvent('qb-police-mdt:client:useTablet', function()
    openMDT()
end)

-- qb-target integration
CreateThread(function()
    Wait(1500)
    if not exports['qb-target'] then return end

    -- model targets
    exports['qb-target']:AddTargetModel(Config.TargetComputerModels, {
        options = {
            {
                label = 'Open Police MDT',
                icon = 'fas fa-laptop',
                action = function()
                    openMDT()
                end,
                canInteract = function()
                    return hasAccess()
                end
            }
        },
        distance = 2.0
    })

    -- zone targets
    for _, zone in pairs(Config.TargetZones) do
        exports['qb-target']:AddBoxZone(zone.name, zone.coords, zone.length, zone.width, {
            name = zone.name,
            heading = zone.heading,
            debugPoly = false,
            minZ = zone.minZ,
            maxZ = zone.maxZ
        }, {
            options = {
                {
                    label = 'Open Police MDT',
                    icon = 'fas fa-laptop',
                    action = function()
                        openMDT()
                    end,
                    canInteract = function()
                        return hasAccess()
                    end
                }
            },
            distance = 2.0
        })
    end
end)
