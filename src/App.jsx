import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc, setDoc, orderBy, Timestamp } from 'firebase/firestore';
import { Users, BookOpen, Calendar, Star, Shield, LogOut, Menu, X, Clock, CheckCircle, XCircle, MessageSquare, Plus, Trash2 } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyB0rfKIviy2RZ13Lh5XMZW2odBgrxylu6w",
  authDomain: "skill-swap-4e2f8.firebaseapp.com",
  projectId: "skill-swap-4e2f8",
  storageBucket: "skill-swap-4e2f8.firebasestorage.app",
  messagingSenderId: "997513204246",
  appId: "1:997513204246:web:25aacddaa9e9367c301b37",
  measurementId: "G-VC59N269GT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function SkillSwap() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() });
            setCurrentView('dashboard');
          } else {
            setUser(null);
            await signOut(auth);
          }
        } catch (error) {
          console.error('Error loading user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        setCurrentView('login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SkillSwap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {!user ? (
        <AuthView currentView={currentView} setCurrentView={setCurrentView} />
      ) : (
        <MainApp 
          user={user} 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          handleLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}
      <footer className="bg-white border-t mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          SkillSwap © 2026 | Frisco, Texas | BPA Web Application Team
        </div>
      </footer>
    </div>
  );
}

function AuthView({ currentView, setCurrentView }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    gradYear: new Date().getFullYear(),
    school: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (currentView === 'register') {
        if (!formData.name.trim() || !formData.school.trim()) {
          setError('Please fill in all required fields');
          setIsSubmitting(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: formData.email,
          name: formData.name.trim(),
          gradYear: parseInt(formData.gradYear),
          school: formData.school.trim(),
          bio: formData.bio.trim(),
          role: 'student',
          createdAt: Timestamp.now()
        });

        setSuccess('Account created successfully! Logging you in...');
        setTimeout(() => {
          setCurrentView('dashboard');
        }, 1000);
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SkillSwap</h1>
          <p className="text-gray-600 mt-2">Student Talent Exchange Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentView === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Frisco High School"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                <input
                  type="number"
                  required
                  min="2024"
                  max="2035"
                  value={formData.gradYear}
                  onChange={(e) => setFormData({...formData, gradYear: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="2026"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@school.edu"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              minLength="6"
              disabled={isSubmitting}
            />
          </div>

          {currentView === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
                rows="3"
                disabled={isSubmitting}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Please wait...' : (currentView === 'register' ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView(currentView === 'login' ? 'register' : 'login')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
            disabled={isSubmitting}
          >
            {currentView === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MainApp({ user, currentView, setCurrentView, handleLogout, mobileMenuOpen, setMobileMenuOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users },
    { id: 'profile', label: 'My Profile', icon: BookOpen },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'browse', label: 'Browse Skills', icon: Star },
  ];

  if (user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">SkillSwap</span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} className="mr-2" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors ml-2"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} className="mr-2" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && <Dashboard user={user} setCurrentView={setCurrentView} />}
        {currentView === 'profile' && <Profile user={user} />}
        {currentView === 'sessions' && <Sessions user={user} />}
        {currentView === 'browse' && <BrowseSkills user={user} />}
        {currentView === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>
    </>
  );
}

function Dashboard({ user, setCurrentView }) {
  const [stats, setStats] = useState({ sessions: 0, skills: 0, rating: 0 });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('participants', 'array-contains', user.uid)
      );
      const sessionsSnap = await getDocs(sessionsQuery);
      
      const skillsQuery = query(
        collection(db, 'userSkills'),
        where('userId', '==', user.uid)
      );
      const skillsSnap = await getDocs(skillsQuery);

      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('rateeId', '==', user.uid)
      );
      const ratingsSnap = await getDocs(ratingsQuery);
      
      let totalRating = 0;
      ratingsSnap.forEach(doc => {
        totalRating += doc.data().score;
      });
      const avgRating = ratingsSnap.size > 0 ? (totalRating / ratingsSnap.size).toFixed(1) : 0;

      setStats({
        sessions: sessionsSnap.size,
        skills: skillsSnap.size,
        rating: avgRating
      });

      const sessions = [];
      sessionsSnap.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      setRecentSessions(sessions.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
        <p className="text-gray-600">Ready to share your skills or learn something new?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.sessions}</p>
            </div>
            <Calendar className="text-indigo-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Skills</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.skills}</p>
            </div>
            <BookOpen className="text-indigo-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.rating || 'N/A'}</p>
            </div>
            <Star className="text-yellow-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
          {skills.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No skills added yet. Add your first skill above!</p>
          ) : (
            skills.map((skill) => (
              <div key={skill.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      skill.type === 'offered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {skill.type === 'offered' ? 'Teaching' : 'Learning'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {skill.proficiency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{skill.category}</p>
                </div>
                <button
                  onClick={() => deleteSkill(skill.id)}
                  className="text-red-600 hover:text-red-700 ml-4 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete skill"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BrowseSkills({ user }) {
  const [skills, setSkills] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestingSession, setRequestingSession] = useState(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const q = query(
        collection(db, 'userSkills'),
        where('type', '==', 'offered')
      );
      const snapshot = await getDocs(q);
      const skillsData = [];
      snapshot.forEach(doc => {
        if (doc.data().userId !== user.uid) {
          skillsData.push({ id: doc.id, ...doc.data() });
        }
      });
      setSkills(skillsData);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestSession = async (skill) => {
    setRequestingSession(skill.id);
    try {
      await addDoc(collection(db, 'sessions'), {
        requesterId: user.uid,
        requesterName: user.name,
        providerId: skill.userId,
        providerName: skill.userName,
        skillId: skill.id,
        skillName: skill.name,
        status: 'pending',
        participants: [user.uid, skill.userId],
        createdAt: Timestamp.now()
      });
      alert('Session request sent successfully!');
    } catch (error) {
      console.error('Error requesting session:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setRequestingSession(null);
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || skill.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = [...new Set(skills.map(s => s.category))];

  if (loading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Available Skills</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            {skills.length === 0 ? 'No skills available yet. Be the first to add one!' : 'No skills found. Try adjusting your search.'}
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div key={skill.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{skill.name}</h3>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                  {skill.proficiency}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{skill.category}</p>
              <p className="text-sm text-gray-700 mb-4">Taught by: <span className="font-medium">{skill.userName}</span></p>
              <button
                onClick={() => requestSession(skill)}
                disabled={requestingSession === skill.id}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {requestingSession === skill.id ? 'Sending...' : 'Request Session'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Sessions({ user }) {
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState({ score: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const q = query(
        collection(db, 'sessions'),
        where('participants', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      const sessionsData = [];
      snapshot.forEach(doc => {
        sessionsData.push({ id: doc.id, ...doc.data() });
      });
      sessionsData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId, newStatus) => {
    setUpdating(sessionId);
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      await loadSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Failed to update session');
    } finally {
      setUpdating(null);
    }
  };

  const submitRating = async () => {
    if (!selectedSession) return;

    try {
      const rateeId = selectedSession.requesterId === user.uid 
        ? selectedSession.providerId 
        : selectedSession.requesterId;

      await addDoc(collection(db, 'ratings'), {
        sessionId: selectedSession.id,
        raterId: user.uid,
        raterName: user.name,
        rateeId: rateeId,
        score: rating.score,
        comment: rating.comment,
        createdAt: Timestamp.now()
      });

      setShowRatingModal(false);
      setRating({ score: 5, comment: '' });
      alert('Rating submitted successfully!');
      await loadSessions();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return session.status === 'pending';
    if (activeTab === 'active') return session.status === 'accepted';
    if (activeTab === 'completed') return session.status === 'completed';
    return true;
  });

  if (loading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Sessions</h2>
        
        <div className="flex gap-2 border-b overflow-x-auto">
          {['all', 'pending', 'active', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab} ({sessions.filter(s => tab === 'all' || s.status === tab || (tab === 'active' && s.status === 'accepted')).length})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            No sessions found in this category.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isRequester = session.requesterId === user.uid;
            const otherPerson = isRequester ? session.providerName : session.requesterName;

            return (
              <div key={session.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{session.skillName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isRequester ? `Learning from: ${otherPerson}` : `Teaching: ${otherPerson}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    session.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                    session.status === 'completed' ? 'bg-green-100 text-green-700' :
                    session.status === 'declined' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {session.status}
                  </span>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">
                  {session.status === 'pending' && !isRequester && (
                    <>
                      <button
                        onClick={() => updateSessionStatus(session.id, 'accepted')}
                        disabled={updating === session.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-green-400"
                      >
                        <CheckCircle size={16} />
                        {updating === session.id ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => updateSessionStatus(session.id, 'declined')}
                        disabled={updating === session.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-red-400"
                      >
                        <XCircle size={16} />
                        Decline
                      </button>
                    </>
                  )}
                  {session.status === 'accepted' && (
                    <button
                      onClick={() => updateSessionStatus(session.id, 'completed')}
                      disabled={updating === session.id}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                      {updating === session.id ? 'Updating...' : 'Mark as Completed'}
                    </button>
                  )}
                  {session.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setShowRatingModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                    >
                      <Star size={16} />
                      Leave Rating
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Rate This Session</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5 stars)</label>
              <select
                value={rating.score}
                onChange={(e) => setRating({...rating, score: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''} {'⭐'.repeat(num)}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                value={rating.comment}
                onChange={(e) => setRating({...rating, comment: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="4"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={submitRating}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating({ score: 5, comment: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalSessions: 0, activeSkills: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const sessionsSnap = await getDocs(collection(db, 'sessions'));
      const skillsSnap = await getDocs(collection(db, 'userSkills'));

      const usersData = [];
      usersSnap.forEach(doc => {
        usersData.push({ id: doc.id, ...doc.data() });
      });

      const sessionsData = [];
      sessionsSnap.forEach(doc => {
        sessionsData.push({ id: doc.id, ...doc.data() });
      });

      setUsers(usersData);
      setSessions(sessionsData);
      setStats({
        totalUsers: usersData.length,
        totalSessions: sessionsData.length,
        activeSkills: skillsSnap.size
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete their skills and sessions.')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      alert('User deleted successfully');
      await loadAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
      alert('Session deleted successfully');
      await loadAdminData();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Total Users</p>
            <p className="text-3xl font-bold text-indigo-900 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Sessions</p>
            <p className="text-3xl font-bold text-green-900 mt-1">{stats.totalSessions}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Active Skills</p>
            <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.activeSkills}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">School</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.school}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Session Management</h3>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No sessions yet</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{session.skillName}</h4>
                  <p className="text-sm text-gray-600">
                    {session.requesterName} ↔ {session.providerName}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                    session.status === 'completed' ? 'bg-green-100 text-green-700' :
                    session.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                    session.status === 'declined' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}-y-3">
            <button
              onClick={() => setCurrentView('browse')}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Browse Available Skills
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              Update My Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sessions yet. Start browsing skills!</p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{session.skillName}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      session.status === 'completed' ? 'bg-green-100 text-green-700' :
                      session.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Profile({ user }) {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', type: 'offered', proficiency: 'beginner', category: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const q = query(collection(db, 'userSkills'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const skillsData = [];
      snapshot.forEach(doc => {
        skillsData.push({ id: doc.id, ...doc.data() });
      });
      setSkills(skillsData);
    } catch (error) {
      console.error('Error loading skills:', error);
      setMessage({ type: 'error', text: 'Failed to load skills' });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (e) => {
    e.preventDefault();
    
    if (!newSkill.name.trim() || !newSkill.category.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await addDoc(collection(db, 'userSkills'), {
        userId: user.uid,
        userName: user.name,
        name: newSkill.name.trim(),
        type: newSkill.type,
        proficiency: newSkill.proficiency,
        category: newSkill.category.trim(),
        createdAt: Timestamp.now()
      });

      setNewSkill({ name: '', type: 'offered', proficiency: 'beginner', category: '' });
      setMessage({ type: 'success', text: 'Skill added successfully!' });
      await loadSkills();
    } catch (error) {
      console.error('Error adding skill:', error);
      setMessage({ type: 'error', text: 'Failed to add skill. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSkill = async (skillId) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await deleteDoc(doc(db, 'userSkills', skillId));
      setMessage({ type: 'success', text: 'Skill deleted successfully!' });
      await loadSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      setMessage({ type: 'error', text: 'Failed to delete skill' });
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              {user.school} • Class of {user.gradYear}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {user.role}
          </span>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
          <p className="text-gray-700">{user.bio || 'No bio added yet.'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Skills</h3>
        
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={addSkill} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Skill name (e.g., Python Programming)"
              value={newSkill.name}
              onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              disabled={submitting}
            />
            <input
              type="text"
              placeholder="Category (e.g., Programming)"
              value={newSkill.category}
              onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              disabled={submitting}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={newSkill.type}
              onChange={(e) => setNewSkill({...newSkill, type: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={submitting}
            >
              <option value="offered">I can teach this</option>
              <option value="sought">I want to learn this</option>
            </select>
            <select
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({...newSkill, proficiency: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={submitting}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {submitting ? 'Adding...' : 'Add Skill'}
          </button>
        </form>

        <div className="space
