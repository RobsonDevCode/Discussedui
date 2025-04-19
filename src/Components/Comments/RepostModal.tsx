import React, { useState, useRef, useEffect } from "react";
import { RepeatIcon, X, MessageSquare, Heart } from "lucide-react";
import { Comment } from "../../models/Comments/Comment";
import { Toaster, toast } from "sonner";
import { User } from "../../models/Accounts/User";

interface RepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: Comment) => Promise<void>;
  userId: string;
  comment: Comment | null;
  userCli: {
    getUserById: (userId: string, jwt: string | null) => Promise<User | null>;
    // Add other methods that might be in userCli
  };
  jwt: string | null;
}

const RepostModal: React.FC<RepostModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  userId,
  comment,
  userCli, 
  jwt
}) => {
  const [canRepost, setCanRepost] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");

  // Reset when modal opens/closes and get username
  useEffect(() => {
    if (isOpen && userId) {
      setIsValidating(true);
      
      // Get user information to display username
      userCli.getUserById(userId, jwt)
      .then(user => {
        console.log(user);
        if (user && user.user_name) {
          setUsername(user.user_name);
        }
        setCanRepost(true);
      })
      .catch(error => {
        console.error("Error getting user:", error);
        toast.error("Couldn't retrieve user information. Please try again later.");
      })
      .finally(() => {
        setIsValidating(false);
      });
    }
  }, [isOpen, userId, userCli, jwt]);

  // Update textarea height based on content
  useEffect(() => {
    // No more textarea to update
  }, []);

  if (!isOpen || !comment) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!comment) return;
    
    await onSubmit(comment);
    onClose(); // Close the modal
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
  };

  const renderRepostRestriction = () => {
    return (
      <div className="flex items-center p-3 bg-indigo-900/50 border border-indigo-800 rounded-lg mb-4">
        <div className="flex items-center justify-center flex-shrink-0 mr-2">
          <RepeatIcon size={20} className="text-yellow-300" />
        </div>
        <div className="flex items-center">
          <p className="text-yellow-200 text-sm leading-5 my-auto">
            You've already reposted today. Please return tomorrow to repost again.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-xl w-full max-w-2xl mx-4 border border-gray-700 shadow-xl"
        style={{ backgroundColor: 'rgb(0, 0, 0)' }} 
        onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching the backdrop
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Repost</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Preview</h3>
          
          {/* Repost Preview */}
          <div className="rounded-lg border border-gray-800 bg-black p-4">
            {/* Repost header */}
            <div className="flex items-center text-green-500 mb-2">
              <RepeatIcon size={16} className="mr-2" />
              <span className="text-sm">{username} reposted</span>
            </div>
            
            {/* Original Comment */}
            <div className="flex space-x-3">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
              <div className="flex-1">
                {/* User Info and Comment Time */}
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-white">{comment.user_name}</span>
                  <span className="text-gray-400">@{comment.user_name.toLowerCase()}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-400 text-sm">{formatDate(comment.created_at)}</span>
                </div>
                {/* Comment Content */}
                <div className="mt-1">
                  <p className="text-white">{comment.content}</p>
                </div>
                
                {/* Comment Stats */}
                <div className="flex items-center space-x-6 mt-2 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MessageSquare size={16} />
                    <span className="text-sm">{comment.user_interactions.reply_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-green-500">
                    <RepeatIcon size={16} />
                    <span className="text-sm">{comment.user_interactions.reposts || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart size={16} />
                    <span className="text-sm">{comment.user_interactions.likes || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!canRepost && !isValidating && renderRepostRestriction()}

        <div className="p-4">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex justify-end">
              <button
                type="submit"
                className={`${canRepost && !isValidating ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 cursor-not-allowed'} text-white font-bold px-6 py-2 rounded-full transition-colors duration-200 flex items-center`}
                disabled={!canRepost || isValidating}
              >
                <RepeatIcon size={16} className="mr-2" /> 
                Repost
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RepostModal;