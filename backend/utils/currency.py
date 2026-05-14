def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    """
    Manual conversion between INR and NPR.
    1 INR = 1.6 NPR
    1 NPR = 0.625 INR
    """
    # Safe Fallbacks
    if amount is None:
        return 0.0
    if not from_currency:
        from_currency = "INR"
    if not to_currency:
        to_currency = "INR"
        
    if from_currency == to_currency:
        return amount
    
    if from_currency == "INR" and to_currency == "NPR":
        return amount * 1.6
    
    if from_currency == "NPR" and to_currency == "INR":
        return amount * 0.625
        
    return amount # Fallback
