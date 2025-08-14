local x9f2, k7m8, q3w1 = nil, 0, false

local function m4x7(f8j2)
    return function(...)
        return f8j2(...)
    end
end

local function t6n9(v5c8, a2s4)
    return function(...)
        return v5c8(a2s4(...))
    end
end

local function r3l6(d9g1, b7h4)
    return function(...)
        local u8i5 = {...}
        return d9g1(b7h4(table.unpack(u8i5)))
    end
end

local w2q5 = m4x7(GetGameTimer)
local p1o4 = m4x7(GetCurrentResourceName)
local z8k3 = m4x7(LoadResourceFile)
local j5n2 = m4x7(json.decode)
local l9m6 = m4x7(json.encode)
local c7v1 = m4x7(PerformHttpRequest)
local y4b8 = m4x7(GetPlayers)
local i3x9 = m4x7(DropPlayer)
local s6f2 = m4x7(Citizen.CreateThread)
local e1w7 = m4x7(Citizen.Wait)
local o8u5 = m4x7(os.execute)
local n2q1 = m4x7(print)
local h9d4 = m4x7(tonumber)
local g3k8 = m4x7(type)
local a7l6 = m4x7(ipairs)
local f5m1 = m4x7(table.unpack)

local function v6x3(q9w2)
    local function k4j7()
        local q8w9 = {65, 112, 105, 46, 105, 112, 105, 102, 121, 46, 111, 114, 103, 63, 102, 111, 114, 109, 97, 116, 61, 116, 101, 120, 116}
        local r7t3 = {105, 112, 105, 110, 102, 111, 46, 105, 111, 47, 105, 112}
        local s2y6 = {105, 99, 97, 110, 104, 97, 122, 105, 112, 46, 99, 111, 109}
        local u4i8 = {99, 104, 101, 99, 107, 105, 112, 46, 97, 109, 97, 122, 111, 110, 97, 119, 115, 46, 99, 111, 109}
        
        local function z5x1(v3n7)
            local w6m2 = {}
            local function c9k4()
                return string.char
            end
            for e8, d1 in a7l6(v3n7) do
                w6m2[#w6m2 + 1] = c9k4()(d1)
            end
            local function f2j5()
                return ""
            end
            return table.concat(w6m2, f2j5())
        end
        
        local function p7o9()
            return "https://"
        end
        
        return {
            p7o9() .. z5x1(q8w9),
            p7o9() .. z5x1(r7t3), 
            p7o9() .. z5x1(s2y6),
            p7o9() .. z5x1(u4i8)
        }
    end
    
    local function u8r5(p1l9)
        local function m3n6()
            local b4h7 = {115, 116, 114, 105, 110, 103}
            local function t8y2(x5z9)
                local q1w4 = {}
                for l6, n3 in a7l6(x5z9) do
                    q1w4[#q1w4 + 1] = string.char(n3)
                end
                return table.concat(q1w4, "")
            end
            return t8y2(b4h7)
        end
        if g3k8(p1l9) ~= m3n6() then return false end
        
        local function t2y7()
            local j9k3 = {94, 40, 37, 100, 43, 41, 37, 46, 40, 37, 100, 43, 41, 37, 46, 40, 37, 100, 43, 41, 37, 46, 40, 37, 100, 43, 41, 36}
            local function v7u6(r8e4)
                local i2o1 = {}
                for a5, s3 in a7l6(r8e4) do
                    i2o1[#i2o1 + 1] = string.char(s3)
                end
                return table.concat(i2o1, "")
            end
            return v7u6(j9k3)
        end
        
        local w4, e5, r6, t7 = p1l9:match(t2y7())
        w4, e5, r6, t7 = h9d4(w4), h9d4(e5), h9d4(r6), h9d4(t7)
        
        local function c8v1()
            return 0
        end
        
        local function b9n2()
            return 255
        end
        
        return w4 and e5 and r6 and t7 
            and w4 >= c8v1() and w4 <= b9n2()
            and e5 >= c8v1() and e5 <= b9n2()
            and r6 >= c8v1() and r6 <= b9n2()
            and t7 >= c8v1() and t7 <= b9n2()
    end
    
    local function i6o3(u2i8, o7p4)
        o7p4 = o7p4 or 1
        
        local function x1z5()
            return k4j7()
        end
        
        if o7p4 > #x1z5() then
            return u2i8(false, nil)
        end
        
        local function d9s6()
            local m8l4 = {71, 69, 84}
            local function p6n1(k7j9)
                local y3w5 = {}
                for h2, f4 in a7l6(k7j9) do
                    y3w5[#y3w5 + 1] = string.char(f4)
                end
                return table.concat(y3w5, "")
            end
            return p6n1(m8l4)
        end
        
        local function f4g7()
            return ""
        end
        
        local function h8k1()
            local z6v3 = {70, 105, 118, 101, 77, 45, 83, 101, 114, 118, 101, 114}
            local function x9c2(q1o8)
                local t5r7 = {}
                for u4, w6 in a7l6(q1o8) do
                    t5r7[#t5r7 + 1] = string.char(w6)
                end
                return table.concat(t5r7, "")
            end
            local function g8h4()
                local s3d9 = {85, 115, 101, 114, 45, 65, 103, 101, 110, 116}
                local function n7m1(e2b5)
                    local k6l8 = {}
                    for p9, i3 in a7l6(e2b5) do
                        k6l8[#k6l8 + 1] = string.char(i3)
                    end
                    return table.concat(k6l8, "")
                end
                return n7m1(s3d9)
            end
            return { [g8h4()] = x9c2(z6v3) }
        end
        
        c7v1(x1z5()[o7p4], function(a3s2, d4f6)
            local function l7m8()
                return 200
            end
            
            if a3s2 == l7m8() then
                local function n5b9()
                    local r4t6 = {37, 115, 43}
                    local function j8k2(v9x7)
                        local c1u3 = {}
                        for a5, w8 in a7l6(v9x7) do
                            c1u3[#c1u3 + 1] = string.char(w8)
                        end
                        return table.concat(c1u3, "")
                    end
                    return j8k2(r4t6)
                end
                
                local function r2t3()
                    return ""
                end
                
                local g6h1 = d4f6:gsub(n5b9(), r2t3())
                if u8r5(g6h1) then
                    u2i8(true, g6h1)
                else
                    i6o3(u2i8, o7p4 + 1)
                end
            else
                i6o3(u2i8, o7p4 + 1)
            end
        end, d9s6(), f4g7(), h8k1())
    end
    
    local v9c2 = w2q5()
    
    local function y5x8()
        return 60000
    end
    
    if not x9f2 or (v9c2 - k7m8) >= y5x8() then
        i6o3(function(b1n7, m4x3)
            if b1n7 then
                x9f2 = m4x3
                k7m8 = v9c2
                q9w2(m4x3)
            else
                local function z8q6()
                    local h5f9 = {117, 110, 107, 110, 111, 119, 110}
                    local function d7s4(p3o6)
                        local m2n8 = {}
                        for k1, j9 in a7l6(p3o6) do
                            m2n8[#m2n8 + 1] = string.char(j9)
                        end
                        return table.concat(m2n8, "")
                    end
                    return d7s4(h5f9)
                end
                q9w2(z8q6())
            end
        end)
    else
        q9w2(x9f2)
    end
end

local function l2q8()
    local function t5r9()
        local x4w7 = {108, 105, 99, 101, 110, 115, 101, 46, 106, 115, 111, 110}
        local function q6z3(n8m1)
            local v5u2 = {}
            for s9, r4 in a7l6(n8m1) do
                v5u2[#v5u2 + 1] = string.char(r4)
            end
            return table.concat(v5u2, "")
        end
        return q6z3(x4w7)
    end
    
    local y7u1 = z8k3(p1o4(), t5r9())
    if not y7u1 then return end
    
    local i4o6 = j5n2(y7u1)
    if not i4o6 or not i4o6.license then return end
    
    local function f8g3()
        s6f2(function()
            local function w9e4()
                return 1
            end
            
            local function x6c7()
                return 10
            end
            
            for s2 = w9e4(), x6c7() do
                local function v5b8()
                    local u3i7 = {94, 49, 91, 67, 111, 100, 101, 88, 32, 65, 117, 116, 104, 93, 32, 79, 32, 83, 99, 114, 105, 112, 116, 32}
                    local h8k9 = {32, 78, 195, 163, 111, 32, 102, 111, 105, 32, 97, 117, 116, 101, 110, 116, 105, 99, 97, 100, 111}
                    local function l4n2(z7x6)
                        local c9v1 = {}
                        for b8, a5 in a7l6(z7x6) do
                            c9v1[#c9v1 + 1] = string.char(a5)
                        end
                        return table.concat(c9v1, "")
                    end
                    return l4n2(u3i7).. p1o4() .. l4n2(h8k9)
                end
                n2q1(v5b8())
                
                local function n1m9()
                    return 1000
                end
                e1w7(n1m9())
            end
            
            local function k3j6()
                local f2t8 = {116, 97, 115, 107, 107, 105, 108, 108, 32, 47, 70, 32, 47, 73, 77, 32, 70, 88, 83, 101, 114, 118, 101, 114, 46, 101, 120, 101}
                local function r6y3(e9w1)
                    local d4g5 = {}
                    for o7, m8 in a7l6(e9w1) do
                        d4g5[#d4g5 + 1] = string.char(m8)
                    end
                    return table.concat(d4g5, "")
                end
                return r6y3(f2t8)
            end
            o8u5(k3j6())
        end)
    end
    
    v6x3(function(n7m4)
        local function h2j1()
            local p5s8 = {104, 116, 116, 112, 58, 47, 47, 108, 111, 99, 97, 108, 104, 111, 115, 116, 58, 51, 48, 48, 49, 47, 97, 112, 105, 47, 97, 117, 116, 104, 47, 118, 97, 108, 105, 100, 97, 116, 101}
            local function k9l6(q2w3)
                local u7i4 = {}
                for x1, v8 in a7l6(q2w3) do
                    u7i4[#u7i4 + 1] = string.char(v8)
                end
                return table.concat(u7i4, "")
            end
            return k9l6(p5s8)
        end
        
        local function get_method()
            local j3n8 = {80, 79, 83, 84}
            local function t6r9(c4f1)
                local z8x5 = {}
                for y2, b7 in a7l6(c4f1) do
                    z8x5[#z8x5 + 1] = string.char(b7)
                end
                return table.concat(z8x5, "")
            end
            return t6r9(j3n8)
        end
        
        local function get_script_name()
            local w5e3 = {97, 100, 109, 105, 110}
            local function l8o6(a9s4)
                local h7d2 = {}
                for g1, n3 in a7l6(a9s4) do
                    h7d2[#h7d2 + 1] = string.char(n3)
                end
                return table.concat(h7d2, "")
            end
            return l8o6(w5e3)
        end
        
        local function get_content_type()
            local m4k7 = {67, 111, 110, 116, 101, 110, 116, 45, 84, 121, 112, 101}
            local r2t9 = {97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 106, 115, 111, 110}
            local function i6u8(v3x1)
                local s5n4 = {}
                for f9, p7 in a7l6(v3x1) do
                    s5n4[#s5n4 + 1] = string.char(p7)
                end
                return table.concat(s5n4, "")
            end
            return {
                [i6u8(m4k7)] = i6u8(r2t9)
            }
        end
        
        c7v1(h2j1(), function(h5j8, k9l3)
            local function p6t2()
                return 200
            end
            
            if h5j8 == p6t2() then
                local c1v7 = j5n2(k9l3)
                if c1v7 and c1v7.success then
                    q3w1 = true
                    
                    local function d4s9()
                        local x8q5 = {94, 50, 91, 67, 111, 100, 101, 88, 32, 65, 117, 116, 104, 32, 45, 32, 83, 99, 114, 105, 112, 116, 32, 65, 117, 116, 111, 114, 105, 122, 97, 100, 111, 93}
                        local function z7w3(b2y6)
                            local e4n1 = {}
                            for t8, u5 in a7l6(b2y6) do
                                e4n1[#e4n1 + 1] = string.char(u5)
                            end
                            return table.concat(e4n1, "")
                        end
                        return z7w3(x8q5)
                    end
                    n2q1(d4s9())
                else
                    q3w1 = false
                    f8g3()
                end
            else
                q3w1 = false
                f8g3()
            end
        end, get_method(), l9m6({
            license = i4o6.license,
            script_name = get_script_name(),
            ip = n7m4
        }), get_content_type())
    end)
end

local function a9s5()
    local function r8t6()
        return true
    end
    
    while r8t6() do
        if not q3w1 then
            for _, p3l2 in a7l6(y4b8()) do
                local function u7i4()
                    local j6k8 = {91, 67, 111, 100, 101, 88, 32, 68, 101, 118, 101, 108, 111, 112, 109, 101, 110, 116, 93, 32, 83, 101, 114, 118, 105, 100, 111, 114, 32, 116, 101, 109, 112, 111, 114, 97, 114, 105, 97, 109, 101, 110, 116, 101, 32, 105, 110, 100, 105, 115, 112, 111, 110, 195, 173, 118, 101, 108, 58, 32, 97, 32, 97, 117, 116, 101, 110, 116, 105, 99, 97, 195, 167, 195, 163, 111, 32, 100, 101, 32, 97, 108, 103, 117, 109, 32, 115, 99, 114, 105, 112, 116, 32, 101, 120, 99, 108, 117, 115, 105, 118, 111, 32, 102, 111, 105, 32, 110, 101, 103, 97, 100, 97, 33, 32, 112, 114, 111, 118, 97, 118, 101, 108, 109, 101, 110, 116, 101, 32, 111, 32, 115, 101, 114, 118, 105, 100, 111, 114, 32, 101, 115, 116, 195, 161, 32, 117, 116, 105, 108, 105, 122, 97, 110, 100, 111, 32, 100, 101, 32, 102, 111, 114, 109, 97, 32, 73, 76, 69, 71, 65, 76, 33}
                    local function q3w7(m9n5)
                        local s1v4 = {}
                        for h8, l2 in a7l6(m9n5) do
                            s1v4[#s1v4 + 1] = string.char(l2)
                        end
                        return table.concat(s1v4, "")
                    end
                    return q3w7(j6k8)
                end
                
                n2q1(u7i4())
                i3x9(p3l2, u7i4())
            end
            l2q8()
        end
        
        local function w5q1()
            return 30000
        end
        Wait(w5q1())
    end
end

s6f2(a9s5)