from PIL import Image, ImageEnhance
import io

class ImagePreprocessor:
    @staticmethod
    def process(image_bytes: bytes) -> bytes:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Auto-rotate based on EXIF
            try:
                from PIL import ExifTags
                for orientation in ExifTags.TAGS.keys():
                    if ExifTags.TAGS[orientation]=='Orientation':
                        break
                exif = image._getexif()
                if exif is not None:
                    orientation_value = exif.get(orientation)
                    if orientation_value == 3:
                        image = image.rotate(180, expand=True)
                    elif orientation_value == 6:
                        image = image.rotate(270, expand=True)
                    elif orientation_value == 8:
                        image = image.rotate(90, expand=True)
            except (AttributeError, KeyError, IndexError):
                pass
                
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # Resize if too large
            max_size = (1024, 1024)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.5)
            
            output = io.BytesIO()
            image.save(output, format="JPEG", quality=85)
            return output.getvalue()
        except Exception as e:
            # Fallback to original bytes on error
            return image_bytes
