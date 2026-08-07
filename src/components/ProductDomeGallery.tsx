"use client";

import DomeGallery from "@/DomeGallery/DomeGallery";

export function ProductDomeGallery({
  images,
}: {
  images: { src: string; alt: string; href: string }[];
}) {
  if (images.length === 0) return null;
  return (
    <div className="relative h-[360px] sm:h-[520px]">
      <DomeGallery
        images={images}
        fit={1.6}
        fitBasis="width"
        minRadius={480}
        segments={28}
        dragDampening={2.6}
        grayscale={false}
        overlayBlurColor="#f7f3ec"
        imageBorderRadius="16px"
        openedImageBorderRadius="20px"
        openedImageWidth="min(78vw, 340px)"
        openedImageHeight="min(78vw, 340px)"
      />
    </div>
  );
}
