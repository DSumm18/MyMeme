'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy, 
  SortableContext,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import Image from 'next/image';

interface ImageItem {
  id: string;
  file: File | null;
  preview: string | null;
}

const SortableImageItem = ({ 
  id, 
  file, 
  preview,
  onFileChange,
  onAnimate 
}: ImageItem & { 
  onFileChange: (id: string, file: File | null) => void;
  onAnimate: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(id, selectedFile);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="relative group"
    >
      {preview ? (
        <div className="relative">
          <Image 
            src={preview} 
            alt="Photo preview" 
            width={200} 
            height={200} 
            className="w-full h-full object-cover rounded-lg" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onAnimate(id)}
              className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600"
            >
              Animate
            </button>
          </div>
        </div>
      ) : (
        <label className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded-lg">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
          <span className="text-gray-500">Upload Photo</span>
        </label>
      )}
    </div>
  );
};

export default function AlbumPage() {
  const { user } = useAuth();
  const [images, setImages] = useState<ImageItem[]>(
    Array.from({ length: 9 }, (_, i) => ({ 
      id: `image-${i + 1}`, 
      file: null, 
      preview: null 
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFileChange = (id: string, file: File | null) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === id 
          ? { 
              ...img, 
              file, 
              preview: file ? URL.createObjectURL(file) : null 
            } 
          : img
      )
    );
  };

  const handleAnimatePhoto = (id: string) => {
    const photo = images.find(img => img.id === id);
    if (photo?.file) {
      // Redirect to existing /animate flow 
      // In real implementation, pass the photo to the animate page
      window.location.href = `/animate?photoId=${id}`;
    }
  };

  const canCreateAlbum = images.some(img => img.preview);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Create Your Animated Album
        </h1>

        {!user ? (
          <div className="text-center mb-8">
            <p className="text-xl text-gray-600 mb-4">
              Please sign in to create your album
            </p>
            <Link 
              href="/auth" 
              className="bg-pink-500 text-white px-6 py-3 rounded-full hover:bg-pink-600"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((img) => (
                    <SortableImageItem
                      key={img.id}
                      {...img}
                      onFileChange={handleFileChange}
                      onAnimate={handleAnimatePhoto}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="text-center mt-8">
              <button 
                disabled={!canCreateAlbum}
                className={`
                  px-8 py-3 rounded-full text-white font-bold 
                  ${canCreateAlbum 
                    ? 'bg-pink-500 hover:bg-pink-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Create Album
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}