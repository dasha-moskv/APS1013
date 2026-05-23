def analyze_signals(signals):
    # TODO: OpenAI call here
    # Should classify each signal using your taxonomy
    return [
        {
            "title": signal,
            "category": "To Be Classified",
            "summary": "LLM-generated summary goes here."
        }
        for signal in signals
    ]