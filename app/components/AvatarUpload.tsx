import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import Avatar from "./Avatar";
import { Card, CardContent } from "./ui/card";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  disabled = false,
  className = "",
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasSelectedFile, setHasSelectedFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with currentAvatar prop, but don't override if user has selected new file
  useEffect(() => {
    if (!hasSelectedFile) {
      setPreview(currentAvatar || null);
    }
  }, [currentAvatar, hasSelectedFile]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "JPEG, PNG, 또는 WebP 형식의 이미지만 업로드할 수 있습니다.",
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "이미지 크기는 5MB 이하여야 합니다.",
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setHasSelectedFile(true); // Track that user selected a file

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onAvatarChange(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    setHasSelectedFile(false); // Reset file selection state
    setPreview(null);
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={`w-fit ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <div
              className={`
                relative inline-block
                ${isDragging ? "ring-2 ring-blue-500" : ""}
                transition-all duration-200
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Avatar src={preview} size="lg" className="cursor-pointer" />

              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              disabled={disabled}
              className="hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                if (!disabled) {
                  fileInputRef.current?.click();
                }
              }}
              disabled={disabled}
            >
              <Upload className="w-4 h-4 mr-2" />
              사진 선택
            </Button>

            {preview && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="w-4 h-4 mr-2" />
                제거
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>• JPEG, PNG, WebP 형식</p>
            <p>• 최대 5MB</p>
            <p>• 드래그 앤 드롭 가능</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
