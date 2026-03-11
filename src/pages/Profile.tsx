import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import { Camera, User as UserIcon, Save, X, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPhotoURL(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateProfile({ name, bio, photoURL });
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-white/60">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl"
        >
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-zinc-800 border-4 border-zinc-900 overflow-hidden shadow-2xl">
                  {photoURL ? (
                    <img src={photoURL} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                      <UserIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button 
                    onClick={startCamera}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                )}
              </div>
              <div className="pb-4">
                <h1 className="text-3xl font-black tracking-tighter text-white">{user.name}</h1>
                <p className="text-white/40 font-medium">{user.email}</p>
              </div>
            </div>
            <div className="absolute top-6 right-8">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-2xl font-bold transition-all backdrop-blur-md border border-white/10"
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setBio(user.bio || "");
                    setPhotoURL(user.photoURL || "");
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-2xl font-bold transition-all backdrop-blur-md border border-white/10"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-24 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none transition-all",
                      isEditing ? "focus:border-emerald-500/50 focus:bg-white/10" : "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/40 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Bio</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none transition-all h-32 resize-none",
                    isEditing ? "focus:border-emerald-500/50 focus:bg-white/10" : "opacity-50 cursor-not-allowed"
                  )}
                />
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-4 pt-4">
                  <AnimatePresence>
                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-2 text-emerald-400 font-bold"
                      >
                        <Check className="w-5 h-5" />
                        Profile updated!
                      </motion.div>
                    )}
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="text-red-400 font-bold"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <h2 className="text-2xl font-black tracking-tighter text-white">Capture Photo</h2>
                <button onClick={stopCamera} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="relative aspect-video bg-black">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="p-8 flex items-center justify-center gap-6">
                <button 
                  onClick={stopCamera}
                  className="px-8 py-4 rounded-2xl font-bold text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={capturePhoto}
                  className="bg-white text-black px-12 py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Camera className="w-6 h-6" />
                  Take Photo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
