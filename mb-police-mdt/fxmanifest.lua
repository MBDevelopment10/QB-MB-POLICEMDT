fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'MB Development'
description 'Police Authority MDT for QBCore | tablet UI | reports | warrants | BOLO | records'
version '1.2.0'

shared_scripts {
    '@qb-core/shared/locale.lua',
    'config.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js',
    'html/assets/**/*'
}
