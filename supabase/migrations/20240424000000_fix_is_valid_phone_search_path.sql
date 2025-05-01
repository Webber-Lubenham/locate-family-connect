-- Fix search path for is_valid_phone function
CREATE OR REPLACE FUNCTION public.is_valid_phone(phone_number text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
IMMUTABLE
AS $function$
DECLARE
    -- Padrões para Brasil e Reino Unido
    br_pattern TEXT := '^(\+55|0055|55)?[ -]?(\(?\d{2}\)?[ -]?)?9?\d{4}[ -]?\d{4}$';
    uk_pattern TEXT := '^(\+44|0044|44)?[ -]?(0)?(\(?\d{2,5}\)?[ -]?)?\d{4}[ -]?\d{4}$';
    us_pattern TEXT := '^(\+1|001|1)?[ -]?(\(?\d{3}\)?[ -]?)?\d{3}[ -]?\d{4}$';
    pt_pattern TEXT := '^(\+351|00351|351)?[ -]?(\(?\d{2,3}\)?[ -]?)?\d{3}[ -]?\d{3,4}$';
BEGIN
    -- Se o número for nulo, consideramos válido (permite valores nulos)
    IF phone_number IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Se o número estiver em branco, consideramos válido (permite valores vazios)
    IF LENGTH(TRIM(phone_number)) = 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se o número corresponde a qualquer um dos padrões
    RETURN 
        phone_number ~ br_pattern OR
        phone_number ~ uk_pattern OR
        phone_number ~ us_pattern OR
        phone_number ~ pt_pattern;
END;
$function$; 