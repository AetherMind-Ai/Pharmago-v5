import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Re-added storage imports
import { db, storage } from '../firebaseConfig'; // Re-added storage import
import { UserData, Product, Feedback, ProfileView, Reply } from '../types'; // Added Reply to imports
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
    FaMapMarkerAlt, FaPhone, FaGlobe, FaBox, FaBuilding, FaSpinner, FaArrowLeft,
    FaStar, FaClock, FaDollarSign, FaImage, FaInfoCircle, FaCheckCircle, FaChartLine,
    FaEye, FaPaperPlane, FaSmile, FaThumbsUp, FaHeart, FaLaugh, FaAngry, FaSadTear, FaCamera
} from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

export const PharmacyProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, userData } = useAuth();
    const [pharmacyData, setPharmacyData] = useState<UserData | null>(null);
    const [productCount, setProductCount] = useState<number>(0);
    const [profileViews, setProfileViews] = useState<number>(0);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackImages, setFeedbackImages] = useState<string[]>([]); // Changed type to string[]
    const feedbackFileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [newCoverPhotoFile, setNewCoverPhotoFile] = useState<File | null>(null);
    const coverPhotoInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingCoverPhoto, setIsUploadingCoverPhoto] = useState(false);

    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
    const [isSubmittingReply, setIsSubmittingReply] = useState<{ [key: string]: boolean }>({});
    const [showReplyInput, setShowReplyInput] = useState<{ [key: string]: boolean }>({});
    const [showReactions, setShowReactions] = useState<{ [key: string]: boolean }>({});
    const [showReplyReactions, setShowReplyReactions] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchPharmacyDataAndLogView = async () => {
            if (!id) {
                setError("Pharmacy ID is missing.");
                setLoading(false);
                return;
            }

            console.log("Attempting to fetch pharmacy data for ID:", id); // Added log

            try {
                const userDocRef = doc(db, 'users', id);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const data = userDocSnap.data() as UserData;
                    if (data.role === 'pharmacy' && data.pharmacyInfo) {
                        setPharmacyData(data);

                        const productsRef = collection(db, 'products');
                        const q = query(productsRef, where('pharmacyName', '==', data.pharmacyInfo.name));
                        const querySnapshot = await getDocs(q);
                        setProductCount(querySnapshot.size);

                        let currentSessionId = localStorage.getItem('medgo_session_id');
                        if (!currentSessionId) {
                            currentSessionId = uuidv4();
                            localStorage.setItem('medgo_session_id', currentSessionId);
                        }

                        const profileViewsRef = collection(db, 'profileViews');
                        if (user?.uid) {
                            const existingViewQuery = query(profileViewsRef,
                                where('pharmacyId', '==', id),
                                where('userId', '==', user.uid)
                            );
                            const existingViewSnapshot = await getDocs(existingViewQuery);

                            if (existingViewSnapshot.empty) {
                                await addDoc(profileViewsRef, {
                                    pharmacyId: id,
                                    timestamp: serverTimestamp(),
                                    userId: user.uid,
                                    sessionId: null,
                                });
                            }
                        } else {
                            const existingAnonymousViewQuery = query(profileViewsRef,
                                where('pharmacyId', '==', id),
                                where('sessionId', '==', currentSessionId)
                            );
                            const existingAnonymousViewSnapshot = await getDocs(existingAnonymousViewQuery);

                            if (existingAnonymousViewSnapshot.empty) {
                                await addDoc(profileViewsRef, {
                                    pharmacyId: id,
                                    timestamp: serverTimestamp(),
                                    userId: null,
                                    sessionId: currentSessionId,
                                });
                            }
                        }

                        const viewsQuery = query(profileViewsRef, where('pharmacyId', '==', id));
                        const viewsSnapshot = await getDocs(viewsQuery);
                        
                        const uniqueViewerIdentifiers = new Set<string>();
                        viewsSnapshot.docs.forEach(doc => {
                            const data = doc.data();
                            if (data.userId) {
                                uniqueViewerIdentifiers.add(`user-${data.userId}`);
                            } else if (data.sessionId) {
                                uniqueViewerIdentifiers.add(`session-${data.sessionId}`);
                            }
                        });
                        setProfileViews(uniqueViewerIdentifiers.size);

                        const feedbacksRef = collection(db, 'feedbacks');
                        const feedbackQuery = query(feedbacksRef, where('pharmacyId', '==', id));
                        const feedbackSnapshot = await getDocs(feedbackQuery);
                        const fetchedFeedbacks: Feedback[] = await Promise.all(feedbackSnapshot.docs.map(async docSnap => {
                            const feedbackData = docSnap.data();
                            console.log("Fetched feedback:", docSnap.id, "Pharmacy ID in feedback:", feedbackData.pharmacyId); // Added log
                            const repliesCollectionRef = collection(db, 'feedbacks', docSnap.id, 'replies');
                            const repliesSnapshot = await getDocs(repliesCollectionRef);
                            const replies = repliesSnapshot.docs.map(replyDoc => {
                                const replyData = replyDoc.data();
                                return {
                                    id: replyDoc.id,
                                    ...replyData as Omit<Reply, 'id' | 'timestamp'>,
                                    timestamp: (replyData.timestamp?.toDate() || new Date()) as Date,
                                };
                            }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort replies by oldest first

                            return {
                                id: docSnap.id,
                                ...feedbackData as Omit<Feedback, 'id' | 'timestamp'>,
                                timestamp: (feedbackData.timestamp?.toDate() || new Date()) as Date,
                                replies: replies,
                            };
                        }));
                        setFeedbacks(fetchedFeedbacks.sort((a, b) => (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime())); // Sort feedbacks by newest first

                    } else {
                        setError("User is not a pharmacy or pharmacy info is missing.");
                    }
                } else {
                    setError("Pharmacy not found.");
                }
            } catch (err) {
                console.error("Error fetching pharmacy data or logging view:", err);
                setError("Failed to load pharmacy profile or log view.");
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacyDataAndLogView();
    }, [id, user]);

    const handleFeedbackImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFeedbackImages([reader.result as string]); // Store Base64 string
            };
            reader.readAsDataURL(file); // Read file as Data URL (Base64)
        }
    };

    const removeFeedbackImage = () => {
        setFeedbackImages([]);
    };

    const handleCoverPhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setNewCoverPhotoFile(event.target.files[0]);
            handleUploadCoverPhoto(event.target.files[0]);
        }
    };

    const handleUploadCoverPhoto = async (file: File) => {
        if (!id || !file) return;

        setIsUploadingCoverPhoto(true);
        try {
            const imageRef = ref(storage, `pharmacy_cover_photos/${id}/${uuidv4()}-${file.name}`);
            await uploadBytes(imageRef, file);
            const downloadURL = await getDownloadURL(imageRef);

            const pharmacyDocRef = doc(db, 'users', id);
            await updateDoc(pharmacyDocRef, {
                'pharmacyInfo.coverPhoto': downloadURL,
            });

            setPharmacyData(prev => prev ? { ...prev, pharmacyInfo: { ...prev.pharmacyInfo!, coverPhoto: downloadURL } } : null);
            toast.success("Cover photo updated successfully!");
        } catch (err) {
            console.error("Error uploading cover photo:", err);
            toast.error("Failed to update cover photo.");
        } finally {
            setIsUploadingCoverPhoto(false);
            setNewCoverPhotoFile(null);
        }
    };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !feedbackText.trim() || feedbackRating === 0) {
            toast.error("Please provide text and a rating for your feedback.");
            return;
        }

        setIsSubmittingFeedback(true);
        try {
            const imageUrls: string[] = [];
            if (feedbackImages.length > 0) {
                // feedbackImages now contains Base64 strings directly
                imageUrls.push(feedbackImages[0]); // Just push the Base64 string
            }

            const newFeedback: Omit<Feedback, 'id'> = {
                pharmacyId: id,
                userId: user?.uid || null,
                userName: user?.displayName || userData?.fullName || "Anonymous",
                userPhotoUrl: user?.photoURL || userData?.photoDataUrl || undefined,
                text: feedbackText.trim(),
                rating: feedbackRating,
                timestamp: serverTimestamp() as any,
                images: imageUrls,
                reactions: {},
            };

            const docRef = await addDoc(collection(db, 'feedbacks'), newFeedback);
            toast.success("Feedback submitted successfully!");

            setFeedbacks(prev => [{ ...newFeedback, id: docRef.id, timestamp: new Date() }, ...prev]);

            setFeedbackText('');
            setFeedbackRating(0);
            setFeedbackImages([]);
        } catch (err) {
            console.error("Error submitting feedback:", err);
            toast.error("Failed to submit feedback.");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const handleReaction = async (targetId: string, emoji: string, type: 'feedback' | 'reply', replyId?: string) => {
        if (!user) {
            toast.error("Please log in to react.");
            return;
        }

        try {
            let docRef;
            let currentReactions: { [key: string]: string[] } = {}; // Map emoji to array of user UIDs

            if (type === 'feedback') {
                docRef = doc(db, 'feedbacks', targetId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    currentReactions = docSnap.data().reactions || {};
                }
            } else { // type === 'reply'
                if (!replyId) return;
                docRef = doc(db, 'feedbacks', targetId, 'replies', replyId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    currentReactions = docSnap.data().reactions || {};
                }
            }

            // Remove user's previous reaction if any
            let updatedReactions = { ...currentReactions };
            for (const key in updatedReactions) {
                updatedReactions[key] = updatedReactions[key].filter(uid => uid !== user.uid);
                if (updatedReactions[key].length === 0) {
                    delete updatedReactions[key];
                }
            }

            // Add new reaction if not already reacted with this emoji
            // For replies, only allow '👍'
            if (type === 'reply' && emoji !== '👍') {
                toast.error("You can only react with Thumbs Up on replies.");
                return;
            }

            // If the user clicked the same emoji again, it means they want to remove it
            if (!currentReactions[emoji]?.includes(user.uid)) {
                updatedReactions[emoji] = [...(updatedReactions[emoji] || []), user.uid];
            }

            await updateDoc(docRef, { reactions: updatedReactions });

            // Update local state
            setFeedbacks(prevFeedbacks => prevFeedbacks.map(fb => {
                if (fb.id === targetId) {
                    if (type === 'feedback') {
                        return { ...fb, reactions: updatedReactions };
                    } else if (type === 'reply' && fb.replies) {
                        return {
                            ...fb,
                            replies: fb.replies.map(rep =>
                                rep.id === replyId ? { ...rep, reactions: updatedReactions } : rep
                            )
                        };
                    }
                }
                return fb;
            }));

            toast.success("Reaction updated!");
        } catch (err) {
            console.error("Error updating reaction:", err);
            toast.error("Failed to add reaction.");
        }
    };

    const handleReplySubmit = async (feedbackId: string) => {
        if (!id || !replyText[feedbackId]?.trim()) {
            toast.error("Please provide text for your reply.");
            return;
        }
        if (!user) {
            toast.error("Please log in to reply.");
            return;
        }

        setIsSubmittingReply(prev => ({ ...prev, [feedbackId]: true }));
        try {
            const newReply: Omit<Reply, 'id'> = {
                userId: user.uid,
                userName: user.displayName || userData?.fullName || "Anonymous",
                userPhotoUrl: user.photoURL || userData?.photoDataUrl || undefined,
                text: replyText[feedbackId].trim(),
                timestamp: serverTimestamp() as any,
                reactions: {}, // Only thumbs up reaction for replies
            };

            const repliesCollectionRef = collection(db, 'feedbacks', feedbackId, 'replies');
            const docRef = await addDoc(repliesCollectionRef, newReply);

            toast.success("Reply submitted successfully!");

            setFeedbacks(prev => prev.map(fb =>
                fb.id === feedbackId
                    ? {
                        ...fb,
                        replies: [...(fb.replies || []), { ...newReply, id: docRef.id, timestamp: new Date() }]
                    }
                    : fb
            ));

            setReplyText(prev => ({ ...prev, [feedbackId]: '' }));
            setShowReplyInput(prev => ({ ...prev, [feedbackId]: false }));
        } catch (err) {
            console.error("Error submitting reply:", err);
            toast.error("Failed to submit reply.");
        } finally {
            setIsSubmittingReply(prev => ({ ...prev, [feedbackId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-red-600">
                <p className="text-lg">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                >
                    <FaArrowLeft className="mr-2" /> Go Back
                </button>
            </div>
        );
    }

    if (!pharmacyData || !pharmacyData.pharmacyInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700">
                <p className="text-lg">No pharmacy data available.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                >
                    <FaArrowLeft className="mr-2" /> Go Back
                </button>
            </div>
        );
    }

    const { pharmacyInfo, phoneNumber, role, aboutMe } = pharmacyData;

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Cover Photo and Profile Picture Section */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="relative h-64 md:h-96 rounded-b-lg overflow-hidden">
                        <img
                            src={pharmacyInfo.coverPhoto || 'https://i.ibb.co/1GsrsySF/cover.png'}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                        {user?.uid === id && (
                            <div className="absolute bottom-4 right-4">
                                <input
                                    type="file"
                                    ref={coverPhotoInputRef}
                                    onChange={handleCoverPhotoSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => coverPhotoInputRef.current?.click()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                                    disabled={isUploadingCoverPhoto}
                                >
                                    {isUploadingCoverPhoto ? <FaSpinner className="animate-spin mr-2" /> : <FaCamera className="mr-2" />}
                                    Edit Cover Photo
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-24 md:-mt-16 px-4">
                        <img
                            src={pharmacyInfo.logoImage || 'https://via.placeholder.com/180?text=Logo'}
                            alt={`${pharmacyInfo.name} Logo`}
                            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{pharmacyInfo.name}</h1>
                            <p className="text-gray-600">{`Your Trusted Partner in Health`}</p>
                        </div>
                        <div className="flex-grow flex justify-center md:justify-end mt-4 md:mt-0 space-x-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center"
                            >
                                <FaArrowLeft className="mr-2" /> Back
                            </button>
                            {pharmacyInfo.vodafoneCash && (
                                <a
                                    href={`https://wa.me/${pharmacyInfo.vodafoneCash}?text=Hello%20${encodeURIComponent(pharmacyInfo.name)}%2C%20I%20would%20like%20to%20message%20you%20about...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center"
                                >
                                    <FaPhone className="mr-2" /> WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 border-t border-gray-200">
                        <div className="flex justify-start space-x-8 px-4 py-2">
                            <span className="font-semibold text-gray-600 hover:text-blue-600 cursor-pointer">Posts</span>
                            <span className="font-semibold text-gray-600 hover:text-blue-600 cursor-pointer">About</span>
                            <span className="font-semibold text-gray-600 hover:text-blue-600 cursor-pointer">Photos</span>
                            <span className="font-semibold text-gray-600 hover:text-blue-600 cursor-pointer">Reviews</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <div className="md:col-span-5 space-y-6">
                    {/* Intro / About Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Intro</h2>
                        <p className="text-gray-700 text-left mb-4">{aboutMe || `Welcome to ${pharmacyInfo.name}! We are dedicated to providing high-quality pharmaceutical products and excellent service.`}</p>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center"><FaBuilding className="mr-3 text-gray-500" />{role}</li>
                            <li className="flex items-center"><FaMapMarkerAlt className="mr-3 text-gray-500" />{pharmacyInfo.address || 'Address not provided'}</li>
                            <li className="flex items-center"><FaPhone className="mr-3 text-gray-500" />{phoneNumber || 'N/A'}</li>
                            {pharmacyInfo.mapLink && (
                                <li className="flex items-center">
                                    <FaGlobe className="mr-3 text-gray-500" />
                                    <a href={pharmacyInfo.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        View on Map
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                    
                    {/* Photo Gallery Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Photos</h2>
                            <a href="#" className="text-blue-600 hover:underline">See all photos</a>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {pharmacyInfo.pharmacyImages && pharmacyInfo.pharmacyImages.slice(0, 4).map((img, index) => (
                                img ? (
                                    <div key={index} className="relative w-full h-52 bg-gray-200 rounded-lg overflow-hidden shadow-sm group">
                                        <img src={img} alt={`Pharmacy Image ${index + 1}`} className="w-full h-full object-cover"/>
                                    </div>
                                ) : null
                            ))}
                        </div>
                         {(!pharmacyInfo.pharmacyImages || pharmacyInfo.pharmacyImages.length === 0) && (
                            <p className="text-gray-500 text-center py-4">No images available.</p>
                        )}
                    </div>
                </div>

                {/* Main Content (Posts/Feedback) */}
                <div className="md:col-span-7 space-y-6">
                     {/* Quick Stats Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaChartLine className="mr-3 text-blue-600" /> Quick Stats
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                <FaStar className="mr-3 text-yellow-500 text-xl" />
                                <div>
                                    <span className="font-semibold">Avg. Rating:</span> {feedbacks.length > 0 ? (feedbacks.reduce((acc, fb) => acc + fb.rating, 0) / feedbacks.length).toFixed(1) : 'N/A'}
                                    <span className="text-sm text-gray-500 ml-1">({feedbacks.length} reviews)</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                <FaBox className="mr-3 text-blue-500 text-xl" />
                                <div>
                                    <span className="font-semibold">Products:</span> {productCount}
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                <FaEye className="mr-3 text-purple-500 text-xl" />
                                <div>
                                    <span className="font-semibold">Profile Views:</span> {profileViews}
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                <FaClock className="mr-3 text-green-500 text-xl" />
                                <div>
                                    <span className="font-semibold">Avg. Delivery:</span> 60 mins
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Feedback Submission Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Leave a Feedback</h3>
                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder={`Share your experience at ${pharmacyInfo.name}...`}
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                required
                            ></textarea>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                <div className="flex items-center mb-3 sm:mb-0">
                                    <span className="font-semibold text-gray-700 mr-3">Your Rating:</span>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={`cursor-pointer text-2xl ${feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                            onClick={() => setFeedbackRating(star)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="file"
                                    ref={feedbackFileInputRef}
                                    onChange={handleFeedbackImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => feedbackFileInputRef.current?.click()}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center"
                                >
                                    <FaCamera className="mr-2" /> Add Photo
                                </button>
                                {feedbackImages.length > 0 && (
                                    <div className="relative ml-4 w-52 h-52">
                                        <img src={feedbackImages[0]} alt="preview" className="w-full h-full object-cover rounded-md" />
                                        <button
                                            type="button"
                                            onClick={removeFeedbackImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
                                disabled={isSubmittingFeedback}
                            >
                                {isSubmittingFeedback ? (
                                    <FaSpinner className="animate-spin mr-2" />
                                ) : (
                                    <FaPaperPlane className="mr-2" />
                                )}
                                Submit Review
                            </button>
                        </form>
                    </div>

                    {/* Display Feedbacks/Posts */}
                    <div className="bg-white rounded-lg shadow-md">
                         <h2 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-200">Reviews</h2>
                        <div className="divide-y divide-gray-200">
                            {feedbacks.length > 0 ? (
                                feedbacks.map((feedback) => (
                                    <div key={feedback.id} className="p-6">
                                        <div className="flex items-start">
                                            <img
                                                src={feedback.userPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.userName)}&background=random&color=fff&size=40`}
                                                alt={feedback.userName}
                                                className="w-10 h-10 rounded-full object-cover mr-4"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{feedback.userName}</p>
                                                        <span className="text-sm text-gray-500">{(feedback.timestamp as Date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center text-yellow-400">
                                                         {[1, 2, 3, 4, 5].map((star) => (
                                                            <FaStar key={star} className={feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}/>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{feedback.text}</p>
                                                {feedback.images && feedback.images.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {feedback.images.map((img, imgIndex) => (
                                                            <img key={imgIndex} src={img} alt={`Feedback ${imgIndex + 1}`} className="w-52 h-52 object-cover rounded-md border" />
                                                        ))}
                                                    </div>
                                                )}
                                                <div
                                                    className="relative mt-4 flex items-center space-x-4 text-gray-600"
                                                    onMouseEnter={() => setShowReactions(prev => ({ ...prev, [feedback.id]: true }))}
                                                    onMouseLeave={() => setShowReactions(prev => ({ ...prev, [feedback.id]: false }))}
                                                >
                                                    {/* Reaction and Reply buttons */}
                                                    <div className="flex items-center space-x-1 text-gray-600">
                                                        <FaSmile />
                                                        <span>React</span>
                                                    </div>
                                                    <button
                                                        className="flex items-center space-x-1 hover:text-blue-600 transition"
                                                        onClick={() => setShowReplyInput(prev => ({ ...prev, [feedback.id]: !prev[feedback.id] }))}
                                                    >
                                                        <FaPaperPlane />
                                                        <span>Reply</span>
                                                    </button>

                                                    {/* Reaction Picker (Facebook-like) */}
                                                    {showReactions[feedback.id] && (
                                                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-full shadow-lg flex space-x-2 animate-fade-in-up z-10">
                                                            {['👍', '❤️', '😂', '😢', '😡'].map(emoji => (
                                                                <button
                                                                    key={emoji}
                                                                    className={`text-2xl p-1 rounded-full hover:bg-gray-100 transition ${feedback.reactions && feedback.reactions[emoji]?.includes(user?.uid || '') ? 'ring-2 ring-blue-500' : ''}`}
                                                                    onClick={() => handleReaction(feedback.id, emoji, 'feedback')}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Display Reactions */}
                                                {Object.keys(feedback.reactions || {}).length > 0 && (
                                                    <div className="mt-2 flex items-center space-x-2 text-gray-600">
                                                        {Object.entries(feedback.reactions || {}).map(([emoji, uids]) => uids.length > 0 && (
                                                            <span key={emoji} className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-sm">
                                                                {emoji} {uids.length}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Reply Input */}
                                                {showReplyInput[feedback.id] && (
                                                    <div className="mt-4 flex items-center space-x-2">
                                                        <textarea
                                                            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            rows={1}
                                                            placeholder="Write a reply..."
                                                            value={replyText[feedback.id] || ''}
                                                            onChange={(e) => setReplyText(prev => ({ ...prev, [feedback.id]: e.target.value }))}
                                                        ></textarea>
                                                        <button
                                                            onClick={() => handleReplySubmit(feedback.id)}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                                                            disabled={isSubmittingReply[feedback.id]}
                                                        >
                                                            {isSubmittingReply[feedback.id] ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Display Replies */}
                                                {feedback.replies && feedback.replies.length > 0 && (
                                                    <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                                                        {feedback.replies.map((reply) => (
                                                            <div key={reply.id} className="flex items-start">
                                                                <img
                                                                    src={reply.userPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userName)}&background=random&color=fff&size=32`}
                                                                    alt={reply.userName}
                                                                    className="w-8 h-8 rounded-full object-cover mr-3"
                                                                />
                                                                <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-semibold text-gray-800 text-sm">{reply.userName}</p>
                                                                        <span className="text-xs text-gray-500">{(reply.timestamp as Date).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{reply.text}</p>
                                                                    <div className="mt-2 flex items-center space-x-2 text-gray-600">
                                                                        {/* Reply Reaction (Thumbs Up Only) */}
                                                                        <button
                                                                            className="flex items-center space-x-1 hover:text-blue-600 transition"
                                                                            onClick={() => handleReaction(feedback.id, '👍', 'reply', reply.id)}
                                                                        >
                                                                            <FaThumbsUp />
                                                                            <span>Like</span>
                                                                        </button>
                                                                        {Object.keys(reply.reactions || {}).length > 0 && (
                                                                            <div className="flex items-center space-x-1">
                                                                                {Object.entries(reply.reactions || {}).map(([emoji, uids]) => uids.length > 0 && (
                                                                                    <span key={emoji} className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                                        {emoji} {uids.length}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-6 text-center text-gray-500">No reviews yet. Be the first to leave one!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
