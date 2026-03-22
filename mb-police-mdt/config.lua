-- Police MDT for QBCore (qb-target + qb/ox inventory)

Config = {}

-- Require police job + on duty
Config.RequirePoliceJob = true
Config.RequireOnDuty = true

-- Allowed jobs
Config.AllowedJobs = {
    police = true,
    sheriff = true,
    state = true,
}

-- Open key (client)
Config.OpenKey = 'F6' -- optional: /mdt always works

-- Tablet item (optional)
Config.TabletItem = 'mdt_tablet'

-- Inventory system for the tablet item: 'qb', 'ox', or 'auto'
Config.InventorySystem = 'auto'

-- Target system: 'qb', 'ox', or 'auto'
Config.TargetSystem = 'auto'
Config.TargetDistance = 2.0

-- Freeze the player while the MDT is open
Config.LockPlayerWhileOpen = true

-- Splash screen shown before the MDT content loads
Config.Splash = {
    Enabled = true,
    Title = 'Police Authority MDT',
    DelayMs = 3000
}

-- Tablet animation (prop + anim) when the MDT opens
Config.TabletAnim = {
    Enabled = true,
    Prop = 'prop_cs_tablet',
    Bone = 28422, -- PH_R_Hand
    Pos = { x = 0.0, y = -0.03, z = 0.0 },
    Rot = { x = 20.0, y = -10.0, z = 0.0 },
    Dict = 'amb@world_human_seat_wall_tablet@female@base',
    Anim = 'base',
    Flag = 49
}

-- Target computer models that can open the MDT
Config.TargetComputerModels = {
    `prop_police_id_board`,
    `prop_laptop_01a`,
    `prop_laptop_lester2`,
    `prop_cs_laptop`,
    `prop_laptop_02_closed`,
    `prop_monitor_01c`,
}

-- Optional target box zones
Config.TargetZones = {
    -- Example:
    -- { name = 'pd_mdt_1', coords = vector3(441.2, -981.9, 30.7), length = 1.2, width = 0.8, heading = 90.0, minZ = 29.7, maxZ = 31.7 },
}

-- Report categories
Config.ReportCategories = {
    'Arrest',
    'Incident',
    'Evidence',
    'Traffic stop',
    'Investigation',
    'Other'
}

-- Max rows returned per search
Config.SearchLimit = 50

-- Citizen index
Config.CitizenIndex = {
    -- Automatically rebuild the index once if it is empty
    AutoRebuildIfEmpty = true,

    -- Rebuild the index from the real players table on resource start
    -- so old or fake MDT profiles are removed automatically
    ForceRebuildOnStart = true,

    -- Batch size used during rebuild
    BatchSize = 250
}

-- Vehicle flag settings
Config.VehicleFlags = {
    -- Max reason length
    MaxReasonLength = 255
}

-- Charge presets (UI helper only, no automatic billing)
Config.ChargePresets = {
    { code = 'PL-101', title = 'Public disturbance', fine = 250, jail = 0 },
    { code = 'PL-202', title = 'Violent resistance', fine = 500, jail = 5 },
    { code = 'TR-110', title = 'Speeding', fine = 350, jail = 0 },
    { code = 'TR-301', title = 'Grand vehicle theft', fine = 1500, jail = 20 },
}

-- Log all MDT actions to SQL (mdt_audit_logs)
Config.EnableAuditLog = true
