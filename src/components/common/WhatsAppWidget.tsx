"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919876543210"; // Replace with actual WhatsApp number
const PRESET_MESSAGE = "Hi Lokus Support, I have a question about my order.";

export default function WhatsAppWidget() {
  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PRESET_MESSAGE)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onClick={handleClick}
    >
      <div className="relative group">
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Chat with us on WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
        
        {/* WhatsApp Button */}
        <button
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
        
        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
      </div>
    </div>
  );
}
