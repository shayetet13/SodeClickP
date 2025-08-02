import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Card, CardHeader, CardFooter, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Search,
  Crown,
  Diamond,
  Medal,
  Trophy,
  ThumbsUp,
  Heart,
  MessageCircle,
  Filter,
  SortAsc,
  SortDesc,
  Users,
  MapPin,
  Check,
  ChevronDown,
  X,
  User
} from 'lucide-react';

// ข้อมูลตัวอย่างซุปตาร์
const mockSuperstars = [
  {
    id: 1,
    name: 'นางสาวสุดา',
    age: 28,
    location: 'กรุงเทพฯ',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    membershipLevel: 'Platinum Member',
    membershipColor: 'cyan',
    stars: 4850,
    votes: 2340,
    hearts: 1890,
    rank: 1,
    verified: true,
    interests: ['ท่องเที่ยว', 'อาหาร', 'ดนตรี'],
    status: 'ออนไลน์'
  },
  {
    id: 2,
    name: 'คุณอรุณ',
    age: 32,
    location: 'เชียงใหม่',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    membershipLevel: 'Diamond Member',
    membershipColor: 'sky',
    stars: 4720,
    votes: 2180,
    hearts: 1750,
    rank: 2,
    verified: true,
    interests: ['กีฬา', 'ธุรกิจ', 'เทคโนโลยี'],
    status: 'ออนไลน์'
  },
  {
    id: 3,
    name: 'นางสาวมาลี',
    age: 26,
    location: 'ภูเก็ต',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    membershipLevel: 'VIP 2',
    membershipColor: 'indigo',
    stars: 4650,
    votes: 2050,
    hearts: 1680,
    rank: 3,
    verified: true,
    interests: ['ศิลปะ', 'การถ่ายภาพ', 'แฟชั่น'],
    status: 'ออฟไลน์'
  },
  {
    id: 4,
    name: 'คุณสมชาย',
    age: 35,
    location: 'ขอนแก่น',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    membershipLevel: 'VIP 1',
    membershipColor: 'pink',
    stars: 4580,
    votes: 1980,
    hearts: 1620,
    rank: 4,
    verified: true,
    interests: ['หนัง', 'หนังสือ', 'การลงทุน'],
    status: 'ออนไลน์'
  },
  {
    id: 5,
    name: 'นางสาวปิยะ',
    age: 29,
    location: 'สงขลา',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    membershipLevel: 'VIP Member',
    membershipColor: 'purple',
    stars: 4420,
    votes: 1850,
    hearts: 1540,
    rank: 5,
    verified: true,
    interests: ['โยคะ', 'สุขภาพ', 'ธรรมชาติ'],
    status: 'ออนไลน์'
  },
  {
    id: 6,
    name: 'คุณธนา',
    age: 31,
    location: 'นครราชสีมา',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    membershipLevel: 'Gold Member',
    membershipColor: 'amber',
    stars: 4350,
    votes: 1720,
    hearts: 1480,
    rank: 6,
    verified: true,
    interests: ['รถยนต์', 'เกม', 'เทคโนโลยี'],
    status: 'ออฟไลน์'
  }
];

export default function SuperstarPage() {
  const navigate = useNavigate();
  const [superstars, setSuperstars] = useState(mockSuperstars);
  const [filteredSuperstars, setFilteredSuperstars] = useState(mockSuperstars);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSuperstar, setSelectedSuperstar] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // ฟังก์ชันกำหนดสีและสไตล์ตามระดับสมาชิก
  const getMembershipStyle = (level, color) => {
    const styles = {
      'Platinum Member': 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-2xl border-2 border-cyan-300',
      'Diamond Member': 'bg-gradient-to-r from-sky-400 via-blue-500 to-teal-500 text-white shadow-2xl border-2 border-sky-300',
      'VIP 2': 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl border-2 border-indigo-300',
      'VIP 1': 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white shadow-2xl border-2 border-pink-300',
      'VIP Member': 'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white shadow-2xl border-2 border-purple-300',
      'Gold Member': 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-2xl border-2 border-yellow-300'
    };
    return styles[level] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
  };

  // ฟังก์ชันกำหนดสไตล์กรอบการ์ด
  const getCardFrameStyle = (level) => {
    const styles = {
      'Platinum Member': 'border-4 border-cyan-400 shadow-2xl shadow-cyan-500/50 bg-gradient-to-br from-cyan-950/30 to-blue-950/30',
      'Diamond Member': 'border-4 border-sky-400 shadow-2xl shadow-sky-500/50 bg-gradient-to-br from-sky-950/30 to-teal-950/30',
      'VIP 2': 'border-4 border-indigo-400 shadow-2xl shadow-indigo-500/50 bg-gradient-to-br from-indigo-950/30 to-purple-950/30',
      'VIP 1': 'border-4 border-pink-400 shadow-2xl shadow-pink-500/50 bg-gradient-to-br from-pink-950/30 to-rose-950/30',
      'VIP Member': 'border-4 border-purple-400 shadow-2xl shadow-purple-500/50 bg-gradient-to-br from-purple-950/30 to-violet-950/30',
      'Gold Member': 'border-4 border-yellow-400 shadow-2xl shadow-yellow-500/50 bg-gradient-to-br from-yellow-950/30 to-amber-950/30'
    };
    return styles[level] || 'border-2 border-gray-500 shadow-lg';
  };

  // ฟังก์ชันกำหนดสไตล์อันดับ
  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-black shadow-2xl border-2 border-yellow-200 animate-pulse';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 via-slate-400 to-gray-500 text-white shadow-xl border-2 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-br from-orange-300 via-amber-600 to-yellow-700 text-white shadow-xl border-2 border-orange-200';
    return 'bg-gradient-to-br from-zinc-600 to-zinc-700 text-white shadow-lg';
  };

  // ฟังก์ชันค้นหาและกรอง
  useEffect(() => {
    let filtered = superstars;

    // ค้นหาตามชื่อ
    if (searchTerm) {
      filtered = filtered.filter(star => 
        star.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        star.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // กรองตามระดับสมาชิก
    if (filterLevel !== 'all') {
      filtered = filtered.filter(star => star.membershipLevel === filterLevel);
    }

    // เรียงลำดับ
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'stars':
          aValue = a.stars;
          bValue = b.stars;
          break;
        case 'votes':
          aValue = a.votes;
          bValue = b.votes;
          break;
        case 'hearts':
          aValue = a.hearts;
          bValue = b.hearts;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.rank;
          bValue = b.rank;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSuperstars(filtered);
  }, [searchTerm, sortBy, sortOrder, filterLevel, superstars]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 via-amber-500 to-orange-500 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <Star size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            🌟 ซุปตาร์ของเดือน 🌟
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            สมาชิกที่ได้รับดาวและโวตมากที่สุด พร้อมสิทธิพิเศษระดับ Platinum
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-zinc-900/50 rounded-xl border border-amber-500/30 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="ค้นหาซุปตาร์ตามชื่อหรือสถานที่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 focus:border-amber-500"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-amber-500"
              >
                <option value="rank">อันดับ</option>
                <option value="stars">ดาว</option>
                <option value="votes">โวต</option>
                <option value="hearts">หัวใจ</option>
                <option value="name">ชื่อ</option>
              </select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
            >
              <Filter size={16} />
              กรอง
              <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterLevel === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterLevel('all')}
                  className="rounded-full"
                >
                  ทั้งหมด
                </Button>
                {['Platinum Member', 'Diamond Member', 'VIP 2', 'VIP 1', 'VIP Member', 'Gold Member'].map((level) => (
                  <Button
                    key={level}
                    variant={filterLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterLevel(level)}
                    className="rounded-full text-xs"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{filteredSuperstars.length}</div>
            <div className="text-yellow-100 text-sm">ซุปตาร์ทั้งหมด</div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {filteredSuperstars.reduce((sum, star) => sum + star.stars, 0).toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm">ดาวรวม</div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {filteredSuperstars.reduce((sum, star) => sum + star.votes, 0).toLocaleString()}
            </div>
            <div className="text-green-100 text-sm">โวตรวม</div>
          </div>
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {filteredSuperstars.reduce((sum, star) => sum + star.hearts, 0).toLocaleString()}
            </div>
            <div className="text-pink-100 text-sm">หัวใจรวม</div>
          </div>
        </div>

        {/* Superstars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSuperstars.map((star) => (
            <Card 
              key={star.id}
              className={`relative overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer ${getCardFrameStyle(star.membershipLevel)}`}
              onClick={() => {
                setSelectedSuperstar(star);
                setShowProfile(true);
              }}
            >
              {/* Rank Badge */}
              <div className={`absolute top-4 left-4 z-20 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getRankStyle(star.rank)}`}>
                {star.rank}
              </div>

              {/* Membership Level Overlay */}
              <div className="absolute top-4 right-4 z-20">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getMembershipStyle(star.membershipLevel, star.membershipColor)}`}>
                  {star.membershipLevel}
                </div>
              </div>

              {/* Crown for Top 3 */}
              {star.rank <= 3 && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-30">
                  <Crown size={32} className={`${star.rank === 1 ? 'text-yellow-400' : star.rank === 2 ? 'text-gray-400' : 'text-orange-400'}`} />
                </div>
              )}

              <CardHeader className="flex flex-col items-center pb-4 pt-8">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white/50 shadow-2xl">
                    <AvatarImage 
                      src={star.avatar} 
                      alt={star.name} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-amber-900 text-amber-100 font-bold text-xl">
                      {star.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {star.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black rounded-full w-6 h-6 flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full ${star.status === "ออนไลน์" ? "bg-green-400" : "bg-zinc-400"}`}></div>
                </div>
                
                <CardTitle className="mt-4 text-center text-white">
                  {star.name}, {star.age}
                </CardTitle>
                
                <div className="text-sm text-amber-400 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {star.location}
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                      <Star size={16} />
                      <span className="font-bold">{star.stars.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-zinc-400">ดาว</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                      <ThumbsUp size={16} />
                      <span className="font-bold">{star.votes.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-zinc-400">โวต</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-pink-400 mb-1">
                      <Heart size={16} />
                      <span className="font-bold">{star.hearts.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-zinc-400">หัวใจ</div>
                  </div>
                </div>

                {/* Interests */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {star.interests.slice(0, 2).map((interest, idx) => (
                    <span key={idx} className="bg-zinc-800/80 text-amber-400 px-2 py-1 rounded-full text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 px-6 pb-6">
                <Button
                  variant="outline"
                  className="flex-1 text-xs gap-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle like action
                  }}
                >
                  <Heart size={12} /> Like
                </Button>
                <Button
                  variant="default"
                  className="flex-1 text-xs gap-1 bg-amber-600 hover:bg-amber-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chat/${star.id}`);
                  }}
                >
                  <MessageCircle size={12} /> ส่งข้อความ
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredSuperstars.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-zinc-800/50 rounded-xl p-8 max-w-md mx-auto">
              <Star size={48} className="text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-400 mb-2">ไม่พบซุปตาร์</h3>
              <p className="text-zinc-500">ลองเปลี่ยนคำค้นหาหรือเงื่อนไขการกรอง</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && selectedSuperstar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${getCardFrameStyle(selectedSuperstar.membershipLevel)}`}>
            <div className="relative">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-zinc-700">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Star className="text-yellow-400" />
                  โปรไฟล์ซุปตาร์
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfile(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  {/* Rank and Crown */}
                  <div className="relative inline-block mb-4">
                    {selectedSuperstar.rank <= 3 && (
                      <Crown size={40} className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${
                        selectedSuperstar.rank === 1 ? 'text-yellow-400' : 
                        selectedSuperstar.rank === 2 ? 'text-gray-400' : 'text-orange-400'
                      }`} />
                    )}
                    <Avatar className="w-32 h-32 border-4 border-white/50 shadow-2xl">
                      <AvatarImage 
                        src={selectedSuperstar.avatar} 
                        alt={selectedSuperstar.name} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-amber-900 text-amber-100 text-3xl font-bold">
                        {selectedSuperstar.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getRankStyle(selectedSuperstar.rank)}`}>
                      #{selectedSuperstar.rank}
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-2">
                    {selectedSuperstar.name}, {selectedSuperstar.age}
                  </h3>
                  
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 ${getMembershipStyle(selectedSuperstar.membershipLevel, selectedSuperstar.membershipColor)}`}>
                    {selectedSuperstar.membershipLevel}
                  </div>

                  <p className="text-amber-400 flex items-center gap-1 justify-center mb-4">
                    <MapPin size={16} /> {selectedSuperstar.location}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="bg-yellow-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                        <Star size={24} className="text-yellow-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{selectedSuperstar.stars.toLocaleString()}</div>
                      <div className="text-zinc-400">ดาว</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                        <ThumbsUp size={24} className="text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{selectedSuperstar.votes.toLocaleString()}</div>
                      <div className="text-zinc-400">โวต</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-pink-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                        <Heart size={24} className="text-pink-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{selectedSuperstar.hearts.toLocaleString()}</div>
                      <div className="text-zinc-400">หัวใจ</div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">ความสนใจ</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedSuperstar.interests.map((interest, idx) => (
                        <span key={idx} className="bg-zinc-800 text-amber-400 px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                    >
                      <Heart size={16} /> Like
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                      onClick={() => {
                        setShowProfile(false);
                        navigate(`/profile/${selectedSuperstar.id}`);
                      }}
                    >
                      <User size={16} /> ดูโปรไฟล์
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
                      onClick={() => {
                        setShowProfile(false);
                        navigate(`/chat/${selectedSuperstar.id}`);
                      }}
                    >
                      <MessageCircle size={16} /> ส่งข้อความ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}