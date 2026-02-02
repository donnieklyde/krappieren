"use client";
import { useState, useRef, useEffect } from "react";
import PostCard from "./PostCard";
import CommentDock from "./CommentDock";
import { usePosts } from "../context/PostsContext";
import { useUser } from "../context/UserContext";

import { useSession } from "next-auth/react";

export default function Feed() {
    const { posts, loading } = usePosts();
    const { data: session } = useSession();
    const { user } = useUser(); // Get user preferences
    const [currentIndex, setCurrentIndex] = useState(0);
    const [replyTo, setReplyTo] = useState(null);

    // Filter posts based on language
    const filteredPosts = posts.filter(post => {
        if (!session || !user || !user.languages) return true; // Show all to guests or incomplete profiles

        // If posts don't have language, we assume they are global/default
        if (!post.language) return true;

        // user.languages is { english: true, german: false }
        // If user hasn't selected any languages yet (e.g. during onboarding), show all?
        // Or if the language key matches
        return user.languages[post.language];
    });

    const currentPost = filteredPosts[currentIndex];
    const isGuest = !session;

    // Reset reply state if post changes
    // (Note: Hooks run on every render. If currentIndex changes, we might want to useEffect to reset logic, 
    // or just reset it when we change index handlers)
    // useEffect is cleaner for "reaction to change".
    // But handlers are fine too.

    const handleNext = () => {
        if (currentIndex < filteredPosts.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setReplyTo(null);
        } else {
            // Loop back or stop? "Users can tap or swipe... to look at a new post"
            // Let's loop for endless feel or just stop. 
            // Stop is better UX usually, but loop is "avant garde". Let's stop for now.
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setReplyTo(null);
        }
    };

    // Touch & Mouse Handling
    const touchStart = useRef({ x: 0, y: 0 });
    const touchEnd = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);

    const minSwipeDistance = 50;

    const handleInputStart = (clientX, clientY) => {
        isDragging.current = true;
        touchEnd.current.x = 0; // Reset
        touchStart.current.x = clientX;
        touchStart.current.y = clientY;
    };

    const handleInputMove = (clientX, clientY) => {
        if (!isDragging.current) return;
        touchEnd.current.x = clientX;
        touchEnd.current.y = clientY;
    };

    const handleInputEnd = () => {
        isDragging.current = false;
        // Check if move occurred
        if (!touchEnd.current.x) {
            // Tap
            const width = window.innerWidth;
            const x = touchStart.current.x;
            if (x < width * 0.5) handlePrev();
            else handleNext();
            return;
        }

        const distanceX = touchStart.current.x - touchEnd.current.x;
        const distanceY = touchStart.current.y - touchEnd.current.y;
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontalSwipe) {
            if (Math.abs(distanceX) > minSwipeDistance) {
                if (distanceX > 0) {
                    // Swiped Left -> Next
                    handleNext();
                } else {
                    // Swiped Right -> Prev
                    handlePrev();
                }
            } else {
                // Tap fallback (small horizontal move)
                // ...
            }
        } else {
            // Vertical Swipe
            if (Math.abs(distanceY) > minSwipeDistance) {
                if (distanceY > 0) {
                    // Swiped UP (Finger moved up) -> Show Navbar
                    window.dispatchEvent(new CustomEvent('toggle-nav', { detail: { visible: true } }));
                } else {
                    // Swiped DOWN (Finger moved down) -> Show Comment Textbox (Reply)
                    // Also hide navbar for immersion?
                    window.dispatchEvent(new CustomEvent('toggle-nav', { detail: { visible: false } }));
                    setReplyTo(currentPost);
                }
            }
        }
    };

    const onTouchStart = (e) => handleInputStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    const onTouchMove = (e) => handleInputMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    const onTouchEnd = (e) => handleInputEnd();

    const onMouseDown = (e) => handleInputStart(e.clientX, e.clientY);
    const onMouseMove = (e) => handleInputMove(e.clientX, e.clientY);
    const onMouseUp = (e) => handleInputEnd();
    const onMouseLeave = (e) => {
        if (isDragging.current) {
            handleInputEnd();
        }
    };

    if (loading) return <div style={{ padding: 20, color: 'white' }}>LOADING...</div>;

    if (!currentPost) return (
        <div style={{ padding: 40, textAlign: 'center', color: '#666', marginTop: '20vh' }}>
            <h2>No threads yet.</h2>
            <p>Be the first to create one!</p>
        </div>
    );

    return (
        <div
            style={{
                height: "100%", // Fit container
                width: "100%",
                position: "relative",
                overflow: "hidden",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "pan-y" // Allow vertical scroll, disable browser horizontal swipe nav if possible
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
        >
            {/* Progress Bar (optional but good for deck view) */}
            <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${((currentIndex + 1) / filteredPosts.length) * 100}%`,
                height: 4, background: 'var(--accent)', transition: 'width 0.3s'
            }} />

            {/* Top Navigation Overlay Removed per request (hierarchy shift) */}


            <PostCard
                key={currentPost.id}
                {...currentPost}
                onReply={setReplyTo}
                activeReplyId={replyTo?.id}
                isGuest={isGuest}
            />

            {!isGuest && (
                <CommentDock
                    key={`dock-${currentPost.id}`}
                    postId={currentPost.id}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                />
            )}
        </div>
    );
}
