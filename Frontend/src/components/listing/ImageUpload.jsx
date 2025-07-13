import React, { useRef } from 'react';
import { IconPhoto, IconTrash } from '@tabler/icons-react';
import { PulseLoader } from 'react-spinners';

const ImageUpload = ({
  imagePreview,
  imageLoader,
  handleImageUpload,
  removeImage,
  fileInputRef
}) => {
  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Listing Image
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
          >
            <IconPhoto size={48} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-1">Click to upload an image</p>
            <p className="text-xs text-gray-400">JPG, PNG or GIF (max. 5MB)</p>

            {imageLoader && (
              <div className="mt-4">
                <PulseLoader size={8} color="#f43f5e" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Listing preview"
              className="max-h-64 mx-auto rounded-md"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
              title="Remove image"
            >
              <IconTrash size={16} className="text-red-500" />
            </button>

            {imageLoader && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                <PulseLoader size={10} color="#ffffff" />
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={imageLoader}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
