def convert_length(value, from_unit, to_unit):
    """
    Convert length between various units.
    Supported units: mm, cm, m, km, in, ft, yd, mi
    Base unit: meters
    """
    
    from_unit = from_unit.lower()
    to_unit = to_unit.lower()

    length_to_meters = {
        "mm": 0.001,
        "cm": 0.01,
        "m": 1.0,
        "km": 1000.0,
        "in": 0.0254,
        "inch": 0.0254,
        "inches": 0.0254,
        "ft": 0.3048,
        "feet": 0.3048,
        "foot": 0.3048,
        "yd": 0.9144,
        "yard": 0.9144,
        "mi": 1609.344,
        "mile": 1609.344,
        "miles": 1609.344
    }

    if from_unit not in length_to_meters or to_unit not in length_to_meters:
        return None
    
    meters = value * length_to_meters[from_unit]
    result = meters / length_to_meters[to_unit]
    
    return result

def convert_weight(value, from_unit, to_unit):
    """
    Convert weight between various units.
    Supported units: mg, g, kg, t, oz, lbs, st
    Base unit: kilograms
    """
    from_unit = from_unit.lower()
    to_unit = to_unit.lower()
    
    weight_to_kg = {
        "mg": 0.000001,
        "g": 0.001,
        "gram": 0.001,
        "grams": 0.001,
        "kg": 1.0,
        "kgs": 1.0,
        "kilogram": 1.0,
        "kilograms": 1.0,
        "t": 1000.0,
        "ton": 1000.0,
        "tons": 1000.0,
        "oz": 0.0283495,
        "ounce": 0.0283495,
        "ounces": 0.0283495,
        "lb": 0.453592,
        "lbs": 0.453592,
        "pound": 0.453592,
        "pounds": 0.453592,
        "st": 6.35029,
        "stone": 6.35029
    }
    
    if from_unit not in weight_to_kg or to_unit not in weight_to_kg:
        return None
    
    kg = value * weight_to_kg[from_unit]
    result = kg / weight_to_kg[to_unit]
    
    return result

def convert_temperature(value, from_unit, to_unit):
    """
    Convert temperature between Celsius, Fahrenheit, and Kelvin.
    """
    from_unit = from_unit.lower()
    to_unit = to_unit.lower()
    
    temp_aliases = {
        "c": "celsius", "celsius": "celsius", "°c": "celsius",
        "f": "fahrenheit", "fahrenheit": "fahrenheit", "°f": "fahrenheit",
        "k": "kelvin", "kelvin": "kelvin"
    }
    
    from_unit = temp_aliases.get(from_unit, from_unit)
    to_unit = temp_aliases.get(to_unit, to_unit)
    
    if from_unit == "celsius":
        celsius = value
    elif from_unit == "fahrenheit":
        celsius = (value - 32) * 5/9
    elif from_unit == "kelvin":
        celsius = value - 273.15
    else:
        return None

    if to_unit == "celsius":
        return celsius
    elif to_unit == "fahrenheit":
        return (celsius * 9/5) + 32
    elif to_unit == "kelvin":
        return celsius + 273.15
    else:
        return None

def convert_currency(value, cur_from, cur_to):
    """
    Convert between currencies using fixed conversion rates.
    Note: For real-world applications, use an external API for current rates.
    Supported currencies: USD, EUR, GBP, JPY, INR, CAD, AUD, CHF, CNY
    Base currency: USD
    """

    cur_from = cur_from.upper()
    cur_to = cur_to.upper()
    

    currency_to_usd = {
        "USD": 1.0,
        "EUR": 1.09,  
        "GBP": 1.28,  
        "JPY": 0.0068,  
        "INR": 0.012,  
        "CAD": 0.74,  
        "AUD": 0.67,  
        "CHF": 1.13,  
        "CNY": 0.14  
    }

    if cur_from not in currency_to_usd or cur_to not in currency_to_usd:
        return None

    usd_amount = value * currency_to_usd[cur_from]
    result = usd_amount / currency_to_usd[cur_to]
    
    return result

def convert_volume(value, from_unit, to_unit):
    """
    Convert volume between various units.
    Supported units: ml, l, cubic cm, cubic m, fl oz, cup, pt, qt, gal
    Base unit: liters
    """

    from_unit = from_unit.lower()
    to_unit = to_unit.lower()

    volume_to_liters = {
        "ml": 0.001,
        "milliliter": 0.001,
        "milliliters": 0.001,
        "l": 1.0,
        "liter": 1.0,
        "liters": 1.0,
        "cm3": 0.001,
        "cubic cm": 0.001,
        "m3": 1000.0,
        "cubic m": 1000.0,
        "fl oz": 0.0295735,
        "fluid ounce": 0.0295735,
        "fluid ounces": 0.0295735,
        "cup": 0.236588,
        "cups": 0.236588,
        "pt": 0.473176,
        "pint": 0.473176,
        "pints": 0.473176,
        "qt": 0.946353,
        "quart": 0.946353,
        "quarts": 0.946353,
        "gal": 3.78541,
        "gallon": 3.78541,
        "gallons": 3.78541
    }

    if from_unit not in volume_to_liters or to_unit not in volume_to_liters:
        return None

    liters = value * volume_to_liters[from_unit]
    result = liters / volume_to_liters[to_unit]
    
    return result

def convert_area(value, from_unit, to_unit):
    """
    Convert area between various units.
    Supported units: sq mm, sq cm, sq m, hectare, sq km, sq in, sq ft, sq yd, acre, sq mi
    Base unit: square meters
    """

    from_unit = from_unit.lower()
    to_unit = to_unit.lower()

    area_to_sq_meters = {
        "sq mm": 0.000001,
        "square mm": 0.000001,
        "sq cm": 0.0001,
        "square cm": 0.0001,
        "sq m": 1.0,
        "square m": 1.0,
        "square meter": 1.0,
        "square meters": 1.0,
        "hectare": 10000.0,
        "hectares": 10000.0,
        "ha": 10000.0,
        "sq km": 1000000.0,
        "square km": 1000000.0,
        "sq in": 0.00064516,
        "square in": 0.00064516,
        "square inch": 0.00064516,
        "sq ft": 0.092903,
        "square ft": 0.092903,
        "square foot": 0.092903,
        "sq yd": 0.836127,
        "square yd": 0.836127,
        "square yard": 0.836127,
        "acre": 4046.86,
        "acres": 4046.86,
        "sq mi": 2589988.11,
        "square mi": 2589988.11,
        "square mile": 2589988.11
    }

    if from_unit not in area_to_sq_meters or to_unit not in area_to_sq_meters:
        return None

    sq_meters = value * area_to_sq_meters[from_unit]
    result = sq_meters / area_to_sq_meters[to_unit]
    
    return result