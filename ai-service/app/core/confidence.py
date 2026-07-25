def calculate_confidence_category(score: float) -> str:
    if score >= 0.85:
        return "high"
    elif score >= 0.60:
        return "medium"
    elif score >= 0.40:
        return "low"
    return "rejected"
