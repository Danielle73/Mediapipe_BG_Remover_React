import React, { useState, useRef } from 'react';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

const BackgroundRemover: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageUrl: string) => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      // Resize the canvas to match the uploaded image
      canvas.width = img.width;
      canvas.height = img.height;

      const segmentation = new SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      segmentation.setOptions({
        modelSelection: 1, // 0: general use, 1: selfie segmentation
      });

      segmentation.onResults((results) => {
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (results.segmentationMask) {
          // Draw the segmentation mask
          context.drawImage(
            results.segmentationMask,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Composite the original image on top of the mask
          context.globalCompositeOperation = 'source-in';
          context.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert the processed canvas back to an image URL
          const processedDataUrl = canvas.toDataURL('image/png');
          setProcessedImage(processedDataUrl);
        }
      });

      await segmentation.send({ image: img });
    };
  };

  const handleProcess = () => {
    if (image) {
      processImage(image);
    }
  };

  return (
    <div className="background-remover">
      {/* Image Upload Section */}
      <div className="upload-container">
        {image && <img src={image} alt="Uploaded preview" />}
        {!image && (
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              aria-label="Upload an image"
            />
            Upload an Image
          </label>
        )}
      </div>

      {/* Processed Image Section */}
      <div className="processed-container">
        {processedImage ? (
          <img src={processedImage} alt="Processed preview" />
        ) : (
          image && (
            <button onClick={handleProcess} aria-label="Remove background">
              Remove Background
            </button>
          )
        )}
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default BackgroundRemover;
