import React from 'react';
import { Camera, Upload, Sparkles, CheckCircle } from 'lucide-react';

const VirtualTryOnGuide = ({ 
  isOpen, 
  onClose, 
  onGetStarted 
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Camera className="h-8 w-8 text-purple-600" />,
      title: "Take or Upload Photo",
      description: "Use a full-body photo with good lighting and minimal background for best results."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-pink-600" />,
      title: "AI Processing",
      description: "Our advanced AI analyzes your photo and virtually fits the clothing item on you."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      title: "See the Result",
      description: "View how the item looks on you and make confident purchase decisions."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Virtual Try-On with AI
          </h2>
          <p className="text-gray-600 text-lg">
            See how clothes look on you before you buy
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  {step.icon}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            Tips for Best Results:
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              Stand straight with arms slightly away from your body
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              Use good lighting and avoid shadows
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              Wear fitted clothing for accurate sizing
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              Keep background simple and uncluttered
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              onClose();
              onGetStarted();
            }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
          >
            Try It Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnGuide;