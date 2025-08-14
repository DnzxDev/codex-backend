-- Inserir algumas licenças de exemplo
INSERT INTO licenses (license_key, name, authorized_ips, expires_at) VALUES
(
    'ABCD1234-EFGH5678-IJKL9012-MNOP3456',
    'Servidor Principal',
    ARRAY['192.168.1.100', '10.0.0.50'],
    NOW() + INTERVAL '1 year'
),
(
    'QRST7890-UVWX1234-YZAB5678-CDEF9012',
    'Servidor de Teste',
    ARRAY['127.0.0.1', '192.168.1.200'],
    NOW() + INTERVAL '6 months'
),
(
    'GHIJ3456-KLMN7890-OPQR1234-STUV5678',
    'Servidor VIP',
    ARRAY['203.0.113.10', '198.51.100.20'],
    NULL -- Sem expiração
);

-- Verificar se as licenças foram inseridas
SELECT 
    license_key,
    name,
    authorized_ips,
    is_active,
    expires_at,
    created_at
FROM licenses;
