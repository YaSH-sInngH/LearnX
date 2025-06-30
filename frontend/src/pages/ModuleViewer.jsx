import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModuleById, saveModuleProgress, submitQuiz, getQuizAttempts } from '../api/tracks';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'react-toastify';
import VideoPlayer from '../components/VideoPlayer';
import NotesPanel from '../components/NotesPanel';
import QuizPanel from '../components/QuizPanel';
import { getProfile } from '../api/profile';

export default function ModuleViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai'); // Changed default to 'ai'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  useEffect(() => {
    fetchModuleDetails();
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    setLoading(true);
    try {
      const moduleData = await getModuleById(moduleId);
      setModule(moduleData);
      
      // Check if user has progress for this module
      if (moduleData.userProgress) {
        setVideoProgress(moduleData.userProgress.lastPosition || 0);
        setIsVideoCompleted(moduleData.userProgress.completed || false);
      }
    } catch (error) {
      toast.error('Failed to load module');
      console.error('Error fetching module:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoProgress = async (currentTime, duration) => {
    const progress = (currentTime / duration) * 100;
    setVideoProgress(progress);
    
    // Save progress every 30 seconds
    if (Math.floor(currentTime) % 30 === 0) {
      try {
        await saveModuleProgress(module.trackId, moduleId, {
          position: currentTime,
          completed: progress >= 90 // Mark as completed if watched 90% or more
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  const handleVideoComplete = async () => {
    setIsVideoCompleted(true);
    try {
      await saveModuleProgress(module.trackId, moduleId, {
        position: module.videoDuration || 0,
        completed: true
      });
      toast.success('Module completed!');
      const updatedProfile = await getProfile();
      setUser(updatedProfile);
    } catch (error) {
      console.error('Failed to mark module as completed:', error);
    }
  };

  const handleQuizSubmit = async (answers) => {
    try {
      const result = await submitQuiz(moduleId, answers);
      if (result.passed) {
        toast.success(`Quiz passed! Score: ${result.score}%`);
        // Mark module as completed if quiz is passed
        try {
          await saveModuleProgress(module.trackId, moduleId, {
            completed: true,
            quizCompleted: true
          });
          const updatedProfile = await getProfile();
          setUser(updatedProfile);
        } catch (progressError) {
          toast.error('Quiz passed, but failed to update progress.');
          // Do NOT throw here, just notify
        }
      } else {
        toast.error(`Quiz failed. Score: ${result.score}%`);
      }
      return result;
    } catch (error) {
      toast.error('Failed to submit quiz');
      // Do NOT throw here, just return a failed result
      return { score: 0, passed: false, correctAnswers: [] };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Module not found</h2>
          <p className="text-gray-600 dark:text-gray-300">The module you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{module.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Module {module.order}</p>
              </div>
            </div>
            
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Player Column (60% width) */}
          <div className="lg:w-3/5">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden dark:border-gray-700">
              <VideoPlayer
                videoUrl={module.videoUrl}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                initialProgress={videoProgress}
                isCompleted={isVideoCompleted}
              />
            </div>
          </div>

          {/* Sidebar Columns (40% width) */}
          <div className={`lg:w-2/5 ${isSidebarCollapsed ? 'hidden lg:block' : 'block'}`}>
            <div className="space-y-6">
              {/* Notes Panel (20% width) */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border-gray-700">
                <NotesPanel
                  moduleId={moduleId}
                  initialNotes={module.notes}
                  isCompleted={isVideoCompleted}
                />
              </div>

              {/* Quiz/Resources Panel (20% width) */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border-gray-700">
                <QuizPanel
                  moduleId={moduleId}
                  module={module}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onSubmitQuiz={handleQuizSubmit}
                  isCompleted={isVideoCompleted}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 