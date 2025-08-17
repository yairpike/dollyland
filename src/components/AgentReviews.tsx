import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, ThumbsUp, User, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Review {
  id: string;
  agent_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

interface AgentReviewsProps {
  agentId: string;
  agentName: string;
  onRatingUpdate?: (newRating: number) => void;
}

export const AgentReviews: React.FC<AgentReviewsProps> = ({ 
  agentId, 
  agentName, 
  onRatingUpdate 
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [agentId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_reviews')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      
      // Find user's review if logged in
      if (user) {
        const userReviewData = data?.find(review => review.user_id === user.id);
        setUserReview(userReviewData || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        agent_id: agentId,
        user_id: user.id,
        rating: newRating,
        review_text: newReviewText.trim() || null,
      };

      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('agent_reviews')
          .update(reviewData)
          .eq('id', userReview.id);

        if (error) throw error;
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        const { error } = await supabase
          .from('agent_reviews')
          .insert(reviewData);

        if (error) throw error;
        toast.success('Review submitted successfully!');
      }

      // Track analytics
      await supabase.from('detailed_analytics').insert({
        agent_id: agentId,
        user_id: user.id,
        event_type: 'review_submitted',
        satisfaction_score: newRating,
        metadata: { review_text_length: newReviewText.length },
      });

      setIsWritingReview(false);
      setNewReviewText('');
      await fetchReviews();

      // Update agent rating
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) + newRating) / (reviews.length + 1)
        : newRating;
      onRatingUpdate?.(avgRating);

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      const { error } = await supabase
        .from('agent_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Review deleted successfully');
      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Summary */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Section */}
          {user && (
            <div className="border-t pt-6">
              {!userReview && !isWritingReview ? (
                <Button onClick={() => setIsWritingReview(true)}>
                  Write a Review
                </Button>
              ) : isWritingReview ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Rating
                    </label>
                    {renderStars(newRating, true, setNewRating)}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Review (Optional)
                    </label>
                    <Textarea
                      placeholder={`Share your experience with ${agentName}...`}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={submitReview} disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsWritingReview(false);
                        setNewReviewText('');
                        setNewRating(5);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : userReview ? (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Your Review</span>
                      {renderStars(userReview.rating)}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setIsWritingReview(true);
                          setNewRating(userReview.rating);
                          setNewReviewText(userReview.review_text || '');
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteReview(userReview.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {userReview.review_text && (
                    <p className="text-sm text-muted-foreground">
                      {userReview.review_text}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <Badge variant="outline" className="text-xs">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Badge>
                      {review.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {review.review_text && (
                      <p className="text-sm">{review.review_text}</p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful ({review.helpful_count})
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};