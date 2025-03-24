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
        <div className="w-full h-full bg-inherit">
            {/* Topic Header */}
            <div className="rounded-b-lg flex flex-col items-center justify-center border border-gray-700 shadow-lg p-4 mx-auto max-w-4xl text-center">
                <h1 className="text-2xl font-bold text-white">Today's topic:</h1>
                <p className="text-2xl text-white">{topic}</p>
            </div>

            {/* Main content area */}
            <div className="max-w-4xl mx-auto border-l border-r border-gray-700 bg-opacity-70" style={{ backdropFilter: 'blur(5px)' }}>
                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        className={`flex-1 py-4 text-center font-medium relative ${activeTab === "for-you" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                        onClick={() => setActiveTab("for-you")}
                    >
                        For You
                        {activeTab === "for-you" && (
                            <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-violet-700 rounded-full"></div>
                        )}
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-medium relative ${activeTab === "following" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                        onClick={() => setActiveTab("following")}
                    >
                        Following
                        {activeTab === "following" && (
                            <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-violet-700 rounded-full"></div>
                        )}
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-medium relative ${activeTab === "top-comments" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                        onClick={() => setActiveTab("top-comments")}
                    >
                        Top Comments
                        {activeTab === "top-comments" && (
                            <div className="absolute bottom-0 left-0 right-0 mx-auto w-16 h-1 bg-violet-700 rounded-full"></div>
                        )}
                    </button>
                </div>

                {/* Comment Button */}
                <div className="border-b border-gray-700 p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-10 rounded-full bg-transparent"></div>
                        {(userId !== null && userId !== undefined) ? (
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="text-gray-400 hover:text-white w-full text-left"
                            >
                                Share your thoughts on this topic...
                            </button>
                        ) : (
                            <button
                                className="text-gray-400 hover:text-white w-full text-left"
                                onClick={() => navigate('/login')}
                            >
                                Login to share your thoughts on the topic...
                            </button>
                        )}
                    </div>

                    {(userId !== null && userId !== undefined) ? (
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-4 py-2 rounded-full"
                        >
                            Comment
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-4 py-2 rounded-full"
                        >
                            Login
                        </button>
                    )}
                </div>

                {/* Comments Feed */}
                <div>
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">
                            <p>Loading comments...</p>
                        </div>
                    ) : displayedComments.length > 0 ? (
                        <>
                            {displayedComments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="p-4 border-b border-gray-700 hover:bg-gray-900 hover:bg-opacity-50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => handleOpenComment(comment.id, userId || "")}
                                >
                                    <div className="flex space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-transparent flex-shrink-0"></div>

                                        <div className="flex-1">
                                            {/* User Info and Comment Time */}
                                            <div className="flex items-center space-x-1">
                                                <span className="font-bold text-white">{comment.user_name}</span>
                                                <span className="text-gray-400">@{comment.user_name.toLowerCase()}</span>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-gray-400 text-sm">{formatDate(comment.created_at)}</span>
                                            </div>

                                            {/* Comment Content */}
                                            <div className="mt-1 mb-2">
                                                <p className="text-white">{comment.content}</p>
                                            </div>

                                            {/* Comment Actions */}
                                            <div className="flex justify-between max-w-md text-gray-400">
                                                {/* Reply */}
                                                {(userId !== null && userId !== undefined) ? (
                                                    <button
                                                        className="flex items-center space-x-1 group"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReplyClick(comment);
                                                        }}
                                                    >
                                                        <MessageCircle size={18} className="group-hover:text-blue-400" />
                                                        <span className="text-xs group-hover:text-blue-400">
                                                            {comment.user_interactions.reply_count > 0 ? comment.user_interactions.reply_count : ''}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="flex items-center space-x-1 group"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/login');
                                                        }}
                                                    >
                                                        <MessageCircle size={18} className="group-hover:text-blue-400" />
                                                        <span className="text-xs group-hover:text-blue-400">
                                                            {comment.user_interactions.reply_count > 0 ? comment.user_interactions.reply_count : ''}
                                                        </span>
                                                    </button>
                                                )}

                                                {/* Repost */}
                                                <button
                                                    className="flex items-center space-x-1 group"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Repeat size={18} className="group-hover:text-green-400" />
                                                    <span className="text-xs group-hover:text-green-400">
                                                        {comment.user_interactions.reposts > 0 ? comment.user_interactions.reposts : ''}
                                                    </span>
                                                </button>

                                                {/* Like */}
                                                <button
                                                    className="flex items-center space-x-1 group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLike(comment);
                                                    }}
                                                >
                                                    <Heart
                                                        size={18}
                                                        className={`${comment.user_interactions.user_liked ? 'text-red-500 fill-red-500' : 'group-hover:text-red-400'}`}
                                                    />
                                                    <span className={`text-xs ${comment.user_interactions.user_liked ? 'text-red-500' : 'group-hover:text-red-400'}`}>
                                                        {comment.user_interactions.likes > 0 ? comment.user_interactions.likes : ''}
                                                    </span>
                                                </button>

                                              
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="p-4 flex justify-center">
                                    <button
                                        ref={loadMoreButtonRef}
                                        onClick={handleLoadMore}
                                        className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-4 py-2 rounded-full"
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? 'Loading...' : 'Load More Comments'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-4 text-gray-400 text-center border-b border-gray-700 hover:bg-gray-900 hover:bg-opacity-50 transition-colors duration-200">
                            {activeTab === "for-you" ? (
                                <p>No comments to show. Be the first to comment!</p>
                            ) : activeTab === "following" && isLoggedIn ? (
                                <p>No comments from people you follow yet.</p>
                            ) : activeTab === "following" && !isLoggedIn ? (
                                <p>To see followers please login or create an account!</p>
                            ) : (
                                <p>No top comments to show yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* Modal components */}
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