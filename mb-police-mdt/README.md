# mb-police-mdt

A polished police MDT resource for **QBCore** with support for:

- **qb-target** and **ox_target**
- **qb-inventory** and **ox_inventory**
- **oxmysql**
- a tablet-style MDT UI
- reports, warrants, BOLOs, vehicle flags, records and audit logs
- in-app language switching for the MDT interface

## Main features

### People
- Search by **name**, **citizen ID** or **phone**
- View person profile, records, linked reports and license history
- Revoke or restore driver license / weapon license
- Search only returns real characters from the server player data

### Vehicles
- Search by **plate**
- View owner, model and wanted flag
- Mark vehicles as wanted with a reason

### Reports / Warrants / BOLO
- Create and browse reports
- Create warrants
- Create BOLO entries
- Quick access from the dashboard

### Compatibility
Set these in `config.lua`:
- `Config.InventorySystem = 'auto'`
- `Config.TargetSystem = 'auto'`

The script will automatically use the correct supported resource when possible.

## Installation

1. Put the folder in your resources directory.
2. Import `sql/install.sql`.
3. Add `ensure mb-police-mdt` to `server.cfg`.
4. Restart the server.

## Language
The whole MDT defaults to **English**.
Users can change the MDT language **inside the MDT settings page** whenever they want.

## Notes
- Personal MDT UI settings are stored locally on the client.
- The included cleanup logic rebuilds the citizen index from real player characters.
- The provided logo has been updated and cleaned with a transparent background.

## Credits
Script package prepared for **MB Development**.
