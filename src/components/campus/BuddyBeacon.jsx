import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Avatar } from '@/components/ui/avatar.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { useTheme } from '@/lib/theme.js';
import { getPostsForEvent } from '@/lib/api';
import LoadingSpinner from '@/components/animations/LoadingSpinner';

export default function BuddyBeacon({ user, eventId }) {
  const { theme } = useTheme();

  // State for data from the API
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventName, setEventName] = useState('');

  // State for UI interactions
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [applicationData, setApplicationData] = useState({
    message: '',
    relevantSkills: [],
    newSkill: ''
  });

  // Fetch team posts when the component loads or eventId prop changes
  useEffect(() => {
    // If no eventId is passed, it means we're viewing the general Buddy Beacon.
    // For now, we'll just show nothing, but you could fetch all posts here.
    if (!eventId) {
      setIsLoading(false);
      setPosts([]);
      setEventName('');
      return;
    }

    const fetchTeamPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getPostsForEvent(eventId);
        setPosts(response.data);
        if (response.data.length > 0) {
          setEventName(response.data[0].eventName);
        }
      } catch (err) {
        setError('Could not fetch team posts for this event.');
        console.error("Fetch Posts Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamPosts();
  }, [eventId]);

  // Your existing filtering and search logic, now working on live data
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(post => new Date(post.expiresAt) > new Date());
        break;
      case 'my-posts':
        filtered = filtered.filter(post => post.authorId === user?.id); // Matches against authorId
        break;
      case 'applied':
        filtered = []; // Logic to filter posts user has applied to would go here
        break;
      default:
        break;
    }

    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.eventName.toLowerCase().includes(lowercasedQuery) ||
        post.description.toLowerCase().includes(lowercasedQuery) ||
        post.requiredSkills.some(skill => skill.toLowerCase().includes(lowercasedQuery))
      );
    }

    return filtered;
  }, [posts, activeFilter, searchQuery, user]);

  // Dynamically update filter counts
  const filters = [
    { id: 'all', label: 'All Posts', count: posts.length },
    { id: 'active', label: 'Active', count: posts.filter(p => new Date(p.expiresAt) > new Date()).length },
    { id: 'my-posts', label: 'My Posts', count: posts.filter(p => p.authorId === user?.id).length },
    { id: 'applied', label: 'Applied', count: 0 }
  ];

  // Your helper functions
  const getRemainingTime = (expiresAt) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours remaining`;
  };

  const handleApplyToTeam = (post) => {
    setSelectedPost(post);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = () => {
    // TODO: Wire this up to a backend API call
    console.log('Submitting application for post:', selectedPost.id);
    setShowApplicationModal(false);
    alert('Application submitted!');
  };

  const renderPosts = () => {
    if (isLoading) {
      return <div className="flex justify-center p-12"><LoadingSpinner /></div>;
    }
    if (error) {
      return <div className="text-center text-red-400 p-12">{error}</div>;
    }
    if (filteredPosts.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
            <p className="text-muted-foreground">
              {eventId ? 'Be the first to create a team post for this event!' : 'No team posts match your search criteria.'}
            </p>
          </CardContent>
        </Card>
      );
    }

    return filteredPosts.map((post) => {
      const currentTeamSize = (post.applicants?.length || 0) + 1;
      const isOwnPost = post.authorId === user?.id;

      return (
        <Card key={post.id} className="transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">{post.author?.name?.charAt(0) || 'U'}</Avatar>
                <div>
                  <div className="font-semibold">{post.author?.name || 'A User'}</div>
                  <div className="text-sm text-muted-foreground">{post.author?.collegeName || 'Their College'}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-100 text-blue-700 mb-2">Team Request</Badge>
                <div className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border mb-4">
              <div className="font-semibold text-blue-800 mb-1">Event: {post.eventName}</div>
              <div className="text-sm text-blue-700">Team: {currentTeamSize}/{post.maxTeamSize} members</div>
            </div>

            <p className="text-muted-foreground mb-4">{post.description}</p>

            <div className="space-y-2 mb-4">
              <div className="text-sm font-medium">Required Skills:</div>
              <div className="flex flex-wrap gap-2">
                {post.requiredSkills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm mb-4">
              <span>⏰</span>
              <span className={new Date(post.expiresAt) > new Date() ? 'text-orange-600' : 'text-red-600'}>
                {getRemainingTime(post.expiresAt)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <div className="text-sm text-muted-foreground">{currentTeamSize}/{post.maxTeamSize} spots filled</div>
              {!isOwnPost && currentTeamSize < post.maxTeamSize && new Date(post.expiresAt) > new Date() && (
                <Button onClick={() => handleApplyToTeam(post)}>✋ Apply to Join</Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">🔍 Buddy Beacon</h1>
        <p className="text-lg text-muted-foreground">
          {eventId && eventName ? `Finding teammates for: ${eventName}` : 'Find teammates for events and projects'}
        </p>
      </div>

      {/* Search and Filter UI */}
      <Input placeholder="Search by event or skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <div className="flex flex-wrap justify-center gap-2">
        {filters.map((filter) => (
          <Button key={filter.id} variant={activeFilter === filter.id ? 'default' : 'outline'} onClick={() => setActiveFilter(filter.id)}>
            {filter.label} <Badge variant="secondary" className="ml-2">{filter.count}</Badge>
          </Button>
        ))}
      </div>

      <div className="space-y-6">{renderPosts()}</div>

      {/* Application Modal JSX (no changes needed) */}
    </div>
  );
}