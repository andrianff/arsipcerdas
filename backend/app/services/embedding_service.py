from typing import List, Optional
import logging
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    _client: Optional[genai.Client] = None

    @classmethod
    def get_client(cls) -> genai.Client:
        """Membuat instance Gemini Client secara singleton."""
        if cls._client is None:
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY belum dikonfigurasi di file .env!")
            cls._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        return cls._client

    @classmethod
    def generate_embedding(cls, text: str) -> List[float]:
        """
        Menghasilkan vektor embedding 768 dimensi untuk satu teks.
        """
        if not text or not text.strip():
            return [0.0] * 768

        client = cls.get_client()
        try:
            response = client.models.embed_content(
                model=settings.GEMINI_EMBEDDING_MODEL,
                contents=text.strip(),
                config=types.EmbedContentConfig(
                    output_dimensionality=768
                )
            )
            return response.embeddings[0].values
        except Exception as e:
            logger.error(f"Gagal menghasilkan embedding teks: {e}")
            raise e

    @classmethod
    def generate_embeddings_batch(cls, texts: List[str]) -> List[List[float]]:
        """
        Menghasilkan vektor embedding 768 dimensi sekaligus (batch) untuk banyak teks.
        """
        if not texts:
            return []

        client = cls.get_client()
        try:
            response = client.models.embed_content(
                model=settings.GEMINI_EMBEDDING_MODEL,
                contents=[t.strip() for t in texts if t.strip()],
                config=types.EmbedContentConfig(
                    output_dimensionality=768
                )
            )
            return [emb.values for emb in response.embeddings]
        except Exception as e:
            logger.error(f"Gagal menghasilkan batch embedding: {e}")
            raise e