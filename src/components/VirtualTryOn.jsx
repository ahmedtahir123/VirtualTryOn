import React, { useState, useRef } from "react";
import { Upload, Camera, X, Loader2, Download, RotateCcw } from "lucide-react";

const uploadToImgbb = async (base64Image) => {
  const formData = new FormData();
  formData.append("image", base64Image.split(",")[1]);

  const response = await fetch(
    "https://api.imgbb.com/1/upload?key=ceeca1869bffb77885e2f4c01402b4af",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return data.data.url; // This is the image URL you can send to PiAPI
};

const VirtualTryOn = ({ product, isOpen, onClose }) => {
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setUserImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result;
        setUserImagePreview(base64String); // Shows preview
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const processVirtualTryOn = async () => {
    const imageUrl = await uploadToImgbb(userImagePreview);

    if (!userImage) return;
    setIsProcessing(true);

    try {
      const formData = JSON.stringify({
        model: "kling",
        task_type: "ai_try_on",
        input: {
          model_input: imageUrl,
          dress_input: product.image,
          upper_input: "",
          lower_input: "",
          batch_size: 1,
        },
      });

      const response = await fetch("https://api.piapi.ai/api/v1/task", {
        method: "POST",
        body: formData,
        headers: {
          "x-api-key":
            "68ce8f66fc3773282f6ef9c85f0211fe53ef11f139a57231afacaa23df3086ed",
        },
      });

      if (!response.ok) throw new Error("Try-on request failed");

      const data = await response.json();
      const taskId = data?.data?.task_id;
      if (!taskId) throw new Error("Task ID not found");

      // Polling with setInterval
      let attempts = 0;
      const maxAttempts = 10;

      const intervalId = setInterval(async () => {
        attempts++;
        console.log(`Polling attempt ${attempts}`);

        try {
          const statusResponse = await fetch(
            `https://api.piapi.ai/api/v1/task/${taskId}`,
            {
              headers: {
                "x-api-key":
                  "68ce8f66fc3773282f6ef9c85f0211fe53ef11f139a57231afacaa23df3086ed",
              },
            }
          );

          const statusData = await statusResponse.json();
          const status = statusData?.data.status;

          if (status === "completed") {
            clearInterval(intervalId);
            setResult({
              success: true,
              resultImage:
                statusData.data.output.works[0].image
                  .resource_without_watermark,
            });
            setIsProcessing(false);
          } else if (status === "failed" || attempts >= maxAttempts) {
            clearInterval(intervalId);
            setResult({
              success: false,
              resultImage: null,
              error: "Try-on failed or timeout reached",
            });
            setIsProcessing(false);
          }
        } catch (err) {
          clearInterval(intervalId);
          console.error("Error during polling:", err);
          setResult({
            success: false,
            resultImage: null,
            error: "Polling failed",
          });
          setIsProcessing(false);
        }
      }, 20000); // every 20 seconds
    } catch (error) {
      console.error("Try-on error:", error);
      setResult({ success: false, resultImage: null, error: error.message });
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result?.resultImage) {
      const link = document.createElement("a");
      link.href = result.resultImage;
      link.download = `virtual-try-on-${product.name
        .replace(/\s+/g, "-")
        .toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetTryOn = () => {
    setUserImage(null);
    setUserImagePreview("");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95-vh] overflow-hidden"> */}
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Virtual Try-On
              </h2>
              <p className="text-gray-600 mt-1">
                See how "{product.name}" looks on you
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[calc(95vh-88px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Upload Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Upload Your Photo
                  </h3>

                  {!userImagePreview ? (
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragActive
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <Upload className="h-8 w-8 text-gray-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drop your photo here, or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            For best results, use a full-body photo with good
                            lighting
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Choose Photo
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={userImagePreview}
                          alt="Your photo"
                          className="w-full max-h-100 object-contains rounded-xl bg-gray-100"
                        />
                        <button
                          onClick={resetTryOn}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {!result && (
                        <button
                          onClick={processVirtualTryOn}
                          disabled={isProcessing}
                          className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Try On This Item"
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {/* Tips */}
                {!userImagePreview && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Tips for Best Results:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use a full-body photo with clear visibility</li>
                      <li>• Ensure good lighting and minimal background</li>
                      <li>
                        • Stand straight with arms slightly away from body
                      </li>
                      <li>• Avoid baggy clothing for accurate fitting</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Product & Result Section */}
              <div className="space-y-6">
                {/* Processing State */}
                {isProcessing && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 text-center">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-amber-100 rounded-full">
                          <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          AI is working its magic...
                        </h4>
                        <p className="text-gray-600 mt-2">
                          Creating your virtual try-on experience
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full animate-pulse"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result */}
                {result && result.success && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Your Virtual Try-On
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={downloadResult}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download result"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          onClick={resetTryOn}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Try again"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <img
                        src={result.resultImage}
                        alt="Virtual try-on result"
                        className="w-full max-h-100 object-contains rounded-xl bg-gray-100"
                      />
                    </div>

                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-green-800 text-sm">
                        ✨ Virtual try-on complete! This is how the item would
                        look on you.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {result && !result.success && (
                  <div className="bg-red-50 rounded-xl p-6 text-center">
                    <p className="text-red-800">
                      {result.error ||
                        "Something went wrong. Please try again."}
                    </p>
                    <button
                      onClick={resetTryOn}
                      className="mt-3 text-red-600 hover:text-red-800 font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
