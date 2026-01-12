import React, { useState, useRef } from "react";
import { Upload, Camera, X, Loader2, Download, RotateCcw } from "lucide-react";

// You might want to move this to a utility file or context for larger apps
const uploadToImgbb = async (base64Image) => {
  const formData = new FormData();
  formData.append("image", base64Image.split(",")[1]); // Extract base64 part

  const response = await fetch(
    "https://api.imgbb.com/1/upload?key=ceeca1869bffb77885e2f4c01402b4af", // Your imgBB API key
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error(`Failed to upload image to imgBB: ${data.error.message}`);
  }
};

const VirtualTryOn = ({ product, isOpen, onClose }) => {
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState("");
  const [isProcessingPiAPI, setIsProcessingPiAPI] = useState(false); // For PiAPI try-on
  const [isInferringGender, setIsInferringGender] = useState(false); // For Gemini gender inference
  const [userInferredGender, setUserInferredGender] = useState(null); // 'Male', 'Female', 'Uncertain'
  const [genderInferenceMessage, setGenderInferenceMessage] = useState(""); // Message about gender inference
  const [result, setResult] = useState(null); // Result from PiAPI
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const inferGenderWithGemini = async (imageFile) => {
    setIsInferringGender(true);
    setGenderInferenceMessage("Analyzing photo for gender with AI...");
    setUserInferredGender(null); // Reset previous gender

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("/api/infer-gender-gemini", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("AI gender inference failed on server.");
      }

      const data = await response.json();
      const inferred = data.inferredGender;
      setUserInferredGender(inferred);
      if (inferred === "Uncertain") {
        setGenderInferenceMessage(
          "AI could not determine gender. Please ensure your photo is clear or manually select your gender."
        );
      } else {
        setGenderInferenceMessage(`AI inferred your gender as: ${inferred}`);
      }
    } catch (error) {
      console.error("Error during gender inference:", error);
      setGenderInferenceMessage(
        "Could not infer gender from your photo. Please try another image."
      );
      setUserInferredGender(null); // Ensure it's reset on error
    } finally {
      setIsInferringGender(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (file && file.type.startsWith("image/")) {
      setUserImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImagePreview(e.target?.result); // Shows preview
      };
      reader.readAsDataURL(file);
      setResult(null); // Clear previous try-on result
      setGenderInferenceMessage(""); // Clear previous gender message
      setUserInferredGender(null); // Clear previous gender
      setIsProcessingPiAPI(false); // Reset PiAPI processing state

      // After setting the preview, infer gender
      await inferGenderWithGemini(file);
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
    if (!userImage || !userInferredGender) {
      setResult({
        success: false,
        error: "Please upload your image and wait for gender detection.",
      });
      return;
    }

    if (userInferredGender === "Uncertain") {
      setResult({
        success: false,
        error: "AI could not confidently determine your gender. Please upload a clearer photo or contact support.",
      });
      return;
    }

    // --- Gender Compatibility Check ---
    const productGender = product.gender_category?.toLowerCase();
    const inferredGender = userInferredGender.toLowerCase(); // 'male' or 'female'

    if (productGender && productGender !== 'unisex') { // Only check if product has a specific gender category
        if (inferredGender === 'male' && productGender === 'women') {
            setResult({
                success: false,
                error: "Sorry, this is a women's clothing item. You cannot try on clothing from the women's category.",
            });
            return;
        }
        if (inferredGender === 'female' && productGender === 'men') {
            setResult({
                success: false,
                error: "Sorry, this is a men's clothing item. You cannot try on clothing from the men's category.",
            });
            return;
        }
    }


    setIsProcessingPiAPI(true);
    setResult(null); // Clear previous result before starting

    try {
      const imageUrl = await uploadToImgbb(userImagePreview); // Upload to imgBB first

      const formData = JSON.stringify({
        model: "kling",
        task_type: "ai_try_on",
        input: {
          model_input: imageUrl, // User's uploaded image URL
          dress_input: product.image, // Product's image URL
          upper_input: "", // Assuming full dress, no separate upper/lower
          lower_input: "",
          batch_size: 1,
        },
      });

      const response = await fetch("https://api.piapi.ai/api/v1/task", {
        method: "POST",
        body: formData,
        headers: {
          "x-api-key": "", // Your PiAPI key
          "Content-Type": "application/json", // Important for JSON body
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Try-on request failed: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const taskId = data?.data?.task_id;
      if (!taskId) throw new Error("Task ID not found in PiAPI response.");

      // Polling with setInterval for PiAPI result
      let attempts = 0;
      const maxAttempts = 15; // Increased max attempts for potentially longer processing

      const intervalId = setInterval(async () => {
        attempts++;
        console.log(`PiAPI Polling attempt ${attempts} for task ${taskId}`);

        try {
          const statusResponse = await fetch(
            `https://api.piapi.ai/api/v1/task/${taskId}`,
            {
              headers: {
                "x-api-key": "", // Your PiAPI key
              },
            }
          );

          const statusData = await statusResponse.json();
          const status = statusData?.data?.status;

          if (status === "completed") {
            clearInterval(intervalId);
            setResult({
              success: true,
              resultImage:
                statusData.data.output.works[0].image.resource_without_watermark,
            });
            setIsProcessingPiAPI(false);
          } else if (status === "failed") {
            clearInterval(intervalId);
            setResult({
              success: false,
              resultImage: null,
              error: statusData.data.error || "PiAPI try-on failed.",
            });
            setIsProcessingPiAPI(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            setResult({
              success: false,
              resultImage: null,
              error: "Try-on timed out. Please try again or with a different image.",
            });
            setIsProcessingPiAPI(false);
          }
        } catch (err) {
          clearInterval(intervalId);
          console.error("Error during PiAPI polling:", err);
          setResult({
            success: false,
            resultImage: null,
            error: "An error occurred while checking try-on status.",
          });
          setIsProcessingPiAPI(false);
        }
      }, 15000); // Poll every 15 seconds
    } catch (error) {
      console.error("Overall try-on process error:", error);
      setResult({ success: false, resultImage: null, error: error.message });
      setIsProcessingPiAPI(false);
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
    setUserInferredGender(null);
    setGenderInferenceMessage("");
    setIsProcessingPiAPI(false);
    setIsInferringGender(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Determine if the "Try On This Item" button should be disabled
  const isTryOnButtonDisabled =
    !userImage || isProcessingPiAPI || isInferringGender || !userInferredGender;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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

          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-88px)]"> {/* Adjusted max-h */}
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
                          className="w-full max-h-96 object-contain rounded-xl bg-gray-100" // Adjusted max-h
                        />
                        <button
                          onClick={resetTryOn}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Gender Inference Status/Message */}
                      {isInferringGender && (
                        <div className="flex items-center text-blue-600">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>{genderInferenceMessage}</span>
                        </div>
                      )}
                      {!isInferringGender && genderInferenceMessage && (
                        <p
                          className={`text-sm ${
                            userInferredGender === "Uncertain" ||
                            result?.error?.includes("Could not infer gender")
                              ? "text-orange-600"
                              : "text-gray-600"
                          }`}
                        >
                          {genderInferenceMessage}
                          {userInferredGender === "Uncertain" && (
                            <span className="font-semibold ml-1">
                              (Consider selecting manually if option available)
                            </span>
                          )}
                        </p>
                      )}

                      {!result && ( // Only show try on button if no result yet
                        <button
                          onClick={processVirtualTryOn}
                          disabled={isTryOnButtonDisabled}
                          className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isProcessingPiAPI ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Processing Try-On...
                            </>
                          ) : isInferringGender ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Analyzing Photo...
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
                {/* Product Info Display (Optional, can be added if desired) */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">
                    Selected Product:
                  </h4>
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-md border border-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">Category: {product.gender_category}</p>
                      {/* Add other product details as needed */}
                    </div>
                  </div>
                </div>

                {/* Processing State for PiAPI */}
                {isProcessingPiAPI && (
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
                        className="w-full max-h-96 object-contain rounded-xl bg-gray-100" // Adjusted max-h
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
                    <p className="text-red-800 font-semibold mb-2">
                      Try-On Failed!
                    </p>
                    <p className="text-red-700 text-sm">
                      {result.error ||
                        "Something went wrong. Please try again."}
                    </p>
                    <button
                      onClick={resetTryOn}
                      className="mt-3 text-red-600 hover:text-red-800 font-medium transition-colors"
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