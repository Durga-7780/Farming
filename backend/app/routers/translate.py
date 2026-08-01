from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Dict
import logging
from deep_translator import GoogleTranslator

router = APIRouter(prefix="/api/translate", tags=["Translation"])

# In-memory translation cache to make responses instant
TRANSLATION_CACHE: Dict[str, str] = {}

class BatchTranslateRequest(BaseModel):
    texts: List[str]
    target_lang: str = "te"

def translate_single_text(text: str, target_lang: str = "te") -> str:
    if not text or not text.strip():
        return text
    
    clean_text = text.strip()
    cache_key = f"{target_lang}:{clean_text.lower()}"
    
    if cache_key in TRANSLATION_CACHE:
        return TRANSLATION_CACHE[cache_key]
    
    try:
        translated = GoogleTranslator(source="auto", target=target_lang).translate(clean_text)
        if translated:
            TRANSLATION_CACHE[cache_key] = translated
            return translated
    except Exception as e:
        logging.error(f"Translation error for '{clean_text}': {e}")
    
    return text

@router.get("")
def translate_text(text: str = Query(...), target_lang: str = Query("te")):
    """Translate a single text string into target language (default: te/Telugu)"""
    translated = translate_single_text(text, target_lang)
    return {"original": text, "translated": translated, "target_lang": target_lang}

@router.post("/batch")
def translate_batch(req: BatchTranslateRequest):
    """Translate a list of texts into target language"""
    results = {}
    for text in req.texts:
        if text:
            results[text] = translate_single_text(text, req.target_lang)
    return {"translations": results}
