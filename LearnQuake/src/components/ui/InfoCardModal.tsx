import React from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface InfoCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  image?: string;
  content?: React.ReactNode;
}

const InfoCardModal: React.FC<InfoCardModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  image,
  content,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-[95vw] max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-gray-200 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl overflow-y-auto"
          )}
        >
          <DialogHeader className="space-y-4 sm:space-y-6">
            {image && (
              <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <DialogTitle className="font-instrument font-bold text-xl sm:text-2xl lg:text-3xl text-quake-dark-blue text-center leading-tight px-2">
              {title}
            </DialogTitle>
            <DialogDescription className="font-instrument text-sm sm:text-base lg:text-lg text-gray-600 text-center leading-relaxed px-4">
              {description}
            </DialogDescription>
          </DialogHeader>
          
          {content && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
              {content}
            </div>
          )}
          
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <button
              onClick={onClose}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-quake-purple text-white font-instrument font-semibold rounded-xl hover:bg-quake-dark-blue transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Add share functionality or additional actions
                navigator.clipboard.writeText(title + ' - ' + description);
              }}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gray-200 text-gray-700 font-instrument font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
            >
              Share
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default InfoCardModal;