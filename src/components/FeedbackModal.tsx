import React, { useState } from 'react';
import { Feedback, MenuItem } from '../types';
import { Star, X, Upload, MessageSquarePlus, CheckCircle2, MessageSquare, Trash2, Camera, Loader2, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbacks: Feedback[];
  onAddFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => Promise<void> | void;
  onDeleteFeedback?: (id: string) => Promise<void> | void;
  menuItems: MenuItem[];
  isOwner?: boolean;
}

/**
 * Compress image using HTML5 Canvas to fit safely inside Firestore 1MB document limit
 */
function compressImage(file: File, maxWidth = 600, maxHeight = 600, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  feedbacks,
  onAddFeedback,
  onDeleteFeedback,
  menuItems,
  isOwner = false,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'view'>('write');
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [selectedDish, setSelectedDish] = useState<string>('');
  
  // Submission & Validation States
  const [ratingError, setRatingError] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Photo File Upload with Canvas Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 10MB.');
        return;
      }
      setIsCompressingPhoto(true);
      try {
        const compressed = await compressImage(file);
        setPhotoUrl(compressed);
      } catch (err) {
        console.error('Image processing error:', err);
        alert('Failed to process photo. Please try a different image.');
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    let hasError = false;

    if (rating < 1 || rating > 5) {
      setRatingError(true);
      hasError = true;
    } else {
      setRatingError(false);
    }

    if (!comment.trim() || comment.trim().length < 2) {
      setCommentError(true);
      hasError = true;
    } else {
      setCommentError(false);
    }

    if (hasError) return;

    setIsSubmitting(true);
    setSubmitErrorMessage(null);

    try {
      await onAddFeedback({
        customerName: customerName.trim() || 'Valued Customer',
        rating,
        comment: comment.trim(),
        photoUrl: photoUrl || undefined,
        dishName: selectedDish || undefined,
      });

      setIsSubmitted(true);
      
      // Reset form
      setRating(0);
      setComment('');
      setCustomerName('');
      setPhotoUrl(undefined);
      setSelectedDish('');

      setTimeout(() => {
        setIsSubmitted(false);
        setActiveTab('view');
      }, 2000);
    } catch (err: any) {
      console.error('[FeedbackModal] Error submitting feedback:', err);
      const msg = err instanceof Error ? err.message : 'Unable to save feedback to database. Please check your internet connection and try again.';
      setSubmitErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate Average Rating
  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : '5.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF6F0] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#D9CEBF] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#2D241E] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#3D3128]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C05621] flex items-center justify-center text-white shadow-sm">
              <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-amber-50">
                Customer Feedback & Reviews
              </h2>
              <p className="text-xs text-amber-200/80">
                Share your dining experience with Currylicious
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-amber-200/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Header Tabs */}
        <div className="flex border-b border-[#E8E0D5] bg-[#EFE8DE] px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('write')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'write'
                ? 'bg-[#FAF6F0] text-[#C05621] border-t-2 border-[#C05621] shadow-xs'
                : 'text-[#6E5E53] hover:text-[#2D241E]'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Give Feedback</span>
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'view'
                ? 'bg-[#FAF6F0] text-[#C05621] border-t-2 border-[#C05621] shadow-xs'
                : 'text-[#6E5E53] hover:text-[#2D241E]'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>All Reviews ({feedbacks.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 no-scrollbar space-y-5">
          {activeTab === 'write' ? (
            /* WRITE FEEDBACK FORM */
            isSubmitted ? (
              <div className="py-12 text-center space-y-3 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#2D241E]">
                  Thank You! Feedback Saved.
                </h3>
                <p className="text-sm text-[#6E5E53] max-w-md mx-auto">
                  Your feedback has been permanently stored and is now visible to all customers across devices.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Submission Error Banner */}
                {submitErrorMessage && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Error Saving Feedback</p>
                      <p className="text-xs text-rose-700 mt-0.5">{submitErrorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Mandatory Star Rating */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs space-y-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-[#2D241E]">
                    Overall Rating <span className="text-rose-600">*</span>
                  </label>
                  <p className="text-xs text-[#6E5E53]">
                    Tap a star to rate your food from 1 to 5 stars (Mandatory)
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={isSubmitting}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => {
                            setRating(star);
                            setRatingError(false);
                          }}
                          className="p-1 transition-transform active:scale-125 focus:outline-none disabled:opacity-50"
                        >
                          <Star
                            className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                              active
                                ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-sm font-extrabold text-[#C05621]">
                      {rating > 0 ? `${rating} / 5 Stars` : ''}
                    </span>
                  </div>
                  {ratingError && (
                    <p className="text-xs text-rose-600 font-semibold animate-shake">
                      Please select a star rating between 1 and 5 stars.
                    </p>
                  )}
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-[#2D241E] mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitting}
                    value={customerName}
                    maxLength={100}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Maria Clara"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D9CEBF] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#C05621] disabled:bg-gray-100"
                  />
                </div>

                {/* Optional Tag Dish */}
                <div>
                  <label className="block text-xs font-bold text-[#2D241E] mb-1">
                    Select Dish Reviewed (Optional)
                  </label>
                  <select
                    disabled={isSubmitting}
                    value={selectedDish}
                    onChange={(e) => setSelectedDish(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D9CEBF] rounded-xl text-sm text-[#2D241E] focus:outline-none focus:border-[#C05621] disabled:bg-gray-100"
                  >
                    <option value="">-- General Restaurant Experience --</option>
                    {menuItems.map((dish) => (
                      <option key={dish.id} value={dish.name}>
                        {dish.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mandatory Feedback Comment */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs sm:text-sm font-extrabold text-[#2D241E]">
                      Your Feedback <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[11px] text-[#6E5E53]">
                      Line or paragraph review
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    disabled={isSubmitting}
                    maxLength={3000}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (e.target.value.trim()) setCommentError(false);
                    }}
                    placeholder="Tell us what you loved about your meal, spice levels, portion size, or delivery experience..."
                    className={`w-full p-3 bg-white border rounded-2xl text-sm text-[#2D241E] focus:outline-none focus:border-[#C05621] disabled:bg-gray-100 ${
                      commentError ? 'border-rose-500 bg-rose-50/30' : 'border-[#D9CEBF]'
                    }`}
                  />
                  {commentError && (
                    <p className="text-xs text-rose-600 font-semibold mt-1">
                      Feedback comment is mandatory. Please write a short line or review.
                    </p>
                  )}
                </div>

                {/* Optional Food Photo Upload */}
                <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] space-y-2">
                  <label className="block text-xs font-extrabold text-[#2D241E] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#C05621]" />
                    <span>Upload Food Photo (Optional)</span>
                  </label>
                  <p className="text-xs text-[#6E5E53]">
                    Show off the delicious dish you received!
                  </p>

                  {isCompressingPhoto ? (
                    <div className="flex items-center gap-2 p-3 text-xs text-[#C05621] font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Optimizing photo size...</span>
                    </div>
                  ) : photoUrl ? (
                    <div className="relative inline-block mt-2">
                      <img
                        src={photoUrl}
                        alt="Food preview"
                        className="w-28 h-28 object-cover rounded-xl border border-[#D9CEBF] shadow-sm"
                      />
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#D9CEBF] hover:border-[#C05621] rounded-xl cursor-pointer bg-[#FAF6F0] transition group">
                      <Upload className="w-5 h-5 text-[#C05621] group-hover:scale-110 transition" />
                      <span className="text-xs font-bold text-[#6E5E53] group-hover:text-[#C05621]">
                        Click to upload food photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isSubmitting}
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressingPhoto}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#C05621] hover:bg-[#A84719] text-white font-extrabold text-sm sm:text-base shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving Feedback to Database...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquarePlus className="w-5 h-5" />
                      <span>Submit Customer Feedback</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : (
            /* REVIEWS LIST VIEW */
            <div className="space-y-4">
              {/* Rating Overview Card */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-extrabold text-[#2D241E]">
                      {averageRating}
                    </span>
                    <span className="text-xs font-bold text-[#6E5E53]">out of 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(Number(averageRating))
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#C05621]">
                    {feedbacks.length} Total {feedbacks.length === 1 ? 'Review' : 'Reviews'}
                  </span>
                  <p className="text-xs text-[#6E5E53]">100% Authentic Customer Voice</p>
                </div>
              </div>

              {/* Feedbacks list */}
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 text-[#6E5E53] space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-[#D9CEBF]" />
                  <p className="font-bold text-sm">No feedback submitted yet.</p>
                  <p className="text-xs">Be the first customer to leave a review!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs space-y-2.5 relative hover:border-[#D9CEBF] transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-[#2D241E]">
                            {fb.customerName}
                          </h4>
                          {fb.dishName && (
                            <span className="inline-block mt-0.5 bg-[#FAF6F0] text-[#C05621] text-[11px] font-bold px-2 py-0.5 rounded-md border border-[#E8E0D5]">
                              {fb.dishName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-extrabold text-amber-800">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{fb.rating}.0</span>
                          </div>
                          {isOwner && onDeleteFeedback && (
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this feedback?')) {
                                  await onDeleteFeedback(fb.id);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-rose-600 transition"
                              title="Delete Feedback (Owner Only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-[#4A3E35] leading-relaxed whitespace-pre-line">
                        "{fb.comment}"
                      </p>

                      {/* Photo if attached */}
                      {fb.photoUrl && (
                        <div className="pt-1">
                          <img
                            src={fb.photoUrl}
                            alt="Customer food photo"
                            onClick={() => setSelectedImagePreview(fb.photoUrl || null)}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-[#D9CEBF] cursor-pointer hover:opacity-90 transition shadow-xs"
                          />
                        </div>
                      )}

                      <div className="text-[10px] text-gray-500 font-mono text-right">
                        {new Date(fb.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Image View Modal */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <img
              src={selectedImagePreview}
              alt="Food enlarged view"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setSelectedImagePreview(null)}
              className="absolute -top-3 -right-3 bg-white text-black p-2 rounded-full shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

