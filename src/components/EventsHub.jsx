import { useState } from 'react'
import { Card } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { Badge } from './ui/badge.jsx'
import { Input } from './ui/input.jsx'
import { Textarea } from './ui/textarea.jsx'

const mockEvents = [
  {
    id: 1,
    title: 'TechFest 2024 Hackathon',
    category: 'Hackathon',
    date: '2024-03-15T09:00:00Z',
    description: 'Build innovative solutions for real-world problems in 48 hours.',
    skills: ['React', 'Node.js', 'Python', 'AI/ML'],
    maxTeamSize: 4,
    externalLink: 'https://techfest2024.com',
    poster: null,
    organizer: 'TechFest Committee',
    participants: 156,
    teamsFormed: 42
  },
  {
    id: 2,
    title: 'Innovation Summit 2024',
    category: 'Competition',
    date: '2024-03-20T10:00:00Z',
    description: 'Showcase your innovative projects and compete for prizes.',
    skills: ['Innovation', 'Presentation', 'Product Design'],
    maxTeamSize: 3,
    externalLink: null,
    poster: null,
    organizer: 'Innovation Club',
    participants: 89,
    teamsFormed: 28
  },
  {
    id: 3,
    title: 'Web Development Workshop',
    category: 'Workshop',
    date: '2024-03-10T14:00:00Z',
    description: 'Learn modern web development with React and TypeScript.',
    skills: ['React', 'TypeScript', 'Web Development'],
    maxTeamSize: 2,
    externalLink: 'https://webdev-workshop.com',
    poster: null,
    organizer: 'CS Department',
    participants: 234,
    teamsFormed: 117
  }
]

export default function EventsHub({ user, onNavigateToBeacon }) {
  const [events, setEvents] = useState(mockEvents)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFindTeamModal, setShowFindTeamModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [findTeamAction, setFindTeamAction] = useState(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: '',
    date: '',
    time: '',
    description: '',
    skills: [],
    newSkill: '',
    maxTeamSize: 4,
    externalLink: '',
    poster: null
  })
  const [teamPost, setTeamPost] = useState({
    extraSkills: [],
    newSkill: '',
    description: ''
  })

  // Check if user is moderator
  const isModerator = user?.hasModerationBadge || user?.isModerator || true // Mock for testing

  const categories = [
    { id: 'Hackathon', label: 'Hackathon', icon: '💻' },
    { id: 'Fest', label: 'Fest', icon: '🎉' },
    { id: 'Competition', label: 'Competition', icon: '🏆' },
    { id: 'Workshop', label: 'Workshop', icon: '🛠️' },
    { id: 'Others', label: 'Others', icon: '📋' }
  ]

  const filters = [
    { id: 'all', label: 'All Events', icon: '📅', count: events.length },
    { id: 'hackathons', label: 'Hackathons', icon: '💻', count: events.filter(e => e.category === 'Hackathon').length },
    { id: 'competitions', label: 'Competitions', icon: '🏆', count: events.filter(e => e.category === 'Competition').length },
    { id: 'workshops', label: 'Workshops', icon: '🛠️', count: events.filter(e => e.category === 'Workshop').length },
    { id: 'fests', label: 'Fests', icon: '🎉', count: events.filter(e => e.category === 'Fest').length }
  ]

  const getFilteredEvents = () => {
    switch (activeFilter) {
      case 'hackathons':
        return events.filter(event => event.category === 'Hackathon')
      case 'competitions':
        return events.filter(event => event.category === 'Competition')
      case 'workshops':
        return events.filter(event => event.category === 'Workshop')
      case 'fests':
        return events.filter(event => event.category === 'Fest')
      default:
        return events
    }
  }

  const handleFindTeam = (event) => {
    setSelectedEvent(event)
    setShowFindTeamModal(true)
    setFindTeamAction(null)
  }

  const handleCreateTeamPost = () => {
    if (!selectedEvent || !teamPost.description.trim()) {
      alert('Please fill in the description for your team post.')
      return
    }

    // Create team post data
    const postData = {
      type: 'Team Request',
      eventName: selectedEvent.title,
      title: `Looking for teammates - ${selectedEvent.title}`,
      description: teamPost.description,
      author: {
        name: user?.fullName || user?.name || 'You',
        college: user?.collegeName || 'Your College',
        avatar: user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'Y',
        badges: user?.badges?.slice(0, 3) || ['Event Participant', 'Team Player', 'Collaborator'],
        year: user?.yearOfStudy || user?.year || '3rd Year'
      },
      requiredSkills: [...selectedEvent.skills, ...teamPost.extraSkills],
      maxTeamSize: selectedEvent.maxTeamSize,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
      applicants: [],
      isOwnPost: true,
      eventId: selectedEvent.id
    }

    // Navigate to Buddy Beacon with the new post
    if (onNavigateToBeacon) {
      onNavigateToBeacon(selectedEvent.title)
    }

    setShowFindTeamModal(false)
    setTeamPost({ extraSkills: [], newSkill: '', description: '' })
    
    alert('🎉 Your team post has been created in Buddy Beacon! It will expire in 24 hours and auto-create a Collab Pod if you get applicants.')
  }

  const handleBrowseTeams = () => {
    if (onNavigateToBeacon) {
      onNavigateToBeacon(selectedEvent?.title)
    }
    setShowFindTeamModal(false)
  }

  const addEventSkill = () => {
    if (newEvent.newSkill.trim() && !newEvent.skills.includes(newEvent.newSkill.trim())) {
      setNewEvent(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }))
    }
  }

  const removeEventSkill = (skillToRemove) => {
    setNewEvent(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addTeamSkill = () => {
    if (teamPost.newSkill.trim() && !teamPost.extraSkills.includes(teamPost.newSkill.trim())) {
      setTeamPost(prev => ({
        ...prev,
        extraSkills: [...prev.extraSkills, prev.newSkill.trim()],
        newSkill: ''
      }))
    }
  }

  const removeTeamSkill = (skillToRemove) => {
    setTeamPost(prev => ({
      ...prev,
      extraSkills: prev.extraSkills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.category || !newEvent.date || !newEvent.time || !newEvent.description) {
      alert('Please fill in all required fields.')
      return
    }

    const event = {
      id: Date.now(),
      title: newEvent.title,
      category: newEvent.category,
      date: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
      description: newEvent.description,
      skills: newEvent.skills,
      maxTeamSize: newEvent.maxTeamSize,
      externalLink: newEvent.externalLink || null,
      poster: newEvent.poster,
      organizer: user?.fullName || user?.name || 'Moderator',
      participants: 0,
      teamsFormed: 0
    }

    setEvents([event, ...events])
    setShowCreateModal(false)
    setNewEvent({
      title: '',
      category: '',
      date: '',
      time: '',
      description: '',
      skills: [],
      newSkill: '',
      maxTeamSize: 4,
      externalLink: '',
      poster: null
    })

    alert('Event created successfully!')
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Hackathon': 'bg-blue-100 text-blue-700 border-blue-200',
      'Competition': 'bg-green-100 text-green-700 border-green-200',
      'Workshop': 'bg-purple-100 text-purple-700 border-purple-200',
      'Fest': 'bg-pink-100 text-pink-700 border-pink-200',
      'Others': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-600'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Hackathon': '💻',
      'Competition': '🏆',
      'Workshop': '🛠️',
      'Fest': '🎉',
      'Others': '📋'
    }
    return icons[category] || '📅'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎯 Events Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover hackathons, competitions, workshops, and fests to showcase your skills
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 p-2 bg-muted/30 rounded-xl">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
              activeFilter === filter.id
                ? 'bg-primary text-primary-foreground shadow-md transform scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
              <Badge variant="outline" className="text-xs">
                {filter.count}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {/* Create Event Button - Moderator Only */}
      {isModerator && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            size="lg"
          >
            ✨ Create Event
          </Button>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {getFilteredEvents().map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] rounded-2xl">
            {/* Event Header */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2 line-clamp-2">{event.title}</h3>
                  <Badge className={`${getCategoryColor(event.category)} px-3 py-1 rounded-full text-sm font-medium mb-3`}>
                    {getCategoryIcon(event.category)} {event.category}
                  </Badge>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <span>📅</span>
                  <span className="text-sm">{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <span>👥</span>
                  <span className="text-sm">Max team size: {event.maxTeamSize}</span>
                </div>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <span>🏢</span>
                  <span className="text-sm">By {event.organizer}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                {event.description}
              </p>

              {/* Skills */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Required Skills</div>
                <div className="flex flex-wrap gap-2">
                  {event.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {event.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.skills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{event.participants}</div>
                  <div className="text-xs">Participants</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{event.teamsFormed}</div>
                  <div className="text-xs">Teams</div>
                </div>
              </div>

              {/* Action Buttons - Enhanced with Find Team */}
              <div className="space-y-2">
                <Button 
                  onClick={() => handleFindTeam(event)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  🔍 Find Team
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    📋 Details
                  </Button>
                  {event.externalLink && (
                    <Button variant="outline" size="sm" className="flex-1">
                      🔗 Register
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Find Team Modal */}
      {showFindTeamModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold">Find Team</h3>
                <p className="text-muted-foreground">{selectedEvent.title}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFindTeamModal(false)}>
                ✕
              </Button>
            </div>

            {!findTeamAction ? (
              <div className="space-y-6">
                <p className="text-lg text-center text-muted-foreground">How would you like to find teammates?</p>
                <div className="space-y-4">
                  <button
                    onClick={() => setFindTeamAction('create')}
                    className="w-full p-6 border-2 border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all text-left group hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-3xl">✨</span>
                      <span className="text-xl font-semibold">Create Team Post</span>
                    </div>
                    <p className="text-muted-foreground">Create a post in Buddy Beacon to attract teammates. Auto-fills event details.</p>
                  </button>
                  
                  <button
                    onClick={() => setFindTeamAction('browse')}
                    className="w-full p-6 border-2 border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all text-left group hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-3xl">🔍</span>
                      <span className="text-xl font-semibold">Browse Teams</span>
                    </div>
                    <p className="text-muted-foreground">Browse existing team posts in Buddy Beacon for this event.</p>
                  </button>
                </div>
              </div>
            ) : findTeamAction === 'create' ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFindTeamAction(null)}
                    className="rounded-full"
                  >
                    ← Back
                  </Button>
                  <Badge className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">
                    ✨ Create Team Post
                  </Badge>
                </div>

                {/* Auto-filled Event Info */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Auto-filled Event Details:</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div><strong>Event:</strong> {selectedEvent.title}</div>
                    <div><strong>Max Team Size:</strong> {selectedEvent.maxTeamSize} members</div>
                    <div><strong>Required Skills:</strong> {selectedEvent.skills.join(', ')}</div>
                  </div>
                </div>

                {/* User Details Preview */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Your Profile Details (will be shown):</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div><strong>Name:</strong> {user?.fullName || user?.name || 'Your Name'}</div>
                    <div><strong>Year:</strong> {user?.yearOfStudy || user?.year || '3rd Year'}</div>
                    <div><strong>Badges:</strong> {(user?.badges?.slice(0, 3) || ['Event Participant', 'Team Player', 'Collaborator']).join(', ')}</div>
                  </div>
                </div>

                {/* Extra Skills */}
                <div>
                  <label className="block font-semibold mb-3 text-lg">Additional Skills (Optional)</label>
                  <div className="space-y-3">
                    {teamPost.extraSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {teamPost.extraSkills.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-destructive/10 hover:text-destructive px-3 py-1"
                            onClick={() => removeTeamSkill(skill)}
                          >
                            {skill} ✕
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add additional skills you bring..."
                        value={teamPost.newSkill}
                        onChange={(e) => setTeamPost(prev => ({ ...prev, newSkill: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addTeamSkill()}
                        className="rounded-xl flex-1"
                      />
                      <Button variant="outline" onClick={addTeamSkill} className="rounded-xl">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold mb-3 text-lg">Team Post Description *</label>
                  <Textarea
                    placeholder="Describe your project idea, what you're looking for in teammates, and why people should join your team..."
                    value={teamPost.description}
                    onChange={(e) => setTeamPost(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="rounded-xl p-4"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <p className="text-yellow-800">
                    ⏰ <strong>Auto-Expiry:</strong> Your team post will expire in 24 hours and auto-create a Collab Pod if you receive applicants.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={handleCreateTeamPost}
                    disabled={!teamPost.description.trim()}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    🚀 Create Team Post
                  </Button>
                  <Button variant="outline" onClick={() => setFindTeamAction(null)} className="py-3 rounded-xl">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="flex items-center space-x-3 mb-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFindTeamAction(null)}
                    className="rounded-full"
                  >
                    ← Back
                  </Button>
                  <Badge className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
                    🔍 Browse Teams
                  </Badge>
                </div>

                <div className="text-6xl mb-4">🔍</div>
                <h4 className="font-semibold text-lg mb-2">Browse Existing Teams</h4>
                <p className="text-muted-foreground mb-6">
                  We'll redirect you to Buddy Beacon where you can see all team posts for {selectedEvent.title}.
                </p>
                
                <Button 
                  onClick={handleBrowseTeams}
                  className="py-3 px-8 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  🚀 Go to Buddy Beacon
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Create Event Modal - Moderator Only */}
      {showCreateModal && isModerator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Create New Event</h3>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="block font-semibold mb-3 text-lg">Event Title *</label>
                <Input
                  placeholder="Enter event title..."
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="rounded-xl p-4 text-lg"
                  required
                />
              </div>

              {/* Event Category */}
              <div>
                <label className="block font-semibold mb-3 text-lg">Event Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setNewEvent(prev => ({ ...prev, category: category.id }))}
                      className={`p-4 border-2 rounded-xl transition-all text-center ${
                        newEvent.category === category.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="text-sm font-medium">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-3 text-lg">Date *</label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="rounded-xl p-4"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-3 text-lg">Time *</label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="rounded-xl p-4"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-3 text-lg">Description *</label>
                <Textarea
                  placeholder="Describe your event..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="rounded-xl p-4"
                  required
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block font-semibold mb-3 text-lg">Required Skills</label>
                <div className="space-y-3">
                  {newEvent.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newEvent.skills.map((skill) => (
                        <Badge 
                          key={skill} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-destructive/10 hover:text-destructive px-3 py-1"
                          onClick={() => removeEventSkill(skill)}
                        >
                          {skill} ✕
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newEvent.newSkill}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, newSkill: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addEventSkill()}
                      className="rounded-xl flex-1"
                    />
                    <Button variant="outline" onClick={addEventSkill} className="rounded-xl">
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Max Team Size */}
              <div>
                <label className="block font-semibold mb-3 text-lg">Max Team Size</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newEvent.maxTeamSize}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, maxTeamSize: parseInt(e.target.value) || 4 }))}
                  className="rounded-xl p-4"
                />
              </div>

              {/* External Link */}
              <div>
                <label className="block font-semibold mb-3 text-lg">External Registration Link (Optional)</label>
                <Input
                  placeholder="https://example.com/register"
                  value={newEvent.externalLink}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, externalLink: e.target.value }))}
                  className="rounded-xl p-4"
                />
              </div>

              {/* Create Event Button */}
              <div className="flex space-x-4">
                <Button 
                  onClick={handleCreateEvent}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  🚀 Create Event
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="py-3 rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}