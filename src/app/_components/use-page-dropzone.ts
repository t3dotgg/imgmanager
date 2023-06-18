import React from "react";

type DropEvent = DragEvent & { dataTransfer: DataTransfer | null };

export const usePageDropzone = (onFilesDropped: (files: File[]) => void) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const dragCounter = React.useRef(0);

  const handleDrag = React.useCallback((event: DropEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);
  const handleDragIn = React.useCallback((event: DropEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;
    if (event.dataTransfer?.items && event.dataTransfer?.items.length > 0) {
      setIsDragging(true);
    }
  }, []);
  const handleDragOut = React.useCallback((event: DropEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current > 0) return;
    setIsDragging(false);
  }, []);
  const handleDrop = React.useCallback((event: DropEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer?.files && event.dataTransfer?.files.length > 0) {
      dragCounter.current = 0;
      console.log(event.dataTransfer.files);
      onFilesDropped(Array.from(event.dataTransfer.files));
      event.dataTransfer.clearData();
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener("dragenter", handleDragIn);
    window.addEventListener("dragleave", handleDragOut);
    window.addEventListener("dragover", handleDrag);
    window.addEventListener("drop", handleDrop);
    return function cleanUp() {
      window.removeEventListener("dragenter", handleDragIn);
      window.removeEventListener("dragleave", handleDragOut);
      window.removeEventListener("dragover", handleDrag);
      window.removeEventListener("drop", handleDrop);
    };
  });

  return { isDragging };
};
