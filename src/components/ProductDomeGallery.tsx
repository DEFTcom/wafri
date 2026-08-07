"use client";

import DomeGallery from "@/DomeGallery/DomeGallery";

export function ProductDomeGallery({
  images,
}: {
  images: { src: string; alt: string }[];
}) {
  if (images.length === 0) return null;
  return (
    <div className="relative h-[420px] sm:h-[520px] rounded-3xl overflow-hidden bg-teal-900">
      <DomeGallery
        images={images}
        fit={1}
        minRadius={300}
        segments={28}
        dragDampening={2.6}
        grayscale={false}
        overlayBlurColor="#12332F"
      />
    </div>
  );
}
