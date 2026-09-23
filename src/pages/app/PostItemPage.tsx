import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../../api/errors";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useCreateItem } from "../../hooks/useItemMutations";

import type { ItemType } from "../../types/item";

type PostItemPageProps = {
  type: ItemType;
};

type FormValues = {
  title: string;
  description: string;
  category: string;
  location: string;
};

type CropEditorState = {
  file: File;
  previewUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  imageWidth: number;
  imageHeight: number;
  x: number;
  y: number;
  zoom: number;
};

type ImageSource = "file" | "camera";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const CROP_WIDTH = 800;
const CROP_HEIGHT = 600;

const CROP_OUTPUT_WIDTH = 1000;
const CROP_OUTPUT_HEIGHT = 750;

const CROP_MIN_ZOOM = 1;
const CROP_MAX_ZOOM = 3;

function getPostTypeContent(type: ItemType) {
  if (type === "lost") {
    return {
      eyebrow: "Lost item",
      title: "Post a lost item",
      description:
        "Tell the TrackIt community what you lost so people can help identify and return it.",
      sideTitle: "Help your item find its way home.",
      sideDescription:
        "Clear details and useful evidence make it easier for the community to recognize your lost item.",
      submitLabel: "Post lost item",
      successTitle: "Lost item submitted",
    };
  }

  return {
    eyebrow: "Found item",
    title: "Post a found item",
    description:
      "Share details about an item you found so its owner has a chance to identify and reclaim it.",
    sideTitle: "Give a found item a path back to its owner.",
    sideDescription:
      "Describe where and what you found without exposing unnecessary private information.",
    submitLabel: "Post found item",
    successTitle: "Found item submitted",
  };
}

function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "We could not submit your post right now. Please try again.";
  }

  if (error.status === 401) {
    return "Your session has expired. Please sign in again and try again.";
  }

  if (error.status === 403) {
    if (
      error.message ===
      "Your TrackIt account is currently inactive."
    ) {
      return "Your TrackIt account is currently inactive.";
    }

    return (
      error.message ||
      "You are not authorized to submit this post."
    );
  }

  if (error.status === 413) {
    return "The selected image is too large. Please choose a smaller image.";
  }

  if (error.status === 422) {
    return "Please check the highlighted fields and make sure they meet the required format.";
  }

  if (error.status >= 500) {
    return "TrackIt is temporarily unable to submit your post. Please try again shortly.";
  }

  return (
    error.message ||
    "We could not submit your post right now. Please try again."
  );
}

function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return "Please choose a JPEG, PNG, or WebP image.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "The selected image is too large. Please choose an image under 10 MB.";
  }

  return null;
}

function getImageTypeLabel(file: File): string {
  switch (file.type) {
    case "image/jpeg":
      return "JPEG";
    case "image/png":
      return "PNG";
    case "image/webp":
      return "WebP";
    default:
      return "image";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m21 15-4.5-4.5L7 20" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
    >
      <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M20 11a8 8 0 0 0-14.9-4L3 9" />
      <path d="M3 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.9 4L21 15" />
      <path d="M21 20v-5h-5" />
    </svg>
  );
}

export function PostItemPage({
  type,
}: PostItemPageProps) {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const createItemMutation = useCreateItem(accessToken);

  const [selectedType, setSelectedType] =
    useState<ItemType>(type);

  const content = useMemo(
    () => getPostTypeContent(selectedType),
    [selectedType],
  );

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const cameraVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const cameraStreamRef =
    useRef<MediaStream | null>(null);

  const cropImageRef =
    useRef<HTMLImageElement | null>(null);

  const cropAreaRef =
    useRef<HTMLDivElement | null>(null);

  const cropDragRef =
    useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      imageX: number;
      imageY: number;
    } | null>(null);

  const [formValues, setFormValues] =
    useState<FormValues>({
      title: "",
      description: "",
      category: "",
      location: "",
    });

  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreviewUrl, setImagePreviewUrl] =
    useState<string | null>(null);

  const [imageError, setImageError] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [cropEditor, setCropEditor] =
    useState<CropEditorState | null>(null);

  const [isCropEditorOpen, setIsCropEditorOpen] =
    useState(false);

  const [cropDisplayScale, setCropDisplayScale] =
    useState(1);

  const [isDraggingCrop, setIsDraggingCrop] =
    useState(false);

  const [isApplyingCrop, setIsApplyingCrop] =
    useState(false);

  const [isCameraOpen, setIsCameraOpen] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [isCapturing, setIsCapturing] =
    useState(false);

  const [cameraStarting, setCameraStarting] =
    useState(false);

  const [imageSource, setImageSource] =
    useState<ImageSource | null>(null);

  useEffect(() => {
    if (!image) {
      setImagePreviewUrl(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(image);

    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  useEffect(() => {
    setSelectedType(type);
    setFormValues({
      title: "",
      description: "",
      category: "",
      location: "",
    });
    setImage(null);
    setImageError("");
    setErrorMessage("");
    createItemMutation.reset();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [type]);

  useEffect(() => {
    if (
      !isCropEditorOpen ||
      !cropEditor ||
      !cropAreaRef.current
    ) {
      return;
    }

    const cropArea =
      cropAreaRef.current;

    const updateDisplayScale = () => {
      const width =
        cropArea.clientWidth;

      if (width <= 0) {
        return;
      }

      setCropDisplayScale(
        width / CROP_WIDTH,
      );
    };

    updateDisplayScale();

    const observer =
      new ResizeObserver(
        updateDisplayScale,
      );

    observer.observe(cropArea);

    return () => {
      observer.disconnect();
    };
  }, [isCropEditorOpen, cropEditor]);

  useEffect(() => {
    return () => {
      stopCameraStream();

      if (cropEditor?.previewUrl) {
        URL.revokeObjectURL(
          cropEditor.previewUrl,
        );
      }
    };
  }, [cropEditor?.previewUrl]);

  useEffect(() => {
    if (!isCameraOpen) {
      stopCameraStream();
      return;
    }

    let cancelled = false;

    async function startCamera() {
      setCameraStarting(true);
      setCameraError("");

      if (
        !window.isSecureContext &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        setCameraStarting(false);
        setCameraError(
          "Camera access requires a secure connection (HTTPS) or localhost.",
        );
        return;
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraStarting(false);
        setCameraError(
          "Camera access is not supported by this browser.",
        );
        return;
      }

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: {
                ideal: "environment",
              },
            },
            audio: false,
          });

        if (cancelled) {
          stream.getTracks().forEach(
            (track) => track.stop(),
          );
          return;
        }

        cameraStreamRef.current = stream;

        const video =
          cameraVideoRef.current;

        if (!video) {
          stream.getTracks().forEach(
            (track) => track.stop(),
          );
          cameraStreamRef.current = null;
          return;
        }

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        await video.play();

        if (!cancelled) {
          setCameraStarting(false);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCameraStarting(false);

        if (
          error instanceof DOMException
        ) {
          if (
            error.name === "NotAllowedError"
          ) {
            setCameraError(
              "Camera permission was denied. Allow camera access in your browser and try again.",
            );
            return;
          }

          if (
            error.name === "NotFoundError"
          ) {
            setCameraError(
              "No camera was found on this device.",
            );
            return;
          }

          if (
            error.name === "NotReadableError"
          ) {
            setCameraError(
              "The camera is already being used by another application.",
            );
            return;
          }

          if (
            error.name === "SecurityError"
          ) {
            setCameraError(
              "The browser blocked camera access for security reasons.",
            );
            return;
          }
        }

        setCameraError(
          "We could not start the camera. Please try again.",
        );
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [isCameraOpen]);

  const titleLength =
    formValues.title.trim().length;

  const descriptionLength =
    formValues.description.trim().length;

  const categoryLength =
    formValues.category.trim().length;

  const locationLength =
    formValues.location.trim().length;

  const titleIsValid =
    titleLength >= 3 &&
    titleLength <= 200;

  const descriptionIsValid =
    descriptionLength >= 10 &&
    descriptionLength <= 5000;

  const categoryIsValid =
    categoryLength >= 2 &&
    categoryLength <= 100;

  const locationIsValid =
    locationLength >= 2 &&
    locationLength <= 255;

  const formIsValid =
    titleIsValid &&
    descriptionIsValid &&
    categoryIsValid &&
    locationIsValid &&
    !imageError;

  function stopCameraStream() {
    const stream =
      cameraStreamRef.current;

    if (stream) {
      stream.getTracks().forEach(
        (track) => track.stop(),
      );
    }

    cameraStreamRef.current = null;

    const video =
      cameraVideoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }

  function revokeCropEditorUrl() {
    if (cropEditor?.previewUrl) {
      URL.revokeObjectURL(
        cropEditor.previewUrl,
      );
    }
  }

  function closeCropEditor() {
    if (isApplyingCrop) {
      return;
    }

    revokeCropEditorUrl();

    setCropEditor(null);
    setIsCropEditorOpen(false);
    setIsDraggingCrop(false);
    cropDragRef.current = null;
    setCropDisplayScale(1);
    setImageSource(null);
  }

  function updateField(
    field: keyof FormValues,
    value: string,
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrorMessage("");
    createItemMutation.reset();
  }

  function openCropEditor(
    file: File,
  ) {
    const validationError =
      validateImage(file);

    if (validationError) {
      setImageError(validationError);
      return;
    }

    setImageError("");
    setErrorMessage("");
    createItemMutation.reset();

    const previewUrl =
      URL.createObjectURL(file);

    const imageElement =
      new Image();

    imageElement.onload = () => {
      const baseScale =
        Math.max(
          CROP_WIDTH /
            imageElement.naturalWidth,
          CROP_HEIGHT /
            imageElement.naturalHeight,
        );

      const imageWidth =
        imageElement.naturalWidth *
        baseScale;

      const imageHeight =
        imageElement.naturalHeight *
        baseScale;

      const centeredX =
        (CROP_WIDTH - imageWidth) /
        2;

      const centeredY =
        (CROP_HEIGHT - imageHeight) /
        2;

      revokeCropEditorUrl();

      setCropEditor({
        file,
        previewUrl,
        naturalWidth:
          imageElement.naturalWidth,
        naturalHeight:
          imageElement.naturalHeight,
        imageWidth,
        imageHeight,
        x: centeredX,
        y: centeredY,
        zoom: CROP_MIN_ZOOM,
      });

      setCropDisplayScale(1);
      setIsCropEditorOpen(true);
      setIsDraggingCrop(false);
      cropDragRef.current = null;
    };

    imageElement.onerror = () => {
      URL.revokeObjectURL(previewUrl);

      setImageError(
        "We could not read that image. Please choose another image.",
      );
    };

    imageElement.src = previewUrl;
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    event.target.value = "";

    if (!file) {
      return;
    }

    setImageSource("file");
    openCropEditor(file);
  }

  function removeImage() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setImage(null);
    setImageError("");
    setErrorMessage("");
    setImageSource(null);
    createItemMutation.reset();
  }

  function openFilePicker() {
    if (createItemMutation.isPending) {
      return;
    }

    setImageSource("file");
    fileInputRef.current?.click();
  }

  function openCamera() {
    if (createItemMutation.isPending) {
      return;
    }

    setCameraError("");
    setErrorMessage("");
    setImageSource("camera");
    setIsCameraOpen(true);
  }

  function handleCloseCamera() {
    if (isCapturing) {
      return;
    }

    stopCameraStream();
    setIsCameraOpen(false);
    setCameraError("");
    setImageSource(null);
  }

  async function handleCaptureImage() {
    const video =
      cameraVideoRef.current;

    if (
      !video ||
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setCameraError(
        "The camera is still starting. Please wait a moment and try again.",
      );

      return;
    }

    setCameraError("");
    setImageError("");
    setIsCapturing(true);

    try {
      const maximumDimension = 1600;

      const scale =
        Math.min(
          1,
          maximumDimension /
            Math.max(
              video.videoWidth,
              video.videoHeight,
            ),
        );

      const canvas =
        document.createElement(
          "canvas",
        );

      canvas.width = Math.max(
        1,
        Math.round(
          video.videoWidth * scale,
        ),
      );

      canvas.height = Math.max(
        1,
        Math.round(
          video.videoHeight * scale,
        ),
      );

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Unable to prepare the camera image.",
        );
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const blob =
        await new Promise<Blob>(
          (resolve, reject) => {
            canvas.toBlob(
              (result) => {
                if (result) {
                  resolve(result);
                  return;
                }

                reject(
                  new Error(
                    "Unable to create the captured image.",
                  ),
                );
              },
              "image/jpeg",
              0.84,
            );
          },
        );

      const file = new File(
        [blob],
        `trackit-camera-${Date.now()}.jpg`,
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        },
      );

      stopCameraStream();
      setIsCameraOpen(false);
      setCameraError("");

      openCropEditor(file);
    } catch (error) {
      if (error instanceof Error) {
        setCameraError(
          error.message ||
            "We could not capture the image. Please try again.",
        );
      } else {
        setCameraError(
          "We could not capture the image. Please try again.",
        );
      }
    } finally {
      setIsCapturing(false);
    }
  }

  function handleCropPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      !cropEditor ||
      isApplyingCrop ||
      cropDisplayScale <= 0
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    cropDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      imageX: cropEditor.x,
      imageY: cropEditor.y,
    };

    setIsDraggingCrop(true);
  }

  function handleCropPointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const drag =
      cropDragRef.current;

    if (
      !drag ||
      !cropEditor ||
      drag.pointerId !== event.pointerId ||
      cropDisplayScale <= 0
    ) {
      return;
    }

    const movementX =
      (event.clientX - drag.startX) /
      cropDisplayScale;

    const movementY =
      (event.clientY - drag.startY) /
      cropDisplayScale;

    const nextX =
      drag.imageX + movementX;

    const nextY =
      drag.imageY + movementY;

    const minimumX =
      CROP_WIDTH -
      cropEditor.imageWidth;

    const minimumY =
      CROP_HEIGHT -
      cropEditor.imageHeight;

    setCropEditor((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        x: Math.min(
          0,
          Math.max(minimumX, nextX),
        ),
        y: Math.min(
          0,
          Math.max(minimumY, nextY),
        ),
      };
    });
  }

  function handleCropPointerUp(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      cropDragRef.current?.pointerId ===
      event.pointerId
    ) {
      cropDragRef.current = null;
      setIsDraggingCrop(false);
    }
  }

  function updateCropZoom(
    nextZoom: number,
  ) {
    if (!cropEditor) {
      return;
    }

    const clampedZoom =
      Math.min(
        CROP_MAX_ZOOM,
        Math.max(
          CROP_MIN_ZOOM,
          nextZoom,
        ),
      );

    const oldWidth =
      cropEditor.imageWidth;

    const oldHeight =
      cropEditor.imageHeight;

    const oldCenterX =
      cropEditor.x +
      oldWidth / 2;

    const oldCenterY =
      cropEditor.y +
      oldHeight / 2;

    const baseScale =
      oldWidth /
      cropEditor.naturalWidth /
      cropEditor.zoom;

    const nextWidth =
      cropEditor.naturalWidth *
      baseScale *
      clampedZoom;

    const nextHeight =
      cropEditor.naturalHeight *
      baseScale *
      clampedZoom;

    let nextX =
      oldCenterX -
      nextWidth / 2;

    let nextY =
      oldCenterY -
      nextHeight / 2;

    const minimumX =
      CROP_WIDTH -
      nextWidth;

    const minimumY =
      CROP_HEIGHT -
      nextHeight;

    nextX = Math.min(
      0,
      Math.max(minimumX, nextX),
    );

    nextY = Math.min(
      0,
      Math.max(minimumY, nextY),
    );

    setCropEditor({
      ...cropEditor,
      imageWidth: nextWidth,
      imageHeight: nextHeight,
      x: nextX,
      y: nextY,
      zoom: clampedZoom,
    });
  }

  function resetCropPosition() {
    if (!cropEditor) {
      return;
    }

    const baseScale =
      Math.max(
        CROP_WIDTH /
          cropEditor.naturalWidth,
        CROP_HEIGHT /
          cropEditor.naturalHeight,
      );

    const imageWidth =
      cropEditor.naturalWidth *
      baseScale;

    const imageHeight =
      cropEditor.naturalHeight *
      baseScale;

    setCropEditor({
      ...cropEditor,
      imageWidth,
      imageHeight,
      x:
        (CROP_WIDTH -
          imageWidth) /
        2,
      y:
        (CROP_HEIGHT -
          imageHeight) /
        2,
      zoom: CROP_MIN_ZOOM,
    });
  }

  async function handleApplyCrop() {
    if (
      !cropEditor ||
      isApplyingCrop
    ) {
      return;
    }

    setIsApplyingCrop(true);
    setImageError("");

    try {
      const imageElement =
        cropImageRef.current;

      if (!imageElement) {
        throw new Error(
          "The image is still loading. Please try again.",
        );
      }

      if (
        !imageElement.complete ||
        imageElement.naturalWidth === 0 ||
        imageElement.naturalHeight === 0
      ) {
        throw new Error(
          "The image is still loading. Please try again.",
        );
      }

      const displayScale =
        cropEditor.imageWidth /
        cropEditor.naturalWidth;

      if (displayScale <= 0) {
        throw new Error(
          "Unable to prepare the selected crop.",
        );
      }

      /*
       * The image is always scaled so that it completely
       * covers the 800 × 600 crop frame. Therefore the
       * crop rectangle is always exactly 4:3 and does
       * not need to be artificially bounded or stretched.
       */
      const sourceX =
        Math.max(
          0,
          -cropEditor.x /
            displayScale,
        );

      const sourceY =
        Math.max(
          0,
          -cropEditor.y /
            displayScale,
        );

      const sourceWidth =
        CROP_WIDTH /
        displayScale;

      const sourceHeight =
        CROP_HEIGHT /
        displayScale;

      if (
        sourceX + sourceWidth >
          cropEditor.naturalWidth + 0.5 ||
        sourceY + sourceHeight >
          cropEditor.naturalHeight + 0.5
      ) {
        throw new Error(
          "The selected crop is outside the image. Please reposition it and try again.",
        );
      }

      const canvas =
        document.createElement(
          "canvas",
        );

      canvas.width =
        CROP_OUTPUT_WIDTH;

      canvas.height =
        CROP_OUTPUT_HEIGHT;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Unable to prepare the selected crop.",
        );
      }

      context.imageSmoothingEnabled =
        true;

      context.imageSmoothingQuality =
        "high";

      context.drawImage(
        imageElement,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        CROP_OUTPUT_WIDTH,
        CROP_OUTPUT_HEIGHT,
      );

      const blob =
        await new Promise<Blob>(
          (resolve, reject) => {
            canvas.toBlob(
              (result) => {
                if (result) {
                  resolve(result);
                  return;
                }

                reject(
                  new Error(
                    "Unable to create the selected image.",
                  ),
                );
              },
              "image/jpeg",
              0.82,
            );
          },
        );

      const croppedFile =
        new File(
          [blob],
          `trackit-post-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          },
        );

      revokeCropEditorUrl();

      setCropEditor(null);
      setIsCropEditorOpen(false);
      setIsDraggingCrop(false);
      cropDragRef.current = null;
      setCropDisplayScale(1);

      setImage(croppedFile);
      setImageSource(null);
    } catch (error) {
      if (error instanceof Error) {
        setImageError(
          error.message ||
            "We could not prepare the selected image. Please try again.",
        );
      } else {
        setImageError(
          "We could not prepare the selected image. Please try again.",
        );
      }
    } finally {
      setIsApplyingCrop(false);
    }
  }

  function handleChangePostType(
    nextType: ItemType,
  ) {
    if (
      nextType === selectedType ||
      createItemMutation.isPending
    ) {
      return;
    }

    setSelectedType(nextType);
    setFormValues({
      title: "",
      description: "",
      category: "",
      location: "",
    });

    setImage(null);
    setImageError("");
    setErrorMessage("");
    setImageSource(null);
    createItemMutation.reset();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!formIsValid) {
      setErrorMessage(
        "Please correct the highlighted requirements before continuing.",
      );
      return;
    }

    if (!accessToken) {
      setErrorMessage(
        "Your session is no longer available. Please sign in again.",
      );
      return;
    }

    createItemMutation.reset();

    try {
      await createItemMutation.mutateAsync({
        payload: {
          title: formValues.title.trim(),
          description:
            formValues.description.trim(),
          type: selectedType,
          category:
            formValues.category.trim(),
          location:
            formValues.location.trim(),
          image,
        },
      });

      navigate("/items", {
        replace: true,
        state: {
          postSubmitted: true,
          postType: selectedType,
          successTitle:
            content.successTitle,
        },
      });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error),
      );
    }
  }

  const inputClasses =
    "mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-input-border)] bg-[var(--trackit-input-surface)] px-4 text-[var(--trackit-navy)] placeholder:text-[var(--trackit-text-muted)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--trackit-surface-blue)]";

  const textareaClasses =
    "mt-2 w-full resize-y rounded-xl border border-[var(--trackit-input-border)] bg-[var(--trackit-input-surface)] px-4 py-3 text-[var(--trackit-navy)] placeholder:text-[var(--trackit-text-muted)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--trackit-surface-blue)]";

  return (
    <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-8">
            <Link
              to="/items"
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              <span
                aria-hidden="true"
                className="mr-2"
              >
                ←
              </span>
              Back to my posts
            </Link>

            <div className="mt-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                What are you posting?
              </p>

              <div
                className="mt-3 inline-flex rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] p-1"
                role="group"
                aria-label="Post type"
              >
                <button
                  type="button"
                  onClick={() =>
                    handleChangePostType("lost")
                  }
                  disabled={
                    createItemMutation.isPending
                  }
                  aria-pressed={
                    selectedType === "lost"
                  }
                  className={`min-h-11 rounded-lg px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] ${
                    selectedType === "lost"
                      ? "bg-[var(--trackit-blue)] text-white shadow-sm"
                      : "text-[var(--trackit-navy)] hover:bg-white"
                  }`}
                >
                  Lost
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleChangePostType("found")
                  }
                  disabled={
                    createItemMutation.isPending
                  }
                  aria-pressed={
                    selectedType === "found"
                  }
                  className={`min-h-11 rounded-lg px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] ${
                    selectedType === "found"
                      ? "bg-[var(--trackit-blue)] text-white shadow-sm"
                      : "text-[var(--trackit-navy)] hover:bg-white"
                  }`}
                >
                  Found
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
              {content.eyebrow}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl lg:text-5xl">
              {content.title}
            </h1>

            <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)] sm:text-lg">
              {content.description}
            </p>
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="mt-8 rounded-2xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-5 py-4 text-sm leading-6 text-[var(--trackit-danger-text)]"
            >
              {errorMessage}
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm sm:p-7 lg:p-8"
            noValidate
          >
            <div className="space-y-7">
              <div>
                <label
                  htmlFor="post-title"
                  className="block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Title
                </label>

                <input
                  id="post-title"
                  name="title"
                  type="text"
                  value={formValues.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value,
                    )
                  }
                  minLength={3}
                  maxLength={200}
                  required
                  disabled={
                    createItemMutation.isPending
                  }
                  className={inputClasses}
                  placeholder={
                    selectedType === "lost"
                      ? "e.g. Black leather wallet"
                      : "e.g. Black leather wallet found"
                  }
                  aria-invalid={
                    formValues.title.length > 0 &&
                    !titleIsValid
                  }
                  aria-describedby="post-title-help"
                />

                <div
                  id="post-title-help"
                  className="mt-2 flex justify-between gap-4 text-xs leading-5 text-[var(--trackit-text-muted)]"
                >
                  <span>
                    3–200 characters.
                  </span>
                  <span>
                    {titleLength}/200
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="post-description"
                  className="block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Description
                </label>

                <textarea
                  id="post-description"
                  name="description"
                  value={formValues.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  minLength={10}
                  maxLength={5000}
                  required
                  disabled={
                    createItemMutation.isPending
                  }
                  rows={7}
                  className={textareaClasses}
                  placeholder={
                    selectedType === "lost"
                      ? "Describe the item, useful identifying details, and anything that could help someone recognize it."
                      : "Describe the item, where you found it, and useful identifying details without sharing unnecessary private information."
                  }
                  aria-invalid={
                    formValues.description.length > 0 &&
                    !descriptionIsValid
                  }
                  aria-describedby="post-description-help"
                />

                <div
                  id="post-description-help"
                  className="mt-2 flex justify-between gap-4 text-xs leading-5 text-[var(--trackit-text-muted)]"
                >
                  <span>
                    10–5,000 characters.
                  </span>
                  <span>
                    {descriptionLength}/5000
                  </span>
                </div>
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="post-category"
                    className="block text-sm font-bold text-[var(--trackit-navy)]"
                  >
                    Category
                  </label>

                  <input
                    id="post-category"
                    name="category"
                    type="text"
                    value={formValues.category}
                    onChange={(event) =>
                      updateField(
                        "category",
                        event.target.value,
                      )
                    }
                    minLength={2}
                    maxLength={100}
                    required
                    disabled={
                      createItemMutation.isPending
                    }
                    className={inputClasses}
                    placeholder="e.g. Wallet, Electronics, Documents"
                    aria-invalid={
                      formValues.category.length > 0 &&
                      !categoryIsValid
                    }
                    aria-describedby="post-category-help"
                  />

                  <p
                    id="post-category-help"
                    className="mt-2 text-xs leading-5 text-[var(--trackit-text-muted)]"
                  >
                    2–100 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="post-location"
                    className="block text-sm font-bold text-[var(--trackit-navy)]"
                  >
                    Location
                  </label>

                  <input
                    id="post-location"
                    name="location"
                    type="text"
                    value={formValues.location}
                    onChange={(event) =>
                      updateField(
                        "location",
                        event.target.value,
                      )
                    }
                    minLength={2}
                    maxLength={255}
                    required
                    disabled={
                      createItemMutation.isPending
                    }
                    className={inputClasses}
                    placeholder="e.g. Westlands, Nairobi"
                    aria-invalid={
                      formValues.location.length > 0 &&
                      !locationIsValid
                    }
                    aria-describedby="post-location-help"
                  />

                  <p
                    id="post-location-help"
                    className="mt-2 text-xs leading-5 text-[var(--trackit-text-muted)]"
                  >
                    2–255 characters.
                  </p>
                </div>
              </div>

              <div>
                <div>
                  <p className="text-sm font-bold text-[var(--trackit-navy)]">
                    Photo
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    Optional. Choose a photo from your
                    device or capture one directly with
                    your camera.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  id="post-image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={
                    createItemMutation.isPending
                  }
                  className="sr-only"
                />

                {image && imagePreviewUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)]">
                    <div className="relative">
                      <img
                        src={imagePreviewUrl}
                        alt={`Selected photo for ${selectedType} item`}
                        className="max-h-[420px] w-full object-contain"
                      />

                      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-black/65 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {image.name}
                          </p>

                          <p className="mt-1 text-xs text-white/75">
                            {getImageTypeLabel(image)}{" "}
                            ·{" "}
                            {formatFileSize(
                              image.size,
                            )}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={
                              openFilePicker
                            }
                            disabled={
                              createItemMutation.isPending
                            }
                            className="min-h-10 rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:pointer-events-none disabled:opacity-50"
                          >
                            Replace
                          </button>

                          <button
                            type="button"
                            onClick={removeImage}
                            disabled={
                              createItemMutation.isPending
                            }
                            className="min-h-10 rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:pointer-events-none disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={openFilePicker}
                      disabled={
                        createItemMutation.isPending
                      }
                      className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-5 text-center text-[var(--trackit-blue)] transition hover:border-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-60"
                    >
                      <ImageIcon />

                      <span className="mt-3 text-sm font-bold text-[var(--trackit-navy)]">
                        Choose from device
                      </span>

                      <span className="mt-1 text-xs leading-5 text-[var(--trackit-text-muted)]">
                        JPEG, PNG, or WebP
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={openCamera}
                      disabled={
                        createItemMutation.isPending
                      }
                      className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-5 text-center text-[var(--trackit-blue)] transition hover:border-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-60"
                    >
                      <CameraIcon />

                      <span className="mt-3 text-sm font-bold text-[var(--trackit-navy)]">
                        Take a photo
                      </span>

                      <span className="mt-1 text-xs leading-5 text-[var(--trackit-text-muted)]">
                        Use your camera
                      </span>
                    </button>
                  </div>
                )}

                {imageError ? (
                  <p
                    role="alert"
                    className="mt-3 text-sm leading-6 text-[var(--trackit-danger)]"
                  >
                    {imageError}
                  </p>
                ) : null}

                {imageSource === "camera" &&
                !imagePreviewUrl ? (
                  <p className="mt-3 text-xs leading-5 text-[var(--trackit-text-muted)]">
                    The captured image will open in the
                    crop editor before it is attached to
                    your post.
                  </p>
                ) : null}
              </div>

              <div className="border-t border-[var(--trackit-border)] pt-7">
                <div className="rounded-2xl border border-[var(--trackit-blue)]/15 bg-[var(--trackit-blue-soft)] p-5">
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0 text-[var(--trackit-blue)]">
                      <ShieldIcon />
                    </div>

                    <div>
                      <h2 className="text-sm font-extrabold text-[var(--trackit-navy)]">
                        Your post will be reviewed
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                        New posts go through TrackIt
                        moderation before becoming publicly
                        visible. Please provide accurate
                        information and avoid unnecessary
                        private or sensitive details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                  to="/items"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 text-sm font-bold text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Cancel
                </Link>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={
                    createItemMutation.isPending
                  }
                  disabled={!formIsValid}
                  className="!text-white sm:min-w-48"
                >
                  {content.submitLabel}
                </Button>
              </div>
            </div>
          </form>
        </section>

        <aside className="lg:pt-14">
          <div className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-deep-navy)] p-6 text-white shadow-sm sm:p-7 lg:sticky lg:top-24">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Before you post
            </p>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
              {content.sideTitle}
            </h2>

            <p className="mt-4 text-sm leading-6 text-[var(--trackit-text-on-dark)]">
              {content.sideDescription}
            </p>

            <div className="mt-7 space-y-5 border-t border-white/10 pt-6">
              <div>
                <p className="text-sm font-bold text-white">
                  Be specific
                </p>

                <p className="mt-1 text-sm leading-6 text-white/60">
                  Include useful identifying details such
                  as color, brand, model, markings, or
                  distinctive features.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Protect private information
                </p>

                <p className="mt-1 text-sm leading-6 text-white/60">
                  Do not include passwords, account
                  numbers, access codes, or other sensitive
                  information.
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Add useful evidence
                </p>

                <p className="mt-1 text-sm leading-6 text-white/60">
                  A clear photo can make an item easier to
                  recognize. You can crop the photo before
                  submitting it.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {isCameraOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-camera-title"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[var(--trackit-surface)] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--trackit-border)] px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Camera
                </p>

                <h2
                  id="post-camera-title"
                  className="mt-1 text-xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Take a photo
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseCamera}
                disabled={isCapturing}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-xl font-bold text-[var(--trackit-text-muted)] transition hover:bg-[var(--trackit-surface-blue)] hover:text-[var(--trackit-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                aria-label="Close camera"
              >
                ×
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="overflow-hidden rounded-2xl bg-black">
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="aspect-video h-auto w-full object-cover"
                />
              </div>

              {cameraStarting ? (
                <p className="mt-4 text-center text-sm text-[var(--trackit-text-muted)]">
                  Starting camera…
                </p>
              ) : null}

              {cameraError ? (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 py-3 text-sm leading-6 text-[var(--trackit-danger-text)]"
                >
                  {cameraError}
                </div>
              ) : null}

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  disabled={isCapturing}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 text-sm font-bold text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancel
                </button>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  loading={isCapturing}
                  disabled={
                    cameraStarting ||
                    Boolean(cameraError)
                  }
                  className="!text-white"
                  onClick={() =>
                    void handleCaptureImage()
                  }
                >
                  Capture photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCropEditorOpen &&
      cropEditor ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-crop-title"
        >
          <div className="my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[var(--trackit-surface)] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--trackit-border)] px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Photo editor
                </p>

                <h2
                  id="post-crop-title"
                  className="mt-1 text-xl font-extrabold text-[var(--trackit-navy)] sm:text-2xl"
                >
                  Crop your photo
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCropEditor}
                disabled={isApplyingCrop}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-xl font-bold text-[var(--trackit-text-muted)] transition hover:bg-[var(--trackit-surface-blue)] hover:text-[var(--trackit-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                aria-label="Close photo editor"
              >
                ×
              </button>
            </div>

            <div className="p-5 sm:p-6 lg:p-8">
              <p className="mx-auto max-w-2xl text-center text-sm leading-6 text-[var(--trackit-text-muted)]">
                Drag the image to position it. Use the
                zoom control to frame the useful details
                inside the crop area.
              </p>

              <div className="mt-5 flex justify-center">
                <div
                  ref={cropAreaRef}
                  className={`relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-inner ${
                    isDraggingCrop
                      ? "cursor-grabbing"
                      : "cursor-grab"
                  }`}
                  style={{
                    aspectRatio: "4 / 3",
                    touchAction: "none",
                  }}
                  onPointerDown={
                    handleCropPointerDown
                  }
                  onPointerMove={
                    handleCropPointerMove
                  }
                  onPointerUp={
                    handleCropPointerUp
                  }
                  onPointerCancel={
                    handleCropPointerUp
                  }
                  onPointerLeave={
                    handleCropPointerUp
                  }
                >
                  <img
                    ref={cropImageRef}
                    src={cropEditor.previewUrl}
                    alt="Crop preview"
                    draggable={false}
                    className="pointer-events-none absolute max-w-none select-none"
                    style={{
                      width: `${
                        cropEditor.imageWidth *
                        cropDisplayScale
                      }px`,
                      height: `${
                        cropEditor.imageHeight *
                        cropDisplayScale
                      }px`,
                      left: `${
                        cropEditor.x *
                        cropDisplayScale
                      }px`,
                      top: `${
                        cropEditor.y *
                        cropDisplayScale
                      }px`,
                    }}
                  />

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 border border-white/60"
                  >
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      <div className="border-b border-r border-white/25" />
                      <div className="border-b border-r border-white/25" />
                      <div className="border-b border-white/25" />
                      <div className="border-b border-r border-white/25" />
                      <div className="border-b border-r border-white/25" />
                      <div className="border-b border-white/25" />
                      <div className="border-r border-white/25" />
                      <div className="border-r border-white/25" />
                      <div />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor="post-crop-zoom"
                    className="text-sm font-bold text-[var(--trackit-navy)]"
                  >
                    Zoom
                  </label>

                  <span className="text-sm font-semibold text-[var(--trackit-text-muted)]">
                    {cropEditor.zoom.toFixed(1)}×
                  </span>
                </div>

                <input
                  id="post-crop-zoom"
                  type="range"
                  min={CROP_MIN_ZOOM}
                  max={CROP_MAX_ZOOM}
                  step="0.1"
                  value={cropEditor.zoom}
                  onChange={(event) =>
                    updateCropZoom(
                      Number(event.target.value),
                    )
                  }
                  disabled={isApplyingCrop}
                  className="mt-4 w-full accent-[var(--trackit-blue)]"
                />

                <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[var(--trackit-text-muted)]">
                  <span>Zoom out</span>
                  <span>Zoom in</span>
                </div>
              </div>

              <div className="mx-auto mt-4 flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={resetCropPosition}
                  disabled={isApplyingCrop}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                >
                  <RotateIcon />
                  Reset crop
                </button>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeCropEditor}
                    disabled={isApplyingCrop}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    loading={isApplyingCrop}
                    disabled={isApplyingCrop}
                    className="!text-white"
                    onClick={() =>
                      void handleApplyCrop()
                    }
                  >
                    Use this photo
                  </Button>
                </div>
              </div>

              <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-[var(--trackit-text-muted)]">
                The crop is prepared locally before the
                image is submitted with your post.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
