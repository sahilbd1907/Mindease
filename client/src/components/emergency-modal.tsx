import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Phone, MessageCircle } from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const handleCrisisHotline = () => {
    // In a real app, this would dial the crisis hotline
    window.open('tel:988', '_blank');
  };

  const handleChatWithCounselor = () => {
    // In a real app, this would connect to a crisis chat service
    window.open('https://suicidepreventionlifeline.org/chat/', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-lg font-bold">We're Here for You</DialogTitle>
          <DialogDescription className="mt-4">
            It seems like you might be going through a difficult time. Remember that you're not alone, 
            and there are people who want to help.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          <Button 
            onClick={handleCrisisHotline}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <Phone className="mr-2 h-4 w-4" />
            Call Crisis Hotline (988)
          </Button>
          
          <Button 
            onClick={handleChatWithCounselor}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with Counselor
          </Button>
          
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Continue to App
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            If you're in immediate danger, please call 911 or go to your nearest emergency room.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
