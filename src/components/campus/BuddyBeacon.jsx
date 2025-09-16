import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Avatar } from '@/components/ui/avatar.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { useTheme } from '@/lib/theme.js';

// NEW: A custom hook to fetch live data from your backend
const useBeaconPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBeaconPosts = async () => {
      try {
        // This should be the endpoint for your Buddy Beacon posts
        const response = await axios.get('/api/beacon'); 
        setPosts(response.data);
      } catch (err) {
        console.error("Failed to fetch beacon posts:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBeaconPosts();
  }, []);

  return { posts, loading, error };
};

export default function BuddyBeacon({ user }) {
  const { theme } = useTheme();
  // NEW: Using the hook to get live data instead of mock data
  const { posts: teamPosts, loading, error } = useBeaconPosts();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [applicationData, setApplicationData] = useState({
    message: '',
    relevantSkills: [],
    newSkill: ''
  });

  // The filters will now be dynamic based on the fetched data
  const filters = [
    { id: 'all', label: 'All Posts', count: teamPosts.length },
    // You can add more dynamic filters here later
  ];

  const getFilteredPosts = () => {
    let filtered = teamPosts;
    // ... search logic remains the same
    return filtered;
  };

  const getRemainingTime = (expiresAt) => {
    // ... logic remains the same
  };

  const handleApplyToTeam = (post) => {
    setSelectedPost(post);
    setShowApplicationModal(true);
  };

  const addSkill = () => { /* ... logic remains the same ... */ };
  const removeSkill = (skillToRemove) => { /* ... logic remains the same ... */ };

  // NEW: This function now submits the application to your real backend
  const handleSubmitApplication = async () => {
    if (!applicationData.message.trim()) {
      alert('Please write a message explaining why you want to join this team.');
      return;
    }
    
    try {
      const payload = {
        message: applicationData.message,
        applicantSkills: applicationData.relevantSkills
      };

      // Calls the backend endpoint we planned
      await axios.post(`/api/beacon/${selectedPost.id}/applications`, payload);

      setShowApplicationModal(false);
      setSelectedPost(null);
      setApplicationData({ message: '', relevantSkills: [], newSkill: '' });
      alert('🎉 Application submitted! The team leader will review your application.');

    } catch(err) {
        console.error("Failed to submit application:", err);
        alert("There was an error submitting your application. Please try again.");
    }
  };

  if (loading) return <div className="text-center p-10">Loading Beacon Posts...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Could not load Buddy Beacon.</div>;

  return (
    <div className="space-y-8">
      {/* --- Header, Search, and Filters --- */}
      {/* This section's JSX remains the same */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">🔍 Buddy Beacon</h1>
        <p className="text-lg text-muted-foreground">Find teammates for events and projects</p>
      </div>
      <div className="max-w-2xl mx-auto">
        <Input placeholder="Search by event, skills, or keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-xl p-4 text-lg w-full" />
      </div>
      <div className="flex flex-wrap justify-center gap-2 p-2 bg-muted/30 rounded-xl">
        {filters.map((filter) => (
          <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className={`px-6 py-3 rounded-lg font-medium ${activeFilter === filter.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
            <div className="flex items-center space-x-2">
              <span>{filter.label}</span>
              <Badge variant="outline">{filter.count}</Badge>
            </div>
          </button>
        ))}
      </div>

      {/* --- Team Posts Display (Now uses live data) --- */}
      <div className="space-y-6">
        {getFilteredPosts().length === 0 ? (
          <Card className="card-glass text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">Try different search terms or filters</p>
            </CardContent>
          </Card>
        ) : (
          getFilteredPosts().map((post) => (
            <Card key={post.id} className="card-glass hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      {/* Using placeholder data until author is populated from backend */}
                      {post.author?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <div>
                      <div className="font-semibold">{post.author?.name || 'A User'}</div>
                      <div className="text-sm text-muted-foreground">{post.author?.college || 'University'} • {post.author?.year || ''}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-700 mb-2">🔍 Team Request</Badge>
                    <div className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Event Info */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                  <div className="font-semibold text-blue-800 mb-1">Event: {post.eventName}</div>
                  <div className="text-sm text-blue-700">Team: {post.currentTeamSize}/{post.maxTeamSize} members</div>
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p className="text-muted-foreground">{post.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Required Skills:</div>
                    <div className="flex flex-wrap gap-2">
                      {post.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span>⏰</span>
                    <span className="text-orange-600">{getRemainingTime(post.expiresAt)}</span>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {post.currentTeamSize}/{post.maxTeamSize} spots filled
                  </div>
                  <Button onClick={() => handleApplyToTeam(post)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    ✋ Apply to Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* --- Application Modal --- */}
      {/* This section's JSX remains the same */}
      {showApplicationModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold">Apply to Team</h3>
                <p className="text-muted-foreground">{selectedPost.eventName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowApplicationModal(false)}>✕</Button>
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Team Details:</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div><strong>Leader:</strong> {selectedPost.author.name}</div>
                  <div><strong>Current Size:</strong> {selectedPost.currentTeamSize}/{selectedPost.maxTeamSize} members</div>
                  <div><strong>Skills Needed:</strong> {selectedPost.requiredSkills.join(', ')}</div>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-3 text-lg">Your Relevant Skills</label>
                <div className="space-y-3">
                  {applicationData.relevantSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {applicationData.relevantSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-destructive/10" onClick={() => removeSkill(skill)}>
                          {skill} ✕
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Input placeholder="Add a skill..." value={applicationData.newSkill} onChange={(e) => setApplicationData(prev => ({ ...prev, newSkill: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addSkill()} className="rounded-xl" />
                    <Button variant="outline" onClick={addSkill} className="rounded-xl">Add</Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-3 text-lg">Why do you want to join this team? *</label>
                <Textarea placeholder="Tell them about your experience..." value={applicationData.message} onChange={(e) => setApplicationData(prev => ({ ...prev, message: e.target.value }))} rows={4} className="rounded-xl p-4" />
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleSubmitApplication} disabled={!applicationData.message.trim()} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                  🚀 Submit Application
                </Button>
                <Button variant="outline" onClick={() => setShowApplicationModal(false)} className="py-3 rounded-xl">Cancel</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}