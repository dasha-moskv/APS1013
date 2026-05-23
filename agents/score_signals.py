def score_signals(analyzed_signals):
    # TODO: OpenAI call here, or replace with Python scoring later
    for signal in analyzed_signals:
        signal["likelihood"] = "High"
        signal["impact"] = "High"
        signal["time_to_hit"] = "2-4 weeks"
        signal["risk_score"] = 8.0

    return analyzed_signals