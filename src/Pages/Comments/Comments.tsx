import { useState, useEffect, useRef } from "react";
import { Comment } from "../../models/Comments/Comment";
import { Heart, MessageCircle, Repeat, Share2 } from "lucide-react";
import { isProblemDetails, UseCommentClient } from "../../Sevices/Comments/CommentsClient";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Like } from "../../models/Comments/Like";
import ShareThoughtsModal from "../../Components/Comments/ShareYourThoughtsModal";
import { PostComment } from "../../models/Comments/PostComment";
import { useTokenClient } from "../../Sevices/Login/TokenClient";
import ReplyModal from "../../Components/Comments/ReplyModal";
import { PostReply } from "../../models/Replies/PostReply";
import { UseReplyClient } from "../../Sevices/Replies/ReplyClient";
import { Toaster, toast } from 'sonner';
import CommentModal from "../../Components/Comments/CommentModal";
import { CommentWithReplies } from "../../models/Comments/CommentWithReplies";
import { Reply } from "../../models/Replies/Reply";

// Define tab types
type TabType = "for-you" | "following" | "top-comments";

const Comments: React.FC = () => {
    const navigate = useNavigate();

    //Clients
    const tokenCli = useTokenClient();
    const commentCli = UseCommentClient();
    const replyCli = UseReplyClient();

    // Active tab state
    const [activeTab, setActiveTab] = useState<TabType>("for-you");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    //Topic 
    const [topic, setTopic] = useState<string>("Luigi Mangione");

    // Comments state for each tab
    const [comments, setComments] = useState<Comment[]>([]);
    const [followingComments, setFollowingComments] = useState<Comment[]>([]);
    const [topComments, setTopComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

    // Pagination state
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [offset, setOffset] = useState<number>(0);
    const BATCH_SIZE = 25;
    const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [displayedComments, setDisplayedComments] = useState<Comment[]>([]);
    const loadMoreButtonRef = useRef<HTMLButtonElement>(null);


    //Open Comment 
    const [isCommentOpen, setIsCommentOpen] = useState<boolean>(false);
    const [activeComment, setActiveComment] = useState<CommentWithReplies | null>(null);
    const [isLoadingReplies, setIsLoadingReplies] = useState<boolean>(false);

    //Replies 
    const [isReplyModalOpen, setIsReplyModelOpen] = useState<boolean>(false);
    const [activeParentComment, setActiveParentComment] = useState<Comment | null>(null)

    //Location
    const location = useLocation();

    //Auth 
    const [jwt, setJwt] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const setAuth = async () => {
        setJwt(await getJwt(userId))
    };

    var userId = location.state?.userId;

    const getJwt = async (userId: string | null): Promise<string | null> => {
        if (jwt !== null) {
            return jwt;
        }
        else if ((userId !== null && userId !== undefined) && jwt === null) {
            return await tokenCli.getJwt(userId, "id");
        } else {
            return null;
        }
    }

    // Helper function to remove duplicates
    function removeDuplicates(comments: Comment[]): Comment[] {
        return Array.from(
            new Map(comments.map(item => [item.id, item])).values()
        );
    }

    const fetchData = async (currentOffset: number) => {
        if (currentOffset === 0) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        console.log("fetch offset:" + currentOffset);

        try {
            let newComments: Comment[] = [];

            switch (activeTab) {
                case "for-you":
                    newComments = await commentCli.getComments(userId, currentOffset);
                    // Remove duplicates from new comments
                    const uniqueNewComments = removeDuplicates(newComments);

                    if (currentOffset === 0) {
                        setComments(uniqueNewComments);
                    } else {
                        setComments(prev => {
                            // Combine with existing comments and remove duplicates again
                            const combined = [...prev, ...uniqueNewComments];
                            return removeDuplicates(combined);
                        });
                    }
                    break;

                case "following":
                    if (!isLoggedIn) {
                        setFollowingComments([]);
                        setHasMore(false);
                        break;
                    }

                    newComments = await commentCli.getFollowingComments(userId, currentOffset);
                    const uniqueFollowingComments = removeDuplicates(newComments);

                    if (currentOffset === 0) {
                        setFollowingComments(uniqueFollowingComments);
                    } else {
                        setFollowingComments(prev => {
                            const combined = [...prev, ...uniqueFollowingComments];
                            return removeDuplicates(combined);
                        });
                    }
                    break;

                case "top-comments":
                    newComments = await commentCli.getTopComments(userId, currentOffset);
                    const uniqueTopComments = removeDuplicates(newComments);

                    if (currentOffset === 0) {
                        setTopComments(uniqueTopComments);
                    } else {
                        setTopComments(prev => {
                            const combined = [...prev, ...uniqueTopComments];
                            return removeDuplicates(combined);
                        });
                    }
                    break;
            }

            // Determine if we have more comments to load
            setHasMore(newComments.length >= BATCH_SIZE);

            // If this is a "load more" operation, show the new comments
            if (currentOffset > 0) {
                setVisibleCount(prev => prev + Math.min(BATCH_SIZE, newComments.length));
            }
        } catch (error: unknown) {
            // Your existing error handling
            console.error("Error fetching comments:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Use a separate effect to update displayed comments when data changes
    useEffect(() => {
        const currentComments = getCurrentComments();
        setDisplayedComments(currentComments.slice(0, visibleCount));
    }, [comments, followingComments, topComments, visibleCount, activeTab]);

    // Fetch comments when tab changes
    useEffect(() => {
        setAuth();
        if (userId !== null && userId !== undefined) {
            setIsLoggedIn(true);
        }

        // Reset pagination when tab changes
        setOffset(0);
        setVisibleCount(BATCH_SIZE);

        fetchData(0);
    }, [activeTab]); // Re-fetch when tab changes

    // Handle load more button click
    const handleLoadMore = async () => {
        // First, check if we already have more comments loaded but not displayed
        const currentComments = getCurrentComments();

        if (visibleCount < currentComments.length) {
            // We have more comments already loaded, just display more
            setVisibleCount(prev => Math.min(prev + BATCH_SIZE, currentComments.length));
        } else {
            // We need to fetch more comments from the API
            const newOffset = offset + 50;
            setOffset(newOffset);
            await fetchData(newOffset);
        }
    };

    // Handle comment submission
    const handleSubmitComment = async (commentContent: string) => {
        if (commentContent.trim() === "") return;


        const toastId = toast.loading('Posting your comment...');

        const postComment: PostComment = {
            topic_id: topic,
            user_id: userId,
            content: commentContent
        };

        try {
            const comment = await commentCli.postComment(postComment, jwt)
            switch (activeTab) {
                case "for-you":
                    setComments([comment, ...comments]);
                    break;
                case "following":
                    setFollowingComments([comment, ...followingComments]);
                    break;
                case "top-comments":
                    setTopComments([comment, ...topComments]);
                    break;
            }
            toast.success('Comment posted successfully!', { id: toastId });
        } catch (error: unknown) {
            toast.error('Failed to post comment. Please try again.', { id: toastId });
            console.log(error);
        }

    };

    // Format date to readable string
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

    // Implementation for the handleLike function
    const handleLike = async (comment: Comment) => {
        try {
            if (!isLoggedIn) {
                navigate("/login");
            }
            // Create a copy of the comment for optimistic UI update
            const commentToUpdate = { ...comment };

            // Toggle the like status
            const newLikedStatus = !commentToUpdate.user_interactions.user_liked;

            // Update like count based on new status
            const newLikeCount = newLikedStatus
                ? commentToUpdate.user_interactions.likes + 1
                : commentToUpdate.user_interactions.likes - 1;

            // Update the comment in UI immediately (optimistic update)
            const updatedComments = getCurrentComments().map(c => {
                if (c.id === comment.id) {
                    return {
                        ...c,
                        user_interactions: {
                            ...c.user_interactions,
                            user_liked: newLikedStatus,
                            likes: newLikeCount,
                            last_interaction: new Date()
                        }
                    };
                }
                return c;
            });

            // Update the correct comment list based on active tab
            switch (activeTab) {
                case "for-you":
                    setComments(updatedComments);
                    break;
                case "following":
                    setFollowingComments(updatedComments);
                    break;
                case "top-comments":
                    setTopComments(updatedComments);
                    break;
            }

            const like: Like = {
                comment_id: comment.id,
                user_id: userId
            }

            var response;

            if (newLikeCount > commentToUpdate.user_interactions.likes) {
                response = await commentCli.likeComment(like);
            } else {
                response = await commentCli.dislikeComment(like);
            }

            // If server response fails, revert the optimistic update
            if (!response || response.status !== 200) {
                // Revert to original state if API fails
                const revertedComments = getCurrentComments().map(c => {
                    if (c.id === comment.id) {
                        return comment; // Original comment state
                    }
                    return c;
                });

                switch (activeTab) {
                    case "for-you":
                        setComments(revertedComments);
                        break;
                    case "following":
                        setFollowingComments(revertedComments);
                        break;
                    case "top-comments":
                        setTopComments(revertedComments);
                        break;
                }
            }
        } catch (error: unknown) {
            // Handle errors similar to your existing error handling
            if (isProblemDetails(error)) {
                const problemDetails = error.response?.data;
                console.log(problemDetails?.detail || problemDetails?.title || "An error occurred while liking the comment.");
            } else if (error instanceof AxiosError) {
                if (error.response) {
                    console.log(error.response.data?.detail || "An error occurred while liking the comment.");
                } else if (error.request) {
                    console.log("Unable to connect to the server. Please check your internet connection.");
                } else {
                    console.log("An unexpected error occurred. Please try again.");
                }
            } else if (error instanceof Error) {
                console.log(error.message || "An unexpected error occurred. Please try again.");
            } else {
                console.log("An unexpected error occurred. Please try again.");
            }
        }
    };

    // Get the current comments based on active tab
    const getCurrentComments = () => {
        switch (activeTab) {
            case "for-you":
                return comments;
            case "following":
                return followingComments;
            case "top-comments":
                return topComments;
            default:
                return comments;
        }
    };


    const handleReplyClick = (comment: Comment) => {
        setActiveParentComment(comment);
        setIsReplyModelOpen(true);
    }


    const handleSubmitReply = async (content: string, parentCommentId: string) => {
        if (!userId || content.trim() === "") return;

        console.log("getting here");
        try {
            const reply: PostReply = {
                comment_id: parentCommentId,
                user_id: userId,
                content: content
            };

            console.log(reply);
            await replyCli.postReply(reply, jwt);

            // Update UI optimistically - just increment the reply count
            const updatedComments = getCurrentComments().map(comment => {
                if (comment.id === parentCommentId) {
                    // Update reply count
                    const updatedInteractions = {
                        ...comment.user_interactions,
                        reply_count: comment.user_interactions.reply_count + 1
                    };

                    return {
                        ...comment,
                        user_interactions: updatedInteractions
                    };
                }
                return comment;
            });

            // Update the appropriate comment list
            switch (activeTab) {
                case "for-you":
                    setComments(updatedComments);
                    break;
                case "following":
                    setFollowingComments(updatedComments);
                    break;
                case "top-comments":
                    setTopComments(updatedComments);
                    break;
            }

            // Show a success message or notification if desired
            console.log("Reply posted successfully!");
        } catch (error) {
            console.error("Error posting reply:", error);
            // Handle error, show notification, etc.
        }
    };


    const handleOpenComment = async (commentId: string, userId: string) => {
        setIsLoadingReplies(true);
        try {
            const response = await commentCli.getCommentWithReplies(commentId, userId, jwt);
            const commentWithReplies: CommentWithReplies = {
                comment: response.comment,
                replies: response.replies || []
            };

            setActiveComment(commentWithReplies);
            setIsCommentOpen(true);

        } catch (error) {
            console.error("Error fetching comment thread:", error);
            toast.error("Could not load comment thread");
        } finally {
            setIsLoadingReplies(false);
        }
    }

    const handleThreadLike = async (commentId: string, isReply: boolean = false) => {
        if (!userId) {
            navigate("/login");
            return;
        }

        try {
            const like: Like = {
                comment_id: commentId,
                user_id: userId
            };

            if (activeComment) {
                if (!isReply) {
                    // It's the main comment
                    const comment = activeComment.comment;
                    const newLikedStatus = !comment.user_interactions.user_liked;

                    // Update optimistically
                    setActiveComment({
                        ...activeComment,
                        comment: {
                            ...comment,
                            user_interactions: {
                                ...comment.user_interactions,
                                user_liked: newLikedStatus,
                                likes: newLikedStatus
                                    ? comment.user_interactions.likes + 1
                                    : comment.user_interactions.likes - 1
                            }
                        }
                    });

                    if (newLikedStatus) {
                        await commentCli.likeComment(like);
                    } else {
                        await commentCli.dislikeComment(like);
                    }
                } else {
                    const replies = activeComment?.replies?.map(reply => {
                        if (reply.id === commentId) {
                            const newLikedStatus = !reply.interactions.user_liked;
                            return {
                                ...reply,
                                interactions: {
                                    ...reply.interactions,
                                    liked: newLikedStatus,
                                    likes: newLikedStatus ? reply.interactions.likes + 1 : reply.interactions.likes - 1
                                }
                            };
                        }
                        return reply;
                    }) || [];

                    setActiveComment({
                        ...activeComment,
                        replies
                    });

                    const replyLike = {
                        reply_id: commentId,
                        user_id: userId
                    };

                    //const updatedReply = await commentCli.likeReply(replyLike);
                }
            }
        } catch (error) {
            console.error("Error updating like:", error);
            toast.error("Could not update like status");

            // You might want to revert the optimistic update here
        }
    };


    return (
        <div className="w-full h-full">
        {/* Topic Header - Glass morphism effect */}
        <div className="rounded-lg flex flex-col items-center justify-center border border-gray-700/50 shadow-lg p-6 mx-auto max-w-4xl text-center bg-gray-900/30 backdrop-blur-md">
            <h1 className="text-2xl font-bold text-white mb-1">Today's topic:</h1>
            <p className="text-3xl font-medium text-white bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{topic}</p>
        </div>
    
        {/* Main content area - Improved glass card */}
        <div className="max-w-4xl mx-auto mt-4 border border-gray-700/50 rounded-lg overflow-hidden bg-gray-900/20 backdrop-blur-md shadow-xl">
            {/* Tabs - Improved styling */}
            <div className="flex border-b border-gray-700/70">
                <button
                    className={`flex-1 py-4 text-center font-medium relative transition-colors duration-200 ${activeTab === "for-you" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                    onClick={() => setActiveTab("for-you")}
                >
                    For You
                    {activeTab === "for-you" && (
                        <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"></div>
                    )}
                </button>
                <button
                    className={`flex-1 py-4 text-center font-medium relative transition-colors duration-200 ${activeTab === "following" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                    onClick={() => setActiveTab("following")}
                >
                    Following
                    {activeTab === "following" && (
                        <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"></div>
                    )}
                </button>
                <button
                    className={`flex-1 py-4 text-center font-medium relative transition-colors duration-200 ${activeTab === "top-comments" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                    onClick={() => setActiveTab("top-comments")}
                >
                    Top Comments
                    {activeTab === "top-comments" && (
                        <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"></div>
                    )}
                </button>
            </div>
    
            {/* Comment Input - Improved styling */}
            <div className="border-b border-gray-700/70 p-5 flex justify-between items-center">
                <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    </div>
                    {(userId !== null && userId !== undefined) ? (
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="text-gray-400 hover:text-white w-full text-left transition-colors duration-200 bg-gray-800/50 py-2 px-4 rounded-full"
                        >
                            Share your thoughts on this topic...
                        </button>
                    ) : (
                        <button
                            className="text-gray-400 hover:text-white w-full text-left transition-colors duration-200 bg-gray-800/50 py-2 px-4 rounded-full"
                            onClick={() => navigate('/login')}
                        >
                            Login to share your thoughts...
                        </button>
                    )}
                </div>
    
                {(userId !== null && userId !== undefined) ? (
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-medium px-5 py-2 rounded-full ml-4 transition-all duration-200 shadow-lg shadow-violet-700/20"
                    >
                        Comment
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-medium px-5 py-2 rounded-full ml-4 transition-all duration-200 shadow-lg shadow-violet-700/20"
                    >
                        Login
                    </button>
                )}
            </div>
    
            {/* Comments Feed - Improved styling */}
            <div>
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-t-2 border-violet-500 border-r-2 border-gray-700 rounded-full animate-spin mb-3"></div>
                        <p>Loading comments...</p>
                    </div>
                ) : displayedComments.length > 0 ? (
                    <>
                        {displayedComments.map((comment) => (
                            <div
                                key={comment.id}
                                className="p-5 border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors duration-200 cursor-pointer"
                                onClick={() => handleOpenComment(comment.id, userId || "")}
                            >
                                <div className="flex space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex-shrink-0 flex items-center justify-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                        </svg>
                                    </div>
    
                                    <div className="flex-1">
                                        {/* User Info and Comment Time */}
                                        <div className="flex items-center space-x-1 flex-wrap">
                                            <span className="font-bold text-white">{comment.user_name}</span>
                                            <span className="text-gray-400">@{comment.user_name.toLowerCase()}</span>
                                            <span className="text-gray-500">·</span>
                                            <span className="text-gray-400 text-sm">{formatDate(comment.created_at)}</span>
                                        </div>
    
                                        {/* Comment Content */}
                                        <div className="mt-2 mb-3">
                                            <p className="text-white leading-relaxed">{comment.content}</p>
                                        </div>
    
                                        {/* Comment Actions - Improved spacing and hover effects */}
                                        <div className="flex justify-start gap-6 text-gray-400">
                                            {/* Reply */}
                                            {(userId !== null && userId !== undefined) ? (
                                                <button
                                                    className="flex items-center space-x-2 group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReplyClick(comment);
                                                    }}
                                                >
                                                    <MessageCircle size={18} className="group-hover:text-blue-400 transition-colors duration-200" />
                                                    <span className="text-sm group-hover:text-blue-400 transition-colors duration-200">
                                                        {comment.user_interactions.reply_count > 0 ? comment.user_interactions.reply_count : ''}
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    className="flex items-center space-x-2 group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/login');
                                                    }}
                                                >
                                                    <MessageCircle size={18} className="group-hover:text-blue-400 transition-colors duration-200" />
                                                    <span className="text-sm group-hover:text-blue-400 transition-colors duration-200">
                                                        {comment.user_interactions.reply_count > 0 ? comment.user_interactions.reply_count : ''}
                                                    </span>
                                                </button>
                                            )}
    
                                            {/* Repost */}
                                            <button
                                                className="flex items-center space-x-2 group"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Repeat size={18} className="group-hover:text-green-400 transition-colors duration-200" />
                                                <span className="text-sm group-hover:text-green-400 transition-colors duration-200">
                                                    {comment.user_interactions.reposts > 0 ? comment.user_interactions.reposts : ''}
                                                </span>
                                            </button>
    
                                            {/* Like */}
                                            <button
                                                className="flex items-center space-x-2 group"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(comment);
                                                }}
                                            >
                                                <Heart
                                                    size={18}
                                                    className={`${comment.user_interactions.user_liked ? 'text-red-500 fill-red-500' : 'group-hover:text-red-400'} transition-colors duration-200`}
                                                />
                                                <span className={`text-sm ${comment.user_interactions.user_liked ? 'text-red-500' : 'group-hover:text-red-400'} transition-colors duration-200`}>
                                                    {comment.user_interactions.likes > 0 ? comment.user_interactions.likes : ''}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
    
                        {/* Load More Button - Improved styling */}
                        {hasMore && (
                            <div className="p-6 flex justify-center">
                                <button
                                    ref={loadMoreButtonRef}
                                    onClick={handleLoadMore}
                                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-2.5 rounded-full transition-colors duration-200 flex items-center space-x-2"
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <div className="w-4 h-4 border-t-2 border-white border-r-2 border-gray-700 rounded-full animate-spin"></div>
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <span>Load More Comments</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-12 px-4 text-gray-400 text-center">
                        <div className="bg-gray-800/30 mx-auto max-w-sm p-8 rounded-xl border border-gray-700/50">
                            <div className="text-gray-300 mb-3 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                            </div>
                            {activeTab === "for-you" ? (
                                <p className="font-medium">No comments to show. Be the first to share your thoughts!</p>
                            ) : activeTab === "following" && isLoggedIn ? (
                                <p className="font-medium">No comments from people you follow yet.</p>
                            ) : activeTab === "following" && !isLoggedIn ? (
                                <p className="font-medium">Login to see comments from people you follow.</p>
                            ) : (
                                <p className="font-medium">No top comments to show yet.</p>
                            )}
                            {(userId === null || userId === undefined) && (
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white font-medium px-5 py-2 rounded-full transition-all duration-200 shadow-lg shadow-violet-700/20"
                                >
                                    Login to comment
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    
        {/* Modal components (unchanged) */}
        <ShareThoughtsModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            onSubmit={handleSubmitComment}
            userId={userId || ""}
            topicTitle={topic}
            commentCli={commentCli}
            jwt={jwt}
        />
        <ReplyModal
            isOpen={isReplyModalOpen}
            onClose={() => setIsReplyModelOpen(false)}
            onSubmit={handleSubmitReply}
            userId={userId || ""}
            parentComment={activeParentComment}
            replyCli={replyCli}
            jwt={jwt}
        />
        <CommentModal
            isOpen={isCommentOpen}
            onClose={() => setIsCommentOpen(false)}
            commentWithReplies={activeComment}
            userId={userId || ""}
            onLike={handleThreadLike}
            onReply={handleSubmitReply}
            replyCli={replyCli}
            jwt={jwt}
        />
    </div>
    );
}

export default Comments;