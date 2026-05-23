import os
import google.generativeai as genai

def get_llm_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Please set it in your environment or .env file.")
    genai.configure(api_key=api_key)
    return genai

def call_llm(system_instruction: str, prompt: str, temperature: float = 0.2, json_mode: bool = False) -> str:
    """
    Calls the Gemini API using gemini-1.5-flash.
    """
    try:
        get_llm_client()
    except ValueError as e:
        # Fallback explanation or return error message
        return f"Error: {e}"

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=system_instruction
    )
    
    generation_config = {"temperature": temperature}
    if json_mode:
        generation_config["response_mime_type"] = "application/json"

    try:
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        return response.text
    except Exception as e:
        return f"LLM API Error: {str(e)}"
