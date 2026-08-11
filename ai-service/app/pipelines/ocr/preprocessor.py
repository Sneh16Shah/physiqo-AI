from PIL import Image, ImageEnhance, ImageOps
import io

class ImagePreprocessor:
    @staticmethod
    def process(image_bytes: bytes) -> bytes:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Auto-rotate based on EXIF metadata using standard ImageOps
            try:
                image = ImageOps.exif_transpose(image)
            except Exception:
                pass
                
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # Resize if too large (keep high resolution for fine display text)
            max_size = (2048, 2048)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Gentle contrast enhancement to avoid blowing out highlights on LCD/LED displays
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.1)
            
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=92)
            return output.getvalue()
        except Exception:
            return image_bytes

    @staticmethod
    def rotate(image_bytes: bytes, angle: int) -> bytes:
        """Rotate image by angle (90, 180, 270 degrees clockwise)."""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # PIL rotate is counter-clockwise, so clockwise angle requires (360 - angle) % 360
            rotated_image = image.rotate((360 - angle) % 360, expand=True)
            output = io.BytesIO()
            rotated_image.save(output, format="JPEG", quality=92)
            return output.getvalue()
        except Exception:
            return image_bytes

