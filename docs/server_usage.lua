local serverPublicIP, lastIPCheck = nil, 0
local isAuthenticated = false

function GetIP(callback)
    local IP_SERVICES = {
    "https://api.ipify.org?format=text",
    "https://ipinfo.io/ip",
    "https://icanhazip.com",
    "https://checkip.amazonaws.com"
    }

    local function isValidIP(ip)
        if type(ip) ~= "string" then return false end
        local a, b, c, d = ip:match("^(%d+)%.(%d+)%.(%d+)%.(%d+)$")
        a, b, c, d = tonumber(a), tonumber(b), tonumber(c), tonumber(d)
        return a and b and c and d
           and a >= 0 and a <= 255
           and b >= 0 and b <= 255
           and c >= 0 and c <= 255
           and d >= 0 and d <= 255
    end

    local function getPublicIP(innerCallback, index)
        index = index or 1
        if index > #IP_SERVICES then 
            return innerCallback(false, nil) 
        end

        PerformHttpRequest(IP_SERVICES[index], function(code, data)
            if code == 200 then
                local ip = data:gsub("%s+", "")
                if isValidIP(ip) then
                    innerCallback(true, ip)
                else
                    getPublicIP(innerCallback, index + 1)
                end
            else
                getPublicIP(innerCallback, index + 1)
            end
        end, "GET", "", { ["User-Agent"] = "FiveM-Server" })
    end

    local now = GetGameTimer()
    if not serverPublicIP or (now - lastIPCheck) >= 60000 then
        getPublicIP(function(success, ip)
            if success then
                serverPublicIP = ip
                lastIPCheck = now
                callback(ip)
            else
                callback("unknown")
            end
        end)
    else
        callback(serverPublicIP)
    end
end

function AuthenticateScript()
    local fileData = LoadResourceFile(GetCurrentResourceName(), "license.json")
    if not fileData then return end

    local licenseData = json.decode(fileData)
    if not licenseData or not licenseData.license then return end

    local function PrintFailedAndExit()
        Citizen.CreateThread(function()
            for i = 1, 10 do
                print("^3[CodeX] ^2 O Script " .. GetCurrentResourceName() .. " Não foi autenticado...")
                Citizen.Wait(1000)
            end
        end)
    end

    GetIP(function(ip)
        PerformHttpRequest("http://localhost:3000/api/auth/validate", function(statusCode, response)
            if statusCode == 200 then
                local data = json.decode(response)
                if data and data.success then
                    isAuthenticated = true
                else
                    isAuthenticated = false
                    PrintFailedAndExit()
                end
            else
                isAuthenticated = false
                PrintFailedAndExit()
            end
        end, 'POST', json.encode({
            license = licenseData.license,
            script_name = GetCurrentResourceName(),
            ip = ip
        }), {
            ['Content-Type'] = 'application/json'
        })
    end)
end

CreateThread(function()
    while not isAuthenticated do
        for _, playerId in ipairs(GetPlayers()) do
            DropPlayer(playerId, "[CodeX Development] Servidor temporariamente indisponível: autenticação de script falhou!")
        end
        Citizen.Wait(10000) 
    end

    while true do
        AuthenticateScript()
        Citizen.Wait(30000)
    end
end)


if not isAuthenticated then
    return
end

